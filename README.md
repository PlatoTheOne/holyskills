# Lenny Data Workspace

这个仓库采用“数据同步仓 + 门户产品仓”双仓结构，推荐长期保持。

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

默认会先同步数据，再启动 Vite 开发服务（默认端口 `5173`）。

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

## 生产构建

```powershell
.\build-lenny-web.cmd
```

产物目录：`web/dist/`

## GitHub Pages 部署

已提供手动触发 workflow：
- `.github/workflows/deploy-pages.yml`

部署前需要在仓库 Secret 中配置：
- `LENNY_DATA_TOKEN`（可访问私有数据仓的 GitHub token）

注意：GitHub Pages 默认是公网可访问。若数据涉及付费/私有内容，请先确认合规与授权范围。

## 旧版静态门户

`portal/` 目录为第一版静态 HTML 原型，后续以 `web/` React 工程为主。
