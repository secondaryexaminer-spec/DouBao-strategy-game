'use strict';
// 马穆鲁克联盟 Layer 4 核心系统：精锐成长（veterancy）+ 军团士气（morale）+
// 精锐死亡代价（eliteLost）+ 三国家机制（埃及尼罗河补给 / 叙利亚长弓火线 / 巴格达学术指令）。
// 只经 factionContext（ctx）访问游戏状态；不依赖 DOM；必须可在无头 sim 运行。
// 实现依据：FACTION-SYSTEM-API-CONTRACT v1.3 + 主对话 Handoff-D（2026-09-07）。
//
// 接口决策（与本文件数值共同构成"口径"，交付报告逐项列明）：
//  - 特殊单位集合（适用 veterancy）：mamlukCavalry / camelWarrior / sultanGuard
//    （规格书 §9.1"精锐骑兵=必须保护的战略资产" + constants 中三个马穆鲁克骑兵类单位）。
//  - 经验来源：造成伤害（1 XP/点）/ 击杀（+10）/ 关键战斗（击杀 level>=3 单位 +5）/
//    占领据点（+15）。埃及河边 ×1.5；高士气 ×1.5（乘法叠加，取整）。
//  - 等级阈值：V1=30（攻击+1，自动）/ V2=70（防御+1，自动）/ V3=120（三选一，
//    玩家与 AI 均发起决策；AI 选择由 src/ai/ 决策系统完成，阶段6 F1）/ Elite=200（联盟特殊称号）。
//  - 士气（模块级，按 owner 独立）：初始 50（0~100）；精锐击杀 +1 / 精锐死亡 -3；
//    高士气 >=70：经验 ×1.5 + 骑兵（特殊单位）每回合首次攻击伤害 +2；
//    低士气 <=30：新生兵（veteranLevel===0 或未建档）攻击 -1。
//  - eliteLost：veteranLevel>=3 精锐死亡 → 15 金币 + 士气 -3 + 累计经验清零
//    （record 保留在历史中作阵亡统计，dead 标记不再生效）。
//  - "精锐恢复降低"：GH-06（beforeHeal）未实现，按 Handoff §4-5 方案 a 降级登记，
//    本轮不实施（见交付报告已知问题）。
//  - 机动战术"不受地形影响"：reachable 在 beforeMove emit 前已计算，无法突破单步可达性，
//    实现为"范围内单位每回合首次移动消耗 -1"（beforeMove 预支 +1，等效地形成本减免）。
//
// 叠加顺序（契约 §2.4）：before 类事件 hre → goldenHorde → venice → mamluk，
// 本模块 onBeforeAttack 看到的是前三个联盟改后的 result.damage，在其上继续叠加。

import { isAiOwner } from '../../ai/aiUtil.js';

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const VETERANCY = {
  // 特殊单位集合（适用 veterancy 的精锐单位）
  specialUnits: ['mamlukCavalry', 'camelWarrior', 'sultanGuard'],
  // 经验
  xpPerDamage: 1,          // 造成伤害：每点 1 XP
  killXp: 10,              // 击杀
  keyBattleXp: 5,          // 关键战斗：击杀 level>=3 单位
  captureXp: 15,           // 占领据点
  // 等级阈值
  v1Threshold: 30,
  v2Threshold: 70,
  v3Threshold: 120,
  eliteThreshold: 200,
  // Veteran 效果数值
  v1Atk: 1,                // Veteran 1：攻击 +1
  v2Def: 1,                // Veteran 2：防御 +1
  chargeBonus: 3,          // Veteran 3 冲锋强化：满移动力攻击伤害 +3
  bloodlustHeal: 2,        // Veteran 3 击杀回血：击杀后回血 +2
  swiftMove: 1,            // Veteran 3 移动力强化：永久移动力 +1
  // 埃及（尼罗河补给）
  egyptHeal: 2,            // 河边/城市附近每回合额外回血
  egyptXpMult: 1.5,        // 河边经验获取 ×1.5
  egyptRange: 1,           // "附近" = Chebyshev 距离 <=1（8 邻域含自身）
  // 叙利亚（长弓火线）
  syriaFocusBonus: 2,      // 协同射击：第二个远程单位攻击同一目标伤害 +2
  // 巴格达（学术指令）
  tacticDef: 1,            // 守势：范围内己方单位被攻击伤害 -1
  tacticOff: 2,            // 进攻：范围内己方单位攻击伤害 +2
  tacticDrillHeal: 1,      // 整军：范围内己方单位每回合回血 +1
  mobilityPrepay: 1,       // 机动：每回合首次移动消耗 -1（beforeMove 预支）
};

export const MORALE = {
  init: 50,                // 初始士气（0~100）
  high: 70,                // 高士气阈值
  low: 30,                 // 低士气阈值
  killGain: 1,             // 精锐击杀 +1
  lostPenalty: 3,          // 精锐死亡 -3
  highXpMult: 1.5,         // 高士气：精锐经验获取 ×1.5
  cavalryFirstHitBonus: 2, // 高士气：骑兵每回合首次攻击伤害 +2
  greenPenalty: 1,         // 低士气：新生兵攻击 -1
};

export const ELITE_LOST = {
  gold: 15,                // 精锐死亡金币损失
  moralePenalty: 3,        // 精锐死亡士气损失（与 MORALE.lostPenalty 一致）
};

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,          // 换局检测
  veterancy: new Map(),       // unitId -> {unitId, xp, veteranLevel, kills, lastPromotionTurn, promotion, elite, dead}
  morale: new Map(),          // owner -> number（0~100，懒初始化 50）
  fireLine: new Map(),        // defenderId -> {lastAttackerId, count}（叙利亚协同射击，回合内）
  cavalryFirstHit: new Set(), // unitId：本回合已享受高士气骑兵首攻（每回合重置）
  mobilityUsed: new Set(),    // unitId：本回合已享受机动预支（每回合重置）
  v3Requested: new Set(),     // unitId：已请求过 Veteran 3 晋升决策（去重）
  tactic: new Map(),          // owner -> 'defensive'|'offensive'|'mobility'|'drill'（巴格达学术指令）
};

function resetState() {
  state.veterancy.clear();
  state.morale.clear();
  state.fireLine.clear();
  state.cavalryFirstHit.clear();
  state.mobilityUsed.clear();
  state.v3Requested.clear();
  state.tactic.clear();
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

// 仅测试用：直接设置士气（harness 构造低/高士气场景；生产流程不调用）
export function setMoraleForTests(owner, value) {
  state.morale.set(owner, Math.max(0, Math.min(100, value)));
  return getMorale(owner);
}

// ---------------------------------------------------------------------------
// 基础判定
// ---------------------------------------------------------------------------
export function isMamlukOwner(ctx, owner) {
  return !!owner && ctx.ownerFaction(owner) === 'mamluk';
}

export function isSpecialUnit(ctx, unit) {
  return !!unit && VETERANCY.specialUnits.includes(unit.type);
}

// ---------------------------------------------------------------------------
// 精锐档案（懒创建：只有特殊单位第一次获得经验/被杀时建档）
// ---------------------------------------------------------------------------
function ensureRecord(unit) {
  let rec = state.veterancy.get(unit.id);
  if (!rec) {
    rec = {
      unitId: unit.id,
      xp: 0,
      veteranLevel: 0,
      kills: 0,
      lastPromotionTurn: 0,
      promotion: null,   // 'charge' | 'bloodlust' | 'swift'
      elite: false,
      dead: false,
    };
    state.veterancy.set(unit.id, rec);
  }
  return rec;
}

export function getVeterancy(unitId) {
  const rec = state.veterancy.get(unitId);
  return rec ? { ...rec } : null;
}

// 巴格达当前战术（无则 null）
export function tacticOf(owner) {
  return state.tactic.get(owner) || null;
}

// ---------------------------------------------------------------------------
// 军团士气（按 owner 独立；懒初始化 50；clamp 0~100）
// ---------------------------------------------------------------------------
export function getMorale(owner) {
  if (!state.morale.has(owner)) state.morale.set(owner, MORALE.init);
  return state.morale.get(owner);
}

function adjustMorale(owner, delta) {
  const v = Math.max(0, Math.min(100, getMorale(owner) + delta));
  state.morale.set(owner, v);
  return v;
}

// ---------------------------------------------------------------------------
// 埃及判定：Chebyshev <=1（8 邻域含自身）内有 water 地形或己方 city 据点
// ---------------------------------------------------------------------------
export function nearNile(ctx, unit) {
  const g = ctx.game;
  if (!g || !g.terrain || !unit) return false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = unit.x + dx;
      const y = unit.y + dy;
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
      if (g.terrain[y] && g.terrain[y][x] === 'water') return true;
    }
  }
  for (const s of g.sites || []) {
    if (s.kind !== 'city') continue;
    if (Math.abs(s.x - unit.x) <= VETERANCY.egyptRange && Math.abs(s.y - unit.y) <= VETERANCY.egyptRange &&
        ctx.areAllies(g.teams, s.owner, unit.owner)) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// 巴格达学者范围（与 combat.js 口径一致：学者 owner 是 baghdad → 范围 3，否则 2；
// 学者为 baghdad 国家特色兵种，实际恒为 3）
// ---------------------------------------------------------------------------
export function hasScholarNearby(ctx, unit) {
  if (!unit) return false;
  const range = ctx.ownerNation(unit.owner) === 'baghdad' ? 3 : 2;
  return ctx.game.units.some(u => u.owner === unit.owner && u.type === 'caliphScholar' &&
    Math.abs(u.x - unit.x) <= range && Math.abs(u.y - unit.y) <= range);
}

// ---------------------------------------------------------------------------
// 经验获取与升级
// ---------------------------------------------------------------------------
function checkLevel(ctx, unit, rec) {
  // Veteran 1（自动）：攻击 +1
  if (rec.veteranLevel < 1 && rec.xp >= VETERANCY.v1Threshold) {
    rec.veteranLevel = 1;
    rec.lastPromotionTurn = ctx.game.turn || 0;
    ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 1（攻击 +1）。`, 'system');
  }
  // Veteran 2（自动）：防御 +1
  if (rec.veteranLevel < 2 && rec.xp >= VETERANCY.v2Threshold) {
    rec.veteranLevel = 2;
    rec.lastPromotionTurn = ctx.game.turn || 0;
    ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 2（防御 +1）。`, 'system');
  }
  // Veteran 3（玩家与 AI 决策，三选一；AI 选择由 src/ai/ 决策系统完成，阶段6 F1）
  if (rec.veteranLevel === 2 && rec.xp >= VETERANCY.v3Threshold && !rec.promotion) {
    if (unit.owner === 'player' || isAiOwner(unit.owner)) {
      if (!state.v3Requested.has(unit.id)) {
        requestV3Decision(ctx, unit, rec);
      }
    }
  }
  // Elite（联盟特殊称号，展示性，无数值）
  if (rec.veteranLevel >= 3 && !rec.elite && rec.xp >= VETERANCY.eliteThreshold) {
    rec.elite = true;
    rec.lastPromotionTurn = ctx.game.turn || 0;
    ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Elite——马穆鲁克精英！`, 'system');
  }
}

function addXp(ctx, unit, amount, reason) {
  if (!isSpecialUnit(ctx, unit)) return;
  syncGameRef(ctx);
  const rec = ensureRecord(unit);
  if (rec.dead) return;
  let xp = amount;
  // 埃及：位于河流/城市附近 → 经验获取 ×1.5
  if (ctx.ownerNation(unit.owner) === 'egypt' && nearNile(ctx, unit)) {
    xp = Math.round(xp * VETERANCY.egyptXpMult);
  }
  // 高士气：精锐经验获取 ×1.5
  if (getMorale(unit.owner) >= MORALE.high) {
    xp = Math.round(xp * MORALE.highXpMult);
  }
  rec.xp += xp;
  if (reason === 'kill') rec.kills += 1;
  checkLevel(ctx, unit, rec);
}

// ---------------------------------------------------------------------------
// Veteran 3 三选一晋升（决策 API；无头 sim 非 AI owner 自动选第一项"冲锋强化"；
// AI owner 由 src/ai/ 决策系统选择，阶段6 F1）
// ---------------------------------------------------------------------------
const V3_OPTION_LABEL = { charge: '冲锋强化', bloodlust: '击杀回血', swift: '移动力强化' };

function requestV3Decision(ctx, unit, rec) {
  state.v3Requested.add(unit.id);
  const options = [
    { id: 'charge', label: '冲锋强化', description: '满移动力发起攻击时伤害 +3。' },
    { id: 'bloodlust', label: '击杀回血', description: '击杀单位后回复 2 点生命。' },
    { id: 'swift', label: '移动力强化', description: '永久移动力 +1。' },
  ];
  return ctx.requestDecision(`mlV3_${unit.id}`, {
    owner: unit.owner,
    unitId: unit.id,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '精锐晋升',
    description: `${ctx.typeMeta(unit.type).name}达到 Veteran 3，选择晋升方向。`,
    options,
    onResolve: (choiceId) => { applyV3Promotion(ctx, unit, choiceId); },
  });
}

function applyV3Promotion(ctx, unit, choiceId) {
  const rec = state.veterancy.get(unit.id);
  if (!rec || rec.dead) return false;
  if (!['charge', 'bloodlust', 'swift'].includes(choiceId)) return false;
  rec.promotion = choiceId;
  rec.veteranLevel = 3;
  rec.lastPromotionTurn = ctx.game.turn || 0;
  if (choiceId === 'swift') {
    // 永久移动力 +1：改 baseMove（beginTurn 用 effectiveMove=baseMove+rank/2 重置 maxMove，永久生效）
    unit.baseMove += VETERANCY.swiftMove;
    unit.maxMove += VETERANCY.swiftMove;
    unit.move += VETERANCY.swiftMove;
  }
  ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 3（${V3_OPTION_LABEL[choiceId]}）。`, 'system');
  return true;
}

// ---------------------------------------------------------------------------
// 巴格达学术指令（决策 API；无头 sim 非 AI owner 自动选第一项"守势"；
// AI owner 由 src/ai/ 决策系统选择，阶段6 F1）
// ---------------------------------------------------------------------------
export const TACTIC_OPTIONS = [
  { id: 'defensive', label: '守势', description: '学者范围内己方单位被攻击时伤害 -1。' },
  { id: 'offensive', label: '进攻', description: '学者范围内己方单位攻击时伤害 +2。' },
  { id: 'mobility', label: '机动', description: '学者范围内己方单位每回合首次移动消耗 -1。' },
  { id: 'drill', label: '整军', description: '学者范围内己方单位每回合恢复 1 点生命。' },
];

function requestTacticDecision(ctx, owner) {
  if (ctx.ownerNation(owner) !== 'baghdad') return null;
  const scholar = ctx.game.units.find(u => u.owner === owner && u.type === 'caliphScholar');
  if (!scholar) return null;
  return ctx.requestDecision(`mlTactic_${owner}_${ctx.game.turn || 0}`, {
    owner,
    unitId: scholar.id,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '学术指令',
    description: '哈里发学者每回合可选择一种战术，替代固定光环。',
    options: TACTIC_OPTIONS,
    onResolve: (choiceId) => {
      if (TACTIC_OPTIONS.some(o => o.id === choiceId)) {
        state.tactic.set(owner, choiceId);
        ctx.log(`巴格达发布学术指令：${TACTIC_OPTIONS.find(o => o.id === choiceId).label}。`, 'system');
      }
    },
  });
}

// ---------------------------------------------------------------------------
// afterAttack：攻击方经验/士气/击杀回血 + 双方精锐死亡惩罚
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker, defender, result, defenderDead, attackerDead } = payload || {};
  if (!attacker || !defender) return;
  syncGameRef(ctx);
  const atkIsMamluk = isMamlukOwner(ctx, attacker.owner);
  const defIsMamluk = isMamlukOwner(ctx, defender.owner);
  if (!atkIsMamluk && !defIsMamluk) return;

  // 1. 攻击方：经验 + 击杀回血 + 士气
  if (atkIsMamluk && isSpecialUnit(ctx, attacker)) {
    const damage = (result && result.damage) || 0;
    if (damage > 0) addXp(ctx, attacker, damage * VETERANCY.xpPerDamage, 'damage');
    if (defenderDead) {
      addXp(ctx, attacker, VETERANCY.killXp, 'kill');
      const dmeta = ctx.typeMeta(defender.type);
      if (dmeta && dmeta.level >= 3) addXp(ctx, attacker, VETERANCY.keyBattleXp, 'keyBattle');
      // Veteran 3 击杀回血
      const rec = state.veterancy.get(attacker.id);
      if (!attackerDead && rec && !rec.dead && rec.promotion === 'bloodlust') {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + VETERANCY.bloodlustHeal);
      }
      // 精锐击杀 → 士气 +1
      if (rec && !rec.dead && rec.veteranLevel >= 1) {
        adjustMorale(attacker.owner, MORALE.killGain);
      }
    }
  }

  // 2. 防守方精锐死亡 → eliteLost（veteranLevel>=3）
  if (defIsMamluk && defenderDead) {
    eliteLost(ctx, defender);
  }
  // 3. 攻击方被反击致死 → eliteLost
  if (atkIsMamluk && attackerDead) {
    eliteLost(ctx, attacker);
  }
}

// ---------------------------------------------------------------------------
// eliteLost：精锐（veteranLevel>=3）死亡代价
// ---------------------------------------------------------------------------
function eliteLost(ctx, unit) {
  const rec = state.veterancy.get(unit.id);
  if (!rec || rec.dead || rec.veteranLevel < 3) return;
  const paid = ctx.spendGold(unit.owner, ELITE_LOST.gold);
  adjustMorale(unit.owner, -ELITE_LOST.moralePenalty);
  // 累计经验清零（record 保留作阵亡统计，dead 标记不再生效）
  rec.xp = 0;
  rec.veteranLevel = 0;
  rec.dead = true;
  ctx.log(
    `${ctx.typeMeta(unit.type).name}（精锐）阵亡：损失${ELITE_LOST.gold}金币${paid ? '' : '（金币不足，实际未扣）'}，军团士气 -${ELITE_LOST.moralePenalty}，累计经验清零。`,
    'warning'
  );
}

// ---------------------------------------------------------------------------
// siteCaptured：占领据点 → 精锐经验
// ---------------------------------------------------------------------------
export function onSiteCaptured(ctx, payload) {
  const { unit } = payload || {};
  if (!unit) return;
  syncGameRef(ctx);
  if (!isMamlukOwner(ctx, unit.owner)) return;
  addXp(ctx, unit, VETERANCY.captureXp, 'capture');
}

// ---------------------------------------------------------------------------
// beforeAttack：士气/等级/战术/协同叠加（只改 result.damage，不取消攻击）
// ---------------------------------------------------------------------------
export function onBeforeAttack(ctx, payload) {
  const { attacker, defender, result, isCounter } = payload || {};
  if (!attacker || !defender || !result || !result.damage) return;
  syncGameRef(ctx);
  const atkMamluk = isMamlukOwner(ctx, attacker.owner);
  const defMamluk = isMamlukOwner(ctx, defender.owner);
  if (!atkMamluk && !defMamluk) return;

  // —— 攻击方加成（主动攻击；beforeAttack 只在主动攻击时 emit，反击不经过本钩子）——
  if (atkMamluk) {
    const rec = state.veterancy.get(attacker.id);
    const morale = getMorale(attacker.owner);

    // 低士气：新生兵（无档案或 veteranLevel===0）攻击 -1
    if (morale <= MORALE.low && (!rec || rec.dead || rec.veteranLevel === 0)) {
      result.damage = Math.max(1, result.damage - MORALE.greenPenalty);
    }
    // Veteran 1：攻击 +1（死亡/清零后的旧档案不生效）
    if (rec && !rec.dead && rec.veteranLevel >= 1) {
      result.damage += VETERANCY.v1Atk;
    }
    // Veteran 3 冲锋强化：满移动力发起攻击 → 伤害 +3
    if (rec && !rec.dead && rec.promotion === 'charge' && attacker.move === attacker.maxMove) {
      result.damage += VETERANCY.chargeBonus;
    }
    // 高士气：骑兵（特殊单位）每回合首次攻击 → 伤害 +2
    if (morale >= MORALE.high && isSpecialUnit(ctx, attacker) && !state.cavalryFirstHit.has(attacker.id)) {
      result.damage += MORALE.cavalryFirstHitBonus;
      state.cavalryFirstHit.add(attacker.id);
      ctx.log(`${ctx.typeMeta(attacker.type).name}趁高涨士气发起猛攻，伤害 +${MORALE.cavalryFirstHitBonus}。`, 'battle');
    }
    // 巴格达进攻战术
    if (ctx.ownerNation(attacker.owner) === 'baghdad' && state.tactic.get(attacker.owner) === 'offensive' && hasScholarNearby(ctx, attacker)) {
      result.damage += VETERANCY.tacticOff;
    }
    // 叙利亚长弓火线（协同射击）
    if (ctx.ownerNation(attacker.owner) === 'syria') {
      applySyriaFocus(ctx, attacker, defender, result);
    }
  }

  // —— 防守方减伤 ——
  if (defMamluk) {
    const drec = state.veterancy.get(defender.id);
    // Veteran 2：防御 +1
    if (drec && !drec.dead && drec.veteranLevel >= 2) {
      result.damage = Math.max(1, result.damage - VETERANCY.v2Def);
    }
    // 巴格达守势战术
    if (ctx.ownerNation(defender.owner) === 'baghdad' && state.tactic.get(defender.owner) === 'defensive' && hasScholarNearby(ctx, defender)) {
      result.damage = Math.max(1, result.damage - VETERANCY.tacticDef);
    }
  }
}

// 叙利亚长弓火线：同一回合内，第二个（不同）远程单位攻击同一目标 → 协同射击 +2
function applySyriaFocus(ctx, attacker, defender, result) {
  const meta = ctx.typeMeta(attacker.type);
  if (!meta || meta.range <= 1) return; // 只统计远程（range>1）
  const prev = state.fireLine.get(defender.id);
  if (prev && prev.lastAttackerId !== attacker.id) {
    result.damage += VETERANCY.syriaFocusBonus;
    prev.count += 1;
    prev.lastAttackerId = attacker.id;
    ctx.log(`${ctx.typeMeta(attacker.type).name}与友军协同射击，伤害 +${VETERANCY.syriaFocusBonus}。`, 'battle');
  } else {
    state.fireLine.set(defender.id, { lastAttackerId: attacker.id, count: prev ? prev.count : 1 });
  }
}

// ---------------------------------------------------------------------------
// beforeMove：巴格达机动战术（范围内单位每回合首次移动消耗 -1，预支 +1）
// ---------------------------------------------------------------------------
export function onBeforeMove(ctx, payload) {
  const { unit, to } = payload || {};
  if (!unit || !to) return;
  if (unit.move <= 0) return;
  syncGameRef(ctx);
  if (ctx.ownerNation(unit.owner) !== 'baghdad') return;
  if (state.tactic.get(unit.owner) !== 'mobility') return;
  if (state.mobilityUsed.has(unit.id)) return;
  if (!hasScholarNearby(ctx, unit)) return;
  unit.move += VETERANCY.mobilityPrepay;
  state.mobilityUsed.add(unit.id);
}

// ---------------------------------------------------------------------------
// turnStart：回合级标记重置 + 埃及回血 + 巴格达整军回血 + 玩家决策请求
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  syncGameRef(ctx);
  // 回合级状态：任何 owner 回合开始都重置（金帐先例：无条件重置）
  state.cavalryFirstHit.clear();
  state.fireLine.clear();
  state.mobilityUsed.clear();

  if (!isMamlukOwner(ctx, owner)) return;

  // 埃及尼罗河补给：河边/城市附近的精锐每回合额外回血
  if (ctx.ownerNation(owner) === 'egypt') {
    for (const u of ctx.game.units) {
      if (u.owner !== owner || u.hp >= u.maxHp) continue;
      if (!isSpecialUnit(ctx, u)) continue;
      if (nearNile(ctx, u)) {
        u.hp = Math.min(u.maxHp, u.hp + VETERANCY.egyptHeal);
        ctx.log(`${ctx.typeMeta(u.type).name}获得尼罗河补给，回复 ${VETERANCY.egyptHeal} 点生命。`, 'battle');
      }
    }
  }

  // 巴格达整军：范围内己方单位每回合回血 +1
  if (ctx.ownerNation(owner) === 'baghdad' && state.tactic.get(owner) === 'drill') {
    for (const u of ctx.game.units) {
      if (u.owner !== owner || u.hp >= u.maxHp) continue;
      if (hasScholarNearby(ctx, u)) {
        u.hp = Math.min(u.maxHp, u.hp + VETERANCY.tacticDrillHeal);
      }
    }
  }

  // 决策请求（人类玩家与 AI；阶段6 F1 接入，AI 选择由 src/ai/ 决策系统完成）
  if (owner === 'player' || isAiOwner(owner)) {
    // 兜底：Veteran 3 晋升决策（正常在 addXp 内即时请求，此处防遗漏；v3Requested 去重）
    for (const u of ctx.game.units) {
      if (u.owner !== owner) continue;
      const rec = state.veterancy.get(u.id);
      if (rec && !rec.dead && rec.veteranLevel === 2 && rec.xp >= VETERANCY.v3Threshold && !rec.promotion && !state.v3Requested.has(u.id)) {
        requestV3Decision(ctx, u, rec);
      }
    }
    // 学术指令（每回合一次，owner 级）
    requestTacticDecision(ctx, owner);
  }
}

// ---------------------------------------------------------------------------
// debug/test 入口（mamlukRules.attachDebug 调用；浏览器控制台可用）
// ---------------------------------------------------------------------------
export function attachDebug(ctx) {
  const debug = {
    config: () => ({
      veterancy: { ...VETERANCY },
      morale: { ...MORALE },
      eliteLost: { ...ELITE_LOST },
      specialUnits: [...VETERANCY.specialUnits],
    }),
    // 当前全部精锐档案（可选按 owner 过滤）
    veterancy: (owner) => {
      const out = [];
      for (const [id, r] of state.veterancy) {
        const u = ctx.game.units.find(x => x.id === id);
        if (owner && (!u || u.owner !== owner)) continue;
        out.push({ ...r, type: u ? u.type : null, x: u ? u.x : null, y: u ? u.y : null });
      }
      return out;
    },
    morale: (owner) => (owner ? { [owner]: getMorale(owner) } : Object.fromEntries([...state.morale.entries()])),
    tactic: (owner) => (owner ? { [owner]: state.tactic.get(owner) || null } : Object.fromEntries([...state.tactic.entries()])),
    state: () => ({
      fireLine: [...state.fireLine.entries()].map(([id, f]) => ({ defender: id, ...f })),
      cavalryFirstHit: [...state.cavalryFirstHit],
      mobilityUsed: [...state.mobilityUsed],
      v3Requested: [...state.v3Requested],
    }),
    // 手动为某单位请求 V3 晋升决策（UI 阶段前的测试入口）
    requestV3: (unitId) => {
      const u = ctx.game.units.find(x => x.id === unitId);
      if (!u) return null;
      const rec = state.veterancy.get(unitId);
      if (!rec) return null;
      return requestV3Decision(ctx, u, rec);
    },
    // 手动为某 owner 请求学术指令决策
    requestTactic: (owner) => requestTacticDecision(ctx, owner),
    // 查看未决马穆鲁克决策（浏览器 UI 阶段前的手动测试入口）
    pending: (owner) => ctx.getPendingDecisions(owner || 'player')
      .filter(r => String(r.id || '').startsWith('ml'))
      .map(r => ({ id: r.id, title: r.context.title, options: r.context.options.map(o => o.id) })),
    resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
    reset: () => resetForTests(),
  };
  if (typeof globalThis !== 'undefined') globalThis.__mamlukDebug = debug;
  return debug;
}
