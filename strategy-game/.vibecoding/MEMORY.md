# 项目记忆 · 边境指挥官 / Frontier Commander

> 跨对话记忆。只记录"值得后续会话知道"的内容：踩坑、决策、偏好、根因链。纯执行细节不写这里。

## 项目速览（2026-09-05 建档）
- 纯前端回合制策略游戏 v0.1.2；`src/main.js`（165KB 单文件，重构中）含逻辑；esbuild 打包为 `js/game.js`（IIFE，file:// 可开）。
- 无头模拟：`sim/harness.js`（DOM shim）+ `sim/run.js`（批量对局）+ `sim/suite.js`（4 场景平衡回归）。AI 逻辑与浏览器共用同一打包产物，零分叉。
- git：仓库在 `E:\WorkPlace\DouBao-WorkPlace\strategy-game`（外层），远程已改为 `https://github.com/secondaryexaminer-spec/DouBao-strategy-game.git`。
- 重构进度：第一阶段已抽取 `src/core/mapgen.js`（地图生成纯逻辑，W/H 参数化）；行为等价已用同种子模拟验证。

## 已知问题清单（待处理）
1. **推送未完成**：本地已提交（`32d3d20` 等 3 个提交），但 2026-09-05 推送时 github.com:443 连不通（无代理、TCP 失败）。网络恢复后 `git push origin main` 即可。
2. **存档路径提示过期**：`index.html` 内两处提示写死旧路径 `E:\WorkPlace\VScode workplace\strategy-game\saves`，实际应为 `E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game\saves`。
3. **`src/sim/` 空目录**：无内容，疑似遗留，可清理或忽略。

## 踩坑与根因（按时间倒序）
- **2026-09-05 · 编码事故**：用 PowerShell `Get-Content -Raw` + `Set-Content -Encoding utf8` 改 main.js，导致全部中文变乱码（PS 5.1 默认按 ANSI/GBK 读取 UTF-8 文件）。根因链：PS 读取编码错误 → 乱码 → esbuild 报 Unterminated regular expression。**教训：改含中文的 JS 文件禁止用 PowerShell 文本管道，一律用 Node 脚本或 Read/Edit 工具；git restore 可回滚。**
- 2026-09-05 · 构建产物"过期"实为注释级差异：main.js 最后 6 分钟改动未改变 esbuild 输出内容（legalComments:none），但时间戳失联导致无法证明同步，重建后消除不确定性。

## 用户偏好与约定
- 用户偏好 VibeCoding 工作方式：每轮收尾列改动+影响+教训；分支任务拆到附属对话省 tokens——**AI 要在合适的时机主动提醒并指导用户去开附属对话**。
- 用户要求方案简单可操作；技术问题要求深度解析、拒绝黑盒结论。
