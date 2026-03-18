# Translation Workspace

## 目录结构
- `translation/zh-CN/batches/batch-XX.json`
- `translation/zh-HK/batches/batch-XX.json`
- `translation/<locale>/tag-map.json`
- `translation/<locale>/plan.json`

## 每批翻译步骤
1. 打开一个 `batch-XX.json`
2. 为每条文档填写 `translated` 字段：
   - `title`
   - `summary`
   - `subtitle`
   - `guest`
3. 完成后把 `status` 改为 `done`
4. 将标签翻译维护到 `tag-map.json`

## 编译为站点可读格式

```powershell
node .\scripts\compile-translation-meta.mjs --locale zh-CN
node .\scripts\compile-translation-meta.mjs --locale zh-HK
```

生成：
- `lennys-newsletterpodcastdata-all/i18n/<locale>/meta.json`

## 同步到前端

```powershell
node .\scripts\sync-lenny-data.mjs --mode public
```

这会把多语言数据写入：
- `web/public/data/i18n/<locale>/meta.json`
- `web/public/data/i18n/<locale>/search-index.json`
