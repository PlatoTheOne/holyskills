import type { SearchIndexEntry, SearchIndexFile } from "../types";
import { getDataRoot } from "./data";

let cached: SearchIndexEntry[] | null = null;
let loading: Promise<SearchIndexEntry[]> | null = null;

async function loadEntries(): Promise<SearchIndexEntry[]> {
  if (cached) {
    return cached;
  }
  if (loading) {
    return loading;
  }

  loading = fetch(`${getDataRoot()}/search-index.json`, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`search-index load failed: ${response.status}`);
      }
      const payload = (await response.json()) as SearchIndexFile;
      cached = payload.docs ?? [];
      return cached;
    })
    .finally(() => {
      loading = null;
    });

  return loading;
}

export async function fulltextSearch(query: string): Promise<Set<string>> {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((item) => item.length > 0);

  if (terms.length === 0) {
    return new Set<string>();
  }

  const docs = await loadEntries();
  const results = new Set<string>();

  for (const doc of docs) {
    if (terms.every((term) => doc.text.includes(term))) {
      results.add(doc.filename);
    }
  }

  return results;
}
