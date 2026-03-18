# Lenny Data Portal Workspace

这个工作区采用“双仓库职责分离”模式：

## 1) 数据镜像仓库（只同步，不改造）

- 目录：`lennys-newsletterpodcastdata-all/`
- 来源：Lenny 私有仓库
- 用途：持续拉取最新 newsletter/podcast 数据
- 建议：不要在这个仓库直接改业务代码

## 2) 门户项目仓库（可持续改造）

- 目录：当前仓库根目录（`portal/` + 脚本）
- 用途：把数据做成可视化 docs 站点
- 你后续的改造、产品迭代、实验分支都放这里

## 启动门户

```powershell
.\stop-lenny-portal.cmd
.\start-lenny-portal.cmd
```

如果默认端口被占用，可指定端口：

```powershell
.\start-lenny-portal.cmd -Port 8850
```

说明：
- `stop-lenny-portal.cmd` 用于清理遗留的本地 `http.server` 进程
- 启动后请保持该终端窗口打开（关闭即停止服务）

## 更新数据镜像

先在 `lennysdata.com` 复制“pull updates”命令到剪贴板，然后执行：

```powershell
.\update-lenny-data.cmd -UseClipboardCommandOnly
```
