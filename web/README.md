# Lenny Data Web (React + Vite)

## 开发

```bash
npm install
npm run dev
```

## 常用脚本

- `npm run sync:data`：从上级数据镜像仓同步到 `public/data`
- `npm run build`：TS 检查 + Vite 构建
- `npm run build:with-data`：先同步数据再构建

## 数据来源

默认读取：
- `public/data/index.json`
- `public/data/newsletters/*.md`
- `public/data/podcasts/*.md`

这些文件由根目录脚本 `scripts/sync-lenny-data.mjs` 生成。
