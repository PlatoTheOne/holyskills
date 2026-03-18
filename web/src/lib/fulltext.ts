import type { SearchIndexEntry, SearchIndexFile } from "../types";
import { getDataRoot } from "./data";

const cached = new Map<string, SearchIndexEntry[]>();
const loading = new Map<string, Promise<SearchIndexEntry[]>>();

function normalizeLocaleForIndex(locale: string): string {
  const normalized = String(locale ?? "").trim();
  if (!normalized || normalized === "en") {
    return "";
  }
  return normalized;
}

async function fetchIndex(url: string): Promise<SearchIndexEntry[] | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as SearchIndexFile;
    return payload.docs ?? [];
  } catch {
    return null;
  }
}

async function loadEntries(locale: string): Promise<SearchIndexEntry[]> {
  const localeKey = normalizeLocaleForIndex(locale) || "default";

  if (cached.has(localeKey)) {
    return cached.get(localeKey) ?? [];
  }
  if (loading.has(localeKey)) {
    return loading.get(localeKey) as Promise<SearchIndexEntry[]>;
  }

  const task = (async () => {
    const dataRoot = getDataRoot();
    const contentLocale = normalizeLocaleForIndex(locale);

    if (contentLocale) {
      const localized = await fetchIndex(`${dataRoot}/i18n/${contentLocale}/search-index.json`);
      if (localized) {
        cached.set(localeKey, localized);
        return localized;
      }
    }

    const fallback = await fetchIndex(`${dataRoot}/search-index.json`);
    if (fallback) {
      cached.set(localeKey, fallback);
      return fallback;
    }

    throw new Error("search-index load failed");
  })().finally(() => {
    loading.delete(localeKey);
  });

  loading.set(localeKey, task);
  return task;
}

export async function fulltextSearch(query: string, locale = "en"): Promise<Set<string>> {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((item) => item.length > 0);

  if (terms.length === 0) {
    return new Set<string>();
  }

  const docs = await loadEntries(locale);
  const results = new Set<string>();

  for (const doc of docs) {
    if (terms.every((term) => doc.text.includes(term))) {
      results.add(doc.filename);
    }
  }

  return results;
}
