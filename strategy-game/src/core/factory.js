'use strict';
// src/core/factory.js —— 单位/据点构造 + 生产/费用/成长计算模块（从 main.js 闭包渐进抽取，行为零变化）。
// 抽取原则：本模块零 DOM；闭包辅助函数经 deps 注入（main.js 传原函数），constants/utils 纯函数直接 import。
// 抽取记录见 .vibecoding/MEMORY.md（main.js 拆分窗口第三刀）。

import { eventBus } from './events.js';
import { TYPES, CAMP_DURATION, UNIT_RANK_THRESHOLDS } from './constants.js';
import { typeMeta, siteMeta, isTransportType, isTransportUnit } from './utils.js';

// 单位构造（基础字段，rank/kills 初始 0）
export function unit(game, deps, type, owner, x, y) {
  const { randomId } = deps;
  const meta = typeMeta(type);
  return {
    id: randomId(),
    type,
    owner,
    x,
    y,
    hp: meta.hp,
    maxHp: meta.hp,
    move: meta.move,
    maxMove: meta.move,
    baseMove: meta.move,
    acted: false,
    hasAttacked: false,
    lastAttacked: false,
    kills: 0,
    rank: 0,
    cargo: meta.transport ? [] : null
  };
}

// 装载舱位构造（运输船内货物）
export function createCargoPayload(game, deps, owner, type) {
  return {
    type,
    owner,
    hp: typeMeta(type).hp,
    maxHp: typeMeta(type).hp,
    lastAttacked: false
  };
}

// 预载运输船构造：基础运输船 + 规范化货物舱位
export function createLoadedTransport(game, deps, owner, x, y, cargoTypes = [], transportType = 'transport') {
  const transport = unit(game, deps, transportType, owner, x, y);
  transport.cargo = normalizeCargoTypes(game, deps, cargoTypes, transportType).map(type => createCargoPayload(game, deps, owner, type));
  return transport;
}

// 据点构造（income 缺省取 siteMeta 基准）
export function site(game, deps, kind, owner, x, y, name, tier = 1, income = null) {
  const { randomId } = deps;
  return {
    id: randomId(),
    kind,
    owner,
    x,
    y,
    name,
    tier,
    income: income == null ? siteMeta(kind).income : income
  };
}

// 旧营地体系构造（main.js 旧逻辑；金帐本部营地 +2 回合，非中立不可占领）
export function createCamp(game, deps, owner, x, y) {
  const camp = site(game, deps, 'camp', owner, x, y, '临时营地', 2, 0);
  const campNat = owner === 'player' ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
  camp.duration = CAMP_DURATION + (campNat === 'goldenHordeCore' ? 2 : 0);
  camp.uncapturable = true;
  return camp;
}

// 单位建造成本（运输单位含装载货物成本）
export function unitBuildCost(game, deps, unitEntry) {
  if (isTransportUnit(unitEntry)) {
    return transportCost(game, deps, (unitEntry.cargo || []).map(payload => payload.type), unitEntry.type);
  }
  return typeMeta(unitEntry.type).cost;
}

// 出售退款：建造成本一半（向下取整）
export function sellRefund(game, deps, unitEntry) {
  return Math.floor(unitBuildCost(game, deps, unitEntry) / 2);
}

// 可装载的陆战兵种列表（运输配置下拉）
export function cargoOptionTypes(game, deps) {
  return Object.keys(TYPES).filter(type => typeMeta(type).domain === 'land');
}

// 货物规范化：过滤非法/非陆战类型，按运输船容量截断
export function normalizeCargoTypes(game, deps, types, transportType = 'transport') {
  return (types || []).filter(type => type && type !== 'none' && TYPES[type] && typeMeta(type).domain === 'land').slice(0, typeMeta(transportType).transport);
}

// 从击杀数计算军衔（UNIT_RANK_THRESHOLDS 阈值表）
export function rankFromKills(game, deps, kills) {
  let rank = 0;
  for (let index = 0; index < UNIT_RANK_THRESHOLDS.length; index++) {
    if (kills >= UNIT_RANK_THRESHOLDS[index]) {
      rank = index;
    }
  }
  return rank;
}

// 有效移动力：基础 + 军衔加成（阶段3 已移除普鲁士恒定 +1）
export function effectiveMove(game, deps, unitEntry) {
  return unitEntry.baseMove + Math.floor(unitEntry.rank / 2);
}

// 回血倍率：军衔成长
export function healMultiplier(game, deps, unitEntry) {
  return 1 + unitEntry.rank * 0.15;
}

// 授予击杀（马穆鲁克双倍击杀为国家机制，原文照搬）；触发晋升
export function grantKills(game, deps, unitEntry, kills) {
  const { ownerName, log } = deps;
  if (!unitEntry) {
    return;
  }
  const killFac = unitEntry.owner === 'player' ? game.settings?.faction : game.aiProfiles?.[unitEntry.owner]?.faction;
  const effectiveKills = killFac === 'mamluk' ? kills * 2 : kills;
  unitEntry.kills += effectiveKills;
  const nextRank = rankFromKills(game, deps, unitEntry.kills);
  if (nextRank !== unitEntry.rank) {
    unitEntry.rank = nextRank;
    unitEntry.maxMove = effectiveMove(game, deps, unitEntry);
    unitEntry.move = Math.max(unitEntry.move, Math.min(unitEntry.maxMove, unitEntry.move + 1));
    log(`${ownerName(unitEntry.owner)}的${typeMeta(unitEntry.type).name}晋升为 ${nextRank} 级老兵。`, 'system');
  }
}

// 运输船总成本：船体 + 全部装载货物
export function transportCost(game, deps, cargoTypes = [], transportType = 'transport') {
  return typeMeta(transportType).cost + normalizeCargoTypes(game, deps, cargoTypes, transportType).reduce((sum, type) => sum + typeMeta(type).cost, 0);
}

// 联盟/国家费用调整（四合一：威尼斯雇佣兵 1.5× / 拉古萨 0.95× / 威尼斯本部造船 0.8× / 大明本部造船建营 0.9×）
export function factionAdjustedCost(game, deps, owner, type, cargoTypes = []) {
  const base = isTransportType(type) ? transportCost(game, deps, cargoTypes, type) : typeMeta(type).cost;
  const fac = owner === 'player' ? game.settings?.faction : game.aiProfiles?.[owner]?.faction;
  const nat = owner === 'player' ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
  const typeFac = typeMeta(type).faction;
  let markup = fac === 'venice' && typeFac && typeFac !== 'venice' ? 1.5 : 1;
  if (nat === 'ragusa') markup *= 0.95;
  // 威尼斯本部：造船费用-20%；大明本部：造船/建营费用-10%
  if (nat === 'veniceCore' && typeMeta(type).domain === 'sea') markup *= 0.8;
  if (nat === 'mingCore' && (typeMeta(type).domain === 'sea' || type === 'engineer' || type === 'worksEngineer')) markup *= 0.9;
  return Math.round(base * markup);
}

// 装载槽位标签
export function cargoLabel(game, deps, type) {
  return type === 'none' ? '空位' : `${typeMeta(type).icon} ${typeMeta(type).name}`;
}

// 货物描述文本
export function describeCargo(game, deps, cargoTypes = []) {
  const types = normalizeCargoTypes(game, deps, cargoTypes);
  return types.length ? types.map(type => typeMeta(type).name).join('、') : '空舱';
}

// 据点可建造兵种（联盟/国家过滤；威尼斯例外可造任意兵种）
export function buildableTypes(game, deps, siteEntry) {
  const { ownerFaction, ownerNation } = deps;
  const domain = siteMeta(siteEntry.kind).domain;
  if (!domain) {
    return [];
  }
  const faction = ownerFaction(siteEntry.owner);
  const nation = ownerNation(siteEntry.owner);
  const isVenice = faction === 'venice';
  return Object.keys(TYPES).filter(type => {
    const meta = typeMeta(type);
    if (meta.domain !== domain || meta.level > siteEntry.tier) return false;
    if (!isVenice && meta.faction && meta.faction !== faction) return false;
    if (!isVenice && meta.nation && meta.nation !== nation) return false;
    return true;
  });
}

// 据点生产主入口：校验 → 扣费 → 构造并入队 → productionCompleted 事件
export function buildAtSite(game, deps, owner, siteEntry, type, options = {}) {
  const { getUnit, atUnitCap, buildBudgetLeft, recordBuild, log, ownerName, incrementStat, recordStatSnapshot } = deps;
  const cargoTypes = isTransportType(type) ? normalizeCargoTypes(game, deps, options.cargoTypes) : [];
  const totalCost = factionAdjustedCost(game, deps, owner, type, cargoTypes);
  const builtUnits = isTransportType(type) ? 1 + cargoTypes.length : 1;
  if (!siteEntry || siteEntry.owner !== owner || !buildableTypes(game, deps, siteEntry).includes(type) || getUnit(siteEntry.x, siteEntry.y) || game.goldByOwner[owner] < totalCost) {
    return false;
  }
  if (atUnitCap(owner, typeMeta(type).domain) || buildBudgetLeft(owner) < builtUnits) {
    return false;
  }
  recordBuild(owner, builtUnits);
  game.goldByOwner[owner] -= totalCost;
  let created = null;
  if (isTransportType(type)) {
    created = createLoadedTransport(game, deps, owner, siteEntry.x, siteEntry.y, cargoTypes, type);
    game.units.push(created);
    log(`${ownerName(owner)}在${siteEntry.name}下水了${typeMeta(type).name}，预载 ${describeCargo(game, deps, cargoTypes)}。`, 'system');
    incrementStat('produced', owner, 1 + cargoTypes.length);
  } else {
    created = unit(game, deps, type, owner, siteEntry.x, siteEntry.y);
    game.units.push(created);
    log(`${ownerName(owner)}在${siteEntry.name}部署了${typeMeta(type).name}。`, 'system');
    incrementStat('produced', owner, 1);
  }
  recordStatSnapshot('build');
  // v0.2 GH-01：productionCompleted 实际埋点（契约 §2.2）。无订阅者时空转，零行为变化。
  eventBus.emit('productionCompleted', { owner, unit: created, site: siteEntry, kind: isTransportType(type) ? 'ship' : 'unit' });
  return true;
}
