// __harness_hre.mjs —— 临时自测文件（主对话接线后删除）。
// 验证：非神罗局零变化 / 决策 fallback / 三种工事建造与效果 / 阵线检测 / 4个兵种联动 /
//       木栅移动税 / 工事受击摧毁 / 工事过期。
// 运行：node src/factions/hre/__harness_hre.mjs
import { createFactionContext } from '../factionContext.js';
import { factionRegistry } from '../factionRegistry.js';
import { facilitySystem } from '../../core/facility.js';
import { statusSystem } from '../../core/status.js';
import { decisionSystem } from '../../core/decision.js';
import { TYPES, TERRAIN } from '../../core/constants.js';
import * as fort from './fortification.js';
import { hreSystem } from './hreRules.js';

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
function mkUnit(type, owner, x, y, over = {}) {
  const m = TYPES[type];
  return {
    id: `u${uid++}`, type, owner, x, y,
    hp: m.hp, maxHp: m.hp, move: m.move, maxMove: m.move, baseMove: m.move,
    acted: false, hasAttacked: false, lastAttacked: false, kills: 0, rank: 0,
    cargo: m.transport ? [] : null, ...over,
  };
}

let game = null;

function freshGame(overrides = {}) {
  facilitySystem.clear();
  statusSystem.clear();
  decisionSystem.clear();
  game = {
    w: 10, h: 10,
    terrain: Array.from({ length: 10 }, () => Array(10).fill('plain')),
    units: [], sites: [], ownerOrder: ['player', 'ai0', 'enemy'], currentIndex: 0,
    side: 'player', turn: 1, logs: [], selected: null, over: false,
    teams: { player: 'A', ai0: 'A', enemy: 'B' },
    aiProfiles: { ai0: { faction: 'ming', nation: 'mingCore' }, enemy: { faction: 'ming', nation: 'mingCore' } },
    goldByOwner: { player: 100, ai0: 100, enemy: 100 },
    settings: { faction: 'hre', nation: 'austria' },
    ...overrides,
  };
  return game;
}

const deps = {
  gameRef: () => game,
  getUnit: (x, y) => game.units.find(u => u.x === x && u.y === y) || null,
  getSite: (x, y) => game.sites.find(s => s.x === x && s.y === y) || null,
  typeMeta: (t) => TYPES[t] || null,
  terrainMeta: (k) => TERRAIN[k],
  ownerFaction: (o) => (o === 'player' ? game.settings.faction : (game.aiProfiles[o] ? game.aiProfiles[o].faction : undefined)),
  ownerNation: (o) => (o === 'player' ? game.settings.nation : (game.aiProfiles[o] ? game.aiProfiles[o].nation : undefined)),
  log: (text, kind) => { game.logs.push({ text, kind }); console.log('[log]', text); },
  addGold: (owner, amount) => { game.goldByOwner[owner] = (game.goldByOwner[owner] || 0) + amount; },
  spendGold: (owner, amount) => {
    if ((game.goldByOwner[owner] || 0) < amount) return false;
    game.goldByOwner[owner] -= amount;
    return true;
  },
};

const ctx = createFactionContext(deps);
factionRegistry.register('hre', hreSystem, ctx);

function turnStart(owner, initial = false) {
  ctx.events.emit('turnStart', { owner, initial });
}
function beforeAttack(attacker, defender, damage, extra = {}) {
  const payload = {
    attacker, defender,
    fromCell: { x: attacker.x, y: attacker.y }, toCell: { x: defender.x, y: defender.y },
    result: { damage, counter: 0 }, isCounter: false, cancel: false, ...extra,
  };
  ctx.events.emit('beforeAttack', payload);
  return payload;
}
function afterAttack(attacker, defender, damage) {
  ctx.events.emit('afterAttack', { attacker, defender, result: { damage, counter: 0 } });
}
function beforeMove(unit, fx, fy, tx, ty) {
  const payload = { unit, from: { x: fx, y: fy }, to: { x: tx, y: ty }, cancel: false };
  ctx.events.emit('beforeMove', payload);
  return payload;
}
function facAt(x, y) { return facilitySystem.getFacilityAt(x, y); }

// ---------------------------------------------------------------------------
// G1 非神罗局零变化
// ---------------------------------------------------------------------------
console.log('== G1 非神罗局零变化 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const atk = mkUnit('qiArmy', 'player', 2, 2);
  const def = mkUnit('qiArmy', 'enemy', 2, 3);
  game.units.push(atk, def);
  turnStart('player');
  eq(facilitySystem.getAll().length, 0, '非神罗局不产生工事');
  eq(game.goldByOwner.player, 100, '非神罗局金币不变');
  const p = beforeAttack(atk, def, 10);
  eq(p.result.damage, 10, '非神罗局 beforeAttack 伤害不变');
}

// ---------------------------------------------------------------------------
// G2 决策 fallback：无头环境自动选"不建"，零行为变化
// ---------------------------------------------------------------------------
console.log('== G2 决策 fallback（无头 auto 不建）==');
{
  freshGame();
  const u = mkUnit('heavyInfantry', 'player', 3, 3);
  game.units.push(u);
  turnStart('player', false);
  eq(facilitySystem.getAll().length, 0, 'fallback 不建：无工事');
  eq(game.goldByOwner.player, 100, 'fallback 不建：金币不变');
  eq(u.acted, false, 'fallback 不建：单位未消耗行动');
  eq(decisionSystem.getPendingDecisions('player').length, 0, 'fallback 自动解析，无滞留决策');
}

// ---------------------------------------------------------------------------
// G3 建造决策（UI 模式）：木栅/壕沟/石堡 + 石堡限制 + 不建
// ---------------------------------------------------------------------------
console.log('== G3 建造决策（模拟 UI 解析）==');
{
  freshGame({ goldByOwner: { player: 200, ai0: 100, enemy: 100 } });
  game.sites.push({ id: 's1', kind: 'city', owner: 'player', x: 5, y: 3, name: '维也纳', tier: 1, income: 10 });
  const A = mkUnit('heavyInfantry', 'player', 3, 3);
  const B = mkUnit('pikeSquare', 'player', 7, 7);   // 远离据点 → 不可建石堡
  const C = mkUnit('imperialCrossbow', 'player', 4, 4);
  const D = mkUnit('prussianGrenadier', 'player', 6, 3); // 距城市1格 → 可建石堡
  game.units.push(A, B, C, D);

  globalThis.document = {};
  globalThis.window = {};
  turnStart('player', false); // UI 模式：决策滞留 pending
  const pending = decisionSystem.getPendingDecisions('player');
  eq(pending.length, 4, `4 个单位均有建造决策 (got ${pending.length})`);

  const dec = (unitId) => pending.find(r => r.context.unitId === unitId);
  eq(dec(A.id).context.options.map(o => o.id).join(','), 'none,palisade,trench,stoneFort', 'A 选项：不建/木栅/壕沟/石堡');
  eq(dec(B.id).context.options.map(o => o.id).join(','), 'none,palisade,trench', 'B 远离据点：无石堡选项');
  eq(dec(B.id).context.options[0].id, 'none', '第一项必须是不建（sim fallback 依赖）');

  ctx.resolveDecision(dec(A.id).id, 'palisade');
  let f = facAt(3, 3);
  assert(!!f && f.type === 'palisade', 'A 建木栅成功');
  eq(game.goldByOwner.player, 188, 'A 木栅扣 12 金币');
  eq(A.acted, true, 'A 已行动');
  eq(A.move, 0, 'A 移动归零');
  eq(A.hasAttacked, true, 'A 本回合不能再攻击');
  assert(game.logs.some(l => l.text.includes('木栅')), '日志记录木栅建立');

  ctx.resolveDecision(dec(C.id).id, 'trench');
  f = facAt(4, 4);
  assert(!!f && f.type === 'trench', 'C 建壕沟成功');
  eq(game.goldByOwner.player, 170, 'C 壕沟扣 18 金币');
  eq(facAt(4, 4).duration, 8, '壕沟持续 8 回合');

  ctx.resolveDecision(dec(D.id).id, 'stoneFort');
  f = facAt(6, 3);
  assert(!!f && f.type === 'stoneFort', 'D 建石堡成功');
  eq(game.goldByOwner.player, 134, 'D 石堡扣 36 金币');
  eq(facAt(6, 3).duration, null, '石堡不过期');
  eq(facAt(6, 3).hp, 30, '石堡耐久 30');

  ctx.resolveDecision(dec(B.id).id, 'none');
  assert(!facAt(7, 7), 'B 选择不建：无工事');
  eq(game.goldByOwner.player, 134, 'B 不建：金币不变');
  eq(B.acted, false, 'B 不建：未消耗行动');

  delete globalThis.document;
  delete globalThis.window;
}

// ---------------------------------------------------------------------------
// G4 木栅效果（神罗步兵+2；重甲坚守+2；对骑兵额外+1；骑兵驻守无效）
// ---------------------------------------------------------------------------
console.log('== G4 木栅效果 ==');
{
  freshGame();
  ctx.createFacility('palisade', 'player', 3, 3, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 4, 4, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 5, 5, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 6, 6, { hp: 8, duration: 5 });
  const defX = mkUnit('imperialCrossbow', 'player', 3, 3);
  const defH = mkUnit('heavyInfantry', 'player', 4, 4);
  const defH2 = mkUnit('heavyInfantry', 'player', 5, 5);
  const defK = mkUnit('austrianKnight', 'player', 6, 6); // 骑兵，不算步兵
  const atk1 = mkUnit('qiArmy', 'enemy', 3, 4);
  const atk2 = mkUnit('qiArmy', 'enemy', 4, 5);
  const atk3 = mkUnit('mingCavalry', 'enemy', 5, 6, { move: 5, maxMove: 5 });
  const atk4 = mkUnit('mingCavalry', 'enemy', 6, 7, { move: 5, maxMove: 5 });
  game.units.push(defX, defH, defH2, defK, atk1, atk2, atk3, atk4);

  eq(beforeAttack(atk1, defX, 10).result.damage, 8, '木栅：神罗步兵防御+2');
  eq(beforeAttack(atk2, defH, 10).result.damage, 6, '重甲坚守：木栅+2 坚守+2');
  eq(beforeAttack(atk3, defH2, 10).result.damage, 5, '重甲被骑兵攻击：再+1');
  eq(beforeAttack(atk4, defK, 10).result.damage, 10, '骑兵驻守木栅无效');
}

// ---------------------------------------------------------------------------
// G5 木栅移动税（敌军+1；付不起则阻止；神罗/同盟不受影响）
// ---------------------------------------------------------------------------
console.log('== G5 木栅移动税 ==');
{
  freshGame();
  ctx.createFacility('palisade', 'player', 3, 3, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 5, 3, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 7, 3, { hp: 8, duration: 5 });
  ctx.createFacility('palisade', 'player', 9, 3, { hp: 8, duration: 5 });
  const e1 = mkUnit('militia', 'enemy', 3, 4, { move: 2, maxMove: 2 });
  const e2 = mkUnit('militia', 'enemy', 5, 4, { move: 1, maxMove: 1 });
  const h1 = mkUnit('militia', 'player', 7, 4, { move: 2, maxMove: 2 });
  const a1 = mkUnit('militia', 'ai0', 9, 4, { move: 2, maxMove: 2 }); // 同盟非神罗
  game.units.push(e1, e2, h1, a1);

  const p1 = beforeMove(e1, 3, 4, 3, 3);
  eq(e1.move, 1, '敌军进入木栅 +1 移动（2→1）');
  eq(p1.cancel, false, '付得起：移动正常放行');

  const p2 = beforeMove(e2, 5, 4, 5, 3);
  eq(p2.cancel, true, '敌军移动不足：无法进入木栅');
  eq(e2.move, 1, '被阻止单位保留剩余移动');

  const p3 = beforeMove(h1, 7, 4, 7, 3);
  eq(h1.move, 2, '神罗单位进己方木栅不扣移动');
  eq(p3.cancel, false, '神罗单位正常放行');

  const p4 = beforeMove(a1, 9, 4, 9, 3);
  eq(a1.move, 2, '同盟单位进木栅不扣移动');
  eq(p4.cancel, false, '同盟单位正常放行');
}

// ---------------------------------------------------------------------------
// G6 壕沟效果（冲锋-2 最低0；第一轮攻击-2；回合刷新）
// ---------------------------------------------------------------------------
console.log('== G6 壕沟效果 ==');
{
  freshGame();
  ctx.createFacility('trench', 'player', 3, 3, { hp: 12, duration: 8 });
  const def = mkUnit('imperialCrossbow', 'player', 3, 3);
  const cav = mkUnit('mingCavalry', 'enemy', 3, 4, { move: 5, maxMove: 5 });
  const cav2 = mkUnit('mingCavalry', 'enemy', 3, 4, { move: 0, maxMove: 5, acted: true }); // 非冲锋
  game.units.push(def, cav, cav2);

  eq(beforeAttack(cav, def, 10).result.damage, 6, '壕沟：第一轮-2 + 冲锋-2 = 10-4');
  eq(beforeAttack(cav, def, 10).result.damage, 8, '壕沟：第二轮仅冲锋-2');
  turnStart('player', false);
  eq(beforeAttack(cav2, def, 10).result.damage, 8, '新回合：第一轮-2（非冲锋）');

  const tiny = mkUnit('militia', 'enemy', 4, 4);
  game.units.push(tiny);
  eq(beforeAttack(tiny, def, 1).result.damage, 1, '伤害最低为 1（不归零）');
}

// ---------------------------------------------------------------------------
// G7 石堡效果（驻守+4；相邻远程+2；非相邻无效；补给回血+1）
// ---------------------------------------------------------------------------
console.log('== G7 石堡效果 ==');
{
  freshGame();
  ctx.createFacility('stoneFort', 'player', 3, 3, { hp: 30, duration: null });
  ctx.createFacility('stoneFort', 'player', 5, 3, { hp: 30, duration: null });
  const guard = mkUnit('imperialGuard', 'player', 3, 3);
  const xbow = mkUnit('imperialCrossbow', 'player', 5, 4);
  const xbowFar = mkUnit('imperialCrossbow', 'player', 8, 8);
  const pike = mkUnit('pikeSquare', 'player', 5, 4, { hp: 5 });
  const militia = mkUnit('militia', 'player', 9, 9, { hp: 4 });
  const atk = mkUnit('qiArmy', 'enemy', 3, 4);
  const atk2 = mkUnit('qiArmy', 'enemy', 5, 5);
  const atk3 = mkUnit('qiArmy', 'enemy', 8, 9);
  game.units.push(guard, xbow, xbowFar, pike, militia, atk, atk2, atk3);

  eq(beforeAttack(atk, guard, 10).result.damage, 6, '石堡：驻守防御+4');
  eq(beforeAttack(atk2, xbow, 10).result.damage, 8, '石堡：相邻远程防御+2');
  eq(beforeAttack(atk3, xbowFar, 10).result.damage, 10, '石堡：非相邻无效');

  turnStart('player', false);
  eq(pike.hp, 6, '石堡补给：相邻单位回血+1');
  eq(militia.hp, 4, '远离石堡不回血');
}

// ---------------------------------------------------------------------------
// G8 阵线检测（3连/孤岛/据点链/断开回退/回血/状态）
// ---------------------------------------------------------------------------
console.log('== G8 阵线检测 ==');
{
  freshGame();
  const f1 = ctx.createFacility('palisade', 'player', 3, 3, { hp: 8, duration: 5 });
  const f2 = ctx.createFacility('palisade', 'player', 4, 3, { hp: 8, duration: 5 });
  const f3 = ctx.createFacility('palisade', 'player', 5, 3, { hp: 8, duration: 5 });
  const iso = ctx.createFacility('palisade', 'player', 8, 8, { hp: 8, duration: 5 });
  const h = mkUnit('heavyInfantry', 'player', 4, 3, { hp: 10 });
  game.units.push(h);

  turnStart('player', false);
  eq(f1.data.frontlined, true, '3连木栅：阵线稳定');
  eq(f2.data.frontlined, true, '3连木栅：阵线稳定');
  eq(f3.data.frontlined, true, '3连木栅：阵线稳定');
  eq(iso.data.frontlined, false, '孤岛木栅：非阵线');
  eq(f1.maxHp, 10, '阵线工事耐久+20%（8→10）');
  eq(iso.maxHp, 8, '孤岛工事耐久不变');
  eq(h.hp, 11, '阵线上驻守单位回血+1');
  eq(ctx.hasStatus(h.id, 'frontline'), true, '阵线上单位获得 frontline 状态');

  facilitySystem.removeFacility(f2.id);
  turnStart('player', false);
  eq(f1.data.frontlined, false, '断开后：阵线失效');
  eq(f3.data.frontlined, false, '断开后：阵线失效');
  eq(f1.maxHp, 8, '断开后：耐久回退');
  eq(ctx.hasStatus(h.id, 'frontline'), false, '断开后：状态移除');

  // 据点链：工事—城市—工事 = 3 节点
  const c1 = ctx.createFacility('palisade', 'player', 2, 6, { hp: 8, duration: 5 });
  const c2 = ctx.createFacility('palisade', 'player', 4, 6, { hp: 8, duration: 5 });
  game.sites.push({ id: 's2', kind: 'city', owner: 'player', x: 3, y: 6, name: '布拉格', tier: 1, income: 10 });
  turnStart('player', false);
  eq(c1.data.frontlined, true, '据点链：工事—城市—工事 阵线稳定');
  eq(c2.data.frontlined, true, '据点链：另一侧工事阵线稳定');
}

// ---------------------------------------------------------------------------
// G9 兵种联动（方阵/皇家守护/攻城塔）
// ---------------------------------------------------------------------------
console.log('== G9 兵种联动 ==');
{
  // 方阵
  freshGame();
  const pike = mkUnit('pikeSquare', 'player', 3, 3);
  const buddy = mkUnit('militia', 'player', 4, 3);
  const atk = mkUnit('qiArmy', 'enemy', 3, 4);
  const atk2 = mkUnit('qiArmy', 'enemy', 3, 4);
  game.units.push(pike, buddy, atk, atk2);
  eq(beforeAttack(atk, pike, 10).result.damage, 8, '方阵：第一次近战伤害-2');
  eq(beforeAttack(atk2, pike, 10).result.damage, 10, '方阵：第二次无减伤');
  const lone = mkUnit('pikeSquare', 'player', 7, 7);
  const atk3 = mkUnit('qiArmy', 'enemy', 7, 8);
  game.units.push(lone, atk3);
  eq(beforeAttack(atk3, lone, 10).result.damage, 10, '方阵：无相邻友军步兵不触发');

  // 皇家守护
  freshGame();
  game.sites.push({ id: 's3', kind: 'city', owner: 'player', x: 4, y: 3, name: '纽伦堡', tier: 1, income: 10 });
  const guard = mkUnit('imperialGuard', 'player', 4, 3);
  const near = mkUnit('imperialCrossbow', 'player', 3, 3);
  const far = mkUnit('imperialCrossbow', 'player', 6, 3);
  const same = mkUnit('heavyInfantry', 'player', 4, 3); // 与守卫同格（非方阵，避免方阵减伤干扰）
  const e1 = mkUnit('qiArmy', 'enemy', 3, 4);
  const e2 = mkUnit('qiArmy', 'enemy', 6, 4);
  const e3 = mkUnit('qiArmy', 'enemy', 4, 4);
  game.units.push(guard, near, far, same, e1, e2, e3);
  eq(beforeAttack(e1, near, 10).result.damage, 9, '皇家守护：相邻单位防御+1');
  eq(beforeAttack(e2, far, 10).result.damage, 10, '皇家守护：2格外无效');
  eq(beforeAttack(e3, same, 10).result.damage, 9, '皇家守护：同格单位防御+1');

  // 攻城塔
  freshGame();
  game.sites.push({ id: 's4', kind: 'city', owner: 'enemy', x: 3, y: 3, name: '敌城', tier: 1, income: 10 });
  const tower = mkUnit('siegeTower', 'player', 3, 4);
  const garrison = mkUnit('militia', 'enemy', 3, 3);
  const field = mkUnit('militia', 'enemy', 6, 6);
  game.units.push(tower, garrison, field);
  eq(beforeAttack(tower, garrison, 10).result.damage, 12, '攻城塔：据点战驻军防御-2');
  eq(beforeAttack(tower, field, 10).result.damage, 10, '攻城塔：非据点战无加成');
}

// ---------------------------------------------------------------------------
// G10 工事受击摧毁（敌方攻击按伤害50%破坏；同盟攻击不破坏）
// ---------------------------------------------------------------------------
console.log('== G10 工事受击摧毁 ==');
{
  freshGame();
  const pal = ctx.createFacility('palisade', 'player', 3, 3, { hp: 8, duration: 5 });
  const pal2 = ctx.createFacility('palisade', 'player', 6, 3, { hp: 8, duration: 5 });
  const def = mkUnit('heavyInfantry', 'player', 3, 3);
  const def2 = mkUnit('heavyInfantry', 'player', 6, 3);
  const atk = mkUnit('qiArmy', 'enemy', 3, 4);
  const allyAtk = mkUnit('qiArmy', 'ai0', 6, 4);
  game.units.push(def, def2, atk, allyAtk);

  afterAttack(atk, def, 10);
  eq(facAt(3, 3).hp, 3, '工事受损：10×50%=5（8→3）');
  afterAttack(atk, def, 10);
  assert(!facAt(3, 3), '工事被摧毁');
  assert(game.logs.some(l => l.text.includes('摧毁')), '日志记录工事摧毁');

  afterAttack(allyAtk, def2, 10);
  eq(facAt(6, 3).hp, 8, '同盟攻击不破坏工事');
}

// ---------------------------------------------------------------------------
// G11 工事过期
// ---------------------------------------------------------------------------
console.log('== G11 工事过期 ==');
{
  freshGame();
  ctx.createFacility('palisade', 'player', 3, 3, { hp: 8, duration: 5 });
  for (let i = 1; i <= 5; i++) turnStart('player', false);
  assert(!facAt(3, 3), '木栅 5 回合后过期移除');
  ctx.createFacility('stoneFort', 'player', 4, 4, { hp: 30, duration: null });
  for (let i = 1; i <= 5; i++) turnStart('player', false);
  assert(!!facAt(4, 4), '石堡永不过期');
}

// ---------------------------------------------------------------------------
// G12 可建造单位判定（骑兵不可建）
// ---------------------------------------------------------------------------
console.log('== G12 建造资格 ==');
{
  freshGame();
  const knight = mkUnit('austrianKnight', 'player', 3, 3);
  const inf = mkUnit('heavyInfantry', 'player', 5, 5);
  game.units.push(knight, inf);
  eq(fort.isBuilderUnit(ctx, knight), false, '骑兵不可建造工事');
  eq(fort.isBuilderUnit(ctx, inf), true, '神罗步兵可建造工事');
  eq(fort.buildOptionsFor(ctx, knight).length, 1, '骑兵只有"不建"选项');
}

// ---------------------------------------------------------------------------
const ok = failed === 0;
console.log(ok ? '\nALL PASS' : `\nFAILED: ${failed}`);
process.exit(ok ? 0 : 1);
