import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    locale: "zh-CN",
    in: "translation",
    out: "lennys-newsletterpodcastdata-all/i18n",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--locale" && argv[i + 1]) {
      args.locale = argv[i + 1];
      i += 1;
    } else if (item === "--in" && argv[i + 1]) {
      args.in = argv[i + 1];
      i += 1;
    } else if (item === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return fallback;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspace = process.cwd();
  const localeRoot = path.resolve(workspace, args.in, args.locale);
  const batchesRoot = path.join(localeRoot, "batches");
  const targetMeta = path.resolve(workspace, args.out, args.locale, "meta.json");

  if (!(await exists(batchesRoot))) {
    throw new Error(`Missing batches directory: ${batchesRoot}`);
  }

  const entries = await fs.readdir(batchesRoot, { withFileTypes: true });
  const batchFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const items = {};
  let totalDocs = 0;
  let translatedDocs = 0;

  for (const batchFile of batchFiles) {
    const payload = await readJson(path.join(batchesRoot, batchFile), { docs: [] });
    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    totalDocs += docs.length;

    for (const doc of docs) {
      const filename = String(doc.filename ?? "").trim();
      if (!filename) {
        continue;
      }

      const translated = doc.translated ?? {};
      const fields = {};
      if (translated.title && String(translated.title).trim()) {
        fields.title = String(translated.title).trim();
      }
      if (translated.summary && String(translated.summary).trim()) {
        fields.summary = String(translated.summary).trim();
      }
      if (translated.subtitle && String(translated.subtitle).trim()) {
        fields.subtitle = String(translated.subtitle).trim();
      }
      if (translated.guest && String(translated.guest).trim()) {
        fields.guest = String(translated.guest).trim();
      }

      if (Object.keys(fields).length > 0) {
        items[filename] = fields;
        translatedDocs += 1;
      }
    }
  }

  const tagMapPayload = await readJson(path.join(localeRoot, "tag-map.json"), { tags: {} });
  const tagMap = tagMapPayload?.tags ?? {};

  const output = {
    version: 1,
    locale: args.locale,
    generated_at: new Date().toISOString(),
    coverage: {
      translated_docs: translatedDocs,
      total_docs: totalDocs,
      translated_ratio: totalDocs > 0 ? Number((translatedDocs / totalDocs).toFixed(4)) : 0,
    },
    tag_map: tagMap,
    items,
  };

  await fs.mkdir(path.dirname(targetMeta), { recursive: true });
  await fs.writeFile(targetMeta, JSON.stringify(output, null, 2), "utf8");

  console.log(`Compiled translation meta: ${targetMeta}`);
  console.log(`Coverage: ${translatedDocs}/${totalDocs}`);
}

main().catch((error) => {
  console.error("compile-translation-meta failed:", error.message);
  process.exit(1);
});
