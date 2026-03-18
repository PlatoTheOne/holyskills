import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { formatDate, formatNumber, getRawDocUrl, loadMarkdown, tagCounts } from "../lib/data";
import type { Locale } from "../i18n";
import type { DocItem, NormalizedData } from "../types";

interface DocsPageProps {
  locale: Locale;
  data: NormalizedData;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

type SortKey = "date_desc" | "date_asc" | "title_asc" | "words_desc";

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

export function DocsPage({ locale, data, t }: DocsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [markdownHtml, setMarkdownHtml] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(false);

  const type = searchParams.get("type") === "podcast" || searchParams.get("type") === "newsletter"
    ? (searchParams.get("type") as "podcast" | "newsletter")
    : "all";
  const query = (searchParams.get("q") ?? "").trim();
  const tag = searchParams.get("tag") ?? "";
  const sortBy = (["date_desc", "date_asc", "title_asc", "words_desc"].includes(searchParams.get("sort") ?? "")
    ? (searchParams.get("sort") as SortKey)
    : "date_desc");
  const docParam = searchParams.get("doc") ?? "";

  const filtered = useMemo(() => {
    const base = data.all.filter((doc) => {
      if (type !== "all" && doc.type !== type) {
        return false;
      }
      if (tag && !doc.tags.includes(tag)) {
        return false;
      }
      return includesQuery(doc, query);
    });
    return sortedDocs(base, sortBy);
  }, [data, query, sortBy, tag, type]);

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
      try {
        const md = await loadMarkdown(activeDoc.filename);
        const parsed = await marked.parse(md);
        if (!alive) {
          return;
        }
        const safeHtml = DOMPurify.sanitize(parsed as string);
        setMarkdownHtml(safeHtml);
      } catch {
        if (alive) {
          setMarkdownHtml(`<p>${t("state.loadErrorTitle")}</p>`);
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
  }, [activeDoc, t]);

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

          <div className="switch-row">
            <button className={`pill ${type === "all" ? "primary" : "ghost"}`} onClick={() => setParam("type", "all")} type="button">{t("docs.typeAll")}</button>
            <button className={`pill ${type === "podcast" ? "primary" : "ghost"}`} onClick={() => setParam("type", "podcast")} type="button">{t("docs.typePodcast")}</button>
            <button className={`pill ${type === "newsletter" ? "primary" : "ghost"}`} onClick={() => setParam("type", "newsletter")} type="button">{t("docs.typeNewsletter")}</button>
          </div>

          <label className="field-label">{t("docs.sortBy")}</label>
          <select value={sortBy} onChange={(event) => setParam("sort", event.target.value)}>
            <option value="date_desc">{t("docs.sortDateDesc")}</option>
            <option value="date_asc">{t("docs.sortDateAsc")}</option>
            <option value="title_asc">{t("docs.sortTitleAsc")}</option>
            <option value="words_desc">{t("docs.sortWordsDesc")}</option>
          </select>

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

            <Link className="pill ghost" to={getRawDocUrl(activeDoc.filename)} target="_blank" rel="noreferrer">
              {t("docs.openRaw")}
            </Link>

            {loadingDoc && <p className="muted">{t("state.loading")}</p>}
            <div className="markdown" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
          </article>
        )}
      </section>
    </main>
  );
}
