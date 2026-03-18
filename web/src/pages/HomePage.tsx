import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate, formatNumber, getTagLabel, tagCounts } from "../lib/data";
import type { Locale } from "../i18n";
import type { DocItem, NormalizedData } from "../types";

interface HomePageProps {
  locale: Locale;
  data: NormalizedData;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

function DocLine({ doc, locale, t }: { doc: DocItem; locale: Locale; t: HomePageProps["t"] }) {
  return (
    <li className="doc-item">
      <Link to={`/docs?doc=${encodeURIComponent(doc.filename)}`}>
        <p className="doc-item-title">{doc.title}</p>
        <p className="doc-item-meta">
          {formatDate(doc.date, locale)} · {t("docs.metaWords", { count: formatNumber(doc.wordCount, locale) })}
        </p>
      </Link>
    </li>
  );
}

export function HomePage({ locale, data, t }: HomePageProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const totalWords = useMemo(() => data.all.reduce((sum, item) => sum + item.wordCount, 0), [data]);
  const latestPodcasts = useMemo(() => [...data.podcasts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [data]);
  const latestNewsletters = useMemo(() => [...data.newsletters].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [data]);
  const topTags = useMemo(() => tagCounts(data.all).slice(0, 24), [data]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/docs?q=${encodeURIComponent(trimmed)}` : "/docs");
  };

  return (
    <main className="container home-layout">
      <section className="card hero">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1>{t("home.title")}</h1>
        <div className="hero-actions">
          <Link className="pill primary" to="/docs">{t("home.openDocs")}</Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="card metric"><p>{t("stats.totalDocs")}</p><strong>{formatNumber(data.all.length, locale)}</strong></article>
        <article className="card metric"><p>{t("stats.podcastCount")}</p><strong>{formatNumber(data.podcasts.length, locale)}</strong></article>
        <article className="card metric"><p>{t("stats.newsletterCount")}</p><strong>{formatNumber(data.newsletters.length, locale)}</strong></article>
        <article className="card metric"><p>{t("stats.totalWords")}</p><strong>{formatNumber(totalWords, locale)}</strong></article>
      </section>

      <section className="dual-grid">
        <article className="card panel">
          <div className="panel-head"><h2>{t("home.latestPodcasts")}</h2><Link to="/docs?type=podcast">{t("home.viewAll")}</Link></div>
          <ul className="doc-list">{latestPodcasts.map((doc) => <DocLine key={doc.filename} doc={doc} locale={locale} t={t} />)}</ul>
        </article>
        <article className="card panel">
          <div className="panel-head"><h2>{t("home.latestNewsletters")}</h2><Link to="/docs?type=newsletter">{t("home.viewAll")}</Link></div>
          <ul className="doc-list">{latestNewsletters.map((doc) => <DocLine key={doc.filename} doc={doc} locale={locale} t={t} />)}</ul>
        </article>
      </section>

      <section className="card panel">
        <div className="panel-head"><h2>{t("home.topTags")}</h2><Link to="/docs">{t("home.exploreInDocs")}</Link></div>
        <div className="tag-cloud">
          {topTags.map((tag) => (
            <Link key={tag.name} className="tag" to={`/docs?tag=${encodeURIComponent(tag.name)}`}>
              {getTagLabel(tag.name, data.tagLabels)} ({tag.count})
            </Link>
          ))}
        </div>
      </section>

      <section className="card panel">
        <h2>{t("home.quickSearch")}</h2>
        <form className="quick-search" onSubmit={onSearch}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("home.searchPlaceholder")} />
          <button className="pill primary" type="submit">{t("home.searchDocs")}</button>
        </form>
      </section>
    </main>
  );
}

