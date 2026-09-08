'use strict';
// HRE AI 决策：帝国工事建造（hreFort_*）。
// 依据 handoff-F1：按 金币余额 / 前线敌情 / 己方兵种构成 选 不建/木栅/壕沟/石堡。
// 决策只发生在本层（决策选择层）；机制层不写 AI 专用分支。
// 确定性：不调用任何随机数（RNG 零变化）。

import { FORTIFICATIONS } from '../factions/hre/fortification.js';
import { enemyCountNear } from './aiUtil.js';

const FORT_TIER = ['palisade', 'trench', 'stoneFort']; // 优先级：低 → 高（选项层已按金币/资格过滤）
const ENEMY_RANGE = 4;            // 前线判定：切比雪夫 4 格内敌军
const CONTACT_RANGE = 2;          // 贴身接触：2 格内有敌军 → 壕沟反冲锋；否则石堡做防御锚点
const NEED_THREAT_NORMAL = 2;     // 普通情况：4 格内 >= 2 敌军才建
const NEED_THREAT_INFANTRY = 1;   // 步兵优势：工事价值高，1 个敌军即建
const INFANTRY_BUILD_THRESHOLD = 6; // 己方步兵 >= 6 → 视为步兵优势
const GOLD_RESERVE = 20;          // 建后至少保留的金币（保生产预算，抑制过度建造）
const MIRROR_RANGE = 8;           // 镜像判定半径：8 格内敌军全为神罗 → 镜像局不建
const BUILD_CAP_PER_TURN = 2;     // 每回合每方最多建造数（防拖垮经济/冻结部队）
// 不参与 AI 建工事的单位：工程师（两栖登陆/造船）、攻城器（炮击），
// 避免冻结其专职行动（早期实证：工事改变行动时序曾使 engineerLandings 71→0）。
const AI_BUILD_EXCLUDE = new Set(['engineer', 'heavyCatapult']);

// 模块级状态：按回合限流（跨局自动重置：game 引用变化）
const state = { lastGameRef: null, turn: -1, built: 0 };

export function selectHreFort(decisionId, context) {
  if (process.env.F1_AB_NONE) return 'none'; // A/B 测量开关（F1 收尾后移除）
  const { ctx, owner, unitId, options } = context || {};
  if (!ctx || !ctx.game || !Array.isArray(options)) return 'none';
  if (ctx.game !== state.lastGameRef) { state.lastGameRef = ctx.game; state.turn = -1; state.built = 0; }
  if (ctx.game.turn !== state.turn) { state.turn = ctx.game.turn; state.built = 0; }
  if (state.built >= BUILD_CAP_PER_TURN) return 'none';

  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return 'none';
  if (AI_BUILD_EXCLUDE.has(unit.type)) return 'none'; // 工程师/攻城器保专职行动
  const gold = ctx.game.goldByOwner[owner] || 0;

  // 镜像神罗局判定（近敌全为神罗）：木栅移动税对神罗豁免、壕沟反冲锋效果被神罗
  // 自身的兵种加成抵消 → 工事对神罗镜像局是净损（实证：diff-gap 冷酷建工事 88→63%，
  // 无工事 69%），且默认 hre+hre 局本就不应触发机制变化（handoff #3）。→ 双方都不建。
  // 非神罗敌人（mamluk/goldenHorde 等）：木栅税/壕沟反冲锋是进攻性工具 → 正常修建
  // （实证：hre-vs-mamluk 建工事 +11pt）。
  let enemyNear = 0;
  let enemyNearNonHre = 0;
  for (const u of ctx.game.units) {
    if (u.x == null || u.y == null) continue;
    if (Math.abs(u.x - unit.x) > MIRROR_RANGE || Math.abs(u.y - unit.y) > MIRROR_RANGE) continue;
    if (u.owner === owner || u.owner === 'neutral') continue;
    if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
    enemyNear += 1;
    if (ctx.ownerFaction(u.owner) !== 'hre') enemyNearNonHre += 1;
  }
  if (enemyNear > 0 && enemyNearNonHre === 0) return 'none'; // 镜像神罗局：不建

  // 前线敌情：后方单位不建（省金币、不冻结部队）
  const threat = enemyCountNear(ctx, owner, unit.x, unit.y, ENEMY_RANGE);
  if (threat <= 0) return 'none';

  // 己方兵种构成：神罗步兵越多，工事收益越高（木栅/石堡对步兵驻守有加成）
  let infantry = 0;
  for (const u of ctx.game.units) {
    if (u.owner !== owner) continue;
    const meta = ctx.typeMeta(u.type);
    if (meta && meta.domain === 'land' && !meta.charge) infantry += 1;
  }
  const needThreat = infantry >= INFANTRY_BUILD_THRESHOLD ? NEED_THREAT_INFANTRY : NEED_THREAT_NORMAL;
  if (threat < needThreat) return 'none';

  // 选址策略（决策层只能选"建哪种"，位置是单位所在格）：
  //   - 贴身接触（2 格内敌军）→ 壕沟反冲锋（冲锋-2 + 首击-2）
  //   - 近据点防守位（非贴身）→ 石堡做防御锚点（+4 驻守 / 回血光环 / 远程 +2）
  //   - 其余 → 最高档（壕沟 > 木栅），建后保留 GOLD_RESERVE
  let contact = 0;
  for (const u of ctx.game.units) {
    if (u.owner === owner || u.owner === 'neutral') continue;
    if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
    if (Math.abs(u.x - unit.x) > CONTACT_RANGE || Math.abs(u.y - unit.y) > CONTACT_RANGE) continue;
    contact += 1;
  }
  const pick = (id) => options.some(o => o.id === id) && gold - FORTIFICATIONS[id].cost >= GOLD_RESERVE;
  if (contact > 0 && pick('trench')) {
    state.built += 1;
    return 'trench';
  }
  for (let i = FORT_TIER.length - 1; i >= 0; i--) {
    const id = FORT_TIER[i];
    if (!pick(id)) continue;
    state.built += 1;
    return id;
  }
  return 'none';
}

export function registerHreAi(register) {
  register('hreFort_', selectHreFort);
}
