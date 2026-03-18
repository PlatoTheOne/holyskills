(function () {
  "use strict";

  var DATA_ROOT = "../lennys-newsletterpodcastdata-all";
  var pathName = window.location.pathname.toLowerCase();
  var DATA_ROOT_CANDIDATES = [];
  if (pathName.indexOf("/portal/") !== -1) {
    DATA_ROOT_CANDIDATES.push("../lennys-newsletterpodcastdata-all");
  }
  DATA_ROOT_CANDIDATES.push("../lennys-newsletterpodcastdata-all");
  DATA_ROOT_CANDIDATES.push("/lennys-newsletterpodcastdata-all");
  DATA_ROOT_CANDIDATES.push("./lennys-newsletterpodcastdata-all");
  DATA_ROOT_CANDIDATES = DATA_ROOT_CANDIDATES.filter(function (v, i, a) {
    return a.indexOf(v) === i;
  });

  var cache = {
    index: null
  };

  var translations = {
    "zh-CN": {
      "nav.docs": "文档中心",
      "nav.home": "返回首页",
      "home.eyebrow": "Lenny 私有知识库总览",
      "home.title": "把所有内容变成可检索、可跳转、可阅读的 Docs 体验",
      "home.subtitle": "首页聚合核心指标与最新内容，文档页支持筛选、搜索、标签导航和原文阅读。",
      "home.openDocs": "打开文档中心",
      "home.openPodcasts": "只看播客",
      "home.openNewsletters": "只看 Newsletter",
      "home.latestPodcasts": "最新播客",
      "home.latestNewsletters": "最新 Newsletter",
      "home.viewAll": "查看全部",
      "home.topTags": "热门标签",
      "home.exploreInDocs": "去文档页探索",
      "home.quickSearch": "快速检索入口",
      "home.searchDocs": "搜索文档",
      "home.searchPlaceholder": "输入关键词，例如 AI、growth、leadership",
      "stats.totalDocs": "文档总数",
      "stats.podcastCount": "播客文档",
      "stats.newsletterCount": "Newsletter 文档",
      "stats.totalWords": "总词数",
      "docs.title": "文档中心",
      "docs.subtitle": "筛选后点击文档，即可在右侧阅读原文",
      "docs.typeAll": "全部",
      "docs.typePodcast": "播客",
      "docs.typeNewsletter": "Newsletter",
      "docs.sortBy": "排序方式",
      "docs.tags": "标签过滤",
      "docs.emptyTitle": "请选择一篇文档",
      "docs.emptyBody": "你可以从左侧列表点击，或者使用筛选和标签快速定位。",
      "docs.openRaw": "打开原始 Markdown 文件",
      "docs.resultCount": "共 {count} 篇",
      "docs.noResults": "没有匹配结果",
      "docs.loadFailed": "文档加载失败",
      "docs.searchPlaceholder": "搜索标题、标签、嘉宾、摘要",
      "docs.metaWords": "{count} 词",
      "docs.metaGuest": "嘉宾：{guest}",
      "docs.metaSubtitle": "副标题：{subtitle}",
      "docs.typeLabelPodcast": "播客",
      "docs.typeLabelNewsletter": "Newsletter"
    },
    "zh-HK": {
      "nav.docs": "文件中心",
      "nav.home": "返回首頁",
      "home.eyebrow": "Lenny 私有知識庫總覽",
      "home.title": "把所有內容變成可檢索、可跳轉、可閱讀的 Docs 體驗",
      "home.subtitle": "首頁聚合核心指標與最新內容，文件頁支援篩選、搜尋、標籤導覽和原文閱讀。",
      "home.openDocs": "打開文件中心",
      "home.openPodcasts": "只看播客",
      "home.openNewsletters": "只看 Newsletter",
      "home.latestPodcasts": "最新播客",
      "home.latestNewsletters": "最新 Newsletter",
      "home.viewAll": "查看全部",
      "home.topTags": "熱門標籤",
      "home.exploreInDocs": "去文件頁探索",
      "home.quickSearch": "快速檢索入口",
      "home.searchDocs": "搜尋文件",
      "home.searchPlaceholder": "輸入關鍵詞，例如 AI、growth、leadership",
      "stats.totalDocs": "文件總數",
      "stats.podcastCount": "播客文件",
      "stats.newsletterCount": "Newsletter 文件",
      "stats.totalWords": "總詞數",
      "docs.title": "文件中心",
      "docs.subtitle": "篩選後點擊文件，即可在右側閱讀原文",
      "docs.typeAll": "全部",
      "docs.typePodcast": "播客",
      "docs.typeNewsletter": "Newsletter",
      "docs.sortBy": "排序方式",
      "docs.tags": "標籤過濾",
      "docs.emptyTitle": "請先選擇一篇文件",
      "docs.emptyBody": "你可以從左側列表點擊，或使用篩選與標籤快速定位。",
      "docs.openRaw": "打開原始 Markdown 檔案",
      "docs.resultCount": "共 {count} 篇",
      "docs.noResults": "沒有匹配結果",
      "docs.loadFailed": "文件載入失敗",
      "docs.searchPlaceholder": "搜尋標題、標籤、嘉賓、摘要",
      "docs.metaWords": "{count} 詞",
      "docs.metaGuest": "嘉賓：{guest}",
      "docs.metaSubtitle": "副標題：{subtitle}",
      "docs.typeLabelPodcast": "播客",
      "docs.typeLabelNewsletter": "Newsletter"
    },
    en: {
      "nav.docs": "Docs",
      "nav.home": "Back Home",
      "home.eyebrow": "Lenny Private Archive Overview",
      "home.title": "Turn the whole archive into a searchable, navigable docs experience",
      "home.subtitle": "The homepage summarizes key metrics and latest entries. The docs page supports filters, search, tags, and full-text reading.",
      "home.openDocs": "Open Docs",
      "home.openPodcasts": "Podcasts Only",
      "home.openNewsletters": "Newsletters Only",
      "home.latestPodcasts": "Latest Podcasts",
      "home.latestNewsletters": "Latest Newsletters",
      "home.viewAll": "View All",
      "home.topTags": "Top Tags",
      "home.exploreInDocs": "Explore In Docs",
      "home.quickSearch": "Quick Search",
      "home.searchDocs": "Search Docs",
      "home.searchPlaceholder": "Enter keywords, e.g. AI, growth, leadership",
      "stats.totalDocs": "Total Docs",
      "stats.podcastCount": "Podcast Docs",
      "stats.newsletterCount": "Newsletter Docs",
      "stats.totalWords": "Total Words",
      "docs.title": "Docs Center",
      "docs.subtitle": "Filter on the left and read the original markdown on the right.",
      "docs.typeAll": "All",
      "docs.typePodcast": "Podcast",
      "docs.typeNewsletter": "Newsletter",
      "docs.sortBy": "Sort By",
      "docs.tags": "Tag Filter",
      "docs.emptyTitle": "Select a document",
      "docs.emptyBody": "Pick any entry from the left list or use tags and search to narrow down.",
      "docs.openRaw": "Open Raw Markdown",
      "docs.resultCount": "{count} results",
      "docs.noResults": "No matching results",
      "docs.loadFailed": "Failed to load document",
      "docs.searchPlaceholder": "Search title, tags, guest, summary",
      "docs.metaWords": "{count} words",
      "docs.metaGuest": "Guest: {guest}",
      "docs.metaSubtitle": "Subtitle: {subtitle}",
      "docs.typeLabelPodcast": "Podcast",
      "docs.typeLabelNewsletter": "Newsletter"
    }
  };

  function resolveLanguage() {
    var urlLang = new URLSearchParams(window.location.search).get("lang");
    var stored = localStorage.getItem("lenny.portal.lang");
    var candidate = urlLang || stored || "zh-CN";
    if (!translations[candidate]) {
      candidate = "zh-CN";
    }
    return candidate;
  }

  function setLanguage(lang) {
    var safe = translations[lang] ? lang : "zh-CN";
    localStorage.setItem("lenny.portal.lang", safe);
    document.documentElement.lang = safe;
    return safe;
  }

  function t(lang, key, vars) {
    var dict = translations[lang] || translations["zh-CN"];
    var text = dict[key] || translations["zh-CN"][key] || key;
    if (!vars) {
      return text;
    }
    return text.replace(/\{(\w+)\}/g, function (_, k) {
      return Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : "";
    });
  }

  function applyTranslations(lang) {
    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      node.textContent = t(lang, key);
    });

    var phNodes = document.querySelectorAll("[data-i18n-placeholder]");
    phNodes.forEach(function (node) {
      var pKey = node.getAttribute("data-i18n-placeholder");
      node.setAttribute("placeholder", t(lang, pKey));
    });
  }

  function bindLanguageSwitcher() {
    var lang = setLanguage(resolveLanguage());
    var switcher = document.getElementById("lang-switcher");
    if (switcher) {
      switcher.value = lang;
      switcher.addEventListener("change", function (e) {
        var next = setLanguage(e.target.value);
        applyTranslations(next);
        if (window.LennyPortal && typeof window.LennyPortal.onLanguageChanged === "function") {
          window.LennyPortal.onLanguageChanged(next);
        }
      });
    }
    applyTranslations(lang);
    return lang;
  }

  async function loadIndexData() {
    if (cache.index) {
      return cache.index;
    }

    var lastError = null;
    for (var i = 0; i < DATA_ROOT_CANDIDATES.length; i += 1) {
      var base = DATA_ROOT_CANDIDATES[i];
      try {
        var response = await fetch(base + "/index.json");
        if (!response.ok) {
          lastError = new Error("HTTP " + response.status + " on " + base + "/index.json");
          continue;
        }
        var data = await response.json();
        DATA_ROOT = base;
        cache.index = data;
        if (window.LennyPortal) {
          window.LennyPortal.DATA_ROOT = DATA_ROOT;
        }
        return data;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to load index.json from all candidate roots");
  }

  function normalizeData(indexData) {
    function pack(item, type) {
      return {
        type: type,
        title: item.title || "",
        filename: item.filename || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        wordCount: Number(item.word_count || 0),
        date: item.date || "",
        summary: item.description || item.subtitle || "",
        guest: item.guest || "",
        subtitle: item.subtitle || ""
      };
    }

    var podcasts = (indexData.podcasts || []).map(function (x) {
      return pack(x, "podcast");
    });
    var newsletters = (indexData.newsletters || []).map(function (x) {
      return pack(x, "newsletter");
    });

    var all = podcasts.concat(newsletters);
    all.sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

    return {
      podcasts: podcasts,
      newsletters: newsletters,
      all: all,
      generatedAt: indexData.generated_at || "",
      schemaVersion: indexData.schema_version || ""
    };
  }

  function formatNumber(value, lang) {
    return new Intl.NumberFormat(lang).format(value);
  }

  function formatDate(value, lang) {
    if (!value) {
      return "-";
    }
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat(lang, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(d);
  }

  function countTags(docs) {
    var m = {};
    docs.forEach(function (doc) {
      (doc.tags || []).forEach(function (tag) {
        m[tag] = (m[tag] || 0) + 1;
      });
    });
    return Object.keys(m)
      .map(function (name) {
        return { name: name, count: m[name] };
      })
      .sort(function (a, b) {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name);
      });
  }

  window.LennyPortal = {
    DATA_ROOT: DATA_ROOT,
    DATA_ROOT_CANDIDATES: DATA_ROOT_CANDIDATES,
    loadIndexData: loadIndexData,
    normalizeData: normalizeData,
    bindLanguageSwitcher: bindLanguageSwitcher,
    t: t,
    formatNumber: formatNumber,
    formatDate: formatDate,
    countTags: countTags,
    onLanguageChanged: null
  };
})();
