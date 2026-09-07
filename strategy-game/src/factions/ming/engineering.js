'use strict';
// 大明联盟 Layer 4 核心系统（二）：工程设施（工程师部署 5 种设施）。
// 只经 factionContext（ctx）访问游戏状态；不依赖 DOM；必须可在无头 sim 运行。
// 实现依据：FACTION-SYSTEM-API-CONTRACT v1.3 + 主对话 Handoff-E（2026-09-08）+ 规格书 §11.3。
//
// 接口决策（与本文件数值共同构成"口径"，交付报告逐项列明）：
//  - 部署单位：工部工程师（worksEngineer，大明专属 builder 单位）。
//  - 决策点：建不建 / 建哪种 —— ctx.requestDecision，turnStart 对 owner==='player' 的
//    worksEngineer 每回合请求一次（HRE 工事先例）。选项第一项固定为"不建"（无头 sim
//    fallback 选第一项 = 零行为变化）；AI 工程师不建工程设施（不给 AI 发决策）。
//    位置 = 工程师当前格（玩家移动工程师到目标格即完成"建在哪"的决策，写进口径；
//    requestDecision 的 options 形态无法表达坐标，位置决策由移动自然承载）。
//  - 成本/耐久：金币建造（HRE 先例），设施持久（duration=null，跨局不存档属项目已知问题）；
//    可被攻击摧毁（HRE 先例：敌方攻击设施格上单位时设施按伤害 50% 受损）。
//  - 设施效果结算时机全部在 turnStart（与埃及回血/石堡补给一致，不做"炮台主动攻击"的
//    新战斗循环——避免引入攻击方/反击/经验一整套问题）。initial 回合（第一回合）不结算
//    收益类效果（HRE applyFrontline 先例）。
//  - 炮台伤害不致死（最低保留 1 HP）：契约 §5 禁止直接调用 removeUnit，联盟系统无法
//    处理致死清理（与 fireZone 进入伤害口径一致）。
//  - 壕沟"减少冲锋"：复刻 combat.js 冲锋触发条件（满移动力/相邻/非反击/非长矛方阵），
//    defender 站在明方 mingTrench 格上 → 冲锋加成减免（最多 -2，最低 0）——与 HRE 壕沟
//    的冲锋减免语义一致（工事格属性，不要求 defender 是明方）。
//  - 炮台防御为"范围光环"，只对明方（isMingOwner）单位生效（handoff：范围内己方单位防御加成）。
//  - 临时桥（bridge，阶段3 裁决③升级）：core/movement.js 新增通用设施修正——facility.data
//    .moveCostMod 为数字时叠加到地形成本（最低 1），core 不识别具体设施类型。临时桥 = 桥格
//    移动成本 -1（全体生效：桥本身敌我皆可利用），持续 3 回合（"临时"语义，营地先例）。
//  - 瞭望塔"火力校正"效果实现在 fireZone.js（进入伤害 +1 / crossfire +1）；本文件只负责
//    瞭望塔的部署与生命周期。视野降级为标记（见已知问题）。

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const ENGINEERING = {
  turret: {
    id: 'turret', label: '炮台', cost: 20, hp: 10, duration: null, range: 2, atk: 2, def: 1,
    desc: '每回合对范围内敌方单位造成 2 点火力打击；范围内己方单位被攻击时伤害 -1',
  },
  watchtower: {
    id: 'watchtower', label: '瞭望塔', cost: 14, hp: 6, duration: null, range: 2,
    desc: '范围内火力区进入伤害 +1、交叉火力加成 +1（视野效果降级，见已知问题）',
  },
  supplyDepot: {
    id: 'supplyDepot', label: '补给站', cost: 18, hp: 8, duration: null, range: 2, heal: 2,
    desc: '每回合为范围内己方单位回复 2 点生命',
  },
  mingTrench: {
    id: 'mingTrench', label: '壕沟', cost: 16, hp: 12, duration: null,
    desc: '壕沟上的单位免受冲锋加成（最多减免 2 点）',
  },
  bridge: {
    id: 'bridge', label: '临时桥', cost: 12, hp: 10, duration: 3, moveCostMod: -1,
    desc: '桥格地形移动成本 -1（持续 3 回合，敌我单位均可利用）',
  },
};

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,         // 换局检测
  deployedThisTurn: new Set(), // unitId：本回合已请求过部署决策（去重）
};

function resetState() {
  state.deployedThisTurn.clear();
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

export function isEngineerUnit(ctx, unit) {
  return !!unit && isMingOwner(ctx, unit.owner) && unit.type === 'worksEngineer';
}

function inRange(a, b, range) {
  return Math.abs(a.x - b.x) <= range && Math.abs(a.y - b.y) <= range;
}

function isLandCell(ctx, x, y) {
  const g = ctx.game;
  if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
  const t = g.terrain[y] && g.terrain[y][x];
  return !!t && t !== 'water' && t !== 'mountain';
}

// ---------------------------------------------------------------------------
// 建造资格与决策
// ---------------------------------------------------------------------------
export function canBuildAt(ctx, unit, type) {
  const def = ENGINEERING[type];
  if (!def) return false;
  if (!isEngineerUnit(ctx, unit)) return false;
  if (!isLandCell(ctx, unit.x, unit.y)) return false;
  if (ctx.getSite(unit.x, unit.y)) return false;       // 据点格不建设施
  const existing = ctx.getFacilityAt(unit.x, unit.y);
  if (existing && existing.type !== 'fireZone') return false; // 已有工程设施（fireZone 可共存）
  if ((ctx.game.goldByOwner[unit.owner] || 0) < def.cost) return false;
  return true;
}

// 决策选项顺序固定：不建 → 炮台 → 瞭望塔 → 补给站 → 壕沟 → 栈桥工事（"不建"必须是第一项）
export function deployOptionsFor(ctx, unit) {
  const options = [{ id: 'none', label: '不建', description: '保留金币与本回合行动，不部署设施。' }];
  if (!isEngineerUnit(ctx, unit)) return options;
  const gold = ctx.game.goldByOwner[unit.owner] || 0;
  for (const key of ['turret', 'watchtower', 'supplyDepot', 'mingTrench', 'bridge']) {
    const d = ENGINEERING[key];
    if (gold >= d.cost) {
      options.push({ id: d.id, label: `部署${d.label}`, description: `${d.desc}（${d.cost}金币，${d.duration == null ? '持久' : d.duration + '回合'}）` });
    }
  }
  return options;
}

// 请求部署决策。满足基本条件（可部署格、金币够炮台）才请求；选项内含各设施资格判断。
export function requestDeployDecision(ctx, unit) {
  if (!unit || !isEngineerUnit(ctx, unit)) return null;
  if (state.deployedThisTurn.has(unit.id)) return null;
  if (!isLandCell(ctx, unit.x, unit.y)) return null;
  if (ctx.getSite(unit.x, unit.y)) return null;
  const existing = ctx.getFacilityAt(unit.x, unit.y);
  if (existing && existing.type !== 'fireZone') return null;
  if ((ctx.game.goldByOwner[unit.owner] || 0) < ENGINEERING.turret.cost) return null;
  const options = deployOptionsFor(ctx, unit);
  if (options.length <= 1) return null; // 只有"不建"，无意义
  state.deployedThisTurn.add(unit.id);
  const owner = unit.owner;
  const unitId = unit.id;
  const decisionId = `mgEng_${unitId}`;
  return ctx.requestDecision(decisionId, {
    owner,
    unitId,
    title: '工程部署',
    description: `${ctx.typeMeta(unit.type).name}可在此格部署工程设施（消耗本回合行动并花费金币）。`,
    options,
    onResolve: (choiceId) => { resolveDeploy(ctx, owner, unitId, choiceId); },
  });
}

// 决策解析后的实际部署。请求后可能已过回合/移动/金币变化，此处重新校验。
export function resolveDeploy(ctx, owner, unitId, choiceId) {
  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return false;
  if (!choiceId || choiceId === 'none') return false;
  const def = ENGINEERING[choiceId];
  if (!def) return false;
  if (!canBuildAt(ctx, unit, choiceId)) {
    ctx.log(`${ctx.typeMeta(unit.type).name}无法在此格部署${def.label}（条件不再满足）。`, 'warning');
    return false;
  }
  if (!ctx.spendGold(owner, def.cost)) return false;
  ctx.createFacility(choiceId, owner, unit.x, unit.y, {
    hp: def.hp,
    duration: def.duration,
    data: { ...(typeof def.moveCostMod === 'number' ? { moveCostMod: def.moveCostMod } : {}) },
  });
  // 部署消耗本回合行动（与 HRE 建造一致：移动归零 + 已行动 + 已攻击）
  unit.acted = true;
  unit.move = 0;
  unit.hasAttacked = true;
  ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）部署了${def.label}。`, 'system');
  return true;
}

// ---------------------------------------------------------------------------
// 设施可被攻击摧毁（HRE 先例：敌方攻击设施格上的单位时，设施按伤害 50% 受损）
// ---------------------------------------------------------------------------
export const FACILITY_CHIP_RATIO = 0.5;

export function onAfterAttack(ctx, payload) {
  const { attacker, defender, result } = payload || {};
  if (!attacker || !defender || !result) return;
  if (isMingOwner(ctx, attacker.owner)) return;
  const fac = ctx.getFacilityAt(defender.x, defender.y);
  if (!fac || !isMingOwner(ctx, fac.owner)) return;
  if (fac.type === 'fireZone') return; // 火力区是区域效果，不可被攻击摧毁（自然过期）
  if (ctx.areAllies(ctx.game.teams, attacker.owner, fac.owner)) return;
  const chip = Math.max(1, Math.round((result.damage || 0) * FACILITY_CHIP_RATIO));
  const remaining = ctx.damageFacility(fac.id, chip);
  const label = ENGINEERING[fac.type]?.label || fac.type;
  if (remaining <= 0) {
    ctx.log(`${label}在战火中被摧毁。`, 'warning');
  } else {
    ctx.log(`${label}受到攻击受损（耐久 ${remaining}/${fac.maxHp}）。`, 'warning');
  }
}

// ---------------------------------------------------------------------------
// turnStart：炮台范围火力 + 补给站范围回血 + 部署决策（仅人类玩家）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  const initial = !!(payload && payload.initial);
  syncGameRef(ctx);
  if (!isMingOwner(ctx, owner)) return;

  // 每回合重置部署去重（worksEngineer 每回合可重新决策）
  state.deployedThisTurn.clear();

  // 收益结算（initial 第一回合不结算，HRE 先例）
  if (!initial) {
    const facilities = ctx.getFacilitiesByOwner(owner);
    // 炮台：范围内敌方（非同盟）单位每回合受到固定火力打击（不致死）
    for (const f of facilities) {
      if (f.type !== 'turret') continue;
      const def = ENGINEERING.turret;
      for (const u of ctx.game.units) {
        if (u.owner === owner) continue;
        if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
        if (!inRange(u, f, def.range)) continue;
        if (u.hp <= 1) continue; // 不致死：已 1 HP 不再扣
        u.hp = Math.max(1, u.hp - def.atk);
        ctx.log(`${def.label}轰击${ctx.typeMeta(u.type).name}，造成 ${def.atk} 点伤害（剩余 ${u.hp} HP）。`, 'battle');
      }
    }
    // 补给站：范围内己方单位回血
    for (const f of facilities) {
      if (f.type !== 'supplyDepot') continue;
      const def = ENGINEERING.supplyDepot;
      for (const u of ctx.game.units) {
        if (u.owner !== owner) continue;
        if (u.hp >= u.maxHp) continue;
        if (!inRange(u, f, def.range)) continue;
        u.hp = Math.min(u.maxHp, u.hp + def.heal);
        ctx.log(`${def.label}为${ctx.typeMeta(u.type).name}补给，回复 ${def.heal} 点生命。`, 'battle');
      }
    }
  }

  // 部署决策：仅人类玩家（无头 sim 无 'player' owner → 零请求 → 零行为变化；AI 阶段6接入）
  if (owner === 'player') {
    for (const unit of ctx.game.units) {
      if (unit.owner !== owner) continue;
      requestDeployDecision(ctx, unit);
    }
  }
}

// ---------------------------------------------------------------------------
// beforeAttack：工程防御（炮台/栈桥光环） + 壕沟冲锋减免（只改 result.damage）
// ---------------------------------------------------------------------------
export function onBeforeAttack(ctx, payload) {
  const { attacker, defender, fromCell, toCell, result, isCounter } = payload || {};
  if (!attacker || !defender || !result || !result.damage) return;
  syncGameRef(ctx);

  // 1. 壕沟：defender 站在明方 mingTrench 格上 → 冲锋加成减免（最多 -2，最低 0）
  const fac = ctx.getFacilityAt(defender.x, defender.y);
  if (fac && fac.type === 'mingTrench' && isMingOwner(ctx, fac.owner)) {
    if (isCharging(ctx, attacker, fromCell, toCell, isCounter, defender)) {
      const atkMeta = ctx.typeMeta(attacker.type);
      const chargeVal = (atkMeta.charge || 0) + (ctx.ownerNation(attacker.owner) === 'austria' ? 1 : 0);
      if (chargeVal > 0) {
        result.damage = Math.max(1, result.damage - Math.min(chargeVal, 2));
        ctx.log(`${ctx.typeMeta(attacker.type).name}的冲锋被壕沟阻挡，伤害 -${Math.min(chargeVal, 2)}。`, 'battle');
      }
    }
  }

  // 2. 范围光环（只对明方单位生效）：炮台范围内己方 +1
  if (isMingOwner(ctx, defender.owner)) {
    const turrets = ctx.getFacilitiesByType('turret')
      .filter(f => isMingOwner(ctx, f.owner) && inRange(defender, f, ENGINEERING.turret.range));
    if (turrets.length) {
      result.damage = Math.max(1, result.damage - ENGINEERING.turret.def);
    }
  }
}

// 复刻 combat.js 冲锋触发条件（charge 只在满移动力、相邻、非反击时生效；长矛方阵免冲锋）
function isCharging(ctx, attacker, fromCell, toCell, isCounter, defender) {
  if (isCounter) return false;
  if (!attacker || attacker.move !== attacker.maxMove) return false;
  const meta = ctx.typeMeta(attacker.type);
  if (!meta || !meta.charge) return false;
  if (defender && defender.type === 'pikeSquare') return false;
  const from = fromCell || { x: attacker.x, y: attacker.y };
  const to = toCell || { x: attacker.x, y: attacker.y };
  return ctx.diagonalDist(from, to) === 1;
}

// ---------------------------------------------------------------------------
// debug/test 入口（mingRules.attachDebug 调用；浏览器控制台可用）
// ---------------------------------------------------------------------------
export function attachDebug(ctx) {
  const debug = {
    config: () => ({ ...ENGINEERING }),
    facilities: () => ctx.getAllFacilities().map(f => ({ id: f.id, type: f.type, owner: f.owner, x: f.x, y: f.y, hp: f.hp, maxHp: f.maxHp, duration: f.duration, data: f.data })),
    state: () => ({ deployedThisTurn: [...state.deployedThisTurn] }),
    // 为某 owner 所有工部工程师发起部署决策（返回请求数）
    requestForOwner: (owner) => {
      let n = 0;
      for (const u of ctx.game.units) {
        if (u.owner === owner && requestDeployDecision(ctx, u)) n += 1;
      }
      return n;
    },
    pending: (owner) => ctx.getPendingDecisions(owner || 'player')
      .filter(r => String(r.id || '').startsWith('mgEng_'))
      .map(r => ({ id: r.id, unitId: r.context.unitId, options: r.context.options.map(o => o.id) })),
    resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
  };
  if (typeof globalThis !== 'undefined') globalThis.__mingDebug = { ...(globalThis.__mingDebug || {}), engineering: debug };
  return debug;
}
