(function () {
  "use strict";

  var portal = window.LennyPortal;
  var currentLang = portal.bindLanguageSwitcher();
  var allDocs = [];
  var filtered = [];

  var state = {
    type: "all",
    q: "",
    sort: "date_desc",
    tag: "",
    doc: ""
  };

  var refs = {
    searchInput: document.getElementById("search-input"),
    sortSelect: document.getElementById("sort-select"),
    typeButtons: Array.prototype.slice.call(document.querySelectorAll(".type-switch [data-type]")),
    tagFilter: document.getElementById("tag-filter"),
    resultCount: document.getElementById("result-count"),
    docsList: document.getElementById("docs-list"),
    empty: document.getElementById("doc-empty"),
    content: document.getElementById("doc-content"),
    docType: document.getElementById("doc-type"),
    docTitle: document.getElementById("doc-title"),
    docMeta: document.getElementById("doc-meta"),
    docTags: document.getElementById("doc-tags"),
    docFileLink: document.getElementById("doc-file-link"),
    docMarkdown: document.getElementById("doc-markdown")
  };

  function parseQuery() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("type");
    var q = params.get("q");
    var sort = params.get("sort");
    var tag = params.get("tag");
    var doc = params.get("doc");

    state.type = type === "podcast" || type === "newsletter" ? type : "all";
    state.q = q ? q.trim() : "";
    state.sort = sort || "date_desc";
    state.tag = tag || "";
    state.doc = doc || "";
  }

  function syncUrl() {
    var params = new URLSearchParams();
    if (state.type !== "all") {
      params.set("type", state.type);
    }
    if (state.q) {
      params.set("q", state.q);
    }
    if (state.sort !== "date_desc") {
      params.set("sort", state.sort);
    }
    if (state.tag) {
      params.set("tag", state.tag);
    }
    if (state.doc) {
      params.set("doc", state.doc);
    }
    var next = params.toString();
    var url = window.location.pathname + (next ? "?" + next : "");
    window.history.replaceState({}, "", url);
  }

  function matches(doc) {
    if (state.type !== "all" && doc.type !== state.type) {
      return false;
    }
    if (state.tag && !(doc.tags || []).includes(state.tag)) {
      return false;
    }
    if (!state.q) {
      return true;
    }

    var text = [
      doc.title,
      doc.summary,
      doc.guest,
      doc.subtitle,
      doc.filename,
      (doc.tags || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();
    return text.indexOf(state.q.toLowerCase()) >= 0;
  }

  function sortDocs(list) {
    var sorted = list.slice();
    if (state.sort === "date_asc") {
      sorted.sort(function (a, b) {
        return String(a.date).localeCompare(String(b.date));
      });
      return sorted;
    }
    if (state.sort === "title_asc") {
      sorted.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
      return sorted;
    }
    if (state.sort === "words_desc") {
      sorted.sort(function (a, b) {
        return b.wordCount - a.wordCount;
      });
      return sorted;
    }
    sorted.sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    return sorted;
  }

  function updateFilterControls() {
    refs.searchInput.value = state.q;
    refs.sortSelect.value = state.sort;
    refs.typeButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-type") === state.type;
      btn.classList.toggle("primary", active);
      btn.classList.toggle("ghost", !active);
    });
  }

  function makeItem(doc) {
    var li = document.createElement("li");
    li.className = "doc-item";
    if (doc.filename === state.doc) {
      li.classList.add("active");
    }

    var title = document.createElement("p");
    title.className = "doc-item-title";
    title.textContent = doc.title;

    var meta = document.createElement("p");
    meta.className = "doc-item-meta";
    var typeLabel = doc.type === "podcast"
      ? portal.t(currentLang, "docs.typeLabelPodcast")
      : portal.t(currentLang, "docs.typeLabelNewsletter");
    meta.textContent = [
      typeLabel,
      portal.formatDate(doc.date, currentLang),
      portal.t(currentLang, "docs.metaWords", { count: portal.formatNumber(doc.wordCount, currentLang) })
    ].join(" · ");

    li.appendChild(title);
    li.appendChild(meta);
    li.addEventListener("click", function () {
      state.doc = doc.filename;
      syncUrl();
      renderDocsList();
      renderCurrentDoc();
    });
    return li;
  }

  function renderDocsList() {
    refs.docsList.innerHTML = "";
    filtered.forEach(function (doc) {
      refs.docsList.appendChild(makeItem(doc));
    });
    refs.resultCount.textContent = portal.t(currentLang, "docs.resultCount", {
      count: portal.formatNumber(filtered.length, currentLang)
    });

    if (!filtered.length) {
      var li = document.createElement("li");
      li.className = "doc-item";
      li.textContent = portal.t(currentLang, "docs.noResults");
      refs.docsList.appendChild(li);
    }
  }

  function renderTagFilter() {
    refs.tagFilter.innerHTML = "";
    var tagStats = portal.countTags(allDocs).slice(0, 40);

    var allBtn = document.createElement("button");
    allBtn.className = "tag" + (state.tag ? "" : " active");
    allBtn.type = "button";
    allBtn.textContent = portal.t(currentLang, "docs.typeAll");
    allBtn.addEventListener("click", function () {
      state.tag = "";
      applyFilters();
    });
    refs.tagFilter.appendChild(allBtn);

    tagStats.forEach(function (tag) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag" + (tag.name === state.tag ? " active" : "");
      btn.textContent = tag.name + " (" + tag.count + ")";
      btn.addEventListener("click", function () {
        state.tag = tag.name;
        applyFilters();
      });
      refs.tagFilter.appendChild(btn);
    });
  }

  async function renderCurrentDoc() {
    var doc = allDocs.find(function (x) {
      return x.filename === state.doc;
    });

    if (!doc) {
      refs.empty.classList.remove("hidden");
      refs.content.classList.add("hidden");
      return;
    }

    refs.empty.classList.add("hidden");
    refs.content.classList.remove("hidden");
    refs.docType.textContent = doc.type === "podcast"
      ? portal.t(currentLang, "docs.typeLabelPodcast")
      : portal.t(currentLang, "docs.typeLabelNewsletter");
    refs.docTitle.textContent = doc.title;
    refs.docFileLink.href = portal.DATA_ROOT + "/" + doc.filename;

    refs.docMeta.innerHTML = "";
    var metaParts = [
      portal.formatDate(doc.date, currentLang),
      portal.t(currentLang, "docs.metaWords", { count: portal.formatNumber(doc.wordCount, currentLang) })
    ];
    if (doc.guest) {
      metaParts.push(portal.t(currentLang, "docs.metaGuest", { guest: doc.guest }));
    }
    if (doc.subtitle) {
      metaParts.push(portal.t(currentLang, "docs.metaSubtitle", { subtitle: doc.subtitle }));
    }
    metaParts.forEach(function (text) {
      var span = document.createElement("span");
      span.textContent = text;
      refs.docMeta.appendChild(span);
    });

    refs.docTags.innerHTML = "";
    (doc.tags || []).forEach(function (tagName) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tag";
      b.textContent = tagName;
      b.addEventListener("click", function () {
        state.tag = tagName;
        applyFilters();
      });
      refs.docTags.appendChild(b);
    });

    try {
      var response = await fetch(portal.DATA_ROOT + "/" + doc.filename);
      if (!response.ok) {
        throw new Error("fetch failed");
      }
      var markdown = await response.text();
      if (window.marked && typeof window.marked.parse === "function") {
        refs.docMarkdown.innerHTML = window.marked.parse(markdown);
      } else {
        refs.docMarkdown.textContent = markdown;
      }
    } catch (e) {
      refs.docMarkdown.innerHTML = "<p>" + portal.t(currentLang, "docs.loadFailed") + "</p>";
    }
  }

  function applyFilters() {
    filtered = sortDocs(allDocs.filter(matches));
    if (state.doc && !filtered.some(function (x) { return x.filename === state.doc; })) {
      state.doc = filtered[0] ? filtered[0].filename : "";
    }

    updateFilterControls();
    renderTagFilter();
    renderDocsList();
    renderCurrentDoc();
    syncUrl();
  }

  function bindEvents() {
    refs.searchInput.addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      applyFilters();
    });

    refs.sortSelect.addEventListener("change", function (e) {
      state.sort = e.target.value;
      applyFilters();
    });

    refs.typeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.type = btn.getAttribute("data-type");
        applyFilters();
      });
    });
  }

  function relabelSortOptions() {
    var options = refs.sortSelect.options;
    if (!options || options.length < 4) {
      return;
    }
    if (currentLang === "en") {
      options[0].text = "Date (newest first)";
      options[1].text = "Date (oldest first)";
      options[2].text = "Title (A-Z)";
      options[3].text = "Word count (high to low)";
      return;
    }
    if (currentLang === "zh-HK") {
      options[0].text = "日期（新到舊）";
      options[1].text = "日期（舊到新）";
      options[2].text = "標題（A-Z）";
      options[3].text = "詞數（高到低）";
      return;
    }
    options[0].text = "日期（新到旧）";
    options[1].text = "日期（旧到新）";
    options[2].text = "标题（A-Z）";
    options[3].text = "词数（高到低）";
  }

  function showLoadError(err) {
    refs.resultCount.textContent = portal.t(currentLang, "docs.loadFailed");
    refs.docsList.innerHTML = "";
    var li = document.createElement("li");
    li.className = "doc-item";
    li.innerHTML =
      "<div style=\"font-weight:700;margin-bottom:6px\">数据加载失败</div>" +
      "<div style=\"font-size:12px;color:#a4a4a4\">请在 <code>G:\\LennysData</code> 目录运行 <code>.\\start-lenny-portal.cmd</code>，并访问 <code>/portal/docs.html</code>。</div>" +
      "<div style=\"font-size:12px;color:#a4a4a4;margin-top:6px\">错误信息: " + String(err && err.message ? err.message : err) + "</div>";
    refs.docsList.appendChild(li);
  }

  portal.onLanguageChanged = function (lang) {
    currentLang = lang;
    relabelSortOptions();
    applyFilters();
  };

  parseQuery();
  bindEvents();
  relabelSortOptions();

  portal
    .loadIndexData()
    .then(function (indexData) {
      var normalized = portal.normalizeData(indexData);
      allDocs = normalized.all;
      filtered = allDocs;

      if (!state.doc) {
        state.doc = allDocs[0] ? allDocs[0].filename : "";
      }
      applyFilters();
    })
    .catch(function (err) {
      showLoadError(err);
    });
})();
