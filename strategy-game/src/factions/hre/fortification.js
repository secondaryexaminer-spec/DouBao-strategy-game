'use strict';
// 神罗联盟 Layer 4 核心系统：帝国工事（Fortification）+ 阵线稳定（Frontline）。
// 三种工事：木栅 palisade / 壕沟 trench / 石堡 stoneFort。
// 依赖注入：只通过 factionContext（ctx）访问游戏状态；不依赖 DOM；必须可在无头 sim 运行。
// v1.1（主对话集成）：按 FACTION-SYSTEM-API-CONTRACT.md §5 边界，状态性模块
// （facility/decision/status）与 core 纯函数一律经 ctx 访问，不再直接 import。
// 不修改 main.js 主流程、不修改 combat.js/movement.js 核心计算、不修改 EventBus 契约。
// 需要主对话补的埋点：moveUnit 内 emit 'beforeMove'（位置：扣移动力之前），已由主对话完成（v1.1）。
// 阶段6（F1）：建造决策对 AI owner（ai0/ai1/...）同样发起；选择由 src/ai/ AI 决策系统完成，
// 本文件不写 AI 专用分支（只把 ctx 传入决策上下文供 AI 查询状态）。

import { isAiOwner } from '../../ai/aiUtil.js';

// 所有游戏访问一律经 ctx（facility/decision/diagonalDist/movementCost/areAllies 由 ctx 转发）。

// ---------------------------------------------------------------------------
// 数值配置（建议起点，最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const FORTIFICATIONS = {
  palisade: {
    id: 'palisade', label: '木栅', cost: 12, duration: 5, hp: 8,
    desc: '敌军进入+1移动消耗；神罗步兵驻守防御+2；可被攻击摧毁',
  },
  trench: {
    id: 'trench', label: '壕沟', cost: 18, duration: 8, hp: 12,
    desc: '敌方骑兵冲锋-2（最低0）；敌方第一轮攻击伤害-2',
  },
  stoneFort: {
    id: 'stoneFort', label: '石堡', cost: 36, duration: null, hp: 30,
    desc: '驻守单位防御+4；相邻远程单位防御+2；相邻单位每回合回血+1；仅限城市/军营/堡垒2格内',
  },
};

export const FORT_SUPPORT_KINDS = new Set(['city', 'camp', 'barracksSmall', 'barracksLarge', 'fortress']);
export const FRONTLINE_MIN_CHAIN = 3;   // 连续 3 格以上工事/据点链视为阵线稳定
export const FRONTLINE_HP_MULT = 1.2;   // 阵线工事耐久 +20%
export const FRONTLINE_HEAL = 1;        // 阵线上驻守单位每回合回血 +1
export const STONE_FORT_RANGE = 2;      // 石堡建造限制：据点相邻2格内
export const STONE_FORT_HEAL = 1;       // 石堡补给节点：相邻单位每回合回血 +1
export const FACILITY_CHIP_RATIO = 0.5; // 敌军攻击工事格时对工事的破坏比例

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象，存档结构不变）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,       // 用于检测 newGame 换局，自动清空模块状态
  baseMaxHp: new Map(),    // facilityId -> 初始 maxHp（阵线耐久加成基准）
  trenchFirstHit: new Set(), // unitId：本回合壕沟"第一轮攻击-2"已生效
  pikeGuardUsed: new Set(),  // unitId：本回合长矛方阵"方阵-2"已生效
};

function resetState() {
  state.baseMaxHp.clear();
  state.trenchFirstHit.clear();
  state.pikeGuardUsed.clear();
}

// 换局检测：game 对象引用变化即视为新一局，清空模块内跨局状态。
// （facilitySystem/statusSystem/decisionSystem 的模块级状态需主对话在 newGame 中 clear，见已知问题）
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
export function isHreOwner(ctx, owner) {
  return !!owner && ctx.ownerFaction(owner) === 'hre';
}

// 可建造单位：神罗步兵（domain='land' 且非骑兵，即 typeMeta.charge 为 falsy 的陆军）
export function isBuilderUnit(ctx, unit) {
  if (!unit || !isHreOwner(ctx, unit.owner)) return false;
  const meta = ctx.typeMeta(unit.type);
  if (!meta) return false;
  if (meta.domain !== 'land') return false;
  if (meta.charge) return false;
  return true;
}

function isLandCell(ctx, x, y) {
  const g = ctx.game;
  if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
  const t = g.terrain[y] && g.terrain[y][x];
  return !!t && t !== 'water' && t !== 'mountain';
}

// 石堡建造限制：城市/军营/堡垒（含临时营地）相邻 2 格内，且该据点与建造者同盟
function nearSupportSite(ctx, unit) {
  for (const s of ctx.game.sites) {
    if (!FORT_SUPPORT_KINDS.has(s.kind)) continue;
    if (!ctx.areAllies(ctx.game.teams, s.owner, unit.owner)) continue;
    if (ctx.diagonalDist(s, unit) <= STONE_FORT_RANGE) return true;
  }
  return false;
}

export function canBuildAt(ctx, unit, type) {
  const def = FORTIFICATIONS[type];
  if (!def) return false;
  if (!isBuilderUnit(ctx, unit)) return false;
  if (!isLandCell(ctx, unit.x, unit.y)) return false;
  if (ctx.getSite(unit.x, unit.y)) return false;          // 据点格不建工事
  if (ctx.getFacilityAt(unit.x, unit.y)) return false;    // 已有工事
  if ((ctx.game.goldByOwner[unit.owner] || 0) < def.cost) return false;
  if (type === 'stoneFort' && !nearSupportSite(ctx, unit)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// 建造决策（decision.js，保留玩家决策点；无头 sim 非 AI owner 自动选第一项"不建"；
// AI owner 由 src/ai/ AI 决策系统选择，阶段6 F1）
// ---------------------------------------------------------------------------
// 决策选项顺序固定：不建 → 木栅 → 壕沟 → 石堡（"不建"必须是第一项，sim fallback 依赖它）
export function buildOptionsFor(ctx, unit) {
  const options = [{ id: 'none', label: '不建', description: '保留金币与本回合行动，不建造工事。' }];
  if (!isBuilderUnit(ctx, unit)) return options;
  const gold = ctx.game.goldByOwner[unit.owner] || 0;
  if (gold >= FORTIFICATIONS.palisade.cost) {
    const d = FORTIFICATIONS.palisade;
    options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，持续${d.duration}回合）` });
  }
  if (gold >= FORTIFICATIONS.trench.cost) {
    const d = FORTIFICATIONS.trench;
    options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，持续${d.duration}回合）` });
  }
  if (gold >= FORTIFICATIONS.stoneFort.cost && nearSupportSite(ctx, unit)) {
    const d = FORTIFICATIONS.stoneFort;
    options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，永久）` });
  }
  return options;
}

// 请求建造决策。满足基本条件（可建造格、金币够木栅）才请求；选项内含石堡资格判断。
export function requestBuildDecision(ctx, unit) {
  if (!unit || !isBuilderUnit(ctx, unit)) return null;
  if (!isLandCell(ctx, unit.x, unit.y)) return null;
  if (ctx.getSite(unit.x, unit.y)) return null;
  if (ctx.getFacilityAt(unit.x, unit.y)) return null;
  if ((ctx.game.goldByOwner[unit.owner] || 0) < FORTIFICATIONS.palisade.cost) return null;
  const options = buildOptionsFor(ctx, unit);
  if (options.length <= 1) return null; // 只有"不建"，无意义
  const owner = unit.owner;
  const unitId = unit.id;
  const decisionId = `hreFort_${unitId}`;
  return ctx.requestDecision(decisionId, {
    owner,
    unitId,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态（对玩家决策无影响）
    title: '帝国工事',
    description: `${ctx.typeMeta(unit.type).name}可在此格建造工事（消耗本回合行动并花费金币）。`,
    options,
    onResolve: (choiceId) => { resolveBuild(ctx, owner, unitId, choiceId); },
  });
}

// 决策解析后的实际建造。请求后可能已过回合/移动/金币变化，此处重新校验。
export function resolveBuild(ctx, owner, unitId, choiceId) {
  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return false;
  if (!choiceId || choiceId === 'none') return false;
  const def = FORTIFICATIONS[choiceId];
  if (!def) return false;
  if (!canBuildAt(ctx, unit, choiceId)) {
    ctx.log(`${ctx.typeMeta(unit.type).name}无法在此格建造${def.label}（条件不再满足）。`, 'warning');
    return false;
  }
  if (!ctx.spendGold(owner, def.cost)) return false;
  const fac = ctx.createFacility(choiceId, owner, unit.x, unit.y, { hp: def.hp, duration: def.duration });
  state.baseMaxHp.set(fac.id, def.hp);
  // 建造消耗本回合行动（与 main.js consumeAction 一致：移动归零 + 已行动 + 已攻击）
  unit.acted = true;
  unit.move = 0;
  unit.hasAttacked = true;
  ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）建立了${def.label}，帝国防线扩展。`, 'system');
  return true;
}

// ---------------------------------------------------------------------------
// 阵线检测（turnStart 时重算）
// 节点：神罗工事 + 神罗控制的据点（sites owner=神罗方）；邻接：正交4格。
// 连通分量节点数 >= 3 视为"阵线稳定"，分量内的工事获得阵线效果。
// ---------------------------------------------------------------------------
export function computeFrontline(ctx, owner) {
  const facilities = ctx.getFacilitiesByOwner(owner).filter(f => isHreOwner(ctx, f.owner));
  const sites = ctx.game.sites.filter(s => isHreOwner(ctx, s.owner));
  const nodes = [
    ...facilities.map(f => ({ kind: 'fac', ref: f, key: `f:${f.id}` })),
    ...sites.map(s => ({ kind: 'site', ref: s, key: `s:${s.id}` })),
  ];
  const byKey = new Map(nodes.map(n => [n.key, n]));
  const adj = new Map(nodes.map(n => [n.key, []]));
  const at = (x, y) => {
    for (const n of nodes) if (n.ref.x === x && n.ref.y === y) return n.key;
    return null;
  };
  for (const n of nodes) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = at(n.ref.x + dx, n.ref.y + dy);
      if (k) adj.get(n.key).push(k);
    }
  }
  const seen = new Set();
  const components = [];
  for (const n of nodes) {
    if (seen.has(n.key)) continue;
    const comp = [];
    const queue = [n.key];
    seen.add(n.key);
    while (queue.length) {
      const k = queue.shift();
      comp.push(k);
      for (const nk of adj.get(k)) {
        if (!seen.has(nk)) { seen.add(nk); queue.push(nk); }
      }
    }
    components.push(comp);
  }
  const frontlined = new Set();
  for (const comp of components) {
    if (comp.length < FRONTLINE_MIN_CHAIN) continue;
    for (const k of comp) {
      const node = byKey.get(k);
      if (node.kind === 'fac') frontlined.add(node.ref.id);
    }
  }
  return { frontlined, facilities, sites };
}

// 应用阵线效果：耐久+20%（maxHp 提升，hp 截断）+ 驻守单位回血 +1 + 'frontline' 状态标记。
export function applyFrontline(ctx, owner, initial) {
  const { frontlined, facilities } = computeFrontline(ctx, owner);
  const onFrontline = new Set();
  for (const f of facilities) {
    const wasFront = !!f.data.frontlined;
    const isFront = frontlined.has(f.id);
    f.data.frontlined = isFront;
    const base = state.baseMaxHp.get(f.id) ?? f.data.baseMaxHp ?? f.maxHp;
    state.baseMaxHp.set(f.id, base);
    f.data.baseMaxHp = base;
    if (isFront) {
      const bonusMax = Math.round(base * FRONTLINE_HP_MULT);
      f.maxHp = bonusMax;
      f.hp = Math.min(f.hp, bonusMax);
      if (!wasFront) ctx.log('阵线稳定：防线上的工事耐久提升。', 'system');
      const u = ctx.getUnit(f.x, f.y);
      if (u && isHreOwner(ctx, u.owner)) onFrontline.add(u.id);
    } else {
      f.maxHp = base;
      f.hp = Math.min(f.hp, base); // 阵线断开，加固随之失效（耐久被截回基准）
      if (wasFront) ctx.log('阵线失稳：该段工事失去阵线加固。', 'warning');
    }
  }
  // 状态标记 + 回血（initial 回合与主流程一致：不结算回血类收益）
  for (const unit of ctx.game.units) {
    if (!isHreOwner(ctx, unit.owner)) continue;
    if (onFrontline.has(unit.id)) {
      ctx.addStatus(unit.id, 'frontline', 1, { owner });
      if (!initial && unit.hp < unit.maxHp) {
        unit.hp = Math.min(unit.maxHp, unit.hp + FRONTLINE_HEAL);
      }
    } else {
      ctx.removeStatus(unit.id, 'frontline');
    }
  }
  // 石堡补给节点：相邻单位（含驻守格自身）每回合回血 +1
  if (!initial) {
    for (const f of facilities) {
      if (f.type !== 'stoneFort') continue;
      for (const unit of ctx.game.units) {
        if (!isHreOwner(ctx, unit.owner)) continue;
        if (ctx.diagonalDist(unit, f) <= 1 && unit.hp < unit.maxHp) {
          unit.hp = Math.min(unit.maxHp, unit.hp + STONE_FORT_HEAL);
        }
      }
    }
  }
  return { frontlinedCount: frontlined.size, facilityCount: facilities.length };
}

// ---------------------------------------------------------------------------
// turnStart：工事过期 → 阵线 → 每回合追踪重置 → 建造决策（仅人类玩家）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  const initial = !!(payload && payload.initial);
  syncGameRef(ctx);
  if (!isHreOwner(ctx, owner)) return;
  // 1. 工事过期（石堡 duration=null 不受影响）
  const beforeIds = new Set(ctx.getFacilitiesByOwner(owner).map(f => f.id));
  ctx.expireFacilities(owner);
  for (const id of beforeIds) {
    if (!ctx.getFacilitiesByOwner(owner).some(f => f.id === id)) {
      state.baseMaxHp.delete(id);
    }
  }
  // 2. 阵线检测 + 耐久 + 回血 + 状态
  applyFrontline(ctx, owner, initial);
  // 3. 重置每回合追踪（壕沟第一击 / 方阵第一击，以防守方回合为界）
  state.trenchFirstHit.clear();
  state.pikeGuardUsed.clear();
  // 4. 建造决策：人类玩家与 AI（阶段6 F1 接入；AI 选择由 src/ai/ 决策系统完成）
  if (owner === 'player' || isAiOwner(owner)) {
    for (const unit of ctx.game.units) {
      if (unit.owner !== owner) continue;
      requestBuildDecision(ctx, unit);
    }
  }
}

// ---------------------------------------------------------------------------
// beforeMove：木栅移动税（需要主对话在 moveUnit 内、扣移动力之前 emit 'beforeMove'）
// 敌军进入己方木栅格：额外 +1 移动消耗；若付不起（剩余移动 < 步成本+1）则本次移动被阻止。
// ---------------------------------------------------------------------------
export function onBeforeMove(ctx, payload) {
  const { unit, from, to } = payload || {};
  if (!unit || !to || !from) return;
  if (isHreOwner(ctx, unit.owner)) return; // 神罗单位不受己方木栅影响
  if (unit.move <= 0) return;
  const fac = ctx.getFacilityAt(to.x, to.y);
  if (!fac || fac.type !== 'palisade' || !isHreOwner(ctx, fac.owner)) return;
  if (ctx.areAllies(ctx.game.teams, unit.owner, fac.owner)) return; // 同盟单位不征税
  const step = ctx.movementCost(ctx.game, unit, to.x, to.y);
  const stepCost = (to.x !== from.x && to.y !== from.y) ? step * Math.SQRT2 : step;
  if (unit.move < stepCost + 1) {
    payload.cancel = true; // 付不起 +1 税，不能进入
    return;
  }
  unit.move -= 1; // 预扣税，主流程再扣步成本 → 实际总消耗 = 步成本 + 1
}

// ---------------------------------------------------------------------------
// beforeAttack：工事效果 + 兵种联动（只改 result.damage，不取消攻击）
// ---------------------------------------------------------------------------
function reduceDamage(damage, n) {
  return Math.max(1, damage - n);
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

function hasAdjacentFriendlyInfantry(ctx, defender) {
  for (const u of ctx.game.units) {
    if (u.id === defender.id) continue;
    if (u.owner !== defender.owner) continue;
    if (ctx.diagonalDist(u, defender) !== 1) continue;
    const meta = ctx.typeMeta(u.type);
    if (!meta || meta.domain !== 'land' || meta.charge) continue;
    return true;
  }
  return false;
}

// 帝国近卫军"皇家守护"：守点（自身格有己方据点）时，为同格/相邻神罗单位防御+1
function royalGuardNear(ctx, defender) {
  for (const u of ctx.game.units) {
    if (u.type !== 'imperialGuard') continue;
    if (!isHreOwner(ctx, u.owner)) continue;
    if (ctx.diagonalDist(u, defender) > 1) continue;
    const site = ctx.getSite(u.x, u.y);
    if (!site) continue;
    if (!ctx.areAllies(ctx.game.teams, site.owner, u.owner)) continue;
    return true;
  }
  return false;
}

export function onBeforeAttack(ctx, payload) {
  const { attacker, defender, fromCell, toCell, result, isCounter } = payload || {};
  if (!attacker || !defender || !result || !result.damage) return;
  const defenderIsHre = isHreOwner(ctx, defender.owner);
  const attackerIsHre = isHreOwner(ctx, attacker.owner);
  if (!defenderIsHre && !(attackerIsHre && attacker.type === 'siegeTower')) return;

  // 攻城塔：据点战降低驻军防御（伤害 +2）——适用于任意敌方守军
  if (attackerIsHre && attacker.type === 'siegeTower' && ctx.getSite(defender.x, defender.y)) {
    result.damage += 2;
  }
  if (!defenderIsHre) return;

  const fac = ctx.getFacilityAt(defender.x, defender.y);
  const defOnFort = !!fac && isHreOwner(ctx, fac.owner);
  const atkMeta = ctx.typeMeta(attacker.type);
  const defMeta = ctx.typeMeta(defender.type);
  const isCavalry = !!atkMeta && !!atkMeta.charge;

  // —— 工事效果（守方站在己方工事上） ——
  if (defOnFort) {
    if (fac.type === 'palisade') {
      // 木栅：神罗步兵在其上防御 +2
      if (isBuilderUnit(ctx, defender)) result.damage = reduceDamage(result.damage, 2);
    } else if (fac.type === 'trench') {
      // 壕沟：敌方第一轮攻击伤害 -2（每防守方每回合一次）
      if (!state.trenchFirstHit.has(defender.id)) {
        result.damage = reduceDamage(result.damage, 2);
        state.trenchFirstHit.add(defender.id);
      }
      // 壕沟：降低敌方骑兵冲锋效果（charge -2，最低0）
      if (isCavalry && isCharging(ctx, attacker, fromCell, toCell, isCounter, defender)) {
        const chargeVal = (atkMeta.charge || 0) + (ctx.ownerNation(attacker.owner) === 'austria' ? 1 : 0);
        result.damage = reduceDamage(result.damage, Math.min(chargeVal, 2));
      }
    } else if (fac.type === 'stoneFort') {
      // 石堡：大幅提升驻守单位防御 +4
      result.damage = reduceDamage(result.damage, 4);
    }
  }
  // 石堡：为相邻远程单位提供防御 +2（不含站在石堡上的，已享受 +4）
  if (!(defOnFort && fac.type === 'stoneFort')) {
    const stoneNearby = ctx.getFacilitiesInRange(defender.x, defender.y, 1)
      .filter(f => f.type === 'stoneFort' && isHreOwner(ctx, f.owner) && !(f.x === defender.x && f.y === defender.y));
    if (stoneNearby.length && defMeta && defMeta.range > 1) {
      result.damage = reduceDamage(result.damage, 2);
    }
  }

  // —— 兵种联动（规格书§4；现有兵种效果保留不动，只新增） ——
  // 德意志重甲步兵：驻扎工事 → 坚守（防御+2；被骑兵攻击额外+1）
  if (defender.type === 'heavyInfantry' && defOnFort) {
    result.damage = reduceDamage(result.damage, 2);
    if (isCavalry) result.damage = reduceDamage(result.damage, 1);
  }
  // 长矛方阵：相邻至少1个友军步兵 → 方阵（第一次受到近战伤害 -2）
  if (defender.type === 'pikeSquare' && !state.pikeGuardUsed.has(defender.id)) {
    if (atkMeta && atkMeta.range <= 1 && hasAdjacentFriendlyInfantry(ctx, defender)) {
      result.damage = reduceDamage(result.damage, 2);
      state.pikeGuardUsed.add(defender.id);
    }
  }
  // 帝国近卫军：守点时皇家守护（防御 +1）
  if (royalGuardNear(ctx, defender)) {
    result.damage = reduceDamage(result.damage, 1);
  }
}

// ---------------------------------------------------------------------------
// afterAttack：工事可被攻击摧毁（敌方攻击工事格上的单位时，工事按伤害比例受损）
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker, defender, result } = payload || {};
  if (!attacker || !defender || !result) return;
  if (isHreOwner(ctx, attacker.owner)) return;
  const fac = ctx.getFacilityAt(defender.x, defender.y);
  if (!fac || !isHreOwner(ctx, fac.owner)) return;
  if (ctx.areAllies(ctx.game.teams, attacker.owner, fac.owner)) return;
  const chip = Math.max(1, Math.round((result.damage || 0) * FACILITY_CHIP_RATIO));
  const remaining = ctx.damageFacility(fac.id, chip);
  const label = FORTIFICATIONS[fac.type]?.label || fac.type;
  if (remaining <= 0) {
    state.baseMaxHp.delete(fac.id);
    ctx.log(`${label}在战火中被摧毁。`, 'warning');
  } else {
    ctx.log(`${label}受到攻击受损（耐久 ${remaining}/${fac.maxHp}）。`, 'warning');
  }
}

// ---------------------------------------------------------------------------
// debug/test 入口：浏览器控制台可触发建造与查看状态（阶段7前替代最终 UI）
// ---------------------------------------------------------------------------
export function attachDebug(ctx) {
  const debug = {
    fortifications: () => ({ ...FORTIFICATIONS }),
    facilities: () => ctx.getAllFacilities().map(f => ({ id: f.id, type: f.type, owner: f.owner, x: f.x, y: f.y, hp: f.hp, maxHp: f.maxHp, duration: f.duration, frontlined: !!f.data.frontlined })),
    state: () => ({
      baseMaxHp: [...state.baseMaxHp.entries()],
      trenchFirstHit: [...state.trenchFirstHit],
      pikeGuardUsed: [...state.pikeGuardUsed],
    }),
    // 查看某 owner 当前可建造的单位及其可选方案
    eligible: (owner) => ctx.game.units
      .filter(u => u.owner === owner && isBuilderUnit(ctx, u))
      .map(u => ({ id: u.id, type: u.type, x: u.x, y: u.y, options: buildOptionsFor(ctx, u).map(o => o.id) })),
    // 为某 owner 所有可建造单位发起建造决策（返回请求数）
    requestForOwner: (owner) => {
      let n = 0;
      for (const u of ctx.game.units) {
        if (u.owner === owner && requestBuildDecision(ctx, u)) n += 1;
      }
      return n;
    },
    // 查看未决建造决策并手动解析（浏览器 UI 阶段前的手动测试入口）
    pending: () => ctx.getPendingDecisions('player').filter(r => String(r.id || '').startsWith('hreFort_')).map(r => ({ id: r.id, unitId: r.context.unitId, options: r.context.options.map(o => o.id) })),
    resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
  };
  if (typeof globalThis !== 'undefined') globalThis.__hreDebug = debug;
  return debug;
}
