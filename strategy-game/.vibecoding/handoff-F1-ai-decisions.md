# handoff-F1：AI 机制决策层（阶段6 第一步）

> 生成时间：2026-09-08 · 主对话移交
> 任务定位：让 AI 学会使用 5 联盟的 L4 机制系统（当前 AI 永远选决策第一项，等于不用任何机制）

---

## 一、项目背景与当前进度

- **项目**：《边境指挥官》v0.2，纯前端回合制策略游戏。代码根 `E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game`，esbuild bundle 产物 `js/game.js`（file:// 可打开）。
- **已完成的阶段**：阶段0 审计 → 阶段1 基础设施（EventBus/status/facility/factionContext/registry + 7 埋点，契约 `FACTION-SYSTEM-API-CONTRACT.md` v1.3 冻结）→ 阶段2 五大联盟 L4 系统（HRE 工事 / 金帐掠袭+营地 / 威尼斯贸易 / 马穆鲁克精锐 / 大明工程，均由附属对话交付并集成）→ 阶段3 十五国机制 → 阶段4 兵种审查+45 特色 tags → **阶段5 数值平衡（已完成：3 组差异化 + 雇佣兵收敛 + 威望口径 + 平衡矩阵 10 组，suite 4/4 全过）**。
- **现在进入阶段6（AI 改良）**：用户硬约束"机制全定完才练 AI"已满足；用户要求"用冷酷难度训练，降智出中/简单"。

## 二、任务边界（F1 只做这些）

### 核心目标
让 AI 在无头 sim 环境中**真正使用 5 联盟的 L4 机制决策**，而不是永远选第一项。

### 根因（已定位）
`src/core/decision.js` 的 `requestDecision`：无头环境（无 DOM）自动选 `context.options[0]`（test fallback）。AI 运行在无头 sim，所以：
- HRE 工事决策 → 永远选"不建"（fortification.js L115-149，L304 注释"AI 阶段6 接入"）
- 金帐营地/威望相关决策 → 永远第一项
- 威尼斯贸易/借贷/雇佣、马穆鲁克晋升/学者、大明工程 → 全部跳过

### F1 工作项

1. **AI 决策器（核心）**：改造 `src/core/decision.js` 的无头分支——当 `context.owner` 是 AI（owner 形如 `ai0`/`ai1`，非 `player`）时，调用"AI 决策函数"选选项；纯测试（无 owner 或测试标记）保留原 test fallback。**必须保持接口与行为向后兼容**：阶段1 契约不变，非 AI 场景零行为变化。
2. **各机制 AI 决策实现**（按 decisionId 注册，建议集中在 `src/ai/` 新目录）：
   - `hre-fortification`：AI 按 金币余额 / 前线敌情 / 己方兵种构成 选 不建/木栅/壕沟/石堡
   - 金帐：营地建造 / 营地迁移 / 相关掠袭决策
   - 威尼斯：贸易路线选择 / 热那亚借贷 / 雇佣兵雇佣
   - 马穆鲁克：Veteran 3 晋升选择 / 哈里发学者四选一
   - 大明：工程设施选择（火力网布置）
   - 具体 decisionId 以各机制文件 `ctx.requestDecision(...)` 调用处为准（查 `src/factions/*/` 下各文件）
3. **AI 决策必须遵守既有硬约束**：不得在机制层写"AI 专用分支"（if hre... if horde... 不允许出现于 facility/status 等基础设施层）；AI 决策只发生在决策选择层。

### F1 明确不做（留给后续）

- main.js 的 AI 策略区（`aiTurn` 2802 行起 / `buildStrategicIntent` 2025 / `unitPriority` 2066 / `aiSpendGold` 2434 / `aiManageForces` 2476）——那是 F2 范畴
- DIFF 难度参数（`src/core/constants.js` L183，easy/medium/brutal 的 lookahead/economy/production/risk）——F2 范畴
- 兵种数值、AI 索敌、新兵种针对性编队——F2 范畴
- 任何 UI 工作（阶段7）

## 三、硬约束（必须逐条遵守）

1. **不修改**：`src/main.js`、`src/core/combat.js`、`src/core/movement.js`、`src/core/factionContext.js`、`src/core/factionRegistry.js`、`FACTION-SYSTEM-API-CONTRACT.md`。接口不足先报告，不得自行发明。
2. **不改任何数值**、不改 AI 战斗行为、不改玩家可见行为、不改随机数调用顺序（RNG 零变化是铁律）。
3. 必须通过 FactionContext（ctx）访问设施/状态/地图能力，不得直接 `game.units.push`、不得直接 import core 模块绕过统一接口。
4. `decision.js` 的改造必须**向后兼容**：阶段1 契约 `requestDecision(id, context) / resolveDecision(id, choiceId)` 签名不变；无 UI 测试场景（如 5 个 harness）若断言了"自动选第一项"，改造后需同步审查 harness 是否受影响（F1 完成后 5 harness 必须全绿）。
5. PowerShell 5.1 命令用 `;` 分隔，禁 `&&`；改含中文 JS 用 Read/Edit 工具（禁 PS 文本管道写文件，有乱码事故）；**仓库文件多为 CRLF 行尾，node 脚本做字符串替换时必须先转 CRLF**。
6. git 由用户自己提交，AI 只给命令。

## 四、验证与验收标准

1. `npm run build` 成功。
2. **5 个 harness 全绿**：`node src/factions/hre/__harness_hre.mjs`(79) / `goldenHorde/__harness_goldenHorde.mjs`(48) / `venice/__harness_venice.mjs`(100) / `mamluk/__harness_mamluk.mjs`(93) / `ming/__harness_ming.mjs`(83) ALL PASS。
3. **seed777 零变化**：`node sim/run.js map=strait diff=brutal agg=balanced rounds=1 seeds=777` 基线= C 胜、121 回合、stalls 1941、reroutes 224、retreats 89、cityCaptures 8、oilCaptures 3、shipyardCaptures 2、engineerLandings 71、transportLaunches 6、campsBuilt 0、sells 301——**注意：这是默认 hre+austria 局，F1 若 HRE AI 开始建工事，campsBuilt/新增设施统计可能变化——但默认局本就不应触发 AI 机制决策变化？请自行验证并报告差异原因**（默认局双方 hre+austria，若 HRE AI 建造生效，此基线预期会变，需明确记录"是否属于预期变化"）。
4. **机制生效实证**：跑带联盟 sim（`node sim/run.js map=strait diff=brutal agg=balanced rounds=1 seeds=777 ai0Faction=hre ai0Nation=austria ai1Faction=mamluk ai1Nation=egypt`）确认：
   - HRE AI 建出工事（需新增/查询设施统计，或用日志确认）
   - 金帐 AI 建营地（campsBuilt > 0）
   - 威尼斯 AI 建贸易线 / 马穆鲁克 AI 触发晋升 / 大明 AI 布置工程设施（以 sim 日志或统计确认）
5. **hre vs mamluk 复测**：`ai0Faction=hre ai0Nation=austria ai1Faction=mamluk ai1Nation=egypt` 对调 ×3 seeds 取平均，HRE 胜率应从 37%（AI 未建工事）回升（目标 ≥40%，具体值以数据为准）——**这是 F1 的关键验收**。
6. `node sim/suite.js` 4/4 全过（diff-gap 已改为正反对调取平均，冷酷平均 ≥60%）。

## 五、交付报告模板（完成后必须逐项回答）

1. 新增文件（路径+用途）
2. 修改文件（路径+改动点）
3. 新增数据结构
4. 新增事件 Hook（如有）
5. 新增玩法（AI 行为）
6. 修改了哪些旧机制
7. 删除了哪些旧机制
8. 数值是否发生变化（必须"否"）
9. build 结果
10. test 结果（5 harness 逐项）
11. sim 结果（seed777 基线逐项 + 机制实证 + hre/mamluk 复测）
12. 已知问题
13. 下一阶段 handoff（F2 需要接什么）

## 六、已知问题清单（从主对话带入）

- HRE AI 建造未实现（fortification.js L304 注释确认）→ 本任务核心之一
- HRE beforeAttack 全单位扫描性能待优化（机制层遗留，非本任务必须，可记录）
- 存档暂不保存设施（阶段7 UI 相关，非本任务）
- GH-04 raided 限回血 / GH-05 camp 摧毁奖励（阶段3 降级待办，非本任务）
- suite diff-gap 已修正（4/4 通过），F2 再评估 easy/medium 梯度

## 七、测试参数速查

- sim 联盟注入：`ai0Faction=xxx ai0Nation=yyy ai1Faction=xxx ai1Nation=yyy`（国家 id：hre→austria/prussia/bavaria；goldenHorde→goldenHordeCore/whiteHorde/blueHorde；venice→veniceCore/genoa/ragusa；mamluk→egypt/syria/baghdad；ming→mingCore/joseon/annam）
- 对调取平均：位置偏差铁律（strait 图 C 侧优势约 8:1），任何平衡对比必须 ai0/ai1 互换两遍取平均
- 默认 hre+austria 双 AI 局为 RNG 零变化回归锚
