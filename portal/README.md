# Lenny Data Portal

本目录提供一个轻量本地 Docs 门户，用于可视化浏览 `lennys-newsletterpodcastdata-all` 数据仓库。

## 启动方式

在 `G:\LennysData` 下执行：

```powershell
.\start-lenny-portal.cmd
```

打开地址：

`http://localhost:8848/portal/index.html`

## 页面结构

- `index.html`：首页概览（总量、最新内容、热门标签、快速搜索）
- `docs.html`：文档阅读页（搜索、筛选、标签、排序、Markdown 阅读）

## 数据来源

- `../lennys-newsletterpodcastdata-all/index.json`
- `../lennys-newsletterpodcastdata-all/newsletters/*.md`
- `../lennys-newsletterpodcastdata-all/podcasts/*.md`

## 建议工作流

1. 先运行 `.\update-lenny-data.cmd -UseClipboardCommandOnly` 更新仓库数据
2. 再启动门户查看最新内容
