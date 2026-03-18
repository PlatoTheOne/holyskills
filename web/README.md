# Lenny Data Web (React + Vite)

## 开发

```bash
npm install
npm run dev
```

如果从仓库根目录启动，推荐使用：

```powershell
.\start-lenny-web.cmd
```

该命令会先做 `private` 数据同步，再启动前端。

## 常用脚本

- `npm run sync:data`：同步数据到 `public/data`（默认 `private`，含原文）
- `npm run build`：TS 检查 + Vite 构建
- `npm run build:with-data`：先同步数据再构建

也可以从仓库根目录直接执行：

```powershell
node .\scripts\sync-lenny-data.mjs --mode private
node .\scripts\sync-lenny-data.mjs --mode public
```

模式说明：
- `private`：生成 `index.json + newsletters/*.md + podcasts/*.md + search-index.json`
- `public`：只生成 `index.json + search-index.json`（不含原文）

## 内容加载策略

前端通过以下环境变量决定正文来源：
- `VITE_CONTENT_MODE=private|public`
- `VITE_DOC_CONTENT_API=<your_private_endpoint>`（可选）

行为规则：
- `private` 模式：前端直接读取 `public/data/**/*.md`
- `public` 模式且未配置 API：正文会显示为受保护
- 配置 `VITE_DOC_CONTENT_API` 后：前端通过 `/content?filename=...` 从你的私有 API/MCP 拉取正文

## 数据来源

基础索引文件：
- `public/data/index.json`
- `public/data/search-index.json`

上述文件由根目录脚本 `scripts/sync-lenny-data.mjs` 生成。

## 私有正文 API（受控访问）

仓库根目录提供了一个最小可用私有 API：
- 启动脚本：`start-private-content-api.cmd`
- 服务实现：`scripts/private-content-api.mjs`

快速启动：

```powershell
cd G:\LennysData
.\start-private-content-api.cmd
```

默认已配置为：
- 邮箱：`0xplato@gmail.com`
- 邀请码：`plato666`

然后启动前端并指定 API：

```powershell
.\start-lenny-web.cmd -DocApi "http://127.0.0.1:8788"
```

前端会在正文受保护时显示授权表单，验证通过后加载全文。
