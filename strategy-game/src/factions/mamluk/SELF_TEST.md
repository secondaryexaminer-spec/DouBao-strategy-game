# 马穆鲁克模块自测文档（SELF_TEST）

> 模块：`src/factions/mamluk/`（精锐成长 + 军团士气 + 精锐死亡代价 + 三国家机制）
> 契约：FACTION-SYSTEM-API-CONTRACT.md v1.3 · 交接：Handoff-D（2026-09-07）
> 运行：`node src/factions/mamluk/__harness_mamluk.mjs` → 93 PASS / 0 FAIL

---

## 1. 测试清单（V1–V17，与 harness 一一对应）

| 组 | 覆盖点 | 断言数 |
|---|---|---|
| V1 | 非马穆鲁克局零变化（伤害/建档/金币/决策） | 4 |
| V2 | 特殊单位集合过滤（arabArcher 不入，三骑兵全入） | 4 |
| V3 | 经验获取：伤害 1XP/点、击杀+10、关键战斗+5、占领+15、埃及×1.5、高士气×1.5 叠加 | 7 |
| V4 | Veteran 1 自动升级（30 XP，攻击+1 生效） | 4 |
| V5 | Veteran 2 自动升级（70 XP，防御+1 生效） | 2 |
| V6 | V3 决策：AI 停在 V2 不晋升；player 无 UI fallback 选第一项；UI 下 pending 三选一可 resolve | 9 |
| V7 | V3 三选项效果：冲锋强化（满移动力+3）、击杀回血（+2）、移动力强化（永久+1） | 8 |
| V8 | Elite 称号（200 XP，保持等级 3） | 4 |
| V9 | eliteLost：金币-15、士气-3、经验清零、dead 标记、历史击杀保留、金币不足分支 | 9 |
| V10 | 士气：初始 50、击杀+1、clamp 上下限 | 5 |
| V11 | 高士气（≥70）骑兵每回合首攻 +2（回合重置） | 3 |
| V12 | 低士气（≤30）新生兵攻击 -1（精锐不受影响） | 2 |
| V13 | 埃及尼罗河补给：water/己方 city 邻域 +2 回血、非特殊单位不触发 | 4 |
| V14 | 叙利亚长弓火线：第二个远程单位攻击同一目标 +2、回合重置、近战不触发 | 6 |
| V15 | 巴格达四战术：守势-1 / 进攻+2 / 机动预支+1（每回合首次）/ 整军+1 回血 | 11 |
| V16 | 跨局状态重置（syncGameRef：档案/士气清空，新局重建） | 4 |
| V17 | 决策 fallback 顺序（V3 第一项 charge、战术第一项 defensive；无头 sim 零 pending） | 3 |

## 2. 数值口径（与交付报告 §8 一致）

- 经验：伤害 `1 XP/点`；击杀 `+10`；关键战斗（击杀 `typeMeta.level>=3` 单位）`+5`；占领 `+15`。
- 加成：埃及河边 `×1.5`（round）；高士气 `×1.5`（round）；两者乘法叠加（如 6 → 埃及 9 → 高士气 14）。
- 等级：V1=30（攻+1）、V2=70（防+1）、V3=120（三选一，仅 player）、Elite=200（称号）。
- 士气：初始 50；精锐击杀+1；精锐死亡-3；高≥70；低≤30；clamp 0~100。
- eliteLost：金币 15 + 士气-3 + 经验清零（dead 标记，历史保留）。
- V3 选项：冲锋强化=满移动力攻击+3；击杀回血=击杀+2；移动力强化=baseMove/maxMove/move 永久+1。
- 国家机制：埃及 +2 回血/回合（water 或己方 city 邻域）；叙利亚协同射击 +2；巴格达守势-1/进攻+2/机动预支+1/整军+1 回血（学者 Chebyshev≤3 范围，与 combat.js 口径一致）。

## 3. 关键实现决策（测试确认的语义）

1. **特殊单位集合**：`mamlukCavalry / camelWarrior / sultanGuard`（规格书 §9.1"精锐骑兵=战略资产"）。
2. **机动战术语义**：reachable 在 beforeMove emit 前计算，无法突破单步可达性 → 实现为"范围内单位每回合首次移动消耗-1"（beforeMove 预支 +1 移动力，等效地形成本减免）。
3. **移动力强化（V3 swift）**：改 `baseMove`（beginTurn 用 `effectiveMove=baseMove+rank/2` 重置 maxMove，永久生效，测试断言 beginTurn 后仍 6）。
4. **低士气"精锐恢复降低"**：GH-06（beforeHeal）未实现 → 按 Handoff §4-5 方案 a 降级登记，本轮不实施（见交付报告已知问题）。
5. **AI 边界**：V3 晋升与学者战术仅 `owner==='player'` 发起决策；AI 精锐停在 V2。经验/士气/死亡惩罚/埃及回血等自动部分对 AI 生效。
6. **beforeAttack 叠加顺序**：hre → goldenHorde → venice → mamluk，本模块看到前三者改后的 `result.damage` 再叠加。

## 4. 验证命令

```bash
cd E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game
node src/factions/mamluk/__harness_mamluk.mjs            # 93 PASS
node src/factions/hre/__harness_hre.mjs                  # 回归
node src/factions/goldenHorde/__harness_goldenHorde.mjs  # 回归
node src/factions/venice/__harness_venice.mjs            # 回归
npm run build
node sim/run.js map=strait diff=brutal agg=balanced rounds=1 seeds=777
```

## 5. 已知限制

- 战斗外单位死亡（非攻击击杀）不触发 eliteLost（afterAttack 覆盖范围，交付报告说明）。
- 学术指令为"额外战术效果"叠加于 combat.js 既有学者 +1/+1 光环（combat.js 冻结不可改，"取代"语义降级为叠加，交付报告偏差说明）。
- 埃及判定以 `water` 地形代表河流（TERRAIN 无 river 类型，mapgen 用 water 画河）。
