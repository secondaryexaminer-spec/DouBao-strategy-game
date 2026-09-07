'use strict';
// HRE 三个国家机制（阶段3，施工图 §4.2）：
//  - 奥地利：王朝城市网络持续作战（城市+2金 / 骑兵charge+1）——charge+1 已在 main.js/fortification
//    保留（本文件不重复实现）；城市+2金为旧机制保留。
//  - 普鲁士（重构）：军阵协同——多单位协同时获战术优势，替代"全单位移动+1"（main.js 恒定加成已移除）。
//    口径：普鲁士单位每回合**首次移动**时，若起点 8 邻域存在友军单位，本次移动消耗 -1
//    （实现：beforeMove 预支 +1 移动力，马穆鲁克机动战术先例；turnStart 无条件重置）。
//  - 巴伐利亚（保留+整合）：山地防线/高地优势——丘陵移动不消耗（movement.js 旧机制保留）、
//    回血+1（main.js 旧机制保留）；新增：站在丘陵的巴伐利亚单位受击伤害 -1。
// 只经 factionContext（ctx）；不依赖 DOM；必须可在无头 sim 运行。

export const HRE_NATION = {
  prussiaFormationMove: 1, // 军阵协同：首次移动消耗 -1（预支移动力）
  bavariaHillDefense: 1,   // 山地防线：丘陵受击伤害 -1
};

// 模块级运行时状态（不写入 game 对象）
const state = {
  lastGameRef: null,
  prussiaFormationUsed: new Set(), // unitId：本回合已享受军阵协同（每回合重置）
};

function resetState() {
  state.prussiaFormationUsed.clear();
}

export function syncGameRef(ctx) {
  if (ctx && ctx.game !== state.lastGameRef) {
    resetState();
    state.lastGameRef = ctx ? ctx.game : null;
  }
}

export function resetForTests() {
  resetState();
  state.lastGameRef = null;
}

function hasFriendlyAdjacent(ctx, unit) {
  for (const other of ctx.game.units) {
    if (other === unit) continue;
    if (!ctx.areAllies(ctx.game.teams, unit.owner, other.owner)) continue;
    if (Math.abs(other.x - unit.x) <= 1 && Math.abs(other.y - unit.y) <= 1) return true;
  }
  return false;
}

// turnStart：军阵协同标记无条件重置（先例：马穆鲁克首攻重置）
export function onTurnStart(ctx, payload) {
  syncGameRef(ctx);
  state.prussiaFormationUsed.clear();
}

// beforeMove：普鲁士军阵协同——首次移动 + 起点相邻友军 → 预支 1 移动力（等效本次消耗 -1）
export function onBeforeMove(ctx, payload) {
  const { unit } = payload || {};
  if (!unit) return;
  syncGameRef(ctx);
  if (ctx.ownerNation(unit.owner) !== 'prussia') return;
  if (unit.move <= 0) return; // 无移动力不预支
  if (state.prussiaFormationUsed.has(unit.id)) return; // 每回合仅首次
  if (!hasFriendlyAdjacent(ctx, unit)) return;        // 需要军阵（相邻友军）
  state.prussiaFormationUsed.add(unit.id);
  // 预支 1 移动力（本次移动消耗 -1）。不钳制 maxMove：军阵协同是"本次多走一步"，
  // 满移动力出发也有效（马穆鲁克机动战术预支先例，临时超上限属预期）。
  unit.move = unit.move + HRE_NATION.prussiaFormationMove;
  ctx.log(`${ctx.typeMeta(unit.type).name}与友军列阵协同推进，本次移动消耗 -1。`, 'system');
}

// beforeAttack：巴伐利亚山地防线——站在丘陵的巴伐利亚单位受击伤害 -1（只改 result.damage）
export function onBeforeAttack(ctx, payload) {
  const { defender, result } = payload || {};
  if (!defender || !result || !result.damage) return;
  syncGameRef(ctx);
  if (ctx.ownerNation(defender.owner) !== 'bavaria') return;
  const g = ctx.game;
  if (!g.terrain || !g.terrain[defender.y]) return;
  if (g.terrain[defender.y][defender.x] !== 'hill') return;
  result.damage = Math.max(1, result.damage - HRE_NATION.bavariaHillDefense);
  ctx.log(`${ctx.typeMeta(defender.type).name}依托山地防线固守，受击伤害 -1。`, 'battle');
}

export function attachDebug(ctx) {
  const debug = {
    config: () => ({ ...HRE_NATION }),
    state: () => ({ prussiaFormationUsed: [...state.prussiaFormationUsed] }),
  };
  if (typeof globalThis !== 'undefined') globalThis.__hreDebug = { ...(globalThis.__hreDebug || {}), nations: debug };
  return debug;
}
