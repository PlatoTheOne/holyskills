import type { DocItem, IndexFile, NormalizedData, RawIndexItem, TagCount } from "../types";

const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");
const dataRoot = `${basePath}/data`.replace(/^$/, "/data");
const contentMode = (import.meta.env.VITE_CONTENT_MODE ?? "public").toLowerCase();
const contentApi = (import.meta.env.VITE_DOC_CONTENT_API ?? "").trim().replace(/\/+$/, "");

const accessTokenStorageKey = "lenny.portal.contentToken";
const accessEmailStorageKey = "lenny.portal.accessEmail";

function readStorage(key: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key) ?? "";
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!value) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, value);
}

export function getDataRoot(): string {
  return dataRoot;
}

export function isPrivateContentMode(): boolean {
  return contentMode === "private";
}

export function hasContentApi(): boolean {
  return Boolean(contentApi);
}

export function hasAccessToken(): boolean {
  return Boolean(readStorage(accessTokenStorageKey));
}

export function getSavedAccessEmail(): string {
  return readStorage(accessEmailStorageKey);
}

export function clearAccessSession(): void {
  writeStorage(accessTokenStorageKey, "");
  writeStorage(accessEmailStorageKey, "");
}

export async function requestInviteAccess(email: string, inviteCode: string): Promise<void> {
  if (!contentApi) {
    throw new Error("content_api_unconfigured");
  }

  const normalizedEmail = email.trim();
  const normalizedInvite = inviteCode.trim();

  const response = await fetch(`${contentApi}/auth`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      email: normalizedEmail,
      inviteCode: normalizedInvite,
    }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("access_denied");
  }
  if (!response.ok) {
    throw new Error(`auth_failed:${response.status}`);
  }

  const payload = (await response.json()) as { token?: string };
  if (!payload.token) {
    throw new Error("auth_token_missing");
  }

  writeStorage(accessTokenStorageKey, payload.token);
  writeStorage(accessEmailStorageKey, normalizedEmail);
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
  if (contentApi) {
    const token = readStorage(accessTokenStorageKey);
    const response = await fetch(`${contentApi}/content?filename=${encodeURIComponent(filename)}`, {
      cache: "no-store",
      headers: token
        ? {
          authorization: `Bearer ${token}`,
        }
        : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("access_required");
    }
    if (!response.ok) {
      throw new Error(`doc_api_load_failed:${response.status}`);
    }
    return response.text();
  }

  if (!isPrivateContentMode()) {
    throw new Error("content_protected");
  }

  const response = await fetch(`${dataRoot}/${filename}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`doc_load_failed:${response.status}`);
  }
  return response.text();
}

export function getRawDocUrl(filename: string): string | null {
  if (!isPrivateContentMode()) {
    return null;
  }
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
