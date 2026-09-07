'use strict';
// 大明联盟 Layer 4 核心系统（一）：火力网（fireZone + 交叉火力 crossfire）。
// 只经 factionContext（ctx）访问游戏状态；不依赖 DOM；必须可在无头 sim 运行。
// 实现依据：FACTION-SYSTEM-API-CONTRACT v1.3 + 主对话 Handoff-E（2026-09-08）+ 规格书 §11/§40。
//
// 接口决策（与本文件数值共同构成"口径"，交付报告逐项列明）：
//  - fireZone 为战场实体（facility type 'fireZone'），放在目标格（defender 所在格）。
//    结构 {owner, sourceUnitId, x, y, damage, duration, type:'fire'} 存入 facility.data（§40）。
//    覆盖判定用坐标匹配（getFacilitiesByType + x/y 比较），不做格覆盖范围数据结构。
//  - 生成：所有大明远程单位（range>1，含神机营/红夷大炮/朝鲜龟船）攻击后，afterAttack
//    在目标格产生 fireZone，持续 1 回合（duration=1）。目标死亡（defenderDead）也生成——
//    火力区是"区域效果"，即使目标被消灭，该区域仍被火力覆盖（下一单位进入同样受伤）。
//  - 去重：同一源单位同一格不重复叠（data.sourceUnitId 判重，已存在则跳过保持原值）；
//    不同源单位同一格可叠加（这是 crossfire 的产生来源——两个火器瞄准同一格）。
//  - 进入受伤（beforeMove）：敌方（非同盟）单位移动进入 fireZone 格 → 扣血。
//    一次进入只结算一格一次，伤害取该格所有敌对 fireZone 中的最高值（含瞭望塔校正），
//    不按数量叠加（多火力区的价值体现在 crossfire 上）。伤害不致死（最低保留 1 HP）——
//    契约 §5 禁止直接调用 removeUnit，联盟系统无法处理致死清理，故"进入即伤但不击杀"。
//    "原地站桩在 fireZone 上"不额外结算（规格书只说"进入时"，写进交付报告口径）。
//  - 交叉火力（beforeAttack）：defender 所在格被 ≥2 个敌对（非同盟）fireZone 覆盖 →
//    result.damage += CROSSFIRE_BONUS（"大幅降低防御"实现为受击伤害增加，对任意攻击者生效）。
//  - 瞭望塔火力校正：fireZone 进入伤害与 crossfire 加成的增强逻辑在本文件实现
//    （瞭望塔是"火力系统"的一部分：engineering.js 只负责瞭望塔的部署生命周期，效果归本文件）。
//  - expire：大明 turnStart 时 ctx.expireFacilities(owner) 移除己方到期 fireZone
//    （duration 1→0）；工程设施 duration=null 不受影响。时序保证：fireZone 从产生到
//    "大明下一个回合 turnStart" 一直有效，即敌方恰好 1 个完整回合受影响（与金帐 raided turns=3
//    的推导一致：每 beginTurn 全量 tick/过期一次）。
//  - 自动部分对 AI 同样生效（与其他联盟一致）：AI 大明的远程单位同样生成火力网。
//  - 叠加顺序（契约 §2.4）：before 类事件 hre → goldenHorde → venice → mamluk → ming，
//    本模块 onBeforeAttack 看到的是前四个联盟改后的 result.damage，在其上继续叠加。

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const FIREZONE = {
  type: 'fireZone',          // facility type 字符串（core 不枚举，联盟系统定义）
  duration: 1,               // 持续 1 回合
  damage: 2,                 // 进入伤害（不致死，最低保留 1 HP）
  crossfireBonus: 4,         // ≥2 个火力区覆盖 → 受击伤害 +4（"大幅降低防御"）
  crossfireMin: 2,           // 触发 crossfire 所需的最小火力区数
  watchtowerRange: 2,        // 瞭望塔校正范围（Chebyshev）
  watchtowerFzBonus: 1,      // 瞭望塔范围内 fireZone 进入伤害 +1（2→3）
  watchtowerXfBonus: 1,      // 瞭望塔范围内 crossfire 加成 +1（4→5）
};

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,         // 换局检测
};

function resetState() {
  // fireZone 是 facility（facilitySystem 内部存储，跨局由主对话 newGame clear）；
  // 本模块暂无模块级 Map/Set，保留 resetState 以对称后续扩展。
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

// ---------------------------------------------------------------------------
// 基础判定
// ---------------------------------------------------------------------------
export function isMingOwner(ctx, owner) {
  return !!owner && ctx.ownerFaction(owner) === 'ming';
}

// 大明远程单位：typeMeta.range > 1（神机营 range3 / 红夷大炮 range5 / 朝鲜龟船 range2）
export function isMingRemoteUnit(ctx, unit) {
  if (!unit) return false;
  if (!isMingOwner(ctx, unit.owner)) return false;
  const meta = ctx.typeMeta(unit.type);
  return !!meta && meta.range > 1;
}

function inRange(a, b, range) {
  return Math.abs(a.x - b.x) <= range && Math.abs(a.y - b.y) <= range;
}

// 某格的所有 fireZone 设施
export function fireZonesAt(ctx, x, y) {
  return ctx.getFacilitiesByType(FIREZONE.type).filter(f => f.x === x && f.y === y);
}

// 瞭望塔校正：该格（或某 fireZone 位置）是否在任一瞭望塔范围内
function watchtowerCovers(ctx, x, y) {
  return ctx.getFacilitiesByType('watchtower')
    .some(f => isMingOwner(ctx, f.owner) && inRange(f, { x, y }, FIREZONE.watchtowerRange));
}

// 某格的"进入伤害"：该格所有敌对 fireZone 的最高伤害（含瞭望塔校正）；无 → 0
export function entryDamageAt(ctx, unit, x, y) {
  let best = 0;
  for (const fz of fireZonesAt(ctx, x, y)) {
    if (ctx.areAllies(ctx.game.teams, unit.owner, fz.owner)) continue; // 同盟火力区不伤
    let dmg = FIREZONE.damage;
    if (watchtowerCovers(ctx, fz.x, fz.y)) dmg += FIREZONE.watchtowerFzBonus;
    if (dmg > best) best = dmg;
  }
  return best;
}

// 某格的 crossfire 判定：敌对 fireZone 覆盖数（含瞭望塔校正后的加成值；无 → 0）
export function crossfireBonusAt(ctx, unit, x, y) {
  const hostile = fireZonesAt(ctx, x, y)
    .filter(fz => !ctx.areAllies(ctx.game.teams, unit.owner, fz.owner));
  if (hostile.length < FIREZONE.crossfireMin) return 0;
  let bonus = FIREZONE.crossfireBonus;
  if (watchtowerCovers(ctx, x, y)) bonus += FIREZONE.watchtowerXfBonus;
  return bonus;
}

// ---------------------------------------------------------------------------
// afterAttack：大明远程单位攻击后，在目标格产生 fireZone
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker, defender } = payload || {};
  if (!attacker || !defender) return;
  syncGameRef(ctx);
  if (!isMingRemoteUnit(ctx, attacker)) return;
  if (ctx.areAllies(ctx.game.teams, attacker.owner, defender.owner)) return;
  // 去重：同一源单位同一格已存在 fireZone → 跳过（保持原值）
  const dup = fireZonesAt(ctx, defender.x, defender.y)
    .some(f => f.data.sourceUnitId === attacker.id);
  if (dup) return;
  ctx.createFacility(FIREZONE.type, attacker.owner, defender.x, defender.y, {
    hp: 1,
    duration: FIREZONE.duration,
    data: {
      owner: attacker.owner,
      sourceUnitId: attacker.id,
      x: defender.x,
      y: defender.y,
      damage: FIREZONE.damage,
      type: 'fire',
    },
  });
  ctx.log(`${ctx.typeMeta(attacker.type).name}在（${defender.x},${defender.y}）布下火力区，敌军进入将遭到火力打击。`, 'battle');
}

// ---------------------------------------------------------------------------
// beforeMove：敌方单位移动进入 fireZone → 受伤（不致死，最低 1 HP）
// ---------------------------------------------------------------------------
export function onBeforeMove(ctx, payload) {
  const { unit, to } = payload || {};
  if (!unit || !to) return;
  if (unit.move <= 0) return;
  syncGameRef(ctx);
  const dmg = entryDamageAt(ctx, unit, to.x, to.y);
  if (dmg <= 0) return;
  unit.hp = Math.max(1, unit.hp - dmg);
  ctx.log(`${ctx.typeMeta(unit.type).name}闯入火力区，受到 ${dmg} 点火力打击（剩余 ${unit.hp} HP）。`, 'battle');
}

// ---------------------------------------------------------------------------
// beforeAttack：交叉火力（defender 被 ≥2 个火力区覆盖 → 受击伤害增加）
// ---------------------------------------------------------------------------
export function onBeforeAttack(ctx, payload) {
  const { defender, result } = payload || {};
  if (!defender || !result || !result.damage) return;
  syncGameRef(ctx);
  const bonus = crossfireBonusAt(ctx, defender, defender.x, defender.y);
  if (bonus <= 0) return;
  result.damage += bonus;
  ctx.log(`${ctx.typeMeta(defender.type).name}陷入交叉火力（${crossfireCoverCount(ctx, defender)} 个火力区），防御被压制，受击伤害 +${bonus}。`, 'battle');
}

function crossfireCoverCount(ctx, defender) {
  return fireZonesAt(ctx, defender.x, defender.y)
    .filter(fz => !ctx.areAllies(ctx.game.teams, defender.owner, fz.owner)).length;
}

// ---------------------------------------------------------------------------
// turnStart：大明回合开始 → 己方 fireZone 到期移除（duration 1→0）
// 工程设施 duration=null 不受影响（expireFacilities 只处理有 duration 的设施）。
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  syncGameRef(ctx);
  if (!isMingOwner(ctx, owner)) return;
  ctx.expireFacilities(owner);
}

// ---------------------------------------------------------------------------
// debug/test 入口（mingRules.attachDebug 调用；浏览器控制台可用）
// ---------------------------------------------------------------------------
export function attachDebug(ctx) {
  const debug = {
    config: () => ({ ...FIREZONE }),
    zones: () => ctx.getFacilitiesByType(FIREZONE.type)
      .map(f => ({ id: f.id, owner: f.owner, sourceUnitId: f.data.sourceUnitId, x: f.x, y: f.y, damage: f.data.damage, duration: f.duration })),
    entryDamage: (unit, x, y) => entryDamageAt(ctx, unit, x, y),
    crossfire: (unit, x, y) => crossfireBonusAt(ctx, unit, x, y),
  };
  if (typeof globalThis !== 'undefined') globalThis.__mingDebug = { ...(globalThis.__mingDebug || {}), fireZone: debug };
  return debug;
}
