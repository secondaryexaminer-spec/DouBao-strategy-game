'use strict';
// 金帐联盟 Layer 4 核心系统（二）：游牧营地（Nomad Camp）。
// facility type 'nomadCamp'：不占永久城市名额、存在 5 回合、可迁移、可生产特定
// 金帐单位、每回合 2 金币维护、迁移后原地点失去生产功能。
// 只经 factionContext（ctx）访问游戏；不依赖 DOM；必须可在无头 sim 运行。
//
// 与 main.js 现有"临时营地"（site.kind='camp'，工程师建造）严格区分：
//  - 现有 camp 是 site，走 buildAtSite 通用生产；本模块是 facility，独立存储。
//  - 建造/生产/迁移决策全部用 requestDecision/resolveDecision（无头 sim 非 AI owner
//    自动选第一项"不建/维持"；AI owner 由 src/ai/ AI 决策系统选择，阶段6 F1 接入）。
//
// 接口依赖（v1.2 已落地）：
//  - GH-02 ctx.createUnit(type, owner, x, y)：生产走 ctx，金币/上限/位置校验本模块自查。
//  - GH-01 生产完成后由本模块广播 productionCompleted（site 字段传营地 facility）。

import { isGoldenHordeOwner } from './raiding.js';
import { isAiOwner } from '../../ai/aiUtil.js';
import { inOasisNetwork, getPrestige, GOLDEN_HORDE_NATION as GHN } from './nationMechanics.js';

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const NOMAD_CAMP = {
  type: 'nomadCamp',
  buildCost: 25,    // 建造费用
  duration: 5,      // 基础存在回合数；金帐本部 +2（阶段3 国家机制）、绿洲网络内 +1 由建造时叠加
  upkeep: 2,        // 每回合维护费
  maxCamps: 2,      // 每方同时存在的游牧营地上限
  migrateRange: 2,  // 迁移候选格：营地切比雪夫距离 <= 2
  migrateMaxOptions: 8, // 迁移候选格最多列出的选项数
};

// 营地可生产的金帐单位（规格书 §5.3；国家特色兵种属阶段3，不在此列）
export const CAMP_PRODUCIBLE = ['lightCavalry', 'hordeCavalry', 'horseArcher', 'nomadArcher', 'nomadChariot'];

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,
};

function resetState() {}

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
function isLandCell(ctx, x, y) {
  const g = ctx.game;
  if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
  const t = g.terrain[y] && g.terrain[y][x];
  return !!t && t !== 'water' && t !== 'mountain';
}

export function campCount(ctx, owner) {
  return ctx.getFacilitiesByType(NOMAD_CAMP.type).filter(f => f.owner === owner).length;
}

export function myCamps(ctx, owner) {
  return ctx.getFacilitiesByType(NOMAD_CAMP.type).filter(f => f.owner === owner);
}

// 可建营地：金帐 land 单位、未行动、站在可建格（land、无 site、无 facility）、金币够、未达上限
export function canBuildCampAt(ctx, unit) {
  if (!unit || !isGoldenHordeOwner(ctx, unit.owner)) return false;
  const meta = ctx.typeMeta(unit.type);
  if (!meta || meta.domain !== 'land') return false;
  if (unit.acted || unit.hasAttacked) return false;
  if (!isLandCell(ctx, unit.x, unit.y)) return false;
  if (ctx.getSite(unit.x, unit.y)) return false;
  if (ctx.getFacilityAt(unit.x, unit.y)) return false;
  if ((ctx.game.goldByOwner[unit.owner] || 0) < NOMAD_CAMP.buildCost) return false;
  if (campCount(ctx, unit.owner) >= NOMAD_CAMP.maxCamps) return false;
  return true;
}

// 营地格合法性（建造/迁移共用）：land、无 site、无 facility、无单位
function isValidCampCell(ctx, x, y) {
  if (!isLandCell(ctx, x, y)) return false;
  if (ctx.getSite(x, y)) return false;
  if (ctx.getFacilityAt(x, y)) return false;
  if (ctx.getUnit(x, y)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// 建造决策（decision.js；无头 sim 非 AI owner 自动选"不建"；AI 由 src/ai/ 决策）
// ---------------------------------------------------------------------------
export function requestBuildDecision(ctx, unit) {
  if (!canBuildCampAt(ctx, unit)) return null;
  const options = [
    { id: 'none', label: '不建', description: '保留金币与本回合行动，不建立营地。' },
    { id: 'build', label: '建游牧营地', description: `${NOMAD_CAMP.buildCost}金币，存在${NOMAD_CAMP.duration}回合，每回合${NOMAD_CAMP.upkeep}金币维护。` },
  ];
  const owner = unit.owner;
  const unitId = unit.id;
  const decisionId = `ghCampBuild_${unitId}`;
  return ctx.requestDecision(decisionId, {
    owner,
    unitId,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '游牧营地',
    description: `${ctx.typeMeta(unit.type).name}可在此格建立游牧营地（消耗本回合行动并花费金币）。`,
    options,
    onResolve: (choiceId) => { resolveBuild(ctx, owner, unitId, choiceId); },
  });
}

export function resolveBuild(ctx, owner, unitId, choiceId) {
  if (!choiceId || choiceId === 'none') return false;
  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return false;
  if (!canBuildCampAt(ctx, unit)) {
    ctx.log('营地建造条件不再满足（金币/占位/上限变化）。', 'warning');
    return false;
  }
  if (!ctx.spendGold(owner, NOMAD_CAMP.buildCost)) return false;
  // 阶段3 国家机制：金帐本部营地 +2 回合；绿洲网络内营地 +1 回合
  const natBonus = ctx.ownerNation(owner) === 'goldenHordeCore' ? 2 : 0;
  const oasisBonus = inOasisNetwork(ctx, unit.x, unit.y) ? 1 : 0;
  const totalDuration = NOMAD_CAMP.duration + natBonus + oasisBonus;
  const fac = ctx.createFacility(NOMAD_CAMP.type, owner, unit.x, unit.y, {
    duration: totalDuration,
    data: { builtTurn: ctx.game.turn },
  });
  // 建造消耗本回合行动（与 main.js consumeAction 一致）
  unit.acted = true;
  unit.move = 0;
  unit.hasAttacked = true;
  ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）建立了游牧营地，可维持 ${totalDuration} 回合。`, 'system');
  return !!fac;
}

// ---------------------------------------------------------------------------
// 营地行动决策（生产 / 迁移；选项顺序：维持 → 生产... → 迁移...）
// ---------------------------------------------------------------------------
function migrateCandidates(ctx, camp) {
  const out = [];
  const r = NOMAD_CAMP.migrateRange;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = camp.x + dx;
      const y = camp.y + dy;
      if (!isValidCampCell(ctx, x, y)) continue;
      out.push({ x, y });
      if (out.length >= NOMAD_CAMP.migrateMaxOptions) return out;
    }
  }
  return out;
}

export function requestCampDecision(ctx, camp) {
  if (!camp || camp.type !== NOMAD_CAMP.type) return null;
  const owner = camp.owner;
  const options = [{ id: 'none', label: '维持营地', description: '本回合不生产、不迁移。' }];
  const gold = ctx.game.goldByOwner[owner] || 0;
  const occupant = ctx.getUnit(camp.x, camp.y);
  if (!occupant) {
    for (const type of CAMP_PRODUCIBLE) {
      const meta = ctx.typeMeta(type);
      if (!meta) continue;
      if (gold < meta.cost) continue;
      options.push({ id: `produce:${type}`, label: `生产${meta.name}`, description: `${meta.name}（${meta.cost}金币，立即部署于营地格）` });
    }
  }
  for (const cell of migrateCandidates(ctx, camp)) {
    options.push({ id: `migrate:${cell.x},${cell.y}`, label: `迁移到（${cell.x},${cell.y}）`, description: '营地迁往目标格，原址失去生产功能。' });
  }
  if (options.length <= 1) return null; // 只有"维持"，无意义
  const decisionId = `ghCamp_${camp.id}`;
  return ctx.requestDecision(decisionId, {
    owner,
    campId: camp.id, // 阶段6 F1：AI 决策系统按 id 定位营地
    ctx,             // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '游牧营地行动',
    description: `游牧营地（${camp.x},${camp.y}）本回合可生产金帐单位或迁移（消耗营地本回合行动）。`,
    options,
    onResolve: (choiceId) => { resolveCampAction(ctx, owner, camp.id, choiceId); },
  });
}

export function resolveCampAction(ctx, owner, campId, choiceId) {
  if (!choiceId || choiceId === 'none') return false;
  const camp = ctx.getFacilitiesByType(NOMAD_CAMP.type).find(f => f.id === campId);
  if (!camp || camp.owner !== owner) return false;
  if (choiceId.startsWith('produce:')) {
    return doProduce(ctx, owner, camp, choiceId.slice('produce:'.length));
  }
  if (choiceId.startsWith('migrate:')) {
    const parts = choiceId.slice('migrate:'.length).split(',');
    const tx = parseInt(parts[0], 10);
    const ty = parseInt(parts[1], 10);
    return doMigrate(ctx, owner, camp, tx, ty);
  }
  return false;
}

// 生产：校验营地状态/占位/金币 → 扣金币 → ctx.createUnit → 广播 productionCompleted
export function doProduce(ctx, owner, camp, type) {
  const meta = ctx.typeMeta(type);
  if (!meta || !CAMP_PRODUCIBLE.includes(type)) return false;
  if (ctx.getUnit(camp.x, camp.y)) {
    ctx.log('营地格已被占用，无法生产。', 'warning');
    return false;
  }
  // 阶段3 国家机制：可汗威望 10 → 营地生产更高效（成本 -20%，口径见 nationMechanics.js）
  const cost = getPrestige(ctx, owner) >= GHN.tierCamp ? Math.ceil(meta.cost * GHN.tierCampCostMult) : meta.cost;
  if (!ctx.spendGold(owner, cost)) {
    ctx.log('金币不足，无法生产。', 'warning');
    return false;
  }
  const unitEntry = ctx.createUnit(type, owner, camp.x, camp.y);
  // GH-01：与主对话 buildAtSite 同一事件契约；site 字段传营地 facility
  ctx.events.emit('productionCompleted', { owner, unit: unitEntry, site: camp, kind: 'unit' });
  ctx.log(`游牧营地（${camp.x},${camp.y}）生产了${meta.name}。`, 'system');
  return true;
}

// 迁移：目标格重校验 → 原址移除（失去生产功能）→ 新址重建（继承剩余 duration 与 data）
export function doMigrate(ctx, owner, camp, tx, ty) {
  if (!isValidCampCell(ctx, tx, ty)) {
    ctx.log('目标格不再适合营地（占位/地形变化）。', 'warning');
    return false;
  }
  if (ctx.diagonalDist(camp, { x: tx, y: ty }) > NOMAD_CAMP.migrateRange) {
    ctx.log('目标格超出营地迁移范围。', 'warning');
    return false;
  }
  const data = { ...(camp.data || {}), migrated: (camp.data?.migrated || 0) + 1 };
  ctx.removeFacility(camp.id);
  ctx.createFacility(NOMAD_CAMP.type, owner, tx, ty, { duration: camp.duration, data });
  ctx.log(`游牧营地迁移到（${tx},${ty}），原址失去生产功能。`, 'system');
  return true;
}

// ---------------------------------------------------------------------------
// turnStart：过期 → 维护 → 决策（仅人类玩家）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  syncGameRef(ctx);
  const owner = payload && payload.owner;
  const initial = !!(payload && payload.initial);
  if (!isGoldenHordeOwner(ctx, owner)) return;

  // 1. 营地过期（duration-1，归零移除；先过期后维护，避免为将拆营地付维护）
  ctx.expireFacilities(owner);

  // 2. 维护（开局回合无收入，跳过；付不起 → 营地解散）
  if (!initial) {
    for (const camp of myCamps(ctx, owner)) {
      if (!ctx.spendGold(owner, NOMAD_CAMP.upkeep)) {
        ctx.removeFacility(camp.id);
        ctx.log('游牧营地因无力支付维护而解散。', 'warning');
      }
    }
  }

  // 3. 决策：人类玩家与 AI（阶段6 F1 接入；AI 选择由 src/ai/ 决策系统完成）
  if (owner === 'player' || isAiOwner(owner)) {
    for (const unit of ctx.game.units) {
      if (unit.owner === owner && canBuildCampAt(ctx, unit)) {
        requestBuildDecision(ctx, unit);
      }
    }
    for (const camp of myCamps(ctx, owner)) {
      requestCampDecision(ctx, camp);
    }
  }
}
