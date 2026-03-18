(function () {
  "use strict";

  var portal = window.LennyPortal;
  var currentLang = portal.bindLanguageSwitcher();
  var normalized = null;
  var searchBound = false;

  function metric(id, value) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  function makeDocLine(doc) {
    var li = document.createElement("li");
    li.className = "doc-item";
    var link = document.createElement("a");
    link.href = "./docs.html?doc=" + encodeURIComponent(doc.filename);
    link.style.color = "inherit";
    link.style.textDecoration = "none";

    var title = document.createElement("p");
    title.className = "doc-item-title";
    title.textContent = doc.title;

    var meta = document.createElement("p");
    meta.className = "doc-item-meta";
    meta.textContent = [
      portal.formatDate(doc.date, currentLang),
      portal.t(currentLang, "docs.metaWords", { count: portal.formatNumber(doc.wordCount, currentLang) })
    ].join(" · ");

    link.appendChild(title);
    link.appendChild(meta);
    li.appendChild(link);
    return li;
  }

  function renderList(targetId, docs, limit) {
    var ul = document.getElementById(targetId);
    if (!ul) {
      return;
    }
    ul.innerHTML = "";
    docs.slice(0, limit).forEach(function (doc) {
      ul.appendChild(makeDocLine(doc));
    });
  }

  function renderTags(allDocs) {
    var container = document.getElementById("tag-cloud");
    if (!container) {
      return;
    }
    container.innerHTML = "";
    portal.countTags(allDocs).slice(0, 24).forEach(function (tag) {
      var a = document.createElement("a");
      a.className = "tag";
      a.href = "./docs.html?tag=" + encodeURIComponent(tag.name);
      a.textContent = tag.name + " (" + tag.count + ")";
      container.appendChild(a);
    });
  }

  function renderOverview(data) {
    var totalDocs = data.all.length;
    var totalWords = data.all.reduce(function (sum, item) {
      return sum + item.wordCount;
    }, 0);

    metric("metric-total-docs", portal.formatNumber(totalDocs, currentLang));
    metric("metric-podcast-count", portal.formatNumber(data.podcasts.length, currentLang));
    metric("metric-newsletter-count", portal.formatNumber(data.newsletters.length, currentLang));
    metric("metric-total-words", portal.formatNumber(totalWords, currentLang));

    var podcasts = data.podcasts.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    var newsletters = data.newsletters.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

    renderList("latest-podcasts", podcasts, 8);
    renderList("latest-newsletters", newsletters, 8);
    renderTags(data.all);
  }

  function bindSearch() {
    if (searchBound) {
      return;
    }
    var form = document.getElementById("home-search-form");
    var input = document.getElementById("home-query");
    if (!form || !input) {
      return;
    }
    searchBound = true;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var url = "./docs.html";
      if (q) {
        url += "?q=" + encodeURIComponent(q);
      }
      window.location.href = url;
    });
  }

  function showLoadError(err) {
    var main = document.querySelector("main.home");
    if (!main) {
      return;
    }
    var box = document.createElement("section");
    box.className = "card";
    box.innerHTML =
      "<h2 style=\"margin-top:0\">数据加载失败</h2>" +
      "<p>通常是本地服务根目录不对。请在 <code>G:\\LennysData</code> 下运行 <code>.\\start-lenny-portal.cmd</code>，再访问 <code>/portal/index.html</code>。</p>" +
      "<p style=\"color:#a4a4a4\">错误信息: " + String(err && err.message ? err.message : err) + "</p>";
    main.insertBefore(box, main.firstChild.nextSibling);
  }

  function render() {
    if (!normalized) {
      return;
    }
    renderOverview(normalized);
    bindSearch();
  }

  portal.onLanguageChanged = function (lang) {
    currentLang = lang;
    render();
  };

  portal
    .loadIndexData()
    .then(function (indexData) {
      normalized = portal.normalizeData(indexData);
      render();
    })
    .catch(function (err) {
      metric("metric-total-docs", "Error");
      metric("metric-podcast-count", "Error");
      metric("metric-newsletter-count", "Error");
      metric("metric-total-words", "Error");
      showLoadError(err);
    });
})();
