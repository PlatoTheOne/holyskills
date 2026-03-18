import { useEffect, useMemo, useState } from "react";
import { HashRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { NeoSelect } from "./components/NeoSelect";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale, translate, type Locale } from "./i18n";
import { loadIndexData } from "./lib/data";
import { DocsPage } from "./pages/DocsPage";
import { HomePage } from "./pages/HomePage";
import { SkillsPage } from "./pages/SkillsPage";
import type { NormalizedData } from "./types";

function readLocaleFromUrl(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const candidate = params.get("lang") ?? params.get("locale");
  if (candidate === "zh-CN" || candidate === "zh-HK" || candidate === "en") {
    return candidate;
  }
  return null;
}

function useLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    const fromUrl = readLocaleFromUrl();
    if (fromUrl) {
      return fromUrl;
    }
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return normalizeLocale(stored ?? DEFAULT_LOCALE);
  });

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get("lang") !== locale) {
        currentUrl.searchParams.set("lang", locale);
        const search = currentUrl.searchParams.toString();
        const nextUrl = `${currentUrl.pathname}${search ? `?${search}` : ""}${currentUrl.hash}`;
        window.history.replaceState(null, "", nextUrl);
      }
    }
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
  const localeOptions = useMemo(() => {
    return [
      { value: "zh-CN", label: "简体中文" },
      { value: "zh-HK", label: "繁體中文" },
      { value: "en", label: "English" },
    ];
  }, []);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await loadIndexData(locale);
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
  }, [locale]);

  return (
    <HashRouter>
      <div className="bg-glow" />
      <header className="container topbar-shell">
        <div className="topbar">
          <Link className="brand" to="/">{t("app.brand")}</Link>
          <nav className="topbar-nav">
            <Link className="pill ghost" to="/">{t("nav.home")}</Link>
            <Link className="pill ghost" to="/docs">{t("nav.docs")}</Link>
            <NeoSelect
              value={locale}
              options={localeOptions}
              ariaLabel={t("nav.localeSelect")}
              onChange={(next) => setLocale(normalizeLocale(next))}
            />
          </nav>
        </div>
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
          <Route path="/skills" element={<SkillsPage t={t} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}
