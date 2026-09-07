# 大明模块 SELF_TEST（Layer 4 · 工程与火力网）

> 依据：FACTION-SYSTEM-API-CONTRACT v1.3 + Handoff-E（2026-09-08）+ 规格书 §11/§12/§40。
> 自测：`node src/factions/ming/__harness_ming.mjs`（82 断言全 PASS）。

## 一、模块文件

| 文件 | 职责 |
|---|---|
| `fireZone.js` | 火力网：fireZone 生成（afterAttack）/ 进入受伤（beforeMove）/ crossfire（beforeAttack）/ 到期移除（turnStart）/ 瞭望塔火力校正 |
| `engineering.js` | 工程设施：5 种设施部署决策（仅 player）/ 炮台结算 / 补给站回血 / 壕沟冲锋减免 / 栈桥工事防御 / 设施被攻击摧毁 |
| `mingRules.js` | 联盟注册对象 + 三国家机制（锦衣卫 stealth / 朝鲜水寨 / 安南丛林伏击）+ `__mingDebug` |
| `__harness_ming.mjs` | 自测 harness（82 断言） |

## 二、核心数值表

### 火力网（fireZone）
| 项 | 值 | 口径 |
|---|---|---|
| fireZone duration | 1 回合 | 大明 turnStart `expireFacilities` 移除；敌方恰好 1 个完整回合受影响 |
| 进入伤害 | 2 | 不致死（最低 1 HP）；每格一次取最高；同盟豁免；站桩不结算 |
| crossfire 加成 | +4 | defender 所在格 ≥2 个敌对 fireZone，任意攻击者受益 |
| 瞭望塔校正（范围 2） | 进入伤害 +1 / crossfire +1 | 效果实现在 fireZone.js（瞭望塔是火力系统一部分） |

### 工程设施（工部工程师 worksEngineer 部署，仅 player 决策）
| 设施 | 成本 | 耐久 | 效果 |
|---|---|---|---|
| 炮台 turret | 20 | 10 | 每回合范围 2 内敌方受 2 点伤（不致死）；范围内己方被攻击 -1 |
| 瞭望塔 watchtower | 14 | 6 | 范围 2 内 fireZone 进入伤害 +1、crossfire +1（视野降级） |
| 补给站 supplyDepot | 18 | 8 | 每回合范围 2 内己方回血 +2 |
| 壕沟 mingTrench | 16 | 12 | 壕沟上单位免受冲锋（减免 ≤2，最低 0） |
| 栈桥工事 causeway | 12 | 10 | 桥格及相邻（≤1）己方被攻击 -1（临时桥降级版） |

### 三国家机制
| 国家 | 机制 | 数值 |
|---|---|---|
| 大明 mingCore | 锦衣卫 stealth | 'hidden' 状态标记（回合开始获得，攻击后暴露）；AI 索敌影响降级 |
| 朝鲜 joseon | 水寨 | 港口/海岸被攻击 -3 |
| 安南 annam | 丛林伏击 | 森林中每回合首次攻击 +3（陆军） |

## 三、关键接口口径（交付报告会展开）

1. **fireZone 是 facility 实体**：`{type:'fireZone', owner, x, y, hp:1, duration:1, data:{owner, sourceUnitId, x, y, damage, type:'fire'}}`（§40 结构）。覆盖判定 = `getFacilitiesByType('fireZone')` + 坐标匹配，不做格覆盖数据结构。
2. **进入受伤不致死**：契约 §5 禁止直接调 `removeUnit`，联盟无法做致死清理 → `max(1, hp-dmg)`。
3. **去重**：同源单位同格不重复叠；不同源可叠加（crossfire 来源）。
4. **目标死亡仍生成 fireZone**：区域效果，与目标生死无关。
5. **工程设施决策**：选项第一项必须"不建"（sim fallback 零变化）；AI 工程师不建；位置 = 工程师当前格（移动即选址）。
6. **跨局清理**：`syncGameRef(ctx)` 三模块各自闭环；设施/状态/决策由主对话 newGame clear。

## 四、已知问题（登记）

1. **临时桥 → 栈桥工事**：无移动成本 override 钩子（`ctx.movementCost` 是 main.js deps 注入纯函数，`reachable/passable` 在 core 禁改），降级为桥格/相邻 buff。阶段3 主对话补钩子后升级。
2. **锦衣卫 stealth 不作用于 AI 索敌**：不改 main.js AI；当前为状态标记 + 日志。阶段6 AI 接入时处理。
3. **AI 不建工程设施**：仅 `owner==='player'` 发起决策（与其他联盟一致）。
4. **瞭望塔视野**：规格书"视野"依赖 AI 索敌展示，降级为标记/日志。
5. **炮台伤害不致死**（同 fireZone 口径）。
6. 存档不保存设施（项目已知问题，跨局消失属预期）。
