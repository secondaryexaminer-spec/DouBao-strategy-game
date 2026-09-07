# Faction System API Contract（v0.2 冻结版）

> 本文档是 v0.2 所有联盟系统（含五个附属对话）必须共同遵守的接口契约。
> 冻结时间：2026-09-06（Phase 1）。
> 原则：**先定契约，再写代码。** 任何联盟系统不得自行发明接口；需要新接口时，提交主对话评审后在此文档追加，再通知所有已完成系统同步。
> 相关文档：`v0.2-改造施工图.md`、`.vibecoding/v0.2-phase1-baseline.md`

---

## 0. 设计原则

1. **渐进式迁移**：不重写 main.js 闭包。旧逻辑留在 main.js，新联盟系统通过事件钩子接入，逐步迁移旧逻辑，每迁移一个系统就测试对比基线。
2. **模块化 ≠ 设计正确**：代码分目录不算完成。战斗核心逻辑（伤害计算、击杀判定）属于 Combat/Core，联盟系统只通过事件影响结果，不得复制战斗逻辑。
3. **克制的设施系统**：基础设施只提供统一战场实体框架，不写 `if hre... if horde...`。具体设施类型由各联盟系统定义。
4. **主动机制保留决策点**：凡是玩家做 A/B/C 选择的机制，核心 API 必须是 `requestDecision/resolveDecision`，禁止写成 `autoChoose`。无头 sim 用 test fallback 自动选第一项，不算正式规则。
5. **零 DOM 依赖**：所有 `src/factions/` 模块禁止 import DOM API，必须能在 sim 无头环境运行。UI 只在阶段7渲染，不参与决策。
6. **统一金币**：不搞五套独立资源。联盟系统用统一金币 + 状态 + 设施。

---

## 1. 模块总览

```
src/core/
├── events.js        # EventBus：on/off/emit
├── status.js        # A. 临时状态（时效 buff/debuff）
├── facility.js      # C. 战场实体（工事/炮台/火力区等）
└── decision.js      # 主动决策（request/resolve，含 test fallback）

src/factions/
├── factionContext.js    # 依赖注入：联盟系统能访问的能力集
├── factionRegistry.js   # 注册中心 + 事件分发
├── hre/...              # 附属对话 A
├── horde/...            # 附属对话 B
├── venice/...           # 附属对话 C
├── mamluk/...           # 附属对话 D
└── ming/...             # 附属对话 E
```

> **B. 永久成长（Veterancy）** 是马穆鲁克系统的一部分，放在 `src/factions/mamluk/veterancy.js`，不在 core/。core/ 只提供跨联盟通用基础设施。

---

## 2. Event / Hook API

### 2.1 EventBus（src/core/events.js）

```js
export const eventBus = {
  on(eventName, handler),      // 注册，返回取消函数
  off(eventName, handler),
  emit(eventName, payload),    // 按注册顺序同步执行所有 handler
};
```

- 同步执行。handler 抛异常不阻断后续 handler（try-catch 包裹，记日志）。
- payload 是对象，引用传递，handler 可修改其字段。

### 2.2 事件清单

| 事件名 | 触发时机 | payload | 可修改 | 可取消 |
|---|---|---|---|---|
| `turnStart` | beginTurn 内，重置单位移动**之前** | `{owner, initial}` | — | — |
| `turnEnd` | advanceTurn 轮转后、下一方 beginTurn 之前 | `{owner}` | — | — |
| `beforeMove` | 单位移动执行前（moveUnit 内、扣移动力之前；v1.1 已埋） | `{unit, from:{x,y}, to:{x,y}, cancel:false}` | — | `payload.cancel=true` |
| `afterMove` | 单位移动执行后 | `{unit, from, to}` | — | — |
| `beforeAttack` | **previewCombat 算出伤害后、实际扣血前** | `{attacker, defender, fromCell, toCell, result:{damage,counter}, isCounter}` | `result.damage`, `result.counter` | `payload.cancel=true` |
| `afterAttack` | 扣血+击杀+反击全部处理完后 | `{attacker, defender, result, defenderDead, attackerDead}` | — | — |
| `unitCreated` | 单位工厂创建后 | `{unit}` | — | — |
| `unitKilled` | removeUnit 执行时（含溅射/反击击杀） | `{killer, victim, context:'attack'|'splash'|'counter'|'other'}` | — | — |
| `siteCaptured` | captureSite 占领成功后 | `{unit, site, oldOwner}` | — | — |
| `incomeCalculated` | grantIncome 算出金额后、写入 goldByOwner 前 | `{owner, amount}` | `amount` | — |
| `productionCompleted` | 造兵/造船/建营地完成后（v1.2 已埋：buildAtSite 成功分支；金帐营地生产由金帐模块用 ctx.events.emit 同事件） | `{owner, unit, site, kind:'unit'|'ship'|'camp'}`（site 可为 siteEntry 或 facility） | — | — |

### 2.3 beforeAttack 精确定义（重点）

```
attack(attacker, defender) 调用流程：
  1. result = previewCombat(...)           ← 算出 damage/counter
  2. emit('beforeAttack', {attacker, defender, result, ...})
     ← 联盟系统可修改 result.damage / result.counter
     ← 若 payload.cancel=true，整个攻击中止（attacker 不消耗行动）
  3. defender.hp -= result.damage           ← 实际扣血
  4. 打完就跑移动保留 / 大明溅射
  5. 击杀处理（grantKills + removeUnit）
  6. 反击（result.counter > 0 且非锦衣卫）
  7. 龟船反弹
  8. emit('afterAttack', {...})             ← 所有战斗处理完后
```

- beforeAttack 的 `result` 是 previewCombat 的返回值引用，修改直接生效。
- 多个联盟系统都改 damage 时，按注册顺序叠加（后一个看到前一个改后的值）。
- cancel 极少用，仅用于"隐身单位未被发现"等场景。

### 2.4 执行顺序

- 联盟系统注册顺序：`hre → goldenHorde → venice → mamluk → ming`（按 FACTIONS 定义顺序）。
- 同一事件内，所有注册系统的钩子都执行（系统内部自己判断 owner 是否相关）。
- before 类事件：按注册顺序，后一个能看到前一个的修改。
- after 类事件：按注册顺序，只读。

---

## 3. 状态系统三分

### 3.1 A. 临时状态 StatusEffect（src/core/status.js）

挂在 unit 上，持续 1~N 回合，回合开始时 tick。

```js
// 数据结构（内部存储，不直接暴露）
{ id, unitId, key, turns, data }

// API
addStatus(unitId, key, turns, data?)   // 同 key 同 unit 默认刷新 turns（取较大值），不叠加
removeStatus(unitId, key)
hasStatus(unitId, key) -> bool
getStatus(unitId, key) -> {key, turns, data} | null
tickStatuses(aliveUnitIds)             // v1.2 签名更正：传入当前全部存活单位 id 列表；
                                       // 不在列表者（死亡）状态清理，存活者 turns-1 归零移除。
                                       // main.js beginTurn 开头全量接线（早于 turnStart emit）。
getAllStatuses(unitId) -> array
```

- **tick 接线语义（v1.2 确认，GH-03）**：`main.js beginTurn` 在 `if(!initial)` 块之前调用 `tickStatuses(game.units.map(u => u.id))`——每 beginTurn 衰减一次**全量存活单位**状态。**禁止只传当前 owner**：status.js 对不在列表者执行删除，会误删其他 owner 存活单位的状态。联盟系统写入 turns 时按此频率推导：金帐 `raided` 写 **turns=3**（敌方回合 tick→2 移动-1 全程生效；金帐下轮 tick→1 攻击时额外收益生效；再下轮归零——"持续 1 回合"= 敌方恰好 1 个完整回合，额外收益窗口 = 下一个金帐回合）。

- 预设 key（阶段2各系统使用，阶段1只定义不使用）：
  `raided`（被掠袭，移动-1/回血减半）、`fortified`（驻工事，防御+）、`crossfire`（被交叉火力，防御-）、`hidden`（隐身）、`ambush`（伏击就绪）、`overwatch`（警戒）。
- 新增 key 由联盟系统在自己的模块内定义字符串，不需在 core 注册。
- **不与永久成长混用**：status 有 turns 会过期，veterancy 永久。

### 3.2 B. 永久成长 Veterancy（src/factions/mamluk/veterancy.js）

马穆鲁克专属，阶段2附属对话D实现。阶段1只约定接口：

```js
{ unitId, xp, level, kills, promotions: [] }

addXP(unitId, amount)
getVeterancy(unitId) -> {xp, level, kills, promotions} | null
promote(unitId, choiceId)   // Veteran3 三选一晋升，走 decision API
```

- 与现有通用 `unit.kills/rank` 系统并存：rank 是全联盟通用等级（影响移动/回血），veterancy 是马穆鲁克深层成长（额外特性）。阶段2再决定是否合并。
- 永久，不 tick 不过期。单位死亡时数据保留在历史中（用于精英阵亡代价统计），但不再生效。

### 3.3 C. 战场实体 Facility（src/core/facility.js）

地图上的临时实体，区别于 `sites`（据点，永久可占领）。

```js
// 数据结构
{ id, type, owner, x, y, hp, maxHp, duration, data }

// API（克制，不写联盟分支）
createFacility(type, owner, x, y, {hp?, duration?, data?}) -> facility
removeFacility(id)
damageFacility(id, amount) -> remainingHp
expireFacilities(owner)              // duration-1，归零移除（turnStart 时调）
getFacilityAt(x, y) -> facility | null
getFacilitiesByOwner(owner) -> array
getFacilitiesByType(type) -> array
getFacilitiesInRange(x, y, range) -> array
```

- `type` 是字符串，由联盟系统定义（如 `'palisade'`, `'fireZone'`, `'turret'`）。core 不枚举。
- `duration` 为 `null` 表示不过期（如石堡），为数字表示回合数。
- facility 不可被占领，只能被摧毁（damageFacility 到 hp≤0 自动 remove）。
- facility 不阻挡移动（passable 仍由地形/单位决定），但提供效果（如防御加成、移动消耗、伤害区）。
- **与 sites 的硬区别**：sites 在 `game.sites`，facility 在 `facility.js` 内部存储。两者不混用。

---

## 4. 主动决策 API（src/core/decision.js）

> 硬约束：凡是玩家做 A/B/C 选择的机制，必须用此 API。禁止 autoChoose。

```js
// 请求决策（异步）
requestDecision(decisionId, context) -> pendingDecision
// context: {
//   owner, unitId?, title, description,
//   options: [{id, label, description}],
//   onResolve(choiceId),   // 回调：玩家选择后执行
//   onCancel?()
// }

// 玩家/UI 选择后调用
resolveDecision(decisionId, choiceId)
cancelDecision(decisionId)

// 查询
getPendingDecisions(owner) -> array
getDecision(decisionId) -> pendingDecision | null
```

### 决策流程

```
1. 联盟系统: requestDecision('tactic', {owner, unitId, title:'选择战术',
     options:[{id:'defensive',label:'守势'},{id:'offensive',label:'进攻'},...],
     onResolve: (choice) => applyTactic(unitId, choice)})
2. 主对话/UI层（阶段7）: 显示选择界面
3. 玩家点击 → resolveDecision(decisionId, 'defensive')
4. decision.js 触发 onResolve('defensive') → 联盟系统应用效果
5. 决策从 pending 列表移除
```

### Test Fallback（无头 sim / 无 UI 环境）

- 当 `requestDecision` 被调用且当前环境无 UI（sim 无头），自动选择 `options[0]`，立即触发 onResolve。
- 日志标记：`[decision:auto-resolve] ${decisionId} → ${options[0].id} (test fallback, not a game rule)`。
- **这只是测试入口，不是正式规则。** UI 阶段（阶段7）会替换为真实玩家选择。
- 联盟系统不得依赖"总是选第一个"来设计平衡。

### 必须用决策 API 的机制（非穷尽）

- 哈里发学者四选一战术指令（守势/进攻/机动/整军）
- Veteran 3 三选一晋升（冲锋强化/击杀回血/移动强化）
- 热那亚借贷（是否借、借多少）
- 工程设施选择（建炮台/瞭望塔/补给站/壕沟/临时桥）
- 游牧营地迁移（是否迁移、迁到哪）
- 贸易路线选择（哪两个节点建路线）
- 未来任何主动技能

---

## 5. FactionContext（依赖注入）

在 main.js 闭包内构造一次，传给所有联盟系统。**联盟系统只通过 context 访问游戏，不直接碰 DOM、不直接调用 main.js 内部函数。**

```js
const factionContext = {
  // —— 只读查询 ——
  get game(),                    // game 对象只读引用
  getUnit(x, y),
  getSite(x, y),
  getFacilityAt(x, y),
  typeMeta(type),
  terrainMeta(terrainKey),
  ownerFaction(owner),          // 返回 faction id
  ownerNation(owner),           // 返回 nation id
  hasStatus(unitId, key),

  // —— 设施维护/查询（v1.1：联盟系统不得直接 import core/facility.js） ——
  createFacility(type, owner, x, y, opts?),
  removeFacility(id),
  damageFacility(id, amount),
  expireFacilities(owner),
  getFacilitiesByOwner(owner),
  getFacilitiesByType(type),
  getFacilitiesInRange(x, y, range),
  getAllFacilities(),

  // —— 决策查询（v1.1：debug/UI 层不得直接 import core/decision.js） ——
  getPendingDecisions(owner),

  // —— 单位创建（v1.2，GH-02：委托 main.js 闭包 unit() 工厂，randomId/字段与主流程一致；
  //    内部 push 并计入 produced 统计；不做金币/上限/位置校验，业务由调用方自查） ——
  createUnit(type, owner, x, y) -> unitEntry | null,

  // —— 纯函数转发（v1.1：core 纯函数经 ctx 统一转发，联盟系统不得直接 import） ——
  diagonalDist(a, b),
  movementCost(game, unitEntry, x, y),
  areAllies(teams, a, b),

  // —— 安全动作（不改变战斗流程） ——
  log(text, kind?),
  addGold(owner, amount, reason?),
  spendGold(owner, amount) -> bool,   // 钱不够返回 false，不扣
  addStatus(unitId, key, turns, data?),
  removeStatus(unitId, key),

  // —— 决策 ——
  requestDecision(decisionId, context),
  resolveDecision(decisionId, choiceId),

  // —— 事件（联盟系统可自行订阅额外事件） ——
  events: eventBus,
};
```

**边界规则（v1.1 起强制执行）**：联盟系统一律通过 `factionContext` 访问游戏——包括设施维护/查询、决策查询、以及 `diagonalDist/movementCost/areAllies` 等 core 纯函数。**禁止**直接 `import` 任何 `core/` 状态性模块（facility/decision/status）；纯函数同样经 ctx 转发（避免各联盟 import 路径分叉、未来签名变更时散落多处）。如确需 ctx 未覆盖的能力，向主对话申请补入 context，不得自行绕过。

**禁止暴露的能力**（联盟系统不能直接调用，必须通过事件影响）：
- `removeUnit`、`attack`、`captureSite`、`grantKills`——这些是 core 战斗流程，联盟系统通过 `beforeAttack/afterAttack/unitKilled` 钩子影响，不能直接触发。
- DOM 操作（`$`, `document`, `refresh`）——UI 层独立。

---

## 6. FactionRegistry（注册中心）

```js
export const factionRegistry = {
  register(factionId, system),    // system 见下方统一接口
  unregister(factionId),
  get(factionId) -> system | null,
  getAll() -> Map<factionId, system>,
};
```

### 联盟系统统一接口

每个联盟系统（hre/horde/venice/mamluk/ming）导出一个对象，缺省字段为空函数：

```js
{
  id: 'hre',                          // 必须与 FACTIONS key 一致
  init(ctx),                          // 注册时调用一次，ctx = factionContext
  onTurnStart(ctx, owner, initial),
  onTurnEnd(ctx, owner),
  onBeforeMove(ctx, payload),         // payload = {unit, from, to}，可设 cancel
  onAfterMove(ctx, payload),
  onBeforeAttack(ctx, payload),       // payload = {attacker, defender, result, ...}，可改 result
  onAfterAttack(ctx, payload),
  onUnitCreated(ctx, unit),
  onUnitKilled(ctx, killer, victim, context),
  onSiteCaptured(ctx, unit, site, oldOwner),
  onIncomeCalculated(ctx, owner, amountRef),  // amountRef = {amount}，可改 amount
  onProductionCompleted(ctx, owner, payload),
}
```

- 所有钩子第一个参数都是 `ctx`（factionContext）。
- 钩子内部自己判断 `ownerFaction(owner) === this.id` 是否相关。
- 缺省为空函数，不需要的钩子不写。
- `init(ctx)` 在注册时调用，用于系统初始化（如读取 factionState）。

### 注册顺序

`hre → goldenHorde → venice → mamluk → ming`。在 main.js 初始化时按此顺序 register。

---

## 7. 阶段1实现范围（严格零行为变化）

阶段1只实现以下内容，**不实现任何联盟系统逻辑**：

| 文件 | 内容 | 行为变化 |
|---|---|---|
| src/core/events.js | EventBus | 无（main.js 还没 emit） |
| src/core/status.js | 临时状态 API | 无（无调用者） |
| src/core/facility.js | 战场实体 API | 无（无调用者） |
| src/core/decision.js | 决策 API + test fallback | 无（无调用者） |
| src/factions/factionContext.js | context 构造函数 | 无（未使用） |
| src/factions/factionRegistry.js | 注册中心 | 无（无注册者） |
| src/main.js | 在 7 个事件点 emit（无订阅者） | **必须零变化** |

- main.js 的 emit 调用：`eventBus.emit('turnStart', {owner, initial})` 等。因为无订阅者，emit 是空操作，不改变任何行为、不调用 rnd、不改状态。
- **不在 game 对象上加新字段**（存档结构不变）。基础设施状态存在模块内部。
- 验收：build 通过 + suite 3/4（diff-gap 仍 50%）+ 固定 seed777 终局数字完全一致。

---

## 8. 附属对话交付模板（每个联盟系统必须遵守）

完成一个联盟后，向主对话提交：

1. **新增文件**（路径列表）
2. **修改文件**（路径 + 改了什么）
3. **新增数据结构**（如 facility type、status key、factionState 字段）
4. **新增事件 Hook**（订阅了哪些事件，做了什么）
5. **新增玩法**（玩家能做什么新决策）
6. **修改了哪些旧机制**（原 +1/+2 机制的处置：保留/降级/重构）
7. **删除了哪些旧机制**
8. **数值是否发生变化**（如有，列出变化前后）
9. **build 结果**
10. **test 结果**（单元/自测）
11. **sim 结果**（固定 seed 单局是否可复现，suite 是否通过）
12. **已知问题**（未完成项、与其他系统的潜在冲突）
13. **下一阶段 handoff**（给下一个附属对话或主对话的接口变更说明）

> 禁止只说"完成了"。主对话要能审计每个联盟到底改了什么。

---

## 9. 变更管理

- 本文档冻结后，任何接口变更必须：
  1. 提交主对话评审；
  2. 在本文档追加变更记录（版本号+日期+变更内容+影响范围）；
  3. 通知所有已完成/进行中的附属对话同步。
- 联盟系统内部实现（如 hre 工事的具体数值）不属于本文档范围，由附属对话自行决定，但不得违反本文档的接口约束。

### 变更记录

**v1.2（2026-09-07，GH 接口申请单处理）**
- `§3.1` `tickStatuses` 签名更正为 `tickStatuses(aliveUnitIds)`（原文档写 owner，与实际实现不符）；新增 tick 接线语义与 `raided turns=3` 推导结论（见 §3.1 说明块）。
- `§2.2` `productionCompleted` 已埋点：buildAtSite 成功分支 emit `{owner, unit, site, kind:'unit'|'ship'}`；金帐营地生产等联盟侧生产路径由联盟模块用 `ctx.events.emit('productionCompleted', ...)` 广播同一事件。
- `§5` 新增 `createUnit(type, owner, x, y)`：经 main.js deps 注入，委托闭包 `unit()` 工厂；push + produced 统计；不做业务校验。
- `main.js` 三处修改：buildAtSite 埋点、beginTurn 全量 tick 接线（`if(!initial)` 块前）、initFactionSystems deps 新增 createUnit。
- 待办登记：GH-04（raided 回血限制，需 beforeHeal）/ GH-05（营地/补给摧毁奖励，需 siteDestroyed）降级；GH-06（beforeHeal Hook）/ GH-07（siteDestroyed 事件）/ GH-08（getStatus/getAllStatuses 经 ctx 暴露）/ GH-09（unitKilled payload 对齐）排期后续。
- 影响范围：无既有订阅者依赖（productionCompleted 无订阅、tick 对 HRE frontline 先清后重建、createUnit 为新增能力）→ 固定 seed 零变化预期，以回归验证为准。

**v1.1（2026-09-07，HRE 集成验收）**
- `§5` FactionContext 补全：设施维护/查询（`expireFacilities/getFacilitiesByOwner/getFacilitiesByType/getFacilitiesInRange/getAllFacilities`）、决策查询（`getPendingDecisions`）、纯函数转发（`diagonalDist/movementCost/areAllies`）。
- `§5` 新增强制边界规则：联盟系统禁止直接 import 任何 `core/` 状态性模块；纯函数同样经 ctx 转发；能力缺口向主对话申请补入 context。
- `§2.2` `beforeMove` 已埋点（main.js moveUnit 内、扣移动力之前，payload 增加 `cancel:false` 初始字段）。
- 跨局清理：`facilitySystem.clear()/statusSystem.clear()/decisionSystem.clear()` 在 `newGame` 开头调用（此前已定义但无调用点）。
- 接线：main.js 顶层 import 三件套 + 闭包内幂等 `initFactionSystems()` + `newGame` 开头调用（早于 `startFirstTurn()`）。
- 影响范围：main.js、factionContext.js、fortification.js、本契约；不改变任何既有数值/AI/战斗流程；无订阅者时事件空转，固定 seed 变化仅来自神罗兵种联动（长矛方阵/帝国近卫军/攻城塔）真实生效。

---

*契约版本：v1.2（2026-09-07，GH 接口申请单处理后）*
