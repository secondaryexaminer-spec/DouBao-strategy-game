'use strict';
// 金帐联盟 Layer 4 核心系统（一）：掠袭系统（Raiding）+ 疲软标记（raided）。
// 只经 factionContext（ctx）访问游戏状态；不依赖 DOM；必须可在无头 sim 运行。
// 实现依据：FACTION-SYSTEM-API-CONTRACT v1.2 + 主对话 GH 接口回执（2026-09-07）。
//
// 接口依赖（v1.2 已落地，本模块不重复实现）：
//  - GH-02 ctx.createUnit：营地生产走 ctx（nomadCamp.js），金币/上限/位置校验由调用方自查。
//  - GH-03 tickStatuses 已在 main.js beginTurn 开头全量接线（game.units.map(u=>u.id)），
//    每 beginTurn 全量衰减一次 → raided 写 turns=3：
//      敌方回合 tick→2（移动-1 覆盖敌方恰好 1 个完整回合）；
//      金帐下轮 tick→1（攻击时额外收益生效）；再下轮归零。
//  - GH-04 raided 回血限制：本轮不实现（降级，交付报告"已知问题"记录）。
//  - GH-05 营地/补给摧毁奖励：本轮不实现（降级，交付报告"已知问题"记录）。

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const RAIDED_KEY = 'raided';
export const RAIDED_TURNS = 3;        // tick 全量接线下的生命周期（见文件头推导）

export const RAID_LOOT = {
  normal: 3,       // 普通单位击杀
  elite: 5,        // 高等级单位（level>=3）击杀
  trade: 6,        // 商队/运输单位击杀
  siteBonus: 4,    // 袭击据点：击杀站在敌方据点格上的单位
  raidedMult: 2,   // 带 raided 标记的单位被击杀 → 战利品翻倍
};

export const RAID_POWER_MOVE_MIN = 5;   // move>=5 → +1 机动加成（轻骑/汗国骑/骆驼骑/快帆）
export const RAID_POWER_LEVEL_MIN = 3;  // level>=3 → +1 等级加成

// 商队识别白名单（阶段4 tags 落地前，constants 无 transport/tags 标记可区分陆上商队）
export const TRADE_TYPES = new Set(['tradeCaravan', 'ragusaCaravan']);

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,         // 换局检测
  slowUsedThisTurn: new Set(), // unitId：本回合已因 raided 预扣过移动力（每 beginTurn 重置）
};

function resetState() {
  state.slowUsedThisTurn.clear();
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

export function debugState() {
  return {
    slowUsedThisTurn: [...state.slowUsedThisTurn],
  };
}

// ---------------------------------------------------------------------------
// 基础判定
// ---------------------------------------------------------------------------
export function isGoldenHordeOwner(ctx, owner) {
  return !!owner && ctx.ownerFaction(owner) === 'goldenHorde';
}

export function isGoldenHordeUnit(ctx, unit) {
  return !!unit && isGoldenHordeOwner(ctx, unit.owner);
}

// 商队/运输判定：typeMeta.transport（海军运兵船：transport/barge/arabDhow/treasureShip）
// 或陆上商队白名单（tradeCaravan/ragusaCaravan）
export function isTradeTarget(ctx, unit) {
  if (!unit) return false;
  if (TRADE_TYPES.has(unit.type)) return true;
  const meta = ctx.typeMeta(unit.type);
  return !!(meta && meta.transport);
}

// raidPower：机动/等级派生（0~2），直接作为战利品金币加成。
// 轻骑兵(move6)→1 / 汗国骑兵(move5,lv3)→2 / 骑射手(move4)→0 / 游牧弓手→0 /
// 快速桨帆船(move5)→1 / 游牧战车→0 / 可汗亲卫(lv3)→1 / 骆驼骑兵(move5,lv3)→2 / 游牧重炮(lv3)→1
export function raidPower(ctx, unit) {
  const meta = ctx.typeMeta(unit.type);
  if (!meta) return 0;
  return (meta.move >= RAID_POWER_MOVE_MIN ? 1 : 0) + (meta.level >= RAID_POWER_LEVEL_MIN ? 1 : 0);
}

// 目标基础战利品（未含 raidPower / siteBonus / raided 倍率）
export function baseLoot(ctx, defender) {
  if (isTradeTarget(ctx, defender)) return RAID_LOOT.trade;
  const meta = ctx.typeMeta(defender.type);
  if (meta && meta.level >= 3) return RAID_LOOT.elite;
  return RAID_LOOT.normal;
}

// 袭击据点：目标站在敌方（非金帐同盟、非中立）据点格上被击杀 → +4
export function siteBonusFor(ctx, attacker, defender) {
  const site = ctx.getSite(defender.x, defender.y);
  if (!site) return 0;
  if (site.owner === 'neutral') return 0;
  if (ctx.areAllies(ctx.game.teams, site.owner, attacker.owner)) return 0;
  return RAID_LOOT.siteBonus;
}

// ---------------------------------------------------------------------------
// afterAttack：打完就跑 + 掠袭收益 + raided 标记
// ---------------------------------------------------------------------------
// 触发条件：金帐单位攻击敌方单位（攻击站据点的单位视为袭击据点）。
//  - 打完就跑（联盟机制，总览 §）：攻击后移动力保留 max(1, floor(maxMove×0.5))。
//    main.js 攻击后 attacker.move=0，这里恢复 50% 实现"骑射游击、打完就跑"；
//    蓝帐伏击（nationMechanics.onAfterAttack 后执行）会覆盖为满移动力（更彻底）。
//  - defenderDead=false → 不给金币，打上 raided 标记（第一刀制造破绽）。
//  - defenderDead=true  → 按目标类型 + raidPower + 据点加成结算战利品；
//                         若目标带 raided 标记，战利品翻倍。
export function onAfterAttack(ctx, payload) {
  const { attacker, defender, defenderDead } = payload || {};
  if (!attacker || !defender) return;
  if (!isGoldenHordeUnit(ctx, attacker)) return;
  if (ctx.areAllies(ctx.game.teams, attacker.owner, defender.owner)) return;
  attacker.move = Math.max(1, Math.floor(attacker.maxMove * 0.5));

  if (!defenderDead) {
    // 第一刀：制造破绽，不给金币
    ctx.addStatus(defender.id, RAIDED_KEY, RAIDED_TURNS, { by: attacker.owner });
    ctx.log(`${ctx.typeMeta(attacker.type).name}掠袭了${ctx.typeMeta(defender.type).name}，使其陷入疲软（raided）。`, 'battle');
    return;
  }

  // 击杀：结算战利品
  let gold = baseLoot(ctx, defender) + siteBonusFor(ctx, attacker, defender) + raidPower(ctx, attacker);
  if (ctx.hasStatus(defender.id, RAIDED_KEY)) {
    gold *= RAID_LOOT.raidedMult;
  }
  if (gold > 0) {
    ctx.addGold(attacker.owner, gold, 'raid');
    ctx.log(`${ctx.typeMeta(attacker.type).name}掠袭成功，缴获 ${gold} 金币。`, 'gold');
  }
}

// ---------------------------------------------------------------------------
// beforeMove：raided 移动力 -1（预扣模式，仿 HRE 木栅移动税）
// ---------------------------------------------------------------------------
// 带 raided 的单位每次移动预扣 1 点移动力；付不起（剩余 < 步成本+1）则本次移动被阻止。
// 每个单位每回合最多扣一次（state.slowUsedThisTurn 去重，onTurnStart 无条件重置）。
export function onBeforeMove(ctx, payload) {
  const { unit, from, to } = payload || {};
  if (!unit || !to || !from) return;
  if (unit.move <= 0) return;
  if (!ctx.hasStatus(unit.id, RAIDED_KEY)) return;
  if (state.slowUsedThisTurn.has(unit.id)) return;
  const step = ctx.movementCost(ctx.game, unit, to.x, to.y);
  const stepCost = (to.x !== from.x && to.y !== from.y) ? step * Math.SQRT2 : step;
  if (unit.move < stepCost + 1) {
    payload.cancel = true; // 疲软单位付不起 +1 移动税，不能移动
    return;
  }
  unit.move -= 1;
  state.slowUsedThisTurn.add(unit.id);
}

// ---------------------------------------------------------------------------
// turnStart：每回合重置掠袭去重标记（对所有 owner 的回合生效——
// raided 作用于被打方，被打方回合开始时必须重置"本回合已扣过"标记）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  syncGameRef(ctx);
  state.slowUsedThisTurn.clear();
}
