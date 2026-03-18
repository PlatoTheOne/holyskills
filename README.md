# Lenny Data Workspace

这个仓库采用“数据同步仓 + 门户产品仓”双仓结构，推荐长期保持。
当前已经支持两种运行模式：
- `private`：本地开发模式，包含原始 Markdown 正文
- `public`：公开部署模式，只发布元数据与检索索引

## 仓库结构

1. 数据镜像仓（只同步，不做业务改造）
- 路径：`lennys-newsletterpodcastdata-all/`
- 来源：Lenny 私有数据仓
- 职责：持续拉取最新 newsletter/podcast 原始数据

2. 门户产品仓（持续开发）
- 路径：当前仓库根目录（`web/` + `scripts/` + 启动脚本）
- 职责：网页化展示、搜索、筛选、信息架构迭代、部署

## 本地开发（React 版）

```powershell
cd G:\LennysData
.\start-lenny-web.cmd
```

默认会先执行 `private` 同步（含原文），再启动 Vite 开发服务（默认端口 `5173`）。

如果你只想启动前端、不重复同步：

```powershell
.\start-lenny-web.cmd -SkipSync
```

## 数据同步

先在 `lennysdata.com` 复制“pull updates”命令，再执行：

```powershell
.\update-lenny-data.cmd -UseClipboardCommandOnly
```

然后将数据同步到前端静态目录：

```powershell
.\sync-lenny-data.cmd
```

说明：
- 默认是 `private` 模式，会同步：
  - `index.json`
  - `newsletters/*.md`
  - `podcasts/*.md`
  - `search-index.json`（基于正文生成）
- 如需生成公开快照（不含原文）：

```powershell
node .\scripts\sync-lenny-data.mjs --mode public
```

公开快照只包含：
- `web/public/data/index.json`
- `web/public/data/search-index.json`（基于元数据生成）

## 生产构建

```powershell
.\build-lenny-web.cmd
```

`build-lenny-web.cmd` 会自动使用 `public` 模式进行构建。

产物目录：`web/dist/`

## GitHub Pages 部署

已提供手动触发 workflow：
- `.github/workflows/deploy-pages.yml`

并且已配置 `push main` 自动部署。

当前默认部署路径是“公开元数据模式”，不再依赖 `LENNY_DATA_TOKEN`。

注意：
- GitHub Pages 默认是公网可访问
- 公开站点不会下发 Markdown 正文，只展示结构化信息与检索结果
- 若要在网页中查看正文，建议接入你自己的私有 API/MCP 服务（后端鉴权后返回正文）

## 旧版静态门户

`portal/` 目录为第一版静态 HTML 原型，后续以 `web/` React 工程为主。

## 专属访问门禁（邮箱 + 邀请码）

仓库已内置私有正文 API：`scripts/private-content-api.mjs`。

示例：仅允许你的邮箱 + 邀请码访问全文。

```powershell
cd G:\LennysData
.\start-private-content-api.cmd
```

默认已配置为：
- 邮箱：`0xplato@gmail.com`
- 邀请码：`plato666`

然后本地启动前端并连接该 API：

```powershell
.\start-lenny-web.cmd -DocApi "http://127.0.0.1:8788"
```

说明：
- `/auth`：校验邮箱 + 邀请码，返回短期 token
- `/content?filename=...`：必须携带 token 才会返回正文
- 如果你要线上使用，请把这个 API 部署到你自己的私有服务（Cloudflare/Vercel/自建）
