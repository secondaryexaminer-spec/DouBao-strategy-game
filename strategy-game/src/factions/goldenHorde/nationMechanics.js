'use strict';
// 金帐三个国家机制（阶段3，施工图 §4.2 + 规格书 §6）：
//  - 金帐本部：可汗威望 khanPrestige——本局动态积累（击杀+1，非固定+1）。
//    阈值：5=骑兵每回合首次攻击+1；10=游牧营地生产更高效（当前 camp 为立即生产、无生产时间
//    概念，口径：生产成本 -20% 近似"生产时间减少"，阶段5 已确认接受该口径）；15=可汗亲卫获得额外效果（攻击+2）。
//    替代并移除 combat.js 的"金帐本部骑兵攻击+1"固定加成。
//  - 白帐汗国：绿洲网络——白帐控制的沙漠/沙地据点（城市/油田等 site）构成网络节点；
//    节点 2 格范围内：金帐联盟单位每回合回血+2、掠袭收益+2、新建游牧营地持续时间+1。
//    替代并移除 combat.js 的"白帐对骑兵伤害+2"固定加成（改在绿洲网络内对骑兵生效）。
//  - 蓝帐汗国：伏击阵地——蓝帐单位站在雪地/森林，每回合首次攻击获得伏击：
//    首击伤害+2，且攻击后可撤离（恢复满移动力，比联盟"打完就跑"留 50% 更彻底）。
//    替代并移除 combat.js 的"蓝帐步兵防御+1"固定加成。
// 只经 factionContext（ctx）；不依赖 DOM；必须可在无头 sim 运行。

export const GOLDEN_HORDE_NATION = {
  prestigePerKill: 1,        // 每击杀 +1 威望
  tierCavalry: 5,  tierCavBonus: 1,   // 5：骑兵每回合首次攻击 +1
  tierCamp: 10,    tierCampCostMult: 0.8, // 10：营地生产成本 -20%
  tierElite: 15,   tierEliteAtk: 2,   // 15：可汗亲卫攻击 +2
  oasisRange: 2,   oasisHeal: 2, oasisRaidBonus: 2, oasisCampDuration: 1,
  ambushFirstHit: 2,         // 伏击：首击伤害 +2
  ambushTerrains: ['snow', 'forest'],
};

const state = {
  lastGameRef: null,
  prestige: new Map(),       // owner → 威望（本局动态积累）
  cavFirstUsed: new Set(),   // unitId：本回合已享受威望5骑兵首攻
  ambushUsed: new Set(),     // unitId：本回合已享受蓝帐伏击
};

function resetState() {
  state.prestige.clear();
  state.cavFirstUsed.clear();
  state.ambushUsed.clear();
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

export function getPrestige(ctx, owner) {
  return state.prestige.get(owner) || 0;
}

// 测试专用注入（马穆鲁克 setMoraleForTests 先例）；游戏内威望只由击杀积累
export function setPrestigeForTests(ctx, owner, value) {
  syncGameRef(ctx);
  state.prestige.set(owner, value);
}

export function isGoldenHordeCore(ctx, owner) {
  return !!owner && ctx.ownerNation(owner) === 'goldenHordeCore';
}

// ---------------------------------------------------------------------------
// 绿洲网络：白帐控制的沙漠/沙地据点 → 节点
// ---------------------------------------------------------------------------
export function oasisNodes(ctx) {
  const g = ctx.game;
  if (!g || !g.sites || !g.terrain) return [];
  const nodes = [];
  for (const s of g.sites) {
    if (!s.owner || s.owner === 'neutral') continue;
    if (ctx.ownerNation(s.owner) !== 'whiteHorde') continue;
    const t = g.terrain[s.y] && g.terrain[s.y][s.x];
    if (t === 'desert' || t === 'sand') nodes.push(s);
  }
  return nodes;
}

export function inOasisNetwork(ctx, x, y, range = GOLDEN_HORDE_NATION.oasisRange) {
  return oasisNodes(ctx).some(s => Math.abs(s.x - x) <= range && Math.abs(s.y - y) <= range);
}

function isAmbushTerrain(ctx, unit) {
  const g = ctx.game;
  if (!g.terrain || !g.terrain[unit.y]) return false;
  return GOLDEN_HORDE_NATION.ambushTerrains.includes(g.terrain[unit.y][unit.x]);
}

// ---------------------------------------------------------------------------
// turnStart：每回合首次标记无条件重置（先例：马穆鲁克首攻重置）
// 绿洲网络回血：网络范围内金帐联盟单位 +2
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  const initial = !!(payload && payload.initial);
  syncGameRef(ctx);
  state.cavFirstUsed.clear();
  state.ambushUsed.clear();

  if (initial) return; // 第一回合不结算收益（HRE 先例）
  // 绿洲网络回血：网络内金帐联盟单位（白帐控制节点）
  const nodes = oasisNodes(ctx);
  if (!nodes.length) return;
  for (const u of ctx.game.units) {
    if (u.hp >= u.maxHp) continue;
    if (ctx.ownerFaction(u.owner) !== 'goldenHorde') continue;
    if (!nodes.some(s => Math.abs(s.x - u.x) <= GOLDEN_HORDE_NATION.oasisRange && Math.abs(s.y - u.y) <= GOLDEN_HORDE_NATION.oasisRange)) continue;
    u.hp = Math.min(u.maxHp, u.hp + GOLDEN_HORDE_NATION.oasisHeal);
    ctx.log(`${ctx.typeMeta(u.type).name}依托绿洲网络补给，回复 ${GOLDEN_HORDE_NATION.oasisHeal} 点生命。`, 'battle');
  }
}

// ---------------------------------------------------------------------------
// beforeAttack：可汗威望（骑兵首攻/精英亲卫）+ 绿洲网络对骑兵 + 蓝帐伏击首攻
// 只改 result.damage
// ---------------------------------------------------------------------------
export function onBeforeAttack(ctx, payload) {
  const { attacker, defender, result } = payload || {};
  if (!attacker || !defender || !result || !result.damage) return;
  syncGameRef(ctx);

  // 可汗威望 5：金帐本部骑兵每回合首次攻击 +1
  if (isGoldenHordeCore(ctx, attacker.owner)) {
    const atkMeta = ctx.typeMeta(attacker.type);
    if (atkMeta && atkMeta.charge && getPrestige(ctx, attacker.owner) >= GOLDEN_HORDE_NATION.tierCavalry
        && !state.cavFirstUsed.has(attacker.id)) {
      state.cavFirstUsed.add(attacker.id);
      result.damage += GOLDEN_HORDE_NATION.tierCavBonus;
      ctx.log(`${atkMeta.name}借可汗威望发动首轮猛攻，伤害 +${GOLDEN_HORDE_NATION.tierCavBonus}。`, 'battle');
    }
    // 可汗威望 15：可汗亲卫额外效果（攻击 +2）
    if (attacker.type === 'khanGuard' && getPrestige(ctx, attacker.owner) >= GOLDEN_HORDE_NATION.tierElite) {
      result.damage += GOLDEN_HORDE_NATION.tierEliteAtk;
      ctx.log('可汗亲卫受威望加持，伤害 +' + GOLDEN_HORDE_NATION.tierEliteAtk + '。', 'battle');
    }
  }

  // 绿洲网络：网络内白帐单位对骑兵（charge 兵种）伤害 +2（原 combat.js 固定+2 已移除）
  if (ctx.ownerNation(attacker.owner) === 'whiteHorde') {
    const defMeta = ctx.typeMeta(defender.type);
    if (defMeta && defMeta.charge && inOasisNetwork(ctx, attacker.x, attacker.y)) {
      result.damage += GOLDEN_HORDE_NATION.oasisRaidBonus;
      ctx.log(`${ctx.typeMeta(attacker.type).name}依托绿洲网络夹击骑兵，伤害 +${GOLDEN_HORDE_NATION.oasisRaidBonus}。`, 'battle');
    }
  }

  // 蓝帐伏击阵地：雪地/森林每回合首次攻击 → 伏击（首击伤害 +2）
  if (ctx.ownerNation(attacker.owner) === 'blueHorde') {
    if (isAmbushTerrain(ctx, attacker) && !state.ambushUsed.has(attacker.id)) {
      state.ambushUsed.add(attacker.id);
      result.damage += GOLDEN_HORDE_NATION.ambushFirstHit;
      ctx.log(`${ctx.typeMeta(attacker.type).name}从雪地/丛林边缘发动伏击，伤害 +${GOLDEN_HORDE_NATION.ambushFirstHit}。`, 'battle');
    }
  }
}

// ---------------------------------------------------------------------------
// afterAttack：可汗威望击杀积累 + 绿洲网络掠袭收益 + 蓝帐伏击可撤离（满移动力）
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker, defender, defenderDead } = payload || {};
  if (!attacker) return;
  syncGameRef(ctx);

  // 可汗威望：金帐本部单位取得击杀 → +1（本局动态积累）
  if (defenderDead && isGoldenHordeCore(ctx, attacker.owner)) {
    const next = getPrestige(ctx, attacker.owner) + GOLDEN_HORDE_NATION.prestigePerKill;
    state.prestige.set(attacker.owner, next);
    const tiers = [GOLDEN_HORDE_NATION.tierCavalry, GOLDEN_HORDE_NATION.tierCamp, GOLDEN_HORDE_NATION.tierElite];
    const unlocked = tiers.filter(t => next >= t).length - tiers.filter(t => next - 1 >= t).length;
    if (unlocked > 0) {
      ctx.log(`可汗威望提升至 ${next}，解锁新的汗权效果！`, 'system');
    } else {
      ctx.log(`可汗威望提升至 ${next}。`, 'system');
    }
  }

  // 绿洲网络掠袭收益：网络内金帐单位取得击杀时额外 +2（与 raiding 的 loot 时机一致，
  // 仅在击杀时结算，避免网络内无限刷钱）
  if (defenderDead && ctx.ownerFaction(attacker.owner) === 'goldenHorde' && inOasisNetwork(ctx, attacker.x, attacker.y)) {
    ctx.addGold(attacker.owner, GOLDEN_HORDE_NATION.oasisRaidBonus);
    ctx.log(`${ctx.typeMeta(attacker.type).name}在绿洲网络内掠袭，额外获得 ${GOLDEN_HORDE_NATION.oasisRaidBonus} 金币。`, 'system');
  }

  // 蓝帐伏击：本回合已伏击（ambushUsed 标记）→ 攻击后仍可撤离（恢复满移动力）
  if (ctx.ownerNation(attacker.owner) === 'blueHorde' && state.ambushUsed.has(attacker.id)) {
    attacker.move = attacker.maxMove;
    ctx.log(`${ctx.typeMeta(attacker.type).name}伏击得手后迅速撤离，移动力恢复。`, 'system');
  }
}

export function attachDebug(ctx) {
  const debug = {
    config: () => ({ ...GOLDEN_HORDE_NATION }),
    prestige: (owner) => getPrestige(ctx, owner),
    state: () => ({ cavFirstUsed: [...state.cavFirstUsed], ambushUsed: [...state.ambushUsed] }),
    oasis: () => oasisNodes(ctx).map(s => ({ x: s.x, y: s.y, kind: s.kind, owner: s.owner })),
  };
  if (typeof globalThis !== 'undefined') globalThis.__goldenHordeDebug = { ...(globalThis.__goldenHordeDebug || {}), nations: debug };
  return debug;
}
