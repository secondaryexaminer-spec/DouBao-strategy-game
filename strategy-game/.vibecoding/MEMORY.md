# 项目记忆 · 边境指挥官 / Frontier Commander

> 跨对话记忆。只记录"值得后续会话知道"的内容：踩坑、决策、偏好、根因链。纯执行细节不写这里。

## 项目速览（2026-09-05 建档）
- 纯前端回合制策略游戏 v0.1.2；`src/main.js`（181KB 单文件）含全部逻辑；esbuild 打包为 `js/game.js`（IIFE，file:// 可开）。
- 无头模拟：`sim/harness.js`（DOM shim）+ `sim/run.js`（批量对局）+ `sim/suite.js`（4 场景平衡回归）。AI 逻辑与浏览器共用同一打包产物，零分叉。
- git：仓库在 `E:\WorkPlace\DouBao-WorkPlace\strategy-game`（外层），仅 1 次提交，工作树干净。

## 已知问题清单（待处理）
1. **构建产物过期**：`js/game.js`（2026-08-08 14:09）早于 `src/main.js`（14:15），最后一次改源码后未重新构建 → 需要 `npm run build`。
2. **存档路径提示过期**：`index.html` 内两处提示写死旧路径 `E:\WorkPlace\VScode workplace\strategy-game\saves`，实际应为 `E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game\saves`。
3. **`src/sim/` 空目录**：无内容，疑似遗留，可清理或忽略。

## 踩坑与根因（按时间倒序）
- 暂无（建档日）。

## 用户偏好与约定
- 用户偏好 VibeCoding 工作方式：每轮收尾列改动+影响+教训；分支任务拆到附属对话省 tokens——**AI 要在合适的时机主动提醒并指导用户去开附属对话**。
- 用户要求方案简单可操作；技术问题要求深度解析、拒绝黑盒结论。
