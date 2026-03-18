import type { DocItem, IndexFile, NormalizedData, RawIndexItem, TagCount } from "../types";

const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");
const dataRoot = `${basePath}/data`.replace(/^$/, "/data");

export function getDataRoot(): string {
  return dataRoot;
}

function toDoc(item: RawIndexItem, type: "podcast" | "newsletter"): DocItem {
  return {
    type,
    title: item.title ?? "",
    filename: item.filename ?? "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    wordCount: Number(item.word_count ?? 0),
    date: item.date ?? "",
    summary: item.description ?? item.subtitle ?? "",
    guest: item.guest ?? "",
    subtitle: item.subtitle ?? "",
  };
}

export async function loadIndexData(): Promise<NormalizedData> {
  const response = await fetch(`${dataRoot}/index.json`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`index.json load failed: ${response.status}`);
  }
  const index = (await response.json()) as IndexFile;

  const podcasts = (index.podcasts ?? []).map((item) => toDoc(item, "podcast"));
  const newsletters = (index.newsletters ?? []).map((item) => toDoc(item, "newsletter"));
  const all = [...podcasts, ...newsletters].sort((a, b) => b.date.localeCompare(a.date));

  return {
    schemaVersion: index.schema_version ?? "",
    generatedAt: index.generated_at ?? "",
    podcasts,
    newsletters,
    all,
  };
}

export async function loadMarkdown(filename: string): Promise<string> {
  const response = await fetch(`${dataRoot}/${filename}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`doc load failed: ${response.status}`);
  }
  return response.text();
}

export function getRawDocUrl(filename: string): string {
  return `${dataRoot}/${filename}`;
}

export function formatDate(date: string, locale: string): string {
  if (!date) {
    return "-";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function tagCounts(items: DocItem[]): TagCount[] {
  const m = new Map<string, number>();
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      m.set(tag, (m.get(tag) ?? 0) + 1);
    });
  });

  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
}
