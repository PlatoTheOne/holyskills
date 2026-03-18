import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { NeoSelect } from "../components/NeoSelect";
import {
  clearAccessSession,
  formatDate,
  formatNumber,
  getRawDocUrl,
  getSavedAccessEmail,
  hasContentApi,
  isPrivateContentMode,
  loadMarkdown,
  requestInviteAccess,
  tagCounts,
} from "../lib/data";
import { fulltextSearch } from "../lib/fulltext";
import type { Locale } from "../i18n";
import type { DocItem, NormalizedData } from "../types";

interface DocsPageProps {
  locale: Locale;
  data: NormalizedData;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

type SortKey = "date_desc" | "date_asc" | "title_asc" | "words_desc";
type NavMode = "list" | "year" | "tag";

const THEME_PRIORITY = [
  "ai",
  "design",
  "engineering",
  "growth",
  "leadership",
  "strategy",
  "startups",
  "product-management",
  "go-to-market",
  "analytics",
  "pricing",
  "career",
  "b2b",
  "b2c",
  "organization",
  "newsletter",
  "podcast",
] as const;

function includesQuery(doc: DocItem, query: string) {
  if (!query) {
    return true;
  }
  const text = [doc.title, doc.summary, doc.guest, doc.subtitle, doc.filename, doc.tags.join(" ")]
    .join(" ")
    .toLowerCase();
  return text.includes(query.toLowerCase());
}

function sortedDocs(items: DocItem[], sortBy: SortKey) {
  const next = [...items];
  if (sortBy === "date_asc") {
    return next.sort((a, b) => a.date.localeCompare(b.date));
  }
  if (sortBy === "title_asc") {
    return next.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortBy === "words_desc") {
    return next.sort((a, b) => b.wordCount - a.wordCount);
  }
  return next.sort((a, b) => b.date.localeCompare(a.date));
}

function docYear(doc: DocItem): string {
  if (!doc.date) {
    return "Unknown";
  }
  return doc.date.slice(0, 4);
}

function resolveTheme(doc: DocItem): string {
  const loweredTags = doc.tags.map((tag) => tag.toLowerCase());
  for (const candidate of THEME_PRIORITY) {
    if (loweredTags.includes(candidate)) {
      return candidate;
    }
  }
  if (doc.tags.length > 0) {
    return doc.tags[0].toLowerCase();
  }
  return doc.type;
}

function formatThemeName(theme: string): string {
  return theme
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface YearThemeGroup {
  year: string;
  total: number;
  themes: Array<{
    theme: string;
    docs: DocItem[];
  }>;
}

export function DocsPage({ locale, data, t }: DocsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [markdownHtml, setMarkdownHtml] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [fulltextMatches, setFulltextMatches] = useState<Set<string> | null>(null);
  const [loadingFulltext, setLoadingFulltext] = useState(false);
  const [contentProtected, setContentProtected] = useState(false);
  const [authEmail, setAuthEmail] = useState(getSavedAccessEmail());
  const [authInviteCode, setAuthInviteCode] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);

  const type = searchParams.get("type") === "podcast" || searchParams.get("type") === "newsletter"
    ? (searchParams.get("type") as "podcast" | "newsletter")
    : "all";
  const query = (searchParams.get("q") ?? "").trim();
  const tag = searchParams.get("tag") ?? "";
  const sortBy = ([
    "date_desc",
    "date_asc",
    "title_asc",
    "words_desc",
  ].includes(searchParams.get("sort") ?? "")
    ? (searchParams.get("sort") as SortKey)
    : "date_desc");
  const navMode = (["list", "year", "tag"].includes(searchParams.get("nav") ?? "")
    ? (searchParams.get("nav") as NavMode)
    : "year");
  const docParam = searchParams.get("doc") ?? "";

  const canUnlockContent = hasContentApi();
  const sortOptions = useMemo(() => {
    return [
      { value: "date_desc", label: t("docs.sortDateDesc") },
      { value: "date_asc", label: t("docs.sortDateAsc") },
      { value: "title_asc", label: t("docs.sortTitleAsc") },
      { value: "words_desc", label: t("docs.sortWordsDesc") },
    ];
  }, [t]);

  const filtered = useMemo(() => {
    const base = data.all.filter((doc) => {
      if (type !== "all" && doc.type !== type) {
        return false;
      }
      if (tag && !doc.tags.includes(tag)) {
        return false;
      }
      if (!query) {
        return true;
      }
      if (fulltextMatches) {
        return fulltextMatches.has(doc.filename);
      }
      return includesQuery(doc, query);
    });
    return sortedDocs(base, sortBy);
  }, [data, query, sortBy, tag, type, fulltextMatches]);

  const yearThemeGroups = useMemo<YearThemeGroup[]>(() => {
    const byYear = new Map<string, DocItem[]>();
    filtered.forEach((doc) => {
      const year = docYear(doc);
      const docs = byYear.get(year) ?? [];
      docs.push(doc);
      byYear.set(year, docs);
    });

    const groups: YearThemeGroup[] = [];
    for (const [year, docs] of byYear.entries()) {
      const byTheme = new Map<string, DocItem[]>();
      docs.forEach((doc) => {
        const theme = resolveTheme(doc);
        const list = byTheme.get(theme) ?? [];
        list.push(doc);
        byTheme.set(theme, list);
      });

      const themes = [...byTheme.entries()]
        .map(([theme, list]) => ({
          theme,
          docs: sortedDocs(list, "date_desc"),
        }))
        .sort((a, b) => {
          if (b.docs.length !== a.docs.length) {
            return b.docs.length - a.docs.length;
          }
          return a.theme.localeCompare(b.theme);
        });

      groups.push({ year, total: docs.length, themes });
    }

    return groups.sort((a, b) => b.year.localeCompare(a.year));
  }, [filtered]);

  const byTag = useMemo(() => {
    const tags = tagCounts(filtered).slice(0, 24);
    return tags.map((entry) => {
      const docs = filtered.filter((doc) => doc.tags.includes(entry.name)).slice(0, 30);
      return { ...entry, docs };
    });
  }, [filtered]);

  const activeDoc = useMemo(() => {
    return filtered.find((doc) => doc.filename === docParam) ?? filtered[0] ?? null;
  }, [docParam, filtered]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "doc") {
      next.delete("doc");
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let alive = true;
    const run = async () => {
      const normalized = query.trim();
      if (normalized.length < 2) {
        setFulltextMatches(null);
        setLoadingFulltext(false);
        return;
      }
      setLoadingFulltext(true);
      try {
        const matches = await fulltextSearch(normalized);
        if (!alive) {
          return;
        }
        setFulltextMatches(matches);
      } catch {
        if (alive) {
          setFulltextMatches(null);
        }
      } finally {
        if (alive) {
          setLoadingFulltext(false);
        }
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [query]);

  useEffect(() => {
    if (!activeDoc) {
      setMarkdownHtml("");
      return;
    }
    if (docParam !== activeDoc.filename) {
      const next = new URLSearchParams(searchParams);
      next.set("doc", activeDoc.filename);
      setSearchParams(next, { replace: true });
    }
  }, [activeDoc, docParam, searchParams, setSearchParams]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!activeDoc) {
        return;
      }
      setLoadingDoc(true);
      setContentProtected(false);
      setAuthError("");
      try {
        const md = await loadMarkdown(activeDoc.filename);
        const parsed = await marked.parse(md);
        if (!alive) {
          return;
        }
        const safeHtml = DOMPurify.sanitize(parsed as string);
        setMarkdownHtml(safeHtml);
      } catch (error) {
        if (alive) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("content_protected")) {
            setContentProtected(true);
            setMarkdownHtml(`<p>${t("docs.contentProtected")}</p>`);
          } else if (message.includes("access_required")) {
            setContentProtected(true);
            setMarkdownHtml(`<p>${t("docs.accessRequired")}</p>`);
          } else {
            setMarkdownHtml(`<p>${t("state.loadErrorTitle")}</p>`);
          }
        }
      } finally {
        if (alive) {
          setLoadingDoc(false);
        }
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [activeDoc, t, reloadNonce]);

  const onUnlockContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authEmail.trim()) {
      setAuthError(t("docs.accessEmailRequired"));
      return;
    }
    if (!authInviteCode.trim()) {
      setAuthError(t("docs.accessCodeRequired"));
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");
    try {
      await requestInviteAccess(authEmail.trim(), authInviteCode.trim());
      setAuthInviteCode("");
      setReloadNonce((prev) => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("access_denied")) {
        setAuthError(t("docs.accessDenied"));
      } else if (message.includes("content_api_unconfigured")) {
        setAuthError(t("docs.accessNeedApi"));
      } else {
        setAuthError(t("docs.accessGenericError"));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <main className="container docs-layout">
      <aside className="card sidebar">
        <h1>{t("docs.title")}</h1>
        <p className="muted">{t("docs.subtitle")}</p>

        <div className="filters">
          <input
            value={query}
            onChange={(event) => setParam("q", event.target.value)}
            placeholder={t("docs.searchPlaceholder")}
          />
          {query.trim().length >= 2 && (
            <p className="muted">{loadingFulltext ? t("docs.fulltextLoading") : t("docs.fulltextReady")}</p>
          )}

          <div className="switch-row">
            <button className={`pill ${type === "all" ? "primary" : "ghost"}`} onClick={() => setParam("type", "all")} type="button">{t("docs.typeAll")}</button>
            <button className={`pill ${type === "podcast" ? "primary" : "ghost"}`} onClick={() => setParam("type", "podcast")} type="button">{t("docs.typePodcast")}</button>
            <button className={`pill ${type === "newsletter" ? "primary" : "ghost"}`} onClick={() => setParam("type", "newsletter")} type="button">{t("docs.typeNewsletter")}</button>
          </div>

          <label className="field-label">{t("docs.sortBy")}</label>
          <NeoSelect
            value={sortBy}
            options={sortOptions}
            ariaLabel={t("docs.sortBy")}
            onChange={(next) => setParam("sort", next)}
          />

          <label className="field-label">{t("docs.navMode")}</label>
          <div className="switch-row">
            <button className={`pill ${navMode === "list" ? "primary" : "ghost"}`} onClick={() => setParam("nav", "list")} type="button">{t("docs.navList")}</button>
            <button className={`pill ${navMode === "year" ? "primary" : "ghost"}`} onClick={() => setParam("nav", "year")} type="button">{t("docs.navYear")}</button>
            <button className={`pill ${navMode === "tag" ? "primary" : "ghost"}`} onClick={() => setParam("nav", "tag")} type="button">{t("docs.navTag")}</button>
          </div>

          <label className="field-label">{t("docs.tags")}</label>
          <div className="tag-cloud">
            <button type="button" className={`tag ${!tag ? "active" : ""}`} onClick={() => setParam("tag", "")}>{t("docs.typeAll")}</button>
            {tagCounts(data.all).slice(0, 40).map((entry) => (
              <button
                key={entry.name}
                type="button"
                className={`tag ${tag === entry.name ? "active" : ""}`}
                onClick={() => setParam("tag", entry.name)}
              >
                {entry.name} ({entry.count})
              </button>
            ))}
          </div>
        </div>

        <p className="result-count">{t("docs.resultCount", { count: formatNumber(filtered.length, locale) })}</p>

        {navMode === "list" && (
          <ul className="doc-list">
            {filtered.length === 0 && <li className="doc-item">{t("docs.noResults")}</li>}
            {filtered.map((doc) => {
              const typeLabel = doc.type === "podcast" ? t("docs.typeLabelPodcast") : t("docs.typeLabelNewsletter");
              return (
                <li
                  key={doc.filename}
                  className={`doc-item ${activeDoc?.filename === doc.filename ? "active" : ""}`}
                  onClick={() => setParam("doc", doc.filename)}
                >
                  <p className="doc-item-title">{doc.title}</p>
                  <p className="doc-item-meta">
                    {typeLabel} · {formatDate(doc.date, locale)} · {t("docs.metaWords", { count: formatNumber(doc.wordCount, locale) })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {navMode === "year" && (
          <div className="group-list">
            {yearThemeGroups.map((yearGroup, yearIndex) => (
              <details key={yearGroup.year} open={yearIndex === 0}>
                <summary>{yearGroup.year} ({yearGroup.total})</summary>
                <div className="group-level-2">
                  {yearGroup.themes.map((themeGroup, themeIndex) => (
                    <details key={`${yearGroup.year}-${themeGroup.theme}`} open={themeIndex === 0}>
                      <summary>{formatThemeName(themeGroup.theme)} ({themeGroup.docs.length})</summary>
                      <ul className="doc-list compact">
                        {themeGroup.docs.map((doc) => (
                          <li
                            key={doc.filename}
                            className={`doc-item ${activeDoc?.filename === doc.filename ? "active" : ""}`}
                            onClick={() => setParam("doc", doc.filename)}
                          >
                            <p className="doc-item-title">{doc.title}</p>
                            <p className="doc-item-meta">{formatDate(doc.date, locale)}</p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {navMode === "tag" && (
          <div className="group-list">
            {byTag.map((entry, idx) => (
              <details key={entry.name} open={idx === 0}>
                <summary>{entry.name} ({entry.count})</summary>
                <ul className="doc-list compact">
                  {entry.docs.map((doc) => (
                    <li
                      key={`${entry.name}-${doc.filename}`}
                      className={`doc-item ${activeDoc?.filename === doc.filename ? "active" : ""}`}
                      onClick={() => setParam("doc", doc.filename)}
                    >
                      <p className="doc-item-title">{doc.title}</p>
                      <p className="doc-item-meta">{formatDate(doc.date, locale)}</p>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </aside>

      <section className="card reader">
        {!activeDoc && (
          <article className="doc-empty">
            <h2>{t("docs.emptyTitle")}</h2>
            <p>{t("docs.emptyBody")}</p>
          </article>
        )}

        {activeDoc && (
          <article>
            <p className="eyebrow">{activeDoc.type === "podcast" ? t("docs.typeLabelPodcast") : t("docs.typeLabelNewsletter")}</p>
            <h2>{activeDoc.title}</h2>
            <div className="doc-meta">
              <span>{formatDate(activeDoc.date, locale)}</span>
              <span>{t("docs.metaWords", { count: formatNumber(activeDoc.wordCount, locale) })}</span>
              {activeDoc.guest && <span>{t("docs.metaGuest", { guest: activeDoc.guest })}</span>}
              {activeDoc.subtitle && <span>{t("docs.metaSubtitle", { subtitle: activeDoc.subtitle })}</span>}
            </div>

            <div className="tag-cloud">
              {activeDoc.tags.map((oneTag) => (
                <button key={oneTag} className="tag" type="button" onClick={() => setParam("tag", oneTag)}>{oneTag}</button>
              ))}
            </div>

            {isPrivateContentMode() && getRawDocUrl(activeDoc.filename) && (
              <Link className="pill ghost" to={getRawDocUrl(activeDoc.filename) ?? ""} target="_blank" rel="noreferrer">
                {t("docs.openRaw")}
              </Link>
            )}

            {loadingDoc && <p className="muted">{t("state.loading")}</p>}
            {contentProtected && <p className="muted">{t("docs.contentProtectedHint")}</p>}
            {contentProtected && (
              <form className="access-gate" onSubmit={onUnlockContent}>
                <h3>{t("docs.accessGateTitle")}</h3>
                <p className="muted">{t("docs.accessGateBody")}</p>\n                {!canUnlockContent && <p className="muted">{t("docs.accessNeedApi")}</p>}

                <label className="field-label" htmlFor="access-email">{t("docs.accessEmailLabel")}</label>
                <input
                  id="access-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <label className="field-label" htmlFor="access-invite">{t("docs.accessCodeLabel")}</label>
                <input
                  id="access-invite"
                  type="password"
                  value={authInviteCode}
                  onChange={(event) => setAuthInviteCode(event.target.value)}
                  placeholder="INVITE-CODE"
                  autoComplete="off"
                />

                <div className="switch-row">
                  <button className="pill primary" type="submit" disabled={authSubmitting || !canUnlockContent}>
                    {authSubmitting ? t("docs.accessSubmitting") : t("docs.accessSubmit")}
                  </button>
                  <button
                    className="pill ghost"
                    type="button"
                    onClick={() => {
                      clearAccessSession();
                      setAuthInviteCode("");
                      setReloadNonce((prev) => prev + 1);
                    }}
                  >
                    {t("docs.accessLogout")}
                  </button>
                </div>

                {authError && <p className="muted">{authError}</p>}
              </form>
            )}
            
            <div className="markdown" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
          </article>
        )}
      </section>
    </main>
  );
}



