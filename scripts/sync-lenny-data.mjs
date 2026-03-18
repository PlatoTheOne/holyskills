import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    } else if (item === "--target" && argv[i + 1]) {
      args.target = argv[i + 1];
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspace = process.cwd();
  const sourceRoot = path.resolve(workspace, args.source ?? "lennys-newsletterpodcastdata-all");
  const targetRoot = path.resolve(workspace, args.target ?? "web/public/data");

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

  await fs.rm(targetRoot, { recursive: true, force: true });
  await fs.mkdir(targetRoot, { recursive: true });

  await fs.copyFile(path.join(sourceRoot, "index.json"), path.join(targetRoot, "index.json"));
  await fs.cp(path.join(sourceRoot, "newsletters"), path.join(targetRoot, "newsletters"), { recursive: true });
  await fs.cp(path.join(sourceRoot, "podcasts"), path.join(targetRoot, "podcasts"), { recursive: true });

  const filesCount = await countFiles(targetRoot);
  console.log(`Synced data to: ${targetRoot}`);
  console.log(`Total files copied: ${filesCount}`);
}

main().catch((error) => {
  console.error("sync-lenny-data failed:", error.message);
  process.exit(1);
});
