import { useEffect, useMemo, useState } from "react";
import { HashRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale, translate, type Locale } from "./i18n";
import { loadIndexData } from "./lib/data";
import { DocsPage } from "./pages/DocsPage";
import { HomePage } from "./pages/HomePage";
import type { NormalizedData } from "./types";

function useLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return normalizeLocale(stored ?? DEFAULT_LOCALE);
  });

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return { locale, setLocale };
}

export default function App() {
  const { locale, setLocale } = useLocale();
  const [data, setData] = useState<NormalizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  }, [locale]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await loadIndexData();
        if (alive) {
          setData(loaded);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <HashRouter>
      <div className="bg-glow" />
      <header className="container topbar">
        <Link className="brand" to="/">{t("app.brand")}</Link>
        <nav className="topbar-actions">
          <Link className="pill ghost" to="/">{t("nav.home")}</Link>
          <Link className="pill ghost" to="/docs">{t("nav.docs")}</Link>
          <select value={locale} onChange={(event) => setLocale(normalizeLocale(event.target.value))}>
            <option value="zh-CN">简体中文</option>
            <option value="zh-HK">繁體中文</option>
            <option value="en">English</option>
          </select>
        </nav>
      </header>

      {loading && (
        <main className="container state-panel">
          <article className="card">
            <h2>{t("state.loading")}</h2>
          </article>
        </main>
      )}

      {!loading && error && (
        <main className="container state-panel">
          <article className="card">
            <h2>{t("state.loadErrorTitle")}</h2>
            <p>{t("state.loadErrorBody")}</p>
            <p className="muted">{error}</p>
          </article>
        </main>
      )}

      {!loading && !error && data && (
        <Routes>
          <Route path="/" element={<HomePage locale={locale} data={data} t={t} />} />
          <Route path="/docs" element={<DocsPage locale={locale} data={data} t={t} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}
