'use strict';
// 威尼斯联盟 Layer 4 核心系统：贸易网络（Trade Network）+ 三个国家机制 + 雇佣兵市场。
// 依据：FACTION-SYSTEM-API-CONTRACT v1.2 + v0.2 威尼斯 handoff（2026-09-07）+ 规格书 §7/§8/§38。
//
// 设计要点（与主对话 handoff 对齐）：
//  - 贸易路线是"两节点间的关系型战场实体（facility）"，data 承载
//    { startNode, endNode, path, income, status }（§38 建议结构）。
//  - 收益挂在现有 incomeCalculated 埋点（main.js grantIncome 内 emit）上，
//    不在 main.js 加新埋点；"敌军进入路线"的实时提示经既有 beforeMove / siteCaptured 钩子。
//  - 所有玩家决策点用 requestDecision/resolveDecision（契约 §4/§5）：
//    建哪条路线 / 是否承担被切断风险 / 热那亚借贷 / 雇佣兵购买 / 拉古萨商港转化。
//    无头 sim 非 AI owner 自动选第一项（不建/不贷/不买/不转化）= 原默认局零行为变化；
//    AI owner 由 src/ai/ AI 决策系统选择（阶段6 F1 接入）。
//  - 只经 factionContext 访问游戏：facility/decision 一律经 ctx，不直接 import core 状态性模块。
//  - 跨局清理：对比 ctx.game 引用变化自动 reset 模块级状态（借贷/雇佣兵冷却），
//    facility 本体由 main.js newGame 的 facilitySystem.clear() 处理。
//
// 未修改任何 main.js / combat.js / movement.js / factionContext.js / factionRegistry.js / 契约文件。

import { isAiOwner } from '../../ai/aiUtil.js';

// ---------------------------------------------------------------------------
// 数值配置（最终值以此为准；阶段5统一平衡时可再调）
// ---------------------------------------------------------------------------
export const TRADE_ROUTE = {
  type: 'tradeRoute',
  baseIncome: 2,        // 每条路线每回合基础 +2 金币
  incomeCap: 5,         // 单条路线长度收益上限 +5（避免无限堆路线；国家加成叠加在其后）
  maxRoutes: 6,         // 每方同时存在的贸易路线上限（防设施无限增长）
  navyGuardRange: 3,    // 海路保护：水域路径格需有己方海军在切比雪夫距离 <= 3 内
  pathSearchCap: 800,   // 路径 BFS 最大探索格数（防性能失控）
  maxCandidates: 5,     // 单回合最多列出 5 条候选路线（决策选项上限）
};

export const TRADING_PORT = {
  type: 'tradingPort',  // 拉古萨中立商港（facility，放在敌方港口格上）
  income: 2,            // 每个交易港每回合 +2 金币（少量收入）
  hp: 6,                // 可被攻击摧毁（每击按伤害 50% 掉耐久）
  chipRatio: 0.5,       // 敌军攻击交易港格上单位时对交易港的耐久伤害比例
  maxPorts: 2,          // 每方同时存在的交易港上限
  caravanRange: 1,      // 拉古萨商队需在港口切比雪夫距离 <= 1 内（"商队进入"）
};

export const GENOA_LOAN = {
  amount: 15,           // 立即获得 +15 金币
  repayment: 6,         // 随后 3 回合每回合 -6
  repayTurns: 3,
  cooldown: 2,          // 还清后冷却 2 回合（不可无限使用）
  maxLoans: 3,          // 每局借贷硬上限
};

export const MERCENARY = {
  // 按当前战场购买"临时解决方案"（规格书 §7.4）：反骑买长枪兵 / 攻城买投石车 / 远程买弩手
  // 价格沿用现有"非己方联盟兵种 ×1.5"概念（factionAdjustedCost 的 venice markup）
  markup: 1.5,
  options: [
    { id: 'spearman', label: '长枪兵', baseCost: 26, desc: '临时方案·反骑：克制骑兵冲锋，坚实前排' },
    { id: 'crossbow', label: '弩手', baseCost: 40, desc: '临时方案·远程：高爆发集火' },
    { id: 'catapult', label: '投石车', baseCost: 54, desc: '临时方案·攻城：远程攻城器械，射程远但脆弱' },
  ],
};

// 商队识别白名单（阶段4 tags 落地前，沿用金帐 TRADE_TYPES 白名单模式；
// 本模块独立声明，避免跨联盟耦合）
export const TRADE_TYPES = new Set(['tradeCaravan', 'ragusaCaravan']);

// 贸易节点：己方城市 / 港口（shipyard）/ 海上堡垒（fortress，特殊商业据点）/ 己方商队单位 /
// 拉古萨交易港（facility）。油田（oil*）/军营（barracks*）/临时营地（camp）不算商业节点（交付报告说明）。
export const NODE_SITE_KINDS = new Set(['city', 'shipyard', 'fortress']);

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象；facility 本体在 facilitySystem 中）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,
  loans: new Map(),     // owner -> { active, repayLeft, cooldownLeft, totalTaken }
  mercs: new Map(),     // owner -> { lastBuyTurn }（每回合最多买 1 次）
};

function resetState() {
  state.loans.clear();
  state.mercs.clear();
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
    loans: [...state.loans.entries()].map(([o, r]) => ({ owner: o, ...r })),
    mercs: [...state.mercs.entries()].map(([o, r]) => ({ owner: o, ...r })),
  };
}

// ---------------------------------------------------------------------------
// 基础判定
// ---------------------------------------------------------------------------
export function isVeniceOwner(ctx, owner) {
  return !!owner && ctx.ownerFaction(owner) === 'venice';
}

function isCaravanType(type) {
  return !!type && TRADE_TYPES.has(type);
}

function isWater(ctx, x, y) {
  const g = ctx.game;
  return !!(g && g.terrain[y] && g.terrain[y][x] === 'water');
}

function ownerShipyards(ctx, owner) {
  return ctx.game.sites.filter(s => s.kind === 'shipyard' && s.owner === owner);
}

function typeLabel(ctx, type) {
  const m = ctx.typeMeta(type);
  return m && m.name ? m.name : type;
}

function routeLabel(route) {
  const d = route.data || {};
  return `贸易路线（${d.startNode ? d.startNode.x + ',' + d.startNode.y : route.x + ',' + route.y} ↔ ${d.endNode ? d.endNode.x + ',' + d.endNode.y : ''}）`;
}

// ---------------------------------------------------------------------------
// 路径寻路（8 连通 BFS，中间格不可为敌方控制据点；水域允许通行 = 海路）
// ---------------------------------------------------------------------------
const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

export function findPath(ctx, owner, a, b) {
  if (!a || !b) return null;
  if (a.x === b.x && a.y === b.y) return null;
  const g = ctx.game;
  const w = g.w, h = g.h;
  const startKey = `${a.x},${a.y}`;
  const goalKey = `${b.x},${b.y}`;
  const prev = new Map([[startKey, null]]);
  const queue = [[a.x, a.y]];
  let head = 0;
  while (head < queue.length && head < TRADE_ROUTE.pathSearchCap) {
    const [x, y] = queue[head++];
    const key = `${x},${y}`;
    if (key === goalKey) break;
    for (const [dx, dy] of NEIGHBORS) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (g.terrain[ny][nx] === 'mountain') continue;
      const nk = `${nx},${ny}`;
      if (prev.has(nk)) continue;
      // 中间格不能是敌方控制据点（端点格是己方节点，跳过判定；中立据点视为可通商区域）
      const isEndpoint = (nx === a.x && ny === a.y) || (nx === b.x && ny === b.y);
      if (!isEndpoint) {
        const s = ctx.getSite(nx, ny);
        if (s && s.owner !== 'neutral' && !ctx.areAllies(ctx.game.teams, s.owner, owner)) continue;
      }
      prev.set(nk, [x, y]);
      queue.push([nx, ny]);
    }
  }
  if (!prev.has(goalKey)) return null;
  const cells = [];
  let cur = goalKey;
  while (cur) {
    const [cx, cy] = cur.split(',').map(Number);
    cells.unshift({ x: cx, y: cy });
    const par = prev.get(cur);
    cur = par ? `${par[0]},${par[1]}` : null;
  }
  return cells;
}

// 单条路线收益：基础 +2，路径每额外 2 格 +1，上限 +5（L=路径格数，含两端节点）
export function routeIncomeForPath(pathCells) {
  if (!pathCells || pathCells.length < 2) return 0;
  const L = pathCells.length;
  return Math.min(TRADE_ROUTE.incomeCap, TRADE_ROUTE.baseIncome + Math.floor((L - 2) / 2));
}

// 海路保护：路径含水域时，需有己方海军（domain='sea'）在任一水域格 3 格内
export function hasNavyGuard(ctx, owner, path) {
  const waterCells = path.filter(c => isWater(ctx, c.x, c.y));
  if (!waterCells.length) return true;
  const navies = ctx.game.units.filter(u => u.owner === owner && ctx.typeMeta(u.type) && ctx.typeMeta(u.type).domain === 'sea');
  if (!navies.length) return false;
  return waterCells.some(c => navies.some(n => ctx.diagonalDist(n, c) <= TRADE_ROUTE.navyGuardRange));
}

// ---------------------------------------------------------------------------
// 贸易节点收集（城市/港口/海上堡垒/商队/交易港）
// ---------------------------------------------------------------------------
export function collectNodes(ctx, owner) {
  const nodes = [];
  for (const s of ctx.game.sites) {
    if (s.owner !== owner || !NODE_SITE_KINDS.has(s.kind)) continue;
    nodes.push({ kind: 'site', id: s.id, x: s.x, y: s.y, label: s.name || `${s.kind}(${s.x},${s.y})` });
  }
  for (const u of ctx.game.units) {
    if (u.owner !== owner || !isCaravanType(u.type)) continue;
    nodes.push({ kind: 'unit', id: u.id, x: u.x, y: u.y, label: `${typeLabel(ctx, u.type)}（商队）` });
  }
  if (ctx.ownerNation(owner) === 'ragusa') {
    for (const f of ctx.getFacilitiesByType(TRADING_PORT.type)) {
      if (f.owner !== owner) continue;
      nodes.push({ kind: 'facility', id: f.id, x: f.x, y: f.y, label: '交易港' });
    }
  }
  return nodes;
}

function existingRoutePairs(ctx, owner) {
  const pairs = new Set();
  for (const f of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
    if (f.owner !== owner) continue;
    const d = f.data || {};
    if (d.startNode && d.endNode) {
      pairs.add([d.startNode.kind, d.startNode.id, d.endNode.kind, d.endNode.id].join(':'));
    }
  }
  return pairs;
}

function routesOf(ctx, owner) {
  return ctx.getFacilitiesByType(TRADE_ROUTE.type).filter(f => f.owner === owner);
}

// 候选路线对：所有节点两两组合，按路径格数升序取前 maxCandidates 条
export function routeCandidates(ctx, owner) {
  const nodes = collectNodes(ctx, owner);
  if (nodes.length < 2) return [];
  const used = existingRoutePairs(ctx, owner);
  const cands = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const key = [a.kind, a.id, b.kind, b.id].join(':');
      if (used.has(key)) continue;
      const path = findPath(ctx, owner, a, b);
      if (!path) continue;
      const sea = path.some(c => isWater(ctx, c.x, c.y));
      if (sea && !hasNavyGuard(ctx, owner, path)) continue; // 海路无海军保护：不可建
      cands.push({ a, b, path, income: routeIncomeForPath(path), sea });
    }
  }
  cands.sort((p, q) => p.path.length - q.path.length || q.income - p.income);
  return cands.slice(0, TRADE_ROUTE.maxCandidates);
}

// ---------------------------------------------------------------------------
// 建立贸易路线（决策 resolve 时重新校验并寻路）
// ---------------------------------------------------------------------------
// 决策请求到解析之间，节点可能移动/死亡：按 id 重新取最新坐标，取不到则失败。
function resolveNodeRef(ctx, node) {
  if (!node) return null;
  if (node.kind === 'site') {
    const s = ctx.game.sites.find(e => e.id === node.id);
    return s ? { kind: 'site', id: s.id, x: s.x, y: s.y, label: node.label } : null;
  }
  if (node.kind === 'unit') {
    const u = ctx.game.units.find(e => e.id === node.id);
    return u ? { kind: 'unit', id: u.id, x: u.x, y: u.y, label: node.label } : null;
  }
  if (node.kind === 'facility') {
    const f = ctx.getAllFacilities().find(e => e.id === node.id);
    return f ? { kind: 'facility', id: f.id, x: f.x, y: f.y, label: node.label } : null;
  }
  return null;
}

export function establishRoute(ctx, owner, a, b) {
  if (routesOf(ctx, owner).length >= TRADE_ROUTE.maxRoutes) {
    ctx.log('贸易路线上限已到，无法再建立。', 'warning');
    return false;
  }
  const ra = resolveNodeRef(ctx, a);
  const rb = resolveNodeRef(ctx, b);
  if (!ra || !rb) {
    ctx.log('节点已失效，贸易路线建立失败。', 'warning');
    return false;
  }
  const path = findPath(ctx, owner, ra, rb);
  if (!path) {
    ctx.log('两端节点已不可达，贸易路线建立失败。', 'warning');
    return false;
  }
  const sea = path.some(c => isWater(ctx, c.x, c.y));
  if (sea && !hasNavyGuard(ctx, owner, path)) {
    ctx.log('海路缺少己方海军保护，贸易路线建立失败。', 'warning');
    return false;
  }
  const income = routeIncomeForPath(path);
  const fac = ctx.createFacility(TRADE_ROUTE.type, owner, ra.x, ra.y, {
    hp: 1,
    duration: null, // 贸易路线不过期，直到端点失效/被切断
    data: {
      startNode: { kind: ra.kind, id: ra.id, x: ra.x, y: ra.y },
      endNode: { kind: rb.kind, id: rb.id, x: rb.x, y: rb.y },
      path,
      income,
      status: 'active',
      establishedTurn: ctx.game.turn,
      sea,
      seaCells: path.filter(c => isWater(ctx, c.x, c.y)).length,
    },
  });
  ctx.log(`${routeLabel(fac)}建立成功，每回合 +${income} 金币${sea ? '（海路，需海军保护）' : ''}。`, 'system');
  return !!fac;
}

// 路线端点是否仍有效（站点仍归己方 / 商队仍存活 / 交易港仍存在）
function nodeAlive(ctx, owner, node) {
  if (!node) return false;
  if (node.kind === 'site') {
    const s = ctx.game.sites.find(e => e.id === node.id);
    return !!s && s.owner === owner && NODE_SITE_KINDS.has(s.kind);
  }
  if (node.kind === 'unit') {
    const u = ctx.game.units.find(e => e.id === node.id);
    return !!u && u.owner === owner && isCaravanType(u.type);
  }
  if (node.kind === 'facility') {
    const f = ctx.getAllFacilities().find(e => e.id === node.id);
    return !!f && f.owner === owner && f.type === TRADING_PORT.type;
  }
  return false;
}

// 重新评估单条路线状态：'active' | 'disrupted' | 'removed'（端点失效）
// 状态迁移时记录日志（恢复/切断提示，避免每回合重复刷屏）。
export function refreshRoute(ctx, route) {
  const d = route.data || {};
  const owner = route.owner;
  if (!nodeAlive(ctx, owner, d.startNode) || !nodeAlive(ctx, owner, d.endNode)) {
    if (d.status !== 'removed') {
      ctx.log(`${routeLabel(route)}端点失效，贸易路线被移除。`, 'warning');
      d.status = 'removed';
    }
    return 'removed';
  }
  let newStatus = 'active';
  for (const c of d.path || []) {
    const s = ctx.getSite(c.x, c.y);
    if (s && s.owner !== 'neutral' && !ctx.areAllies(ctx.game.teams, s.owner, owner)) {
      newStatus = 'disrupted'; // 敌方控制据点落入路径
      break;
    }
    const u = ctx.getUnit(c.x, c.y);
    if (u && !ctx.areAllies(ctx.game.teams, u.owner, owner)) {
      newStatus = 'disrupted'; // 敌军单位进入路线
      break;
    }
  }
  if (newStatus !== d.status) {
    if (newStatus === 'disrupted') {
      ctx.log(`${routeLabel(route)}被敌军切断，贸易收入暂停（商队可另建新路线）。`, 'warning');
    } else {
      ctx.log(`${routeLabel(route)}恢复通商。`, 'system');
    }
    d.status = newStatus;
  }
  return newStatus;
}

// 敌军移动进入路线路径 → 立即标记切断（收入侧在 incomeCalculated 复核并保持）
export function onBeforeMove(ctx, payload) {
  const { unit, to } = payload || {};
  if (!unit || !to) return;
  for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
    if (ctx.areAllies(ctx.game.teams, unit.owner, route.owner)) continue;
    const d = route.data || {};
    if (d.status === 'disrupted') continue;
    if ((d.path || []).some(c => c.x === to.x && c.y === to.y)) {
      d.status = 'disrupted';
      ctx.log(`${typeLabel(ctx, unit.type)}进入${routeLabel(route)}，贸易路线被切断！`, 'warning');
    }
  }
}

// 敌军占领路径上的据点 → 立即标记切断
export function onSiteCaptured(ctx, payload) {
  const { unit, site } = payload || {};
  if (!unit || !site) return;
  for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
    if (ctx.areAllies(ctx.game.teams, unit.owner, route.owner)) continue;
    const d = route.data || {};
    if (d.status === 'disrupted') continue;
    if ((d.path || []).some(c => c.x === site.x && c.y === site.y)) {
      d.status = 'disrupted';
      ctx.log(`${routeLabel(route)}沿线据点失守，贸易路线被切断！`, 'warning');
    }
  }
}

// ---------------------------------------------------------------------------
// incomeCalculated：贸易路线收益 + 威尼斯海上垄断 + 拉古萨交易港收入 + 热那亚还款
// 注意：factionRegistry 实际以 (ctx, payload) 分发本钩子（payload = {owner, amount}），
//       契约 §6 表中签名按此实现（GH/HRE 未实现本钩子，无前例冲突）。
// ---------------------------------------------------------------------------
export function onIncomeCalculated(ctx, payload) {
  if (!payload || !payload.owner) return;
  const owner = payload.owner;
  if (!isVeniceOwner(ctx, owner)) return;
  syncGameRef(ctx);

  const nation = ctx.ownerNation(owner);
  let bonus = 0;

  // —— 贸易路线收益（先刷新状态：端点失效移除 / 切断暂停）——
  const ports = ownerShipyards(ctx, owner).length;
  let seaBonus = 0;
  let landBonus = 0;
  if (nation === 'veniceCore') {
    if (ports >= 2) seaBonus = 1;      // 海上垄断：控制 ≥2 港口 → 海上路线收益 +1
    if (ports >= 3) { seaBonus = 2; landBonus = 1; } // 海上霸权：≥3 港 → 海上 +2 / 陆路 +1
  }
  for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
    if (route.owner !== owner) continue;
    const st = refreshRoute(ctx, route);
    if (st === 'removed') {
      ctx.removeFacility(route.id);
      continue;
    }
    if (st !== 'active') continue;
    const d = route.data || {};
    let inc = d.income || 0;
    if (d.sea) inc += seaBonus; else inc += landBonus;
    bonus += inc;
  }

  // —— 拉古萨中立商港：交易港维护检查 + 收入 ——
  for (const port of ctx.getFacilitiesByType(TRADING_PORT.type)) {
    if (port.owner !== owner) continue;
    const site = ctx.getSite(port.x, port.y);
    const stale = !site || site.kind !== 'shipyard' || ctx.areAllies(ctx.game.teams, site.owner, owner);
    const occupied = !!ctx.getUnit(port.x, port.y) &&
      !ctx.areAllies(ctx.game.teams, ctx.getUnit(port.x, port.y).owner, owner);
    if (stale || occupied) {
      ctx.removeFacility(port.id);
      ctx.log('中立商港失效：港口被己方收复或敌军重占，交易港关闭。', 'warning');
      continue;
    }
    bonus += TRADING_PORT.income;
  }

  // —— 热那亚银行信用：还款（-6/回合 × 3）与冷却倒计时 ——
  if (nation === 'genoa') {
    const rec = state.loans.get(owner);
    if (rec && rec.active) {
      payload.amount -= GENOA_LOAN.repayment;
      rec.repayLeft -= 1;
      if (rec.repayLeft <= 0) {
        rec.active = false;
        rec.cooldownLeft = GENOA_LOAN.cooldown;
        ctx.log('热那亚贷款已还清，进入信用冷却。', 'gold');
      }
    } else if (rec && rec.cooldownLeft > 0) {
      rec.cooldownLeft -= 1;
    }
  }

  if (bonus > 0) {
    payload.amount += bonus;
  }
}

// ---------------------------------------------------------------------------
// turnStart：被动维护（海上垄断加速生产）+ 玩家决策请求（路线/借贷/雇佣兵/商港）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  const initial = !!(payload && payload.initial);
  syncGameRef(ctx);
  if (!isVeniceOwner(ctx, owner)) return;

  // 1. 威尼斯海上垄断：≥2 港口时每回合 1 次，在首个空闲己方港口以半价加速生产桨帆船
  //   （"港口生产速度增加"的模块内实现：生产费用减半 + 自动补产，初始回合不生效）
  if (!initial && ctx.ownerNation(owner) === 'veniceCore') {
    maybePortProduction(ctx, owner);
  }

  // 2. 决策点（无头 sim 非 AI owner 自动选第一项；AI owner 由 src/ai/ 决策，阶段6 F1）
  if (owner === 'player' || isAiOwner(owner)) {
    requestRouteDecision(ctx, owner);
    requestLoanDecision(ctx, owner);
    requestMercenaryDecision(ctx, owner);
    requestTradingPortDecision(ctx, owner);
  }
}

// —— 威尼斯海上垄断：港口加速生产（被动机制，对 AI 同样生效）——
export function maybePortProduction(ctx, owner) {
  const shipyards = ownerShipyards(ctx, owner);
  if (shipyards.length < 2) return; // 控制 ≥2 港口才触发
  const site = shipyards.find(s => !ctx.getUnit(s.x, s.y));
  if (!site) return;
  const cost = Math.round((ctx.typeMeta('galley').cost || 30) * 0.5); // 半价生产（30→15）
  if ((ctx.game.goldByOwner[owner] || 0) < cost) return;
  if (!ctx.spendGold(owner, cost)) return;
  const u = ctx.createUnit('galley', owner, site.x, site.y);
  ctx.events.emit('productionCompleted', { owner, unit: u, site, kind: 'unit' });
  ctx.log(`海上垄断：${site.name || '港口'}（${site.x},${site.y}）以半价 ${cost} 金币加速生产了桨帆船。`, 'gold');
  return u;
}

// —— 决策：哪两座节点建立贸易路线 ——
export function requestRouteDecision(ctx, owner) {
  if (!isVeniceOwner(ctx, owner)) return null;
  if (routesOf(ctx, owner).length >= TRADE_ROUTE.maxRoutes) return null;
  const cands = routeCandidates(ctx, owner).map(c => {
    const risk = c.path.filter(p => {
      const u = ctx.getUnit(p.x, p.y);
      return u && !ctx.areAllies(ctx.game.teams, u.owner, owner);
    }).length;
    return { ...c, risk };
  });
  if (!cands.length) return null;
  const options = [{ id: 'none', label: '不建', description: '保留金币，不建立贸易路线。' }];
  cands.forEach((c, idx) => {
    const risk = c.risk;
    options.push({
      id: `route:${idx}`,
      label: `${c.a.label} ↔ ${c.b.label}`,
      description: `路径 ${c.path.length} 格${c.sea ? '（海路）' : ''}，每回合 +${c.income} 金币${risk ? `；路径上有 ${risk} 个敌军单位，存在被切断风险` : ''}`,
    });
  });
  return ctx.requestDecision(`venRoute_${owner}`, {
    owner,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    // 阶段6 F1：结构化候选数据（收益/风险/路径长度），AI 决策系统据此择优
    cands: cands.map(c => ({ income: c.income, risk: c.risk, sea: c.sea, pathLen: c.path.length })),
    title: '贸易路线',
    description: '选择两座己方节点建立贸易路线（无直接成本，但可被敌军切断；海路需己方海军保护）。',
    options,
    onResolve: (choiceId) => resolveRouteChoice(ctx, owner, cands, choiceId),
  });
}

export function resolveRouteChoice(ctx, owner, cands, choiceId) {
  if (!choiceId || choiceId === 'none') return false;
  const idx = parseInt(String(choiceId).slice('route:'.length), 10);
  const cand = cands[idx];
  if (!cand) return false;
  return establishRoute(ctx, owner, cand.a, cand.b);
}

// —— 决策：热那亚银行信用（借不借、借多少——当前只有 15 一档）——
export function canLoan(ctx, owner) {
  if (ctx.ownerNation(owner) !== 'genoa') return false;
  const rec = state.loans.get(owner);
  if (!rec) return true;
  return !rec.active && rec.cooldownLeft <= 0 && rec.totalTaken < GENOA_LOAN.maxLoans;
}

export function requestLoanDecision(ctx, owner) {
  if (!canLoan(ctx, owner)) return null;
  const options = [
    { id: 'none', label: '不贷', description: '维持现状，不借贷。' },
    { id: 'loan', label: '贷款 15 金币', description: `立即 +${GENOA_LOAN.amount}，随后 ${GENOA_LOAN.repayTurns} 回合每回合 -${GENOA_LOAN.repayment}（净利息 ${GENOA_LOAN.repayment * GENOA_LOAN.repayTurns - GENOA_LOAN.amount}），还清后冷却 ${GENOA_LOAN.cooldown} 回合。` },
  ];
  return ctx.requestDecision(`venLoan_${owner}`, {
    owner,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '热那亚银行信用',
    description: '花未来收入换当前现金——这是借贷/投资决策，请判断是否值得承担还款压力。',
    options,
    onResolve: (choiceId) => resolveLoanChoice(ctx, owner, choiceId),
  });
}

export function resolveLoanChoice(ctx, owner, choiceId) {
  if (!choiceId || choiceId !== 'loan') return false;
  if (!canLoan(ctx, owner)) return false;
  const rec = state.loans.get(owner) || { active: false, repayLeft: 0, cooldownLeft: 0, totalTaken: 0 };
  ctx.addGold(owner, GENOA_LOAN.amount, 'genoaLoan');
  rec.active = true;
  rec.repayLeft = GENOA_LOAN.repayTurns;
  rec.cooldownLeft = 0;
  rec.totalTaken += 1;
  state.loans.set(owner, rec);
  ctx.log(`热那亚银行放贷：立即获得 ${GENOA_LOAN.amount} 金币，接下来 ${GENOA_LOAN.repayTurns} 回合每回合还款 ${GENOA_LOAN.repayment}。`, 'gold');
  return true;
}

// —— 决策：雇佣兵市场（按当前战场购买临时解决方案）——
export function requestMercenaryDecision(ctx, owner) {
  if (!isVeniceOwner(ctx, owner)) return null;
  if (state.mercs.get(owner) && state.mercs.get(owner).lastBuyTurn === ctx.game.turn) return null; // 每回合最多 1 次
  const market = marketSite(ctx, owner);
  if (!market) return null; // 需要己方城市/港口作为市场
  const options = [{ id: 'none', label: '不购买', description: '保留金币，本回合不雇佣。' }];
  for (const o of MERCENARY.options) {
    const cost = Math.round(o.baseCost * MERCENARY.markup);
    options.push({ id: `merc:${o.id}`, label: `雇佣${o.label}（${cost}金币）`, description: o.desc });
  }
  return ctx.requestDecision(`venMerc_${owner}`, {
    owner,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '雇佣兵市场',
    description: `按当前战场购买"临时解决方案"（部署于 ${market.name || '市场'}${market.x},${market.y}）。`,
    options,
    onResolve: (choiceId) => resolveMercChoice(ctx, owner, choiceId),
  });
}

function marketSite(ctx, owner) {
  return ctx.game.sites.find(s => s.owner === owner && (s.kind === 'city' || s.kind === 'shipyard') && !ctx.getUnit(s.x, s.y));
}

export function resolveMercChoice(ctx, owner, choiceId) {
  if (!choiceId || choiceId === 'none') return false;
  if (!choiceId.startsWith('merc:')) return false;
  const type = choiceId.slice('merc:'.length);
  const def = MERCENARY.options.find(o => o.id === type);
  if (!def) return false;
  const market = marketSite(ctx, owner);
  if (!market) {
    ctx.log('市场格已被占用，雇佣兵无法部署。', 'warning');
    return false;
  }
  const cost = Math.round(def.baseCost * MERCENARY.markup);
  if ((ctx.game.goldByOwner[owner] || 0) < cost) {
    ctx.log('金币不足，无法雇佣。', 'warning');
    return false;
  }
  if (!ctx.spendGold(owner, cost)) return false;
  const u = ctx.createUnit(type, owner, market.x, market.y);
  state.mercs.set(owner, { lastBuyTurn: ctx.game.turn });
  ctx.log(`雇佣兵市场：${typeLabel(ctx, type)}抵达（${market.x},${market.y}），花费 ${cost} 金币。`, 'system');
  return !!u;
}

// —— 决策：拉古萨中立商港（把某敌方港口变为交易港）——
function eligiblePorts(ctx, owner) {
  if (ctx.ownerNation(owner) !== 'ragusa') return [];
  const count = ctx.getFacilitiesByType(TRADING_PORT.type).filter(f => f.owner === owner).length;
  if (count >= TRADING_PORT.maxPorts) return [];
  const out = [];
  for (const site of ctx.game.sites) {
    if (site.kind !== 'shipyard') continue;
    if (site.owner === 'neutral' || ctx.areAllies(ctx.game.teams, site.owner, owner)) continue; // 敌方港口
    if (ctx.getFacilitiesByType(TRADING_PORT.type).some(f => f.x === site.x && f.y === site.y)) continue;
    const caravan = ctx.game.units.find(u => u.owner === owner && isCaravanType(u.type) && ctx.diagonalDist(u, site) <= TRADING_PORT.caravanRange);
    if (!caravan) continue; // 拉古萨商队需进入（邻近）
    out.push(site);
  }
  return out;
}

export function requestTradingPortDecision(ctx, owner) {
  const ports = eligiblePorts(ctx, owner);
  if (!ports.length) return null;
  const options = [{ id: 'none', label: '不转化', description: '保留现状，不设立中立商港。' }];
  ports.slice(0, 3).forEach((site, idx) => {
    options.push({
      id: `port:${idx}`,
      label: `转化${site.name || '港口'}（${site.x},${site.y}）`,
      description: `中立商港：不完全占领，每回合 +${TRADING_PORT.income} 金币，并为拉古萨贸易网络提供连接。`,
    });
  });
  return ctx.requestDecision(`venPort_${owner}`, {
    owner,
    ctx, // 阶段6 F1：供 AI 决策系统查询战场状态
    title: '拉古萨中立商港',
    description: '拉古萨商队已抵达敌方港口，可将其变为交易港（不占领，可被敌军摧毁/重占）。',
    options,
    onResolve: (choiceId) => resolvePortChoice(ctx, owner, ports, choiceId),
  });
}

export function resolvePortChoice(ctx, owner, ports, choiceId) {
  if (!choiceId || choiceId === 'none') return false;
  const idx = parseInt(String(choiceId).slice('port:'.length), 10);
  const site = ports[idx];
  if (!site) return false;
  const count = ctx.getFacilitiesByType(TRADING_PORT.type).filter(f => f.owner === owner).length;
  if (count >= TRADING_PORT.maxPorts) return false;
  const caravan = ctx.game.units.find(u => u.owner === owner && isCaravanType(u.type) && ctx.diagonalDist(u, site) <= TRADING_PORT.caravanRange);
  if (!caravan) {
    ctx.log('商队已离开，商港转化条件不再满足。', 'warning');
    return false;
  }
  const fac = ctx.createFacility(TRADING_PORT.type, owner, site.x, site.y, {
    hp: TRADING_PORT.hp,
    duration: null,
    data: { siteId: site.id, establishedTurn: ctx.game.turn },
  });
  ctx.log(`中立商港建立：${site.name || '港口'}（${site.x},${site.y}）成为拉古萨交易港，每回合 +${TRADING_PORT.income} 金币。`, 'system');
  return !!fac;
}

// ---------------------------------------------------------------------------
// afterAttack：交易港可被攻击摧毁（敌军攻击港格上单位时按伤害 50% 掉耐久）
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker, defender, result } = payload || {};
  if (!attacker || !defender || !result) return;
  const port = ctx.getFacilitiesByType(TRADING_PORT.type).find(f => f.x === defender.x && f.y === defender.y);
  if (!port) return;
  if (ctx.areAllies(ctx.game.teams, attacker.owner, port.owner)) return;
  const chip = Math.max(1, Math.round((result.damage || 0) * TRADING_PORT.chipRatio));
  const remaining = ctx.damageFacility(port.id, chip);
  if (remaining <= 0) {
    ctx.log('中立商港在战火中被摧毁。', 'warning');
  } else {
    ctx.log(`中立商港受到攻击受损（耐久 ${remaining}/${port.maxHp}）。`, 'warning');
  }
}
