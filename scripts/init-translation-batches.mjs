import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    source: "lennys-newsletterpodcastdata-all",
    out: "translation",
    locale: "zh-CN",
    batches: "24",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    } else if (item === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (item === "--locale" && argv[i + 1]) {
      args.locale = argv[i + 1];
      i += 1;
    } else if (item === "--batches" && argv[i + 1]) {
      args.batches = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

function toDoc(item, type) {
  return {
    filename: item.filename ?? "",
    type,
    date: item.date ?? "",
    word_count: Number(item.word_count ?? 0),
    source: {
      title: item.title ?? "",
      summary: item.description ?? "",
      subtitle: item.subtitle ?? "",
      guest: item.guest ?? "",
      tags: Array.isArray(item.tags) ? item.tags : [],
    },
    translated: {
      title: "",
      summary: "",
      subtitle: "",
      guest: "",
    },
    status: "todo",
  };
}

function buildBalancedBatches(docs, batchCount) {
  const totalWords = docs.reduce((sum, doc) => sum + doc.word_count, 0);
  const targetWords = Math.max(1, Math.floor(totalWords / batchCount));

  const batches = [];
  let current = [];
  let currentWords = 0;

  for (const doc of docs) {
    const nextWords = currentWords + doc.word_count;
    const shouldBreak = batches.length < batchCount - 1 && current.length > 0 && nextWords > targetWords;
    if (shouldBreak) {
      batches.push(current);
      current = [];
      currentWords = 0;
    }
    current.push(doc);
    currentWords += doc.word_count;
  }

  if (current.length > 0) {
    batches.push(current);
  }

  while (batches.length < batchCount) {
    batches.push([]);
  }

  return batches;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath, payload) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspace = process.cwd();
  const sourceRoot = path.resolve(workspace, args.source);
  const outRoot = path.resolve(workspace, args.out, args.locale);
  const batchCount = Math.max(1, Number(args.batches));

  const index = await readJson(path.join(sourceRoot, "index.json"));
  const podcasts = (index.podcasts ?? []).map((item) => toDoc(item, "podcast"));
  const newsletters = (index.newsletters ?? []).map((item) => toDoc(item, "newsletter"));
  const docs = [...podcasts, ...newsletters]
    .filter((item) => item.filename)
    .sort((a, b) => b.date.localeCompare(a.date));

  const batches = buildBalancedBatches(docs, batchCount);
  const totalWords = docs.reduce((sum, doc) => sum + doc.word_count, 0);

  const tagSet = new Set();
  docs.forEach((doc) => {
    doc.source.tags.forEach((tag) => tagSet.add(tag));
  });

  const tagMap = {};
  [...tagSet].sort((a, b) => a.localeCompare(b)).forEach((tag) => {
    tagMap[tag] = "";
  });

  for (let i = 0; i < batches.length; i += 1) {
    const batchDocs = batches[i];
    const words = batchDocs.reduce((sum, item) => sum + item.word_count, 0);
    await writeJson(path.join(outRoot, "batches", `batch-${String(i + 1).padStart(2, "0")}.json`), {
      locale: args.locale,
      batch: i + 1,
      docs: batchDocs,
      stats: {
        docs: batchDocs.length,
        words,
      },
    });
  }

  await writeJson(path.join(outRoot, "tag-map.json"), {
    locale: args.locale,
    tags: tagMap,
  });

  await writeJson(path.join(outRoot, "plan.json"), {
    locale: args.locale,
    generated_at: new Date().toISOString(),
    totals: {
      docs: docs.length,
      words: totalWords,
      batches: batchCount,
      avg_words_per_batch: Math.round(totalWords / batchCount),
    },
    progress: {
      completed_batches: 0,
      completed_docs: 0,
    },
    instructions: [
      "Fill translated fields inside each batch file.",
      "Set doc.status to 'done' when translation is ready.",
      "Run scripts/compile-translation-meta.mjs to build i18n/<locale>/meta.json.",
    ],
  });

  console.log(`Initialized translation batches: locale=${args.locale}, docs=${docs.length}, batches=${batchCount}`);
  console.log(`Output: ${outRoot}`);
}

main().catch((error) => {
  console.error("init-translation-batches failed:", error.message);
  process.exit(1);
});
