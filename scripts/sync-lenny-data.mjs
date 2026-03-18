import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    mode: "private",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    } else if (item === "--target" && argv[i + 1]) {
      args.target = argv[i + 1];
      i += 1;
    } else if (item === "--mode" && argv[i + 1]) {
      args.mode = argv[i + 1];
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

async function countFiles(rootDir) {
  let total = 0;
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        total += 1;
      }
    }
  }
  await walk(rootDir);
  return total;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, " $1 ")
    .replace(/[>#*_~\[\]\(\)\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function readMarkdownFiles(dir) {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const full = path.join(dir, entry.name);
    const content = await fs.readFile(full, "utf8");
    result.push({
      name: entry.name,
      content,
    });
  }
  return result;
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const serialized = JSON.stringify(payload);
  await fs.writeFile(filePath, serialized, "utf8");
  return (Buffer.byteLength(serialized, "utf8") / (1024 * 1024)).toFixed(2);
}

function mergedMetaText(item, translationMeta) {
  const items = translationMeta?.items ?? {};
  const translated = items[item.filename ?? ""] ?? {};
  const tagMap = translationMeta?.tag_map ?? {};

  const translatedTags = Array.isArray(item.tags)
    ? item.tags.map((tag) => tagMap[tag] ?? tag)
    : [];

  const text = normalizeText([
    translated.title ?? item.title ?? "",
    translated.subtitle ?? item.subtitle ?? "",
    translated.summary ?? item.description ?? "",
    translated.guest ?? item.guest ?? "",
    translatedTags.join(" "),
  ].join(" "));

  return {
    filename: item.filename ?? "",
    text,
  };
}

async function buildSearchIndexFromMarkdown(targetRoot) {
  const newslettersDir = path.join(targetRoot, "newsletters");
  const podcastsDir = path.join(targetRoot, "podcasts");

  const [newsletters, podcasts] = await Promise.all([
    readMarkdownFiles(newslettersDir),
    readMarkdownFiles(podcastsDir),
  ]);

  const docs = [
    ...newsletters.map((item) => ({ filename: `newsletters/${item.name}`, text: normalizeText(item.content) })),
    ...podcasts.map((item) => ({ filename: `podcasts/${item.name}`, text: normalizeText(item.content) })),
  ];

  const payload = {
    version: 1,
    generated_at: new Date().toISOString(),
    mode: "private",
    locale: "en",
    docs,
  };

  const output = path.join(targetRoot, "search-index.json");
  const sizeMb = await writeJson(output, payload);
  return { docsCount: docs.length, sizeMb };
}

async function buildSearchIndexFromMetadata(sourceRoot, targetRoot, translationMeta, locale) {
  const index = await readJson(path.join(sourceRoot, "index.json"), {});

  const podcasts = Array.isArray(index.podcasts) ? index.podcasts : [];
  const newsletters = Array.isArray(index.newsletters) ? index.newsletters : [];

  const docs = [...podcasts, ...newsletters]
    .map((item) => mergedMetaText(item, translationMeta))
    .filter((item) => item.filename);

  const payload = {
    version: 1,
    generated_at: new Date().toISOString(),
    mode: "public",
    locale,
    docs,
  };

  const output = locale === "en"
    ? path.join(targetRoot, "search-index.json")
    : path.join(targetRoot, "i18n", locale, "search-index.json");
  const sizeMb = await writeJson(output, payload);
  return { docsCount: docs.length, sizeMb };
}

async function listI18nLocales(sourceRoot) {
  const i18nRoot = path.join(sourceRoot, "i18n");
  if (!(await exists(i18nRoot))) {
    return [];
  }

  const entries = await fs.readdir(i18nRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function copyI18nPublic(sourceRoot, targetRoot, locales) {
  for (const locale of locales) {
    const sourceMeta = path.join(sourceRoot, "i18n", locale, "meta.json");
    if (!(await exists(sourceMeta))) {
      continue;
    }
    const targetMeta = path.join(targetRoot, "i18n", locale, "meta.json");
    await fs.mkdir(path.dirname(targetMeta), { recursive: true });
    await fs.copyFile(sourceMeta, targetMeta);
  }
}

async function copyI18nPrivate(sourceRoot, targetRoot) {
  const sourceI18n = path.join(sourceRoot, "i18n");
  if (!(await exists(sourceI18n))) {
    return false;
  }
  await fs.cp(sourceI18n, path.join(targetRoot, "i18n"), { recursive: true });
  return true;
}

async function buildLocalizedSearchIndexes(sourceRoot, targetRoot, locales) {
  const reports = [];
  for (const locale of locales) {
    const translationMeta = await readJson(path.join(sourceRoot, "i18n", locale, "meta.json"), null);
    if (!translationMeta) {
      continue;
    }
    const built = await buildSearchIndexFromMetadata(sourceRoot, targetRoot, translationMeta, locale);
    reports.push({ locale, ...built });
  }
  return reports;
}

async function ensureSource(sourceRoot) {
  const required = [
    path.join(sourceRoot, "index.json"),
    path.join(sourceRoot, "newsletters"),
    path.join(sourceRoot, "podcasts"),
  ];

  for (const filePath of required) {
    if (!(await exists(filePath))) {
      throw new Error(`Missing source path: ${filePath}`);
    }
  }
}

async function runPrivate(sourceRoot, targetRoot) {
  await fs.rm(targetRoot, { recursive: true, force: true });
  await fs.mkdir(targetRoot, { recursive: true });

  await fs.copyFile(path.join(sourceRoot, "index.json"), path.join(targetRoot, "index.json"));
  await fs.cp(path.join(sourceRoot, "newsletters"), path.join(targetRoot, "newsletters"), { recursive: true });
  await fs.cp(path.join(sourceRoot, "podcasts"), path.join(targetRoot, "podcasts"), { recursive: true });

  const fulltext = await buildSearchIndexFromMarkdown(targetRoot);

  const locales = await listI18nLocales(sourceRoot);
  const hasI18n = await copyI18nPrivate(sourceRoot, targetRoot);
  const localized = hasI18n ? await buildLocalizedSearchIndexes(sourceRoot, targetRoot, locales) : [];

  const filesCount = await countFiles(targetRoot);

  console.log(`Synced data to: ${targetRoot}`);
  console.log(`Mode: private (includes raw markdown)`);
  console.log(`Total files copied: ${filesCount}`);
  console.log(`Search index (en): ${fulltext.docsCount} docs, ${fulltext.sizeMb} MB`);
  if (localized.length > 0) {
    console.log(`Localized indexes: ${localized.map((item) => `${item.locale}(${item.docsCount})`).join(", ")}`);
  }
}

async function runPublic(sourceRoot, targetRoot) {
  await fs.rm(targetRoot, { recursive: true, force: true });
  await fs.mkdir(targetRoot, { recursive: true });

  await fs.copyFile(path.join(sourceRoot, "index.json"), path.join(targetRoot, "index.json"));
  const fulltext = await buildSearchIndexFromMetadata(sourceRoot, targetRoot, null, "en");

  const locales = await listI18nLocales(sourceRoot);
  await copyI18nPublic(sourceRoot, targetRoot, locales);
  const localized = await buildLocalizedSearchIndexes(sourceRoot, targetRoot, locales);

  const filesCount = await countFiles(targetRoot);

  console.log(`Synced data to: ${targetRoot}`);
  console.log(`Mode: public (metadata only, no raw markdown)`);
  console.log(`Total files copied: ${filesCount}`);
  console.log(`Search index (en): ${fulltext.docsCount} docs, ${fulltext.sizeMb} MB`);
  if (localized.length > 0) {
    console.log(`Localized indexes: ${localized.map((item) => `${item.locale}(${item.docsCount})`).join(", ")}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspace = process.cwd();
  const sourceRoot = path.resolve(workspace, args.source ?? "lennys-newsletterpodcastdata-all");
  const targetRoot = path.resolve(workspace, args.target ?? "web/public/data");
  const mode = (args.mode ?? "private").toLowerCase();

  if (mode !== "private" && mode !== "public") {
    throw new Error(`Invalid --mode value: ${args.mode}. Use 'private' or 'public'.`);
  }

  await ensureSource(sourceRoot);

  if (mode === "private") {
    await runPrivate(sourceRoot, targetRoot);
    return;
  }

  await runPublic(sourceRoot, targetRoot);
}

main().catch((error) => {
  console.error("sync-lenny-data failed:", error.message);
  process.exit(1);
});
