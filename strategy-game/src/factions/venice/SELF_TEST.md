# 威尼斯模块 · 浏览器 Debug 自测说明（SELF_TEST）

> 阶段7 UI 落地前，用浏览器控制台 + `__veniceDebug` 手动验证威尼斯贸易网络。
> 模块未接线前（未注册进 main.js）控制台无 `__veniceDebug` 属预期；接线后可用。
> 无头自测：`node src/factions/venice/__harness_venice.mjs`（16 组全断言）。

## 0. 前置

1. 打开 `index.html`（本地 file:// 或任意静态服务器）。
2. 玩家联盟选「威尼斯」（`factionSelect=venice`），国家任选（威尼斯本部/热那亚/拉古萨）。
3. 建议地图 `strait`/`coast`（有海），正常开一局。
4. F12 打开控制台，输入 `typeof __veniceDebug` 应返回 `"object"`。

## 1. 查看配置与状态

```js
__veniceDebug.config()          // 贸易路线/交易港/借贷/雇佣兵全部数值
__veniceDebug.state()           // 模块级状态：借贷记录、雇佣兵冷却
__veniceDebug.routes()          // 当前所有贸易路线（含 path/income/status/sea）
__veniceDebug.ports()           // 当前所有中立商港
__veniceDebug.nodes('player')   // 玩家的贸易节点（城市/港口/堡垒/商队/交易港）
__veniceDebug.candidates('player') // 候选路线预览（长度/收益/海路）
```

## 2. 贸易路线（决策入口）

```js
__veniceDebug.requestForOwner('player')  // 请求本回合全部威尼斯决策，返回请求数
__veniceDebug.pending('player')          // 列出未决决策（venRoute_/venLoan_/venMerc_/venPort_）
__veniceDebug.resolve('venRoute_player', 'route:0')  // 手动选择第 1 条候选路线
```

自测要点：
- 己方 ≥2 座城市/港口时回合开始会出现「贸易路线」决策，选项首项为「不建」。
- 建立后 `routes()` 显示 `status:'active'`、`income` 与路线长度匹配（每额外 2 格 +1，上限 +5）。
- 海路（路径含水域）若周围 3 格无己方海军，则该候选不出现（`candidates()` 为空或减少）。
- 敌军单位走到路线路径格上 → 日志提示「贸易路线被切断」，`routes()` 中该路线 `status:'disrupted'`；
  下回合收入中该路线暂停；敌军离开后自动恢复 `active`。
- 城市被敌军占领 / 商队被击杀 → 该路线被移除（日志「端点失效」）。

## 3. 威尼斯本部 · 海上垄断（nation=veniceCore）

```js
__veniceDebug.routes()
```

- 控制 ≥2 个己方港口（shipyard）后：海路每回合 +1 金币；≥3 港：海路 +2、陆路 +1（海上霸权）。
- ≥2 港时每回合首座空闲港口自动以半价（15 金币）生产 1 艘桨帆船（日志「海上垄断」）。

## 4. 热那亚 · 银行信用（nation=genoa）

```js
__veniceDebug.resolve('venLoan_player', 'loan')   // 贷款 +15
__veniceDebug.state()                             // repayLeft=3 → 每回合还款 6
```

- 贷款后 3 个收入回合各扣 6 金币；还清后冷却 2 回合；冷却结束决策再次出现（每局最多 3 次）。
- 无头 sim（无 UI）自动选「不贷」，不改变任何默认局行为。

## 5. 拉古萨 · 中立商港（nation=ragusa）

```js
__veniceDebug.requestForOwner('player')
__veniceDebug.resolve('venPort_player', 'port:0') // 转化第 1 个敌方港口
```

- 前提：敌方港口（shipyard）旁 1 格内有己方商队（tradeCaravan/ragusaCaravan）。
- 转化后 `ports()` 出现交易港，每回合 +2 金币，并可作为贸易路线节点。
- 敌军单位站上港口格 / 港口被己方收复 → 交易港关闭；被攻击按伤害 50% 掉耐久（6 点）。

## 6. 雇佣兵市场（任何威尼斯国家）

```js
__veniceDebug.resolve('venMerc_player', 'merc:spearman') // 39 金币买长枪兵（反骑）
__veniceDebug.resolve('venMerc_player', 'merc:crossbow') // 60 金币买弩手（远程）
__veniceDebug.resolve('venMerc_player', 'merc:catapult') // 81 金币买投石车（攻城）
```

- 需有己方城市/港口且市场格空闲；每回合最多购买 1 次；价格 = 基础价 ×1.5（沿用现有雇佣兵加价概念）。

## 7. 换局验证

开新一局后 `__veniceDebug.state()` 的 `loans` 应为空（借贷状态自动重置），旧局的路线/交易港随
`facilitySystem.clear()` 一并清空。
