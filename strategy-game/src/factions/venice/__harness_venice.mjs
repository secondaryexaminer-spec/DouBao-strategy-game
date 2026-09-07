// __harness_venice.mjs —— 威尼斯模块临时自测文件（主对话接线后决定去留；HRE/金帐 harness 保留作回归）。
// 验证：非威尼斯局零变化 / 决策 fallback（不建/不贷/不买/不转化）/ 路线建立与收益公式 /
//       海路海军保护 / 路线被切断与恢复 / 端点失效移除 / 威尼斯海上垄断（≥2/≥3 港）/
//       港口半价生产 / 热那亚借贷与冷却 / 拉古萨交易港（条件/收入/节点/摧毁）/
//       雇佣兵购买（×1.5 成本）/ 跨局状态重置。
// 运行：node src/factions/venice/__harness_venice.mjs
import { createFactionContext } from '../factionContext.js';
import { factionRegistry } from '../factionRegistry.js';
import { facilitySystem } from '../../core/facility.js';
import { statusSystem } from '../../core/status.js';
import { decisionSystem } from '../../core/decision.js';
import { TYPES } from '../../core/constants.js';
import * as trade from './tradeNetwork.js';
import { veniceSystem } from './veniceRules.js';

let passed = 0;
let failed = 0;
function assert(cond, label) {
  if (cond) { passed += 1; console.log('  PASS', label); }
  else { failed += 1; console.error('  FAIL', label); }
}
function eq(a, b, label) { assert(a === b, `${label} (got ${a}, want ${b})`); }

// ---------------------------------------------------------------------------
// 伪造游戏环境
// ---------------------------------------------------------------------------
let uid = 1;
let sid = 1;
function mkUnit(type, owner, x, y, over = {}) {
  const m = TYPES[type];
  return {
    id: `u${uid++}`, type, owner, x, y,
    hp: m.hp, maxHp: m.hp, move: m.move, maxMove: m.move, baseMove: m.move,
    acted: false, hasAttacked: false, lastAttacked: false, kills: 0, rank: 0,
    cargo: m.transport ? [] : null, ...over,
  };
}
function mkSite(kind, owner, x, y, name, tier = 1, income = 10) {
  return { id: `s${sid++}`, kind, owner, x, y, name: name || `${kind}${sid}`, tier, income };
}

let game = null;

function freshGame(overrides = {}) {
  facilitySystem.clear();
  statusSystem.clear();
  decisionSystem.clear();
  game = {
    w: 10, h: 10,
    terrain: Array.from({ length: 10 }, () => Array(10).fill('plain')),
    units: [], sites: [], ownerOrder: ['player', 'enemy'], currentIndex: 0,
    side: 'player', turn: 1, logs: [], selected: null, over: false,
    teams: { player: 'A', enemy: 'B' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'mingCore' } },
    goldByOwner: { player: 100, enemy: 100 },
    settings: { faction: 'venice', nation: 'veniceCore' },
    ...overrides,
  };
  return game;
}

const deps = {
  gameRef: () => game,
  getUnit: (x, y) => game.units.find(u => u.x === x && u.y === y) || null,
  getSite: (x, y) => game.sites.find(s => s.x === x && s.y === y) || null,
  typeMeta: (t) => TYPES[t] || null,
  terrainMeta: (k) => null,
  ownerFaction: (o) => (o === 'player' ? game.settings.faction : (game.aiProfiles[o] ? game.aiProfiles[o].faction : undefined)),
  ownerNation: (o) => (o === 'player' ? game.settings.nation : (game.aiProfiles[o] ? game.aiProfiles[o].nation : undefined)),
  log: (text, kind) => { game.logs.push({ text, kind }); console.log('[log]', text); },
  addGold: (owner, amount) => { game.goldByOwner[owner] = (game.goldByOwner[owner] || 0) + amount; },
  spendGold: (owner, amount) => {
    if ((game.goldByOwner[owner] || 0) < amount) return false;
    game.goldByOwner[owner] -= amount;
    return true;
  },
  createUnit: (type, owner, x, y) => {
    const u = mkUnit(type, owner, x, y);
    game.units.push(u);
    return u;
  },
};

const ctx = createFactionContext(deps);
factionRegistry.register('venice', veniceSystem, ctx);

// 模拟 main.js 接线：beginTurn 开头全量 tick，再 emit turnStart
function beginTurn(owner, initial = false) {
  statusSystem.tickStatuses(game.units.map(u => u.id));
  ctx.events.emit('turnStart', { owner, initial });
}
// 模拟 grantIncome 的 incomeCalculated 埋点（payload 引用传递，钩子可改 amount；
// emit 后按 main.js 语义将 amount 入账 goldByOwner）
function incomeCalc(owner, amount) {
  const p = { owner, amount };
  ctx.events.emit('incomeCalculated', p);
  game.goldByOwner[owner] = (game.goldByOwner[owner] || 0) + p.amount;
  return p;
}
function beforeMove(unit, fx, fy, tx, ty) {
  const payload = { unit, from: { x: fx, y: fy }, to: { x: tx, y: ty }, cancel: false };
  ctx.events.emit('beforeMove', payload);
  return payload;
}
function afterAttack(attacker, defender, damage, extra = {}) {
  ctx.events.emit('afterAttack', { attacker, defender, result: { damage, counter: 0 }, defenderDead: false, attackerDead: false, ...extra });
}
function siteCaptured(unit, site) {
  ctx.events.emit('siteCaptured', { unit, site, oldOwner: site.owner });
}
function ui() { globalThis.document = {}; globalThis.window = {}; }
function noUi() { delete globalThis.document; delete globalThis.window; }

const routes = () => ctx.getFacilitiesByType(trade.TRADE_ROUTE.type);
const ports = () => ctx.getFacilitiesByType(trade.TRADING_PORT.type);
const pendingVen = (owner) => decisionSystem.getPendingDecisions(owner).filter(r => String(r.id).startsWith('ven'));

// ---------------------------------------------------------------------------
// V1 非威尼斯局零变化
// ---------------------------------------------------------------------------
console.log('== V1 非威尼斯局零变化 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const p = incomeCalc('player', 50);
  eq(p.amount, 50, '非威尼斯 owner 收入不变');
  const g0 = game.goldByOwner.player;
  beginTurn('player', false);
  eq(game.goldByOwner.player, g0, '非威尼斯局金币不变');
  eq(facilitySystem.getAll().length, 0, '非威尼斯局无设施');
  eq(decisionSystem.getPendingDecisions('player').length, 0, '非威尼斯局无决策');
}

// ---------------------------------------------------------------------------
// V2 决策 fallback：无头环境自动选第一项（不建/不贷/不买/不转化）= 零行为变化
// ---------------------------------------------------------------------------
console.log('== V2 决策 fallback（无头自动 不建/不贷/不买）==');
{
  freshGame(); // venice/veniceCore
  game.sites.push(mkSite('city', 'player', 2, 2, '威尼斯城'), mkSite('city', 'player', 5, 5, '热那亚城'));
  beginTurn('player', false);
  eq(facilitySystem.getAll().length, 0, 'fallback 不建：无贸易路线');
  eq(game.goldByOwner.player, 100, 'fallback 不贷/不买：金币不变');
  eq(game.units.length, 0, 'fallback 不买：无雇佣兵');
  eq(pendingVen('player').length, 0, 'fallback 自动解析，无滞留决策');
}
{
  freshGame({ settings: { faction: 'venice', nation: 'genoa' } });
  beginTurn('player', false);
  eq(game.goldByOwner.player, 100, 'fallback 不贷：热那亚金币不变');
  eq(trade.debugState().loans.length, 0, 'fallback 不贷：无贷款记录');
}

// ---------------------------------------------------------------------------
// V3 贸易路线建立（UI 决策）+ incomeCalculated 收益
// ---------------------------------------------------------------------------
console.log('== V3 路线建立与基础收益 ==');
{
  freshGame();
  game.sites.push(mkSite('city', 'player', 2, 2, '威尼斯城'), mkSite('city', 'player', 2, 3, '君士坦丁堡'));
  ui();
  beginTurn('player', false);
  const dec = pendingVen('player').find(r => r.id === 'venRoute_player');
  assert(!!dec, '有节点对时产生路线决策');
  eq(dec.context.options.map(o => o.id).join(','), 'none,route:0', '选项：不建/一条候选路线');
  eq(dec.context.options[0].id, 'none', '第一项必须是不建（sim fallback 依赖）');
  assert(dec.context.options[1].description.includes('+2 金币'), '候选路线描述含收益预览');

  ctx.resolveDecision(dec.id, 'route:0');
  const r = routes()[0];
  assert(!!r && r.type === trade.TRADE_ROUTE.type, '贸易路线设施建立');
  eq(r.x, 2, '路线 facility 位于起点格');
  eq(r.data.income, 2, '相邻路线基础收益 +2');
  eq(r.data.status, 'active', '路线初始状态 active');
  eq(r.data.sea, false, '陆路 non-sea');
  eq(r.duration, null, '路线不过期（duration null）');
  noUi();

  const p = incomeCalc('player', 100);
  eq(p.amount, 102, 'incomeCalculated 挂载：+2 路线收益');
}

// ---------------------------------------------------------------------------
// V4 单条路线收益公式（长度加成 + 上限）
// ---------------------------------------------------------------------------
console.log('== V4 收益公式 ==');
{
  const cells = n => Array.from({ length: n }, (_, i) => ({ x: i, y: 0 }));
  eq(trade.routeIncomeForPath(cells(2)), 2, 'L=2 → 2');
  eq(trade.routeIncomeForPath(cells(3)), 2, 'L=3 → 2');
  eq(trade.routeIncomeForPath(cells(4)), 3, 'L=4 → 3');
  eq(trade.routeIncomeForPath(cells(6)), 4, 'L=6 → 4');
  eq(trade.routeIncomeForPath(cells(8)), 5, 'L=8 → 5（上限）');
  eq(trade.routeIncomeForPath(cells(12)), 5, 'L=12 → 5（上限）');
  eq(trade.routeIncomeForPath(null), 0, '非法路径 → 0');
}

// ---------------------------------------------------------------------------
// V5 海路需要己方海军保护（无海军不可建 / 有海军可建）
// ---------------------------------------------------------------------------
console.log('== V5 海路海军保护 ==');
{
  freshGame({
    terrain: Array.from({ length: 10 }, (_, y) => Array.from({ length: 10 }, (_, x) => y === 4 ? 'water' : 'plain')),
  });
  game.sites.push(mkSite('city', 'player', 1, 1, '北港'), mkSite('city', 'player', 1, 6, '南港'));
  ui();
  beginTurn('player', false);
  assert(!pendingVen('player').some(r => r.id === 'venRoute_player'), '海路无海军保护：不提供路线决策');
  noUi();

  // 有海军（桨帆船在 (2,4)，距水域格 (1,4) 距离 1）
  const navy = mkUnit('galley', 'player', 2, 4);
  game.units.push(navy);
  ui();
  beginTurn('player', false);
  const dec = pendingVen('player').find(r => r.id === 'venRoute_player');
  assert(!!dec, '海路有海军保护：提供路线决策');
  ctx.resolveDecision(dec.id, 'route:0');
  const r = routes()[0];
  assert(!!r && r.data.sea === true, '路线标记为海路');
  eq(r.data.income, 4, '海路 L=6 → 4');
  noUi();
}

// ---------------------------------------------------------------------------
// V6 路线被切断与恢复（income 侧）+ 敌军进入实时标记（beforeMove/siteCaptured）
// ---------------------------------------------------------------------------
console.log('== V6 切断与恢复 ==');
{
  freshGame();
  const cA = mkSite('city', 'player', 2, 2, '城A');
  const cB = mkSite('city', 'player', 5, 5, '城B');
  game.sites.push(cA, cB);
  const nodes = trade.collectNodes(ctx, 'player');
  trade.establishRoute(ctx, 'player', nodes[0], nodes[1]); // (2,2)-(5,5), L=4 → income 3
  eq(routes().length, 1, '直接建立路线成功');
  eq(routes()[0].data.income, 3, 'L=4 → income 3');

  // 敌军单位站在路径中格 (3,3)
  const enemy = mkUnit('militia', 'enemy', 3, 3);
  game.units.push(enemy);
  const p1 = incomeCalc('player', 100);
  eq(p1.amount, 100, '敌军进入路线：收益暂停（+0）');
  eq(routes()[0].data.status, 'disrupted', '路线状态 disrupted');
  assert(game.logs.some(l => l.text.includes('切断')), '威尼斯收到切断提示');

  // 敌军离开 → 恢复
  game.units.splice(game.units.indexOf(enemy), 1);
  const p2 = incomeCalc('player', 100);
  eq(p2.amount, 103, '敌军离开：路线恢复通商（+3）');
  eq(routes()[0].data.status, 'active', '路线状态恢复 active');
  assert(game.logs.some(l => l.text.includes('恢复通商')), '恢复提示日志');
}

console.log('== V6b 敌军进入实时标记（beforeMove / siteCaptured）==');
{
  freshGame();
  const cA = mkSite('city', 'player', 2, 2, '城A');
  const cB = mkSite('city', 'player', 5, 5, '城B');
  game.sites.push(cA, cB);
  const nodes = trade.collectNodes(ctx, 'player');
  trade.establishRoute(ctx, 'player', nodes[0], nodes[1]);
  // 敌军移动到路径格 (3,3)
  const enemy = mkUnit('militia', 'enemy', 3, 4);
  game.units.push(enemy);
  beforeMove(enemy, 3, 4, 3, 3);
  eq(routes()[0].data.status, 'disrupted', 'beforeMove：敌军进入路线立即标记切断');
  // 敌人占领路径上的据点
  const route = routes()[0];
  route.data.status = 'active';
  const ocSite = mkSite('city', 'enemy', 4, 4, '敌占城');
  game.sites.push(ocSite);
  siteCaptured(mkUnit('militia', 'enemy', 4, 4), ocSite);
  eq(routes()[0].data.status, 'disrupted', 'siteCaptured：沿线据点失守立即标记切断');
}

// ---------------------------------------------------------------------------
// V7 端点失效 → 路线移除（城市被占 / 商队死亡）
// ---------------------------------------------------------------------------
console.log('== V7 端点失效移除 ==');
{
  freshGame();
  const cA = mkSite('city', 'player', 2, 2, '城A');
  const cB = mkSite('city', 'player', 5, 5, '城B');
  game.sites.push(cA, cB);
  const nodes = trade.collectNodes(ctx, 'player');
  trade.establishRoute(ctx, 'player', nodes[0], nodes[1]);
  game.sites = game.sites.filter(s => s.id !== cB.id); // 城B 被占领/消失
  const p = incomeCalc('player', 100);
  eq(p.amount, 100, '端点失效：路线无收益');
  eq(routes().length, 0, '端点失效：路线被移除');
  assert(game.logs.some(l => l.text.includes('端点失效')), '移除提示日志');

  // 商队端点死亡
  const cC = mkSite('city', 'player', 1, 1, '城C');
  game.sites.push(cC);
  const caravan = mkUnit('tradeCaravan', 'player', 8, 8);
  game.units.push(caravan);
  const nodes2 = trade.collectNodes(ctx, 'player');
  const pair = nodes2.find(n => n.kind === 'unit');
  trade.establishRoute(ctx, 'player', nodes2[0], pair);
  eq(routes().length, 1, '商队端点路线建立');
  game.units = game.units.filter(u => u.id !== caravan.id); // 商队被击杀
  incomeCalc('player', 100);
  eq(routes().length, 0, '商队死亡：路线被移除');
}

// ---------------------------------------------------------------------------
// V8 威尼斯海上垄断（≥2 港海上 +1 / ≥3 港海上霸权 +2 且陆路 +1）+ 港口半价生产
// ---------------------------------------------------------------------------
console.log('== V8 海上垄断 ==');
{
  freshGame(); // 陆地图即可：海路直接以 facility 数据构造（本测试只验证垄断加成与收入挂载）
  const seaA = mkSite('city', 'player', 0, 0, '海A');
  const seaB = mkSite('city', 'player', 0, 5, '海B');
  game.sites.push(seaA, seaB);
  // 构造海路：L=6（含 5 个水域格）→ 基础收益 4
  ctx.createFacility(trade.TRADE_ROUTE.type, 'player', 0, 0, {
    hp: 1, duration: null,
    data: {
      startNode: { kind: 'site', id: seaA.id, x: 0, y: 0 },
      endNode: { kind: 'site', id: seaB.id, x: 0, y: 5 },
      path: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }],
      income: 4, status: 'active', establishedTurn: 1, sea: true, seaCells: 5,
    },
  });
  const seaRoute = routes()[0];
  eq(seaRoute.data.sea, true, '海路 data.sea 标记');
  eq(seaRoute.data.income, 4, '海路基础收益 4');

  // V8a 0~1 港：无加成
  let p = incomeCalc('player', 100);
  eq(p.amount, 104, '0 港：海上垄断不触发（4）');

  // V8b 2 港：海上路线 +1
  game.sites.push(mkSite('shipyard', 'player', 3, 3, '港一'), mkSite('shipyard', 'player', 4, 4, '港二'));
  p = incomeCalc('player', 100);
  eq(p.amount, 105, '≥2 港：海上路线 +1（4+1）');

  // V8c 3 港：海上霸权（海上 +2、陆路 +1）
  game.sites.push(mkSite('shipyard', 'player', 6, 6, '港三'));
  const landA = mkSite('city', 'player', 8, 1, '陆A');
  const landB = mkSite('city', 'player', 8, 2, '陆B');
  game.sites.push(landA, landB);
  const nodes2 = trade.collectNodes(ctx, 'player');
  const landPair = nodes2.filter(n => n.kind === 'site' && n.id === landA.id || n.kind === 'site' && n.id === landB.id);
  trade.establishRoute(ctx, 'player', landPair[0], landPair[1]); // 陆路 L=2 → income 2
  p = incomeCalc('player', 100);
  eq(p.amount, 109, '≥3 港：海上霸权（海路 4+2 + 陆路 2+1 = 9）');
}

console.log('== V8d 港口半价生产 ==');
{
  freshGame();
  const produced = [];
  const off = ctx.events.on('productionCompleted', (ev) => produced.push(ev));
  game.sites.push(mkSite('shipyard', 'player', 3, 3, '港一'), mkSite('shipyard', 'player', 4, 4, '港二'));
  beginTurn('player', false); // 无头：2 港 + 空闲港口格 → 自动半价生产
  const galley = game.units.find(u => u.type === 'galley' && u.owner === 'player');
  assert(!!galley, '≥2 港口：自动生产桨帆船');
  eq(galley.x, 3, '生产于首个空闲港口（港一）');
  eq(game.goldByOwner.player, 85, '半价生产扣 15 金币（30×0.5）');
  eq(produced.length, 1, 'productionCompleted 广播一次');
  eq(produced[0].kind, 'unit', '广播 kind=unit');
  assert(game.logs.some(l => l.text.includes('海上垄断')), '海上垄断日志');
  off();
}

// ---------------------------------------------------------------------------
// V9 热那亚银行信用（借贷 / 还款 / 冷却 / 再次借贷）
// ---------------------------------------------------------------------------
console.log('== V9 热那亚借贷 ==');
{
  freshGame({ settings: { faction: 'venice', nation: 'genoa' } });
  ui();
  beginTurn('player', false);
  const dec = pendingVen('player').find(r => r.id === 'venLoan_player');
  assert(!!dec, '热那亚产生借贷决策');
  eq(dec.context.options.map(o => o.id).join(','), 'none,loan', '选项：不贷/贷15');
  eq(dec.context.options[0].id, 'none', '第一项必须是不贷（sim fallback 依赖）');
  ctx.resolveDecision(dec.id, 'loan');
  eq(game.goldByOwner.player, 115, '贷款立即 +15');
  noUi();

  // 还款 3 回合：每回合 -6（收入不足则净扣金）
  let p = incomeCalc('player', 10); eq(p.amount, 4, '还款 1：10-6=4');
  p = incomeCalc('player', 0); eq(p.amount, -6, '还款 2：收入 0 时净扣 6');
  p = incomeCalc('player', 0); eq(p.amount, -6, '还款 3：还清');
  eq(game.goldByOwner.player, 107, '贷款 +15 后三回合净金（115+4-6-6=107）');
  eq(trade.debugState().loans[0].active, false, '还款后贷款关闭');
  eq(trade.debugState().loans[0].cooldownLeft, 2, '进入冷却 2 回合');

  // 冷却 2 回合（每 incomeCalculated 递减一次）
  p = incomeCalc('player', 5); eq(p.amount, 5, '冷却 1：收入不再扣款'); eq(trade.debugState().loans[0].cooldownLeft, 1, 'cooldown 2→1');
  p = incomeCalc('player', 5); eq(p.amount, 5, '冷却 2'); eq(trade.debugState().loans[0].cooldownLeft, 0, 'cooldown 1→0');

  // 冷却结束：可再次借贷
  ui();
  beginTurn('player', false);
  const dec2 = pendingVen('player').find(r => r.id === 'venLoan_player');
  assert(!!dec2, '冷却结束：借贷决策再次出现');
  ctx.resolveDecision(dec2.id, 'loan');
  eq(trade.debugState().loans[0].totalTaken, 2, '第二次贷款（上限 3 次）');
  noUi();
}

// ---------------------------------------------------------------------------
// V10 拉古萨中立商港（条件 / 收入 / 节点 / 摧毁 / 重占）
// ---------------------------------------------------------------------------
console.log('== V10 拉古萨交易港 ==');
{
  freshGame({ settings: { faction: 'venice', nation: 'ragusa' } });
  const enemyPort = mkSite('shipyard', 'enemy', 3, 3, '敌国港');
  game.sites.push(enemyPort);

  // 无商队：不提供决策
  ui();
  beginTurn('player', false);
  assert(!pendingVen('player').some(r => r.id === 'venPort_player'), '无商队进入：不提供商港决策');
  noUi();

  // 商队进入（相邻）
  const caravan = mkUnit('ragusaCaravan', 'player', 3, 2);
  game.units.push(caravan);
  ui();
  beginTurn('player', false);
  const dec = pendingVen('player').find(r => r.id === 'venPort_player');
  assert(!!dec, '商队进入敌方港口：提供商港决策');
  eq(dec.context.options.map(o => o.id).join(','), 'none,port:0', '选项：不转化/转化');
  ctx.resolveDecision(dec.id, 'port:0');
  eq(ports().length, 1, '交易港设施建立');
  eq(ports()[0].hp, 6, '交易港耐久 6');
  noUi();

  // 收入 +2 + 作为贸易节点
  const p = incomeCalc('player', 100);
  eq(p.amount, 102, '交易港每回合 +2');
  const nodeKinds = trade.collectNodes(ctx, 'player').map(n => n.kind);
  assert(nodeKinds.includes('facility'), '交易港成为贸易节点');
  assert(trade.routeCandidates(ctx, 'player').length >= 1, '交易港可参与路线候选');

  // 敌军重占港口格 → 交易港关闭
  const occupier = mkUnit('militia', 'enemy', 3, 3);
  game.units.push(occupier);
  incomeCalc('player', 100);
  eq(ports().length, 0, '敌军重占港口格：交易港关闭');
  assert(game.logs.some(l => l.text.includes('失效')), '交易港关闭日志');
}

console.log('== V10b 交易港可被攻击摧毁 ==');
{
  freshGame({ settings: { faction: 'venice', nation: 'ragusa' } });
  ctx.createFacility(trade.TRADING_PORT.type, 'player', 3, 3, { hp: trade.TRADING_PORT.hp });
  const defender = mkUnit('militia', 'player', 3, 3);
  const attacker = mkUnit('militia', 'enemy', 3, 4);
  game.units.push(defender, attacker);
  afterAttack(attacker, defender, 4);
  eq(ports()[0].hp, 4, '伤害 4 → 交易港耐久 -2（50%）');
  afterAttack(attacker, defender, 8);
  eq(ports().length, 0, '耐久归零：交易港被摧毁');
  assert(game.logs.some(l => l.text.includes('摧毁')), '摧毁日志');
}

// ---------------------------------------------------------------------------
// V11 雇佣兵市场（×1.5 成本 / 每回合一次 / 无市场不请求）
// ---------------------------------------------------------------------------
console.log('== V11 雇佣兵 ==');
{
  freshGame();
  game.sites.push(mkSite('city', 'player', 2, 2, '威尼斯城'));
  ui();
  beginTurn('player', false);
  const dec = pendingVen('player').find(r => r.id === 'venMerc_player');
  assert(!!dec, '有市场格时产生雇佣兵决策');
  eq(dec.context.options.map(o => o.id).join(','), 'none,merc:spearman,merc:crossbow,merc:catapult', '选项：不购买/长枪兵/弩手/投石车');
  eq(dec.context.options[0].id, 'none', '第一项必须是不购买（sim fallback 依赖）');

  ctx.resolveDecision(dec.id, 'merc:spearman');
  const sp = game.units.find(u => u.type === 'spearman' && u.owner === 'player');
  assert(!!sp && sp.x === 2 && sp.y === 2, '雇佣长枪兵部署于市场格');
  eq(game.goldByOwner.player, 61, '长枪兵 ×1.5：26→39（100-39）');
  assert(trade.requestMercenaryDecision(ctx, 'player') === null, '同一回合不再请求第二次购买');
  noUi();

  // 市场格被占（换回合）→ 不再请求
  ui();
  game.turn = 2;
  beginTurn('player', false);
  assert(!pendingVen('player').some(r => r.id === 'venMerc_player'), '市场格被占用：不再请求雇佣兵');
  noUi();
}

// ---------------------------------------------------------------------------
// V12 跨局重置（syncGameRef：换局后借贷状态清零）
// ---------------------------------------------------------------------------
console.log('== V12 跨局重置 ==');
{
  freshGame({ settings: { faction: 'venice', nation: 'genoa' } });
  trade.resolveLoanChoice(ctx, 'player', 'loan');
  eq(game.goldByOwner.player, 115, 'V12 借贷生效');
  eq(trade.debugState().loans.length, 1, 'V12 有贷款记录');

  freshGame({ settings: { faction: 'venice', nation: 'genoa' } }); // 新 game 对象 = 换局
  beginTurn('player', false);
  eq(trade.debugState().loans.length, 0, '换局后贷款状态清零');
  const p = incomeCalc('player', 10);
  eq(p.amount, 10, '换局后不再还款');
}

// ---------------------------------------------------------------------------
// V13 其他 owner / 盟友不受影响
// ---------------------------------------------------------------------------
console.log('== V13 owner 隔离 ==');
{
  freshGame();
  game.sites.push(mkSite('city', 'player', 2, 2, '城A'), mkSite('city', 'player', 5, 5, '城B'));
  const nodes = trade.collectNodes(ctx, 'player');
  trade.establishRoute(ctx, 'player', nodes[0], nodes[1]);
  const p = incomeCalc('enemy', 40);
  eq(p.amount, 40, '敌人收入不受威尼斯路线影响');
  // 敌方移动不崩、不误标己方路线
  const enemy = mkUnit('militia', 'enemy', 9, 9);
  game.units.push(enemy);
  beforeMove(enemy, 9, 9, 8, 8);
  eq(routes()[0].data.status, 'active', '敌军未进入路径：路线保持 active');
}

// ---------------------------------------------------------------------------
const ok = failed === 0;
console.log(ok ? '\nALL PASS' : `\nFAILED: ${failed}`);
process.exit(ok ? 0 : 1);
