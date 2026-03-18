import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--port" && argv[i + 1]) {
      args.port = argv[i + 1];
      i += 1;
    } else if (item === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    } else if (item === "--ttl" && argv[i + 1]) {
      args.ttl = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function issueToken({ email, secret, ttlSeconds }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const payloadRaw = JSON.stringify({ email, exp, iat: now });
  const payload = base64UrlEncode(payloadRaw);
  const sig = signPayload(payload, secret);
  return {
    token: `${payload}.${sig}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

function verifyToken(token, secret) {
  if (!token || !token.includes(".")) {
    return { ok: false, reason: "bad_token_format" };
  }

  const [payload, sig] = token.split(".", 2);
  const expected = signPayload(payload, secret);
  if (sig !== expected) {
    return { ok: false, reason: "invalid_signature" };
  }

  let parsed;
  try {
    parsed = JSON.parse(base64UrlDecode(payload));
  } catch {
    return { ok: false, reason: "bad_payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!parsed.exp || Number(parsed.exp) <= now) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload: parsed };
}

function json(res, status, payload, corsOrigin) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": corsOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "cache-control": "no-store",
  });
  res.end(body);
}

function text(res, status, payload, corsOrigin) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "access-control-allow-origin": corsOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "cache-control": "no-store",
  });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) {
      throw new Error("body_too_large");
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeInvite(value) {
  return String(value ?? "").trim();
}

function normalizeRelativeFile(filename) {
  const raw = String(filename ?? "").trim().replace(/\\/g, "/");
  if (!raw) {
    return "";
  }
  if (raw.startsWith("/")) {
    return "";
  }
  if (!raw.endsWith(".md")) {
    return "";
  }
  if (!(raw.startsWith("newsletters/") || raw.startsWith("podcasts/"))) {
    return "";
  }
  return raw;
}

function normalizeLocale(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "en") {
    return "";
  }
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(raw)) {
    return "";
  }
  return raw;
}

async function ensurePath(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspace = process.cwd();
  const port = Number(args.port ?? process.env.PORT ?? 8788);
  const sourceRoot = path.resolve(workspace, args.source ?? process.env.DATA_SOURCE ?? "lennys-newsletterpodcastdata-all");
  const ttlSeconds = Number(args.ttl ?? process.env.ACCESS_TOKEN_TTL_SEC ?? 86400);
  const invitedEmail = normalizeEmail(process.env.ACCESS_EMAIL);
  const inviteCode = normalizeInvite(process.env.ACCESS_INVITE_CODE);
  const corsOrigin = (process.env.ALLOWED_ORIGIN ?? "*").trim() || "*";
  const tokenSecret = (process.env.ACCESS_TOKEN_SECRET ?? crypto.randomBytes(24).toString("hex")).trim();

  if (!invitedEmail && !inviteCode) {
    throw new Error("Please set ACCESS_EMAIL or ACCESS_INVITE_CODE before starting the API.");
  }

  const server = http.createServer(async (req, res) => {
    if (!req.url || !req.method) {
      json(res, 400, { error: "bad_request" }, corsOrigin);
      return;
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": corsOrigin,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-max-age": "86400",
      });
      res.end();
      return;
    }

    const requestUrl = new URL(req.url, "http://localhost");

    if (req.method === "GET" && requestUrl.pathname === "/health") {
      json(res, 200, { status: "ok" }, corsOrigin);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/auth") {
      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const code = normalizeInvite(body.inviteCode);

        if (invitedEmail && email !== invitedEmail) {
          json(res, 403, { error: "forbidden_email" }, corsOrigin);
          return;
        }
        if (inviteCode && code !== inviteCode) {
          json(res, 403, { error: "forbidden_invite_code" }, corsOrigin);
          return;
        }

        const access = issueToken({
          email: email || invitedEmail || "invited-user",
          secret: tokenSecret,
          ttlSeconds,
        });

        json(res, 200, {
          token: access.token,
          expiresAt: access.expiresAt,
        }, corsOrigin);
      } catch {
        json(res, 400, { error: "invalid_auth_payload" }, corsOrigin);
      }
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/content") {
      const authHeader = req.headers.authorization ?? "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
      const verified = verifyToken(token, tokenSecret);
      if (!verified.ok) {
        json(res, 401, { error: "unauthorized" }, corsOrigin);
        return;
      }

      if (invitedEmail && normalizeEmail(verified.payload.email) !== invitedEmail) {
        json(res, 403, { error: "forbidden_email" }, corsOrigin);
        return;
      }

      const file = normalizeRelativeFile(requestUrl.searchParams.get("filename") ?? "");
      if (!file) {
        json(res, 400, { error: "invalid_filename" }, corsOrigin);
        return;
      }

      const locale = normalizeLocale(requestUrl.searchParams.get("locale") ?? "");
      const candidates = [];
      if (locale) {
        candidates.push(path.resolve(sourceRoot, "i18n", locale, "docs", file));
      }
      candidates.push(path.resolve(sourceRoot, file));

      const safeCandidates = candidates.filter((candidate) => candidate.startsWith(sourceRoot));
      if (safeCandidates.length === 0) {
        json(res, 400, { error: "invalid_path" }, corsOrigin);
        return;
      }

      for (const absolute of safeCandidates) {
        if (!(await ensurePath(absolute))) {
          continue;
        }
        const md = await fs.readFile(absolute, "utf8");
        text(res, 200, md, corsOrigin);
        return;
      }

      json(res, 404, { error: "file_not_found" }, corsOrigin);
      return;
    }

    json(res, 404, { error: "not_found" }, corsOrigin);
  });

  server.listen(port, () => {
    console.log("Private content API started");
    console.log(`- Listening: http://127.0.0.1:${port}`);
    console.log(`- Source root: ${sourceRoot}`);
    console.log(`- Allowed origin: ${corsOrigin}`);
    console.log(`- Invited email: ${invitedEmail || "(disabled)"}`);
    console.log(`- Invite code required: ${inviteCode ? "yes" : "no"}`);
    console.log(`- Token TTL: ${ttlSeconds} sec`);
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.log("- ACCESS_TOKEN_SECRET not set. Using ephemeral secret for this run.");
    }
  });
}

main().catch((error) => {
  console.error("private-content-api failed:", error.message);
  process.exit(1);
});
