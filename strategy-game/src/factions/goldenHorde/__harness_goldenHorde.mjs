// __harness_goldenHorde.mjs —— 临时自测文件（主对话接线后删除）。
// 验证：非金帐局零变化 / 决策 fallback / 掠袭收益（普通/高等级/商队/据点/raided翻倍/未击杀）/
//       raided 标记与生命周期（turns=3 全量 tick 时序）/ raided 移动-1 /
//       营地建造/维护/过期/生产（createUnit+productionCompleted 广播）/迁移 / raidPower 兵种联动。
// 运行：node src/factions/goldenHorde/__harness_goldenHorde.mjs
import { createFactionContext } from '../factionContext.js';
import { factionRegistry } from '../factionRegistry.js';
import { facilitySystem } from '../../core/facility.js';
import { statusSystem } from '../../core/status.js';
import { decisionSystem } from '../../core/decision.js';
import { TYPES, TERRAIN } from '../../core/constants.js';
import * as raid from './raiding.js';
import * as camp from './nomadCamp.js';
import { goldenHordeSystem } from './goldenHordeRules.js';

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
    units: [], sites: [], ownerOrder: ['player', 'enemy'], currentIndex: 0,
    side: 'player', turn: 1, logs: [], selected: null, over: false,
    teams: { player: 'A', enemy: 'B' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'mingCore' } },
    goldByOwner: { player: 100, enemy: 100 },
    settings: { faction: 'goldenHorde', nation: 'goldenHordeCore' },
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
  createUnit: (type, owner, x, y) => {
    const u = mkUnit(type, owner, x, y);
    game.units.push(u);
    return u;
  },
};

const ctx = createFactionContext(deps);
factionRegistry.register('goldenHorde', goldenHordeSystem, ctx);

// 模拟 main.js 接线（v1.2 GH-03）：beginTurn 开头全量 tick，再 emit turnStart
function beginTurn(owner, initial = false) {
  statusSystem.tickStatuses(game.units.map(u => u.id));
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
function afterAttack(attacker, defender, damage, defenderDead, extra = {}) {
  ctx.events.emit('afterAttack', { attacker, defender, result: { damage, counter: 0 }, defenderDead, attackerDead: false, ...extra });
}
function beforeMove(unit, fx, fy, tx, ty) {
  const payload = { unit, from: { x: fx, y: fy }, to: { x: tx, y: ty }, cancel: false };
  ctx.events.emit('beforeMove', payload);
  return payload;
}
const facAt = (x, y) => facilitySystem.getFacilityAt(x, y);

// ---------------------------------------------------------------------------
// G1 非金帐局零变化
// ---------------------------------------------------------------------------
console.log('== G1 非金帐局零变化 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const atk = mkUnit('qiArmy', 'player', 2, 2);
  const def = mkUnit('qiArmy', 'enemy', 2, 3);
  game.units.push(atk, def);
  beginTurn('player');
  afterAttack(atk, def, 10, false);
  eq(game.goldByOwner.player, 100, '非金帐局攻击不产生金币');
  eq(ctx.hasStatus(def.id, raid.RAIDED_KEY), false, '非金帐局不产生 raided');
  eq(facilitySystem.getAll().length, 0, '非金帐局无营地');
}

// ---------------------------------------------------------------------------
// G2 决策 fallback：无头环境自动选第一项（不建/维持），零行为变化
// ---------------------------------------------------------------------------
console.log('== G2 决策 fallback（无头 auto 不建/维持）==');
{
  freshGame();
  const u = mkUnit('lightCavalry', 'player', 3, 3);
  game.units.push(u);
  beginTurn('player', false);
  eq(facilitySystem.getAll().length, 0, 'fallback 不建：无营地');
  eq(game.goldByOwner.player, 100, 'fallback 不建：金币不变');
  eq(u.acted, false, 'fallback 不建：单位未消耗行动');
  eq(decisionSystem.getPendingDecisions('player').length, 0, 'fallback 自动解析，无滞留决策');
}

// ---------------------------------------------------------------------------
// G3 掠袭击杀收益（普通/高等级/商队/据点/raided 翻倍）
// ---------------------------------------------------------------------------
console.log('== G3 掠袭击杀收益 ==');
{
  freshGame();
  // G3a 普通击杀：fastGalley(move5,lv1 → rp1) 杀 militia → 3+1=4
  const a1 = mkUnit('fastGalley', 'player', 2, 2);
  const d1 = mkUnit('militia', 'enemy', 2, 3);
  game.units.push(a1, d1);
  afterAttack(a1, d1, 10, true);
  eq(game.goldByOwner.player, 104, 'G3a 普通击杀 +4（3 基础 + 1 机动）');

  // G3b 高等级击杀：hordeCavalry(move5,lv3 → rp2) 杀 battleship(lv3) → 5+2=7
  const a2 = mkUnit('hordeCavalry', 'player', 4, 4);
  const d2 = mkUnit('battleship', 'enemy', 4, 5);
  game.units.push(a2, d2);
  afterAttack(a2, d2, 10, true);
  eq(game.goldByOwner.player, 111, 'G3b 高等级击杀 +7（5 精英 + 2 机动/等级）');

  // G3c 商队击杀：lightCavalry(move6,lv1 → rp1) 杀 ragusaCaravan(trade) → 6+1=7
  const a3 = mkUnit('lightCavalry', 'player', 6, 6);
  const d3 = mkUnit('ragusaCaravan', 'enemy', 6, 7);
  game.units.push(a3, d3);
  afterAttack(a3, d3, 10, true);
  eq(game.goldByOwner.player, 118, 'G3c 商队击杀 +7（6 商队 + 1 机动）');

  // G3d 据点袭击：hordeCavalry 杀站在敌方城市格上的 militia → 3+4+2=9
  game.sites.push({ id: 's1', kind: 'city', owner: 'enemy', x: 8, y: 3, name: '敌城', tier: 1, income: 10 });
  const a4 = mkUnit('hordeCavalry', 'player', 8, 2);
  const d4 = mkUnit('militia', 'enemy', 8, 3);
  game.units.push(a4, d4);
  afterAttack(a4, d4, 10, true);
  eq(game.goldByOwner.player, 127, 'G3d 据点守军击杀 +9（3 基础 + 4 据点 + 2 机动/等级）');

  // G3e raided 翻倍：lightCavalry 杀带 raided 的 militia → (3+1)*2=8
  ctx.addStatus(d1.id, raid.RAIDED_KEY, raid.RAIDED_TURNS);
  afterAttack(a1, d1, 10, true);
  eq(game.goldByOwner.player, 135, 'G3e raided 翻倍 +8（(3+1)×2）');

  // G3f 未击杀：不给金币，打上 raided
  const a5 = mkUnit('lightCavalry', 'player', 5, 5);
  const d5 = mkUnit('militia', 'enemy', 5, 6);
  game.units.push(a5, d5);
  afterAttack(a5, d5, 5, false);
  eq(game.goldByOwner.player, 135, 'G3f 未击杀不给金币');
  eq(ctx.hasStatus(d5.id, raid.RAIDED_KEY), true, 'G3f 未击杀打上 raided 标记');
}

// ---------------------------------------------------------------------------
// G4 raided 标记与生命周期（turns=3，全量 tick 时序）
// ---------------------------------------------------------------------------
console.log('== G4 raided 生命周期 ==');
{
  freshGame();
  const atk = mkUnit('lightCavalry', 'player', 2, 2);
  const def = mkUnit('militia', 'enemy', 2, 3);
  game.units.push(atk, def);
  afterAttack(atk, def, 5, false);
  eq(statusSystem.getStatus(def.id, raid.RAIDED_KEY).turns, 3, 'raided 初始 turns=3');

  beginTurn('enemy', false); // 敌方回合 tick → 2（移动-1 覆盖敌方 1 个完整回合）
  eq(statusSystem.getStatus(def.id, raid.RAIDED_KEY).turns, 2, '敌方回合后 turns=2');

  beginTurn('player', false); // 金帐回合 tick → 1（攻击时额外收益仍生效）
  eq(statusSystem.getStatus(def.id, raid.RAIDED_KEY).turns, 1, '金帐回合后 turns=1');
  afterAttack(atk, def, 10, true);
  eq(game.goldByOwner.player, 108, '金帐下轮击杀带 raided 目标翻倍（(3+1)×2=8）');

  beginTurn('enemy', false); // 再一轮 tick → 0 移除
  eq(statusSystem.getStatus(def.id, raid.RAIDED_KEY), null, '再一轮后 raided 移除');
}

// ---------------------------------------------------------------------------
// G5 raided 移动力 -1（预扣/付不起取消/每回合一次/非 raided 不扣）
// ---------------------------------------------------------------------------
console.log('== G5 raided 移动-1 ==');
{
  freshGame();
  const r1 = mkUnit('militia', 'enemy', 3, 4, { move: 3, maxMove: 3 });
  const r2 = mkUnit('militia', 'enemy', 5, 4, { move: 1, maxMove: 1 });
  const r3 = mkUnit('militia', 'enemy', 7, 4, { move: 3, maxMove: 3 });
  const n1 = mkUnit('militia', 'enemy', 9, 4, { move: 3, maxMove: 3 });
  game.units.push(r1, r2, r3, n1);
  ctx.addStatus(r1.id, raid.RAIDED_KEY, 3);
  ctx.addStatus(r2.id, raid.RAIDED_KEY, 3);
  ctx.addStatus(r3.id, raid.RAIDED_KEY, 3);

  const p1 = beforeMove(r1, 3, 4, 3, 3);
  eq(r1.move, 2, 'raided 单位预扣 1 点移动（3→2）');
  eq(p1.cancel, false, '付得起：移动放行');

  const p1b = beforeMove(r1, 3, 3, 3, 2);
  eq(r1.move, 2, '同回合第二次移动不再扣预扣（每回合一次）');

  const p2 = beforeMove(r2, 5, 4, 5, 3);
  eq(p2.cancel, true, 'raided 且移动不足：无法移动');
  eq(r2.move, 1, '被阻止单位保留剩余移动');

  const p3 = beforeMove(n1, 9, 4, 9, 3);
  eq(n1.move, 3, '非 raided 单位不扣移动');
  eq(p3.cancel, false, '非 raided 正常放行');

  beginTurn('enemy', false);
  const p4 = beforeMove(r3, 7, 4, 7, 3);
  eq(r3.move, 2, '新回合重置：raided 再次预扣（3→2）');
}

// ---------------------------------------------------------------------------
// G6 营地建造决策（UI 模式）
// ---------------------------------------------------------------------------
console.log('== G6 营地建造 ==');
{
  freshGame();
  globalThis.document = {};
  globalThis.window = {};
  const u = mkUnit('lightCavalry', 'player', 3, 3);
  game.units.push(u);
  beginTurn('player', false); // UI 模式：决策滞留 pending
  const pending = decisionSystem.getPendingDecisions('player');
  const dec = pending.find(r => r.id === `ghCampBuild_${u.id}`);
  assert(!!dec, '金帐可建单位产生建造决策');
  eq(dec.context.options.map(o => o.id).join(','), 'none,build', '选项：不建/建');
  eq(dec.context.options[0].id, 'none', '第一项必须是不建（sim fallback 依赖）');

  ctx.resolveDecision(dec.id, 'build');
  const f = facAt(3, 3);
  assert(!!f && f.type === camp.NOMAD_CAMP.type, '营地建造成功');
  eq(f.duration, 5, '营地持续 5 回合');
  eq(game.goldByOwner.player, 75, '营地扣 25 金币');
  eq(u.acted, true, '建造单位已行动');
  eq(u.move, 0, '建造单位移动归零');
  assert(game.logs.some(l => l.text.includes('游牧营地')), '日志记录营地建立');

  // 第二个单位：营地上限 2
  const u2 = mkUnit('hordeCavalry', 'player', 5, 5);
  game.units.push(u2);
  beginTurn('player', false);
  const pending2 = decisionSystem.getPendingDecisions('player');
  const dec2 = pending2.find(r => r.id === `ghCampBuild_${u2.id}`);
  assert(!!dec2, '第二单位可继续请求建造决策');
  ctx.resolveDecision(dec2.id, 'build');
  const f2 = facAt(5, 5);
  assert(!!f2, '第二营地建造成功');
  eq(camp.campCount(ctx, 'player'), 2, '营地数=2');

  // 第三单位：超上限不请求
  const u3 = mkUnit('nomadArcher', 'player', 7, 7);
  game.units.push(u3);
  beginTurn('player', false);
  const pending3 = decisionSystem.getPendingDecisions('player');
  assert(!pending3.some(r => r.id === `ghCampBuild_${u3.id}`), '营地数达上限：不再请求建造决策');
  delete globalThis.document;
  delete globalThis.window;
}

// ---------------------------------------------------------------------------
// G7 营地维护（扣款 / 无力支付拆除）
// ---------------------------------------------------------------------------
console.log('== G7 营地维护 ==');
{
  freshGame();
  ctx.createFacility(camp.NOMAD_CAMP.type, 'player', 3, 3, { duration: 5 });
  beginTurn('player', false);
  eq(game.goldByOwner.player, 98, '营地维护每回合扣 2 金币');
  assert(!!facAt(3, 3), '金币充足：营地保留');

  // 金币不足 → 拆除
  game.goldByOwner.player = 1;
  beginTurn('player', false);
  assert(!facAt(3, 3), '无力支付维护：营地解散');
  assert(game.logs.some(l => l.text.includes('解散')), '日志记录营地解散');
}

// ---------------------------------------------------------------------------
// G8 营地过期（5 回合）
// ---------------------------------------------------------------------------
console.log('== G8 营地过期 ==');
{
  freshGame();
  ctx.createFacility(camp.NOMAD_CAMP.type, 'player', 3, 3, { duration: 5 });
  for (let i = 1; i <= 4; i++) beginTurn('player', false);
  assert(!!facAt(3, 3), '4 回合后营地仍在');
  beginTurn('player', false);
  assert(!facAt(3, 3), '5 回合后营地过期移除');
}

// ---------------------------------------------------------------------------
// G9 营地生产（createUnit + productionCompleted 广播）
// ---------------------------------------------------------------------------
console.log('== G9 营地生产 ==');
{
  freshGame();
  globalThis.document = {};
  globalThis.window = {};
  const produced = [];
  const off = ctx.events.on('productionCompleted', (p) => produced.push(p));
  ctx.createFacility(camp.NOMAD_CAMP.type, 'player', 3, 3, { duration: 5 });
  beginTurn('player', false); // 回合开始：营地维护 -2（100→98）
  const g1 = game.goldByOwner.player;
  const dec = decisionSystem.getPendingDecisions('player').find(r => String(r.id).startsWith('ghCamp_'));
  assert(!!dec, '营地产生行动决策');
  const optIds = dec.context.options.map(o => o.id);
  assert(optIds.includes('produce:lightCavalry'), '决策含生产轻骑兵选项');
  eq(optIds[0], 'none', '第一项必须是维持（sim fallback 依赖）');

  ctx.resolveDecision(dec.id, 'produce:lightCavalry');
  const unit = game.units.find(u => u.type === 'lightCavalry' && u.owner === 'player');
  assert(!!unit && unit.x === 3 && unit.y === 3, '营地生产出轻骑兵于营地格');
  eq(game.goldByOwner.player, g1 - TYPES.lightCavalry.cost, '生产扣除单位成本（维护后余额 98-28=70）');
  eq(produced.length, 1, 'productionCompleted 广播一次');
  eq(produced[0].kind, 'unit', '广播 kind=unit');
  eq(produced[0].site.type, camp.NOMAD_CAMP.type, '广播 site 为营地 facility');
  assert(game.logs.some(l => l.text.includes('生产了轻骑兵')), '日志记录营地生产');
  off();
  delete globalThis.document;
  delete globalThis.window;
}

// ---------------------------------------------------------------------------
// G10 营地迁移（原址失去生产功能）
// ---------------------------------------------------------------------------
console.log('== G10 营地迁移 ==');
{
  freshGame();
  globalThis.document = {};
  globalThis.window = {};
  ctx.createFacility(camp.NOMAD_CAMP.type, 'player', 3, 3, { duration: 5 });
  beginTurn('player', false); // 回合开始：expireFacilities 使 duration 5→4
  const dec = decisionSystem.getPendingDecisions('player').find(r => String(r.id).startsWith('ghCamp_'));
  assert(!!dec, '营地产生行动决策');
  const migrateOpts = dec.context.options.filter(o => o.id.startsWith('migrate:'));
  assert(migrateOpts.length > 0, '决策含迁移候选格选项');
  const [tx, ty] = migrateOpts[0].id.slice('migrate:'.length).split(',').map(Number);

  ctx.resolveDecision(dec.id, `migrate:${tx},${ty}`);
  assert(!facAt(3, 3), '原址营地移除（失去生产功能）');
  const nf = facAt(tx, ty);
  assert(!!nf && nf.type === camp.NOMAD_CAMP.type, '新址营地建立');
  eq(nf.owner, 'player', '新址营地归属不变');
  eq(nf.duration, 4, '新址营地继承剩余 duration（回合开始后 5→4）');
  assert(game.logs.some(l => l.text.includes('迁移到')), '日志记录营地迁移');
  delete globalThis.document;
  delete globalThis.window;
}

// ---------------------------------------------------------------------------
// G11 raidPower 兵种联动（机动/等级加成）
// ---------------------------------------------------------------------------
console.log('== G11 raidPower 兵种联动 ==');
{
  freshGame();
  eq(raid.raidPower(ctx, mkUnit('lightCavalry', 'player', 1, 1)), 1, '轻骑兵(move6,lv1) → 1');
  eq(raid.raidPower(ctx, mkUnit('hordeCavalry', 'player', 1, 1)), 2, '汗国骑兵(move5,lv3) → 2');
  eq(raid.raidPower(ctx, mkUnit('horseArcher', 'player', 1, 1)), 0, '骑射手(move4,lv2) → 0');
  eq(raid.raidPower(ctx, mkUnit('camelCavalry', 'player', 1, 1)), 2, '骆驼骑兵(move5,lv3) → 2');
  eq(raid.raidPower(ctx, mkUnit('khanGuard', 'player', 1, 1)), 1, '可汗亲卫(move4,lv3) → 1');
  eq(raid.raidPower(ctx, mkUnit('nomadCannon', 'player', 1, 1)), 1, '游牧重炮(move3,lv3) → 1');

  // 商队识别：tradeCaravan 白名单 + 海军运输船
  eq(raid.isTradeTarget(ctx, mkUnit('tradeCaravan', 'enemy', 1, 1)), true, 'tradeCaravan 是商队');
  eq(raid.isTradeTarget(ctx, mkUnit('ragusaCaravan', 'enemy', 1, 1)), true, 'ragusaCaravan 是商队');
  eq(raid.isTradeTarget(ctx, mkUnit('transport', 'enemy', 1, 1)), true, '运兵船是运输单位');
  eq(raid.isTradeTarget(ctx, mkUnit('militia', 'enemy', 1, 1)), false, '民兵不是商队');
}

// ---------------------------------------------------------------------------
const ok = failed === 0;
console.log(ok ? '\nALL PASS' : `\nFAILED: ${failed}`);
process.exit(ok ? 0 : 1);
