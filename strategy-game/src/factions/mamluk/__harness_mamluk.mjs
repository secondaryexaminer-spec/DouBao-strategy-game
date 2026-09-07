// __harness_mamluk.mjs —— 马穆鲁克模块临时自测文件（主对话接线后决定去留；HRE/金帐/威尼斯 harness 保留作回归）。
// 验证：非马穆鲁克局零变化 / 特殊单位集合 / 经验获取（伤害/击杀/关键战斗/占领 + 埃及/士气加成）/
//       V1·V2 自动升级 / V3 玩家决策（fallback 与 pending 形态，AI 不晋升）/
//       V3 三选项效果（冲锋强化/击杀回血/移动力强化）/ Elite 称号 / eliteLost 死亡代价 /
//       士气增减与 clamp / 高士气骑兵首攻 / 低士气新生兵攻击下降 / 埃及尼罗河补给 /
//       叙利亚协同射击 / 巴格达四战术（守势/进攻/机动/整军）/ 跨局状态重置。
// 运行：node src/factions/mamluk/__harness_mamluk.mjs
import { createFactionContext } from '../factionContext.js';
import { factionRegistry } from '../factionRegistry.js';
import { facilitySystem } from '../../core/facility.js';
import { statusSystem } from '../../core/status.js';
import { decisionSystem } from '../../core/decision.js';
import { TYPES } from '../../core/constants.js';
import * as vet from './veterancy.js';
import { mamlukSystem } from './mamlukRules.js';

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
    aiProfiles: { enemy: { faction: 'hre', nation: 'austria' } },
    goldByOwner: { player: 100, enemy: 100 },
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
  terrainMeta: (k) => null,
  ownerFaction: (o) => (o === 'player' ? game.settings.faction : (game.aiProfiles[o] ? game.aiProfiles[o].faction : undefined)),
  ownerNation: (o) => (o === 'player' ? game.settings.nation : (game.aiProfiles[o] ? game.aiProfiles[o].nation : undefined)),
  log: (text, kind) => { game.logs.push({ text, kind }); },
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
factionRegistry.register('mamluk', mamlukSystem, ctx);

// 模拟 main.js 事件分发（与真实 emit payload 结构一致；result 用对象引用传递）
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
  return payload.result.damage;
}
function afterAttack(attacker, defender, damage, extra = {}) {
  const payload = { attacker, defender, result: { damage, counter: 0 }, defenderDead: false, attackerDead: false, ...extra };
  ctx.events.emit('afterAttack', payload);
  if (payload.defenderDead) game.units = game.units.filter(u => u !== defender);
  if (payload.attackerDead) game.units = game.units.filter(u => u !== attacker);
  return payload;
}
function siteCaptured(unit, site) {
  ctx.events.emit('siteCaptured', { unit, site, oldOwner: site.owner });
}
function beforeMove(unit, tx, ty) {
  const payload = { unit, from: { x: unit.x, y: unit.y }, to: { x: tx, y: ty }, cancel: false };
  ctx.events.emit('beforeMove', payload);
  if (!payload.cancel) unit.move -= 1; // 模拟 main.js moveUnit 扣步成本（plain cost 1）
  return payload;
}
function ui() { globalThis.document = {}; globalThis.window = {}; }
function noUi() { delete globalThis.document; delete globalThis.window; }
noUi();

const pendingMl = (owner) => decisionSystem.getPendingDecisions(owner || 'player')
  .filter(r => String(r.id).startsWith('ml'))
  .map(r => ({ id: r.id, title: r.context.title, options: r.context.options.map(o => o.id) }));

// 快速喂 XP 的辅助：一次击杀 level>=3 目标（damage 12 + kill 10 + keyBattle 5 = 27 XP，无加成）
function killOnce(attacker, over = {}) {
  const foe = attacker.owner === 'player' ? 'enemy' : 'player';
  const target = mkUnit('guard', foe, attacker.x + 1, attacker.y, { hp: 12, maxHp: 12 });
  game.units.push(target);
  afterAttack(attacker, target, 12, { defenderDead: true, ...over });
  return target;
}

// ---------------------------------------------------------------------------
// V1 非马穆鲁克局零变化
// ---------------------------------------------------------------------------
console.log('== V1 非马穆鲁克局零变化 ==');
{
  freshGame({ settings: { faction: 'hre', nation: 'austria' } });
  const atk = mkUnit('mamlukCavalry', 'player', 3, 3);
  const def = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(atk, def);
  const d0 = beforeAttack(atk, def, 8);
  eq(d0, 8, '非马穆鲁克局伤害不变');
  afterAttack(atk, def, 8, { defenderDead: true });
  eq(vet.getVeterancy(atk.id), null, '非马穆鲁克局不建档');
  beginTurn('player', false);
  eq(game.goldByOwner.player, 100, '非马穆鲁克局金币不变');
  eq(pendingMl('player').length, 0, '非马穆鲁克局无决策');
}

// ---------------------------------------------------------------------------
// V2 特殊单位集合：非特殊马穆鲁克单位不加经验
// ---------------------------------------------------------------------------
console.log('== V2 特殊单位集合 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'egypt' } });
  const archer = mkUnit('arabArcher', 'player', 3, 3); // 非特殊（弓手）
  const def = mkUnit('heavyInfantry', 'enemy', 4, 3, { hp: 12, maxHp: 12 });
  game.units.push(archer, def);
  afterAttack(archer, def, 6);
  eq(vet.getVeterancy(archer.id), null, '非特殊单位（arabArcher）不建档');
  // 三个特殊单位全部在集合内
  for (const t of ['mamlukCavalry', 'camelWarrior', 'sultanGuard']) {
    const u = mkUnit(t, 'player', 1, 1);
    game.units.push(u);
    const d = mkUnit('heavyInfantry', 'enemy', 2, 1, { hp: 5, maxHp: 5 });
    game.units.push(d);
    afterAttack(u, d, 5);
    eq(vet.getVeterancy(u.id).xp, 5, `${t} 造成伤害记经验`);
  }
}

// ---------------------------------------------------------------------------
// V3 经验获取：伤害 / 击杀 / 关键战斗 / 占领 + 埃及加成 + 高士气加成
// ---------------------------------------------------------------------------
console.log('== V3 经验获取 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(cav);
  const d1 = mkUnit('heavyInfantry', 'enemy', 4, 3, { hp: 6, maxHp: 6 });
  game.units.push(d1);
  afterAttack(cav, d1, 6); // 伤害 6
  eq(vet.getVeterancy(cav.id).xp, 6, '造成伤害：1 XP/点');
  const d2 = mkUnit('militia', 'enemy', 4, 4, { hp: 10, maxHp: 10, level: 1 });
  game.units.push(d2);
  afterAttack(cav, d2, 10, { defenderDead: true }); // 击杀 level1 → 10+10
  eq(vet.getVeterancy(cav.id).xp, 26, '击杀 +10（非关键战斗）');
  eq(vet.getVeterancy(cav.id).kills, 1, 'kills 计数');
  const d3 = mkUnit('imperialGuard', 'enemy', 4, 5, { hp: 12, maxHp: 12, level: 3 });
  game.units.push(d3);
  afterAttack(cav, d3, 12, { defenderDead: true }); // 击杀 level3 → +10+5
  eq(vet.getVeterancy(cav.id).xp, 53, '关键战斗：击杀 level>=3 额外 +5');
  // 占领
  const site = mkSite('city', 'neutral', 5, 3);
  game.sites.push(site);
  siteCaptured(cav, site);
  eq(vet.getVeterancy(cav.id).xp, 68, '占领据点 +15');

  // 埃及河边加成：round(6*1.5)=9
  freshGame({ settings: { faction: 'mamluk', nation: 'egypt' } });
  game.terrain[2][3] = 'water'; // (3,3) 单位的 (3,2) 邻域
  const ecav = mkUnit('mamlukCavalry', 'player', 3, 3);
  const ed = mkUnit('militia', 'enemy', 4, 3, { hp: 6, maxHp: 6 });
  game.units.push(ecav, ed);
  afterAttack(ecav, ed, 6);
  eq(vet.getVeterancy(ecav.id).xp, 9, '埃及河边经验 ×1.5（round(6*1.5)=9）');

  // 高士气叠加：6 → 埃及 9 → 士气 ×1.5 → round(9*1.5)=14
  vet.setMoraleForTests('player', 80);
  const hcav = mkUnit('mamlukCavalry', 'player', 3, 3);
  const hd = mkUnit('militia', 'enemy', 4, 3, { hp: 6, maxHp: 6 });
  game.units.push(hcav, hd);
  afterAttack(hcav, hd, 6);
  eq(vet.getVeterancy(hcav.id).xp, 14, '埃及×高士气叠加（round(9*1.5)=14）');
}

// ---------------------------------------------------------------------------
// V4 Veteran 1 自动升级（攻击 +1）
// ---------------------------------------------------------------------------
console.log('== V4 Veteran 1 自动升级 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(cav);
  // 3 次击杀 level3 目标 = 3×27 = 81 XP（一次到 V2，先验证 V1 等级出现）
  killOnce(cav); killOnce(cav); killOnce(cav);
  const rec = vet.getVeterancy(cav.id);
  eq(rec.veteranLevel, 2, '自动升到 Veteran 2（81 XP）');
  eq(rec.lastPromotionTurn, 1, '记录晋升回合');
  // V1 攻击 +1 生效：freshGame 重来，只喂到 V1
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const v1 = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(v1);
  // 30 XP：伤害 15 + 击杀 10 + 关键战斗 5（level 3 目标）= 30
  const t1 = mkUnit('guard', 'enemy', 4, 3, { hp: 15, maxHp: 15 });
  game.units.push(t1);
  afterAttack(v1, t1, 15, { defenderDead: true });
  eq(vet.getVeterancy(v1.id).veteranLevel, 1, '30 XP → Veteran 1');
  eq(beforeAttack(v1, t1, 5), 6, 'V1 攻击 +1 生效');
}

// ---------------------------------------------------------------------------
// V5 Veteran 2 自动升级（防御 +1）
// ---------------------------------------------------------------------------
console.log('== V5 Veteran 2 自动升级 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const v2 = mkUnit('mamlukCavalry', 'player', 3, 3);
  const ene = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(v2, ene);
  killOnce(v2); killOnce(v2); killOnce(v2); // 81 XP → V2
  eq(vet.getVeterancy(v2.id).veteranLevel, 2, 'Veteran 2 达成');
  eq(beforeAttack(ene, v2, 5), 4, 'V2 防御 +1：被攻击伤害 -1');
}

// ---------------------------------------------------------------------------
// V6 Veteran 3 玩家决策：无 UI fallback 选第一项；UI 下 pending；AI 不晋升
// ---------------------------------------------------------------------------
console.log('== V6 Veteran 3 决策（player fallback / pending / AI 不晋升） ==');
{
  // AI（mamluk）精锐到 120 XP → 停在 V2，无 promotion，无决策
  freshGame({
    settings: { faction: 'hre', nation: 'austria' },
    aiProfiles: { enemy: { faction: 'mamluk', nation: 'egypt' } },
  });
  const aiCav = mkUnit('mamlukCavalry', 'enemy', 3, 3);
  game.units.push(aiCav);
  for (let i = 0; i < 5; i++) killOnce(aiCav); // 5×27=135 ≥ 120
  eq(vet.getVeterancy(aiCav.id).veteranLevel, 2, 'AI 精锐停在 Veteran 2');
  eq(vet.getVeterancy(aiCav.id).promotion, null, 'AI 无 V3 晋升方向');
  eq(pendingMl('enemy').length, 0, 'AI 无决策请求');
  eq(beforeAttack(aiCav, mkUnit('militia', 'player', 4, 3), 5), 6, 'AI V2 仍享受 +1 攻击（veterancy 自动部分对 AI 生效）');

  // player（mamluk）：无 UI → 自动选第一项 charge
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const pCav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(pCav);
  for (let i = 0; i < 5; i++) killOnce(pCav);
  eq(vet.getVeterancy(pCav.id).veteranLevel, 3, 'player V3 达成（fallback 自动晋升）');
  eq(vet.getVeterancy(pCav.id).promotion, 'charge', 'fallback 第一项 = 冲锋强化');

  // player：UI 存在 → 决策 pending，可手动选
  ui();
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const pCav2 = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(pCav2);
  for (let i = 0; i < 5; i++) killOnce(pCav2);
  eq(vet.getVeterancy(pCav2.id).veteranLevel, 2, 'UI 下 V3 待决策（未晋升）');
  eq(vet.getVeterancy(pCav2.id).promotion, null, 'UI 下 promotion 未定');
  const pend = pendingMl('player');
  eq(pend.length, 1, '有一个待决 V3 决策');
  eq(pend[0].options.join(','), 'charge,bloodlust,swift', '三选一选项顺序正确');
  ctx.resolveDecision(pend[0].id, 'swift');
  eq(vet.getVeterancy(pCav2.id).promotion, 'swift', 'resolve 后晋升方向生效');
  eq(vet.getVeterancy(pCav2.id).veteranLevel, 3, 'resolve 后等级 3');
  noUi();
}

// ---------------------------------------------------------------------------
// V7 Veteran 3 三选项效果
// ---------------------------------------------------------------------------
console.log('== V7 V3 三选项效果 ==');
{
  // 冲锋强化：满移动力攻击 +3
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const chg = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(chg);
  for (let i = 0; i < 5; i++) killOnce(chg); // fallback → charge
  eq(vet.getVeterancy(chg.id).promotion, 'charge', 'V3=冲锋强化');
  const t1 = mkUnit('militia', 'enemy', 4, 3);
  game.units.push(t1);
  eq(beforeAttack(chg, t1, 5), 9, '满移动力冲锋 +3（5+1V1+3）');
  chg.move = 0; // 非满移动力
  eq(beforeAttack(chg, t1, 5), 6, '非满移动力不加冲锋（5+1=V1）');

  // 击杀回血
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  ui();
  const bl = mkUnit('mamlukCavalry', 'player', 3, 3, { hp: 10 });
  game.units.push(bl);
  for (let i = 0; i < 5; i++) killOnce(bl);
  const pend = pendingMl('player');
  ctx.resolveDecision(pend[0].id, 'bloodlust');
  noUi();
  eq(vet.getVeterancy(bl.id).promotion, 'bloodlust', 'V3=击杀回血');
  const t2 = mkUnit('militia', 'enemy', 4, 3, { hp: 10, maxHp: 10 });
  game.units.push(t2);
  afterAttack(bl, t2, 10, { defenderDead: true });
  eq(bl.hp, 12, '击杀回血 +2（10→12）');

  // 移动力强化
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  ui();
  const sw = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(sw);
  for (let i = 0; i < 5; i++) killOnce(sw);
  const pend2 = pendingMl('player');
  ctx.resolveDecision(pend2[0].id, 'swift');
  noUi();
  eq(sw.baseMove, 6, '移动力强化：baseMove 5→6');
  eq(sw.maxMove, 6, '移动力强化：maxMove 同步');
  beginTurn('player', false);
  eq(sw.maxMove, 6, 'beginTurn 重置后仍 6（effectiveMove=baseMove+rank/2）');
}

// ---------------------------------------------------------------------------
// V8 Elite 称号
// ---------------------------------------------------------------------------
console.log('== V8 Elite 称号 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(cav);
  // 冲到 V3（fallback charge）：5 次击杀 = 135 XP
  for (let i = 0; i < 5; i++) killOnce(cav);
  eq(vet.getVeterancy(cav.id).elite, false, 'V3 后还不是 Elite');
  // 再加 65 XP：4 次击杀（4×27=108）→ 243 ≥ 200
  for (let i = 0; i < 4; i++) killOnce(cav);
  eq(vet.getVeterancy(cav.id).xp, 243, '累计经验 243');
  eq(vet.getVeterancy(cav.id).elite, true, '200 XP → Elite 称号');
  eq(vet.getVeterancy(cav.id).veteranLevel, 3, 'Elite 保持等级 3（称号展示）');
}

// ---------------------------------------------------------------------------
// V9 eliteLost：精锐（veteranLevel>=3）死亡代价
// ---------------------------------------------------------------------------
console.log('== V9 eliteLost 死亡代价 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  const atk = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(cav, atk);
  for (let i = 0; i < 5; i++) killOnce(cav); // V3
  const goldBefore = game.goldByOwner.player;
  const moraleBefore = vet.getMorale('player');
  afterAttack(atk, cav, 20, { defenderDead: true }); // 精锐被击杀
  eq(game.goldByOwner.player, goldBefore - 15, '金币损失 15');
  eq(vet.getMorale('player'), moraleBefore - 3, '士气 -3');
  const rec = vet.getVeterancy(cav.id);
  eq(rec.dead, true, '档案标记 dead');
  eq(rec.xp, 0, '累计经验清零');
  eq(rec.veteranLevel, 0, '等级清零（不再生效）');
  eq(vet.getVeterancy(cav.id).kills, 5, '历史击杀保留（阵亡统计）');
  // 死亡后不再提供加成
  eq(beforeAttack(mkUnit('heavyInfantry', 'enemy', 4, 3), cav, 5), 5, '死亡精锐不再提供 V2 防御');
  // 金币不足：不扣（spendGold false 分支）
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  game.goldByOwner.player = 5;
  const cav2 = mkUnit('mamlukCavalry', 'player', 3, 3);
  const atk2 = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(cav2, atk2);
  for (let i = 0; i < 5; i++) killOnce(cav2);
  afterAttack(atk2, cav2, 20, { defenderDead: true });
  eq(game.goldByOwner.player, 5, '金币不足时不扣（记录日志）');
  eq(vet.getVeterancy(cav2.id).dead, true, '惩罚仍生效（士气/清零）');
}

// ---------------------------------------------------------------------------
// V10 士气增减与 clamp
// ---------------------------------------------------------------------------
console.log('== V10 士气增减与 clamp ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  vet.syncGameRef(ctx); // 模拟新局第一次钩子调用，清掉上一组残留士气
  eq(vet.getMorale('player'), 50, '初始士气 50');
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(cav);
  // 30 XP → V1（guard level3：15 damage + 10 kill + 5 keyBattle），击杀 +1
  const t1 = mkUnit('guard', 'enemy', 4, 3, { hp: 15, maxHp: 15 });
  game.units.push(t1);
  afterAttack(cav, t1, 15, { defenderDead: true });
  eq(vet.getMorale('player'), 51, '精锐击杀士气 +1');
  // 满士气 clamp：设 99 后击杀 → 100
  vet.setMoraleForTests('player', 99);
  const t2 = mkUnit('militia', 'enemy', 4, 4, { hp: 10, maxHp: 10 });
  game.units.push(t2);
  afterAttack(cav, t2, 10, { defenderDead: true });
  eq(vet.getMorale('player'), 100, '士气 clamp 上限 100');
  // 低士气死亡：V3 精锐死亡 -3（clamp 下限 0）
  for (let i = 0; i < 3; i++) killOnce(cav); // 40 → 121 XP → V3（fallback charge）
  eq(vet.getVeterancy(cav.id).veteranLevel, 3, 'cav 已到 V3 准备死亡测试');
  vet.setMoraleForTests('player', 2); // 先喂完 XP 再压低士气（避免击杀 +1 干扰）
  const atk = mkUnit('heavyInfantry', 'enemy', 4, 5);
  game.units.push(atk);
  afterAttack(atk, cav, 20, { defenderDead: true });
  eq(vet.getMorale('player'), 0, '士气 clamp 下限 0（2-3→0）');
}

// ---------------------------------------------------------------------------
// V11 高士气：骑兵每回合首次攻击 +2
// ---------------------------------------------------------------------------
console.log('== V11 高士气骑兵首攻 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  vet.syncGameRef(ctx); // 先触发跨局重置，再设置士气（否则钩子内 syncGameRef 会清掉）
  vet.setMoraleForTests('player', 80);
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  const t1 = mkUnit('militia', 'enemy', 4, 3, { hp: 30, maxHp: 30 });
  const t2 = mkUnit('militia', 'enemy', 4, 4, { hp: 30, maxHp: 30 });
  game.units.push(cav, t1, t2);
  eq(beforeAttack(cav, t1, 5), 7, '首次攻击 +2');
  eq(beforeAttack(cav, t2, 5), 5, '同回合第二次不加');
  beginTurn('player', false);
  eq(beforeAttack(cav, t1, 5), 7, '新回合首次攻击恢复 +2');
}

// ---------------------------------------------------------------------------
// V12 低士气：新生兵攻击 -1（精锐不受影响）
// ---------------------------------------------------------------------------
console.log('== V12 低士气新生兵攻击下降 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  vet.syncGameRef(ctx);
  vet.setMoraleForTests('player', 20);
  const green = mkUnit('mamlukCavalry', 'player', 3, 3); // 无档案新生兵
  const v1u = mkUnit('camelWarrior', 'player', 3, 4);     // 有档案 V1 精锐
  const t = mkUnit('militia', 'enemy', 4, 3, { hp: 30, maxHp: 30 });
  game.units.push(green, v1u, t);
  // 先给 v1u 建档到 V1（guard level3：15 damage + 10 kill + 5 keyBattle = 30）
  const vt = mkUnit('guard', 'enemy', 4, 5, { hp: 15, maxHp: 15 });
  game.units.push(vt);
  afterAttack(v1u, vt, 15, { defenderDead: true }); // V1
  eq(beforeAttack(green, t, 5), 4, '新生兵攻击 -1');
  eq(beforeAttack(v1u, t, 5), 6, 'V1 精锐不受惩罚（反而 +1）');
}

// ---------------------------------------------------------------------------
// V13 埃及尼罗河补给：回血 +2 / 经验 +50%
// ---------------------------------------------------------------------------
console.log('== V13 埃及尼罗河补给 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'egypt' } });
  game.terrain[2][3] = 'water';
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3, { hp: 10 });
  const away = mkUnit('mamlukCavalry', 'player', 8, 8, { hp: 10 }); // 远离水/城市
  game.units.push(cav, away);
  beginTurn('player', false);
  eq(cav.hp, 12, '河边精锐 +2 回血');
  eq(away.hp, 10, '远离河流不触发');
  // 城市附近也触发
  const city = mkSite('city', 'player', 6, 3);
  game.sites.push(city);
  const cityCav = mkUnit('mamlukCavalry', 'player', 6, 4, { hp: 10 });
  game.units.push(cityCav);
  beginTurn('player', false);
  eq(cityCav.hp, 12, '城市附近精锐 +2 回血');
  // 非精锐不触发
  const archer = mkUnit('arabArcher', 'player', 3, 4, { hp: 5 });
  game.units.push(archer);
  beginTurn('player', false);
  eq(archer.hp, 5, '非特殊单位不吃尼罗河补给');
}

// ---------------------------------------------------------------------------
// V14 叙利亚长弓火线：第二个远程单位攻击同一目标 +2
// ---------------------------------------------------------------------------
console.log('== V14 叙利亚长弓火线 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'syria' } });
  const a = mkUnit('syrianLongbow', 'player', 2, 3);
  const b = mkUnit('syrianLongbow', 'player', 2, 4);
  const c = mkUnit('syrianLongbow', 'player', 2, 5);
  const t = mkUnit('militia', 'enemy', 6, 3, { hp: 40, maxHp: 40 });
  game.units.push(a, b, c, t);
  eq(beforeAttack(a, t, 5), 5, '第一个远程单位无加成');
  eq(beforeAttack(b, t, 5), 7, '第二个远程单位协同射击 +2');
  eq(beforeAttack(c, t, 5), 7, '第三个（不同单位）同样触发');
  eq(beforeAttack(a, t, 5), 7, '轮换单位再次触发（车轮战）');
  beginTurn('player', false);
  eq(beforeAttack(a, t, 5), 5, '新回合火线重置');
  // 近战单位不触发火线
  const melee = mkUnit('mamlukCavalry', 'player', 3, 6);
  game.units.push(melee);
  eq(beforeAttack(melee, t, 5), 5, '近战不算远程（无火线也无 V1，新生兵）');
}

// ---------------------------------------------------------------------------
// V15 巴格达学术指令：四战术效果 + 决策 fallback
// ---------------------------------------------------------------------------
console.log('== V15 巴格达学术指令 ==');
{
  // 无 UI：fallback 自动选第一项"守势"
  freshGame({ settings: { faction: 'mamluk', nation: 'baghdad' } });
  const scholar = mkUnit('caliphScholar', 'player', 5, 5);
  const ally = mkUnit('mamlukCavalry', 'player', 6, 5); // 学者范围内
  const far = mkUnit('mamlukCavalry', 'player', 9, 9);  // 范围外
  const ene = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(scholar, ally, far, ene);
  beginTurn('player', false);
  eq(vet.tacticOf('player'), 'defensive', 'fallback 自动选守势');
  // 守势：范围内己方单位被攻击 -1
  eq(beforeAttack(ene, ally, 5), 4, '守势：范围内被攻击 -1');
  eq(beforeAttack(ene, far, 5), 5, '守势：范围外不生效');

  // 进攻：resolve 后 +2
  ui();
  freshGame({ settings: { faction: 'mamluk', nation: 'baghdad' } });
  const s2 = mkUnit('caliphScholar', 'player', 5, 5);
  const a2 = mkUnit('mamlukCavalry', 'player', 6, 5);
  const t2 = mkUnit('militia', 'enemy', 4, 3, { hp: 30, maxHp: 30 });
  game.units.push(s2, a2, t2);
  beginTurn('player', false);
  const pend = pendingMl('player');
  eq(pend.length, 1, '有学术指令决策');
  eq(pend[0].options.join(','), 'defensive,offensive,mobility,drill', '四选一选项顺序');
  ctx.resolveDecision(pend[0].id, 'offensive');
  eq(vet.tacticOf('player'), 'offensive', 'resolve 进攻');
  eq(beforeAttack(a2, t2, 5), 7, '进攻：范围内攻击 +2');
  noUi();

  // 机动：范围内单位每回合首次移动消耗 -1（beforeMove 预支 +1）
  freshGame({ settings: { faction: 'mamluk', nation: 'baghdad' } });
  ui();
  const s3 = mkUnit('caliphScholar', 'player', 5, 5);
  const m3 = mkUnit('mamlukCavalry', 'player', 6, 5, { move: 2, maxMove: 2 });
  game.units.push(s3, m3);
  beginTurn('player', false);
  ctx.resolveDecision(pendingMl('player')[0].id, 'mobility');
  noUi();
  const p1 = beforeMove(m3, 7, 5);
  eq(p1.cancel, false, '机动不取消移动');
  eq(m3.move, 2, '机动预支 +1：2→3→扣1→2（比不预支多1）');
  beforeMove(m3, 8, 5);
  eq(m3.move, 1, '同回合第二次不再预支：2→扣1→1');

  // 整军：范围内单位每回合 +1 回血
  freshGame({ settings: { faction: 'mamluk', nation: 'baghdad' } });
  ui();
  const s4 = mkUnit('caliphScholar', 'player', 5, 5);
  const h4 = mkUnit('mamlukCavalry', 'player', 6, 5, { hp: 10 });
  const f4 = mkUnit('mamlukCavalry', 'player', 9, 9, { hp: 10 });
  game.units.push(s4, h4, f4);
  beginTurn('player', false);
  ctx.resolveDecision(pendingMl('player')[0].id, 'drill');
  noUi();
  beginTurn('player', false); // 下一回合：drill 已生效
  eq(h4.hp, 11, '整军：范围内 +1 回血');
  eq(f4.hp, 10, '整军：范围外不回');
}

// ---------------------------------------------------------------------------
// V16 跨局状态重置（syncGameRef）
// ---------------------------------------------------------------------------
console.log('== V16 跨局状态重置 ==');
{
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } });
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(cav);
  for (let i = 0; i < 5; i++) killOnce(cav);
  eq(vet.getVeterancy(cav.id).veteranLevel, 3, '旧局已建档');
  freshGame({ settings: { faction: 'mamluk', nation: 'austria' } }); // 新 game 对象
  vet.syncGameRef(ctx); // 模拟新局第一次钩子调用时触发跨局重置
  eq(vet.getVeterancy(cav.id), null, '新局开始：旧档案已清空');
  eq(vet.getMorale('player'), 50, '新局士气回默认 50');
  const cav2 = mkUnit('mamlukCavalry', 'player', 3, 3);
  const t2 = mkUnit('militia', 'enemy', 4, 3, { hp: 6, maxHp: 6 });
  game.units.push(cav2, t2);
  afterAttack(cav2, t2, 6);
  eq(vet.getVeterancy(cav2.id).xp, 6, '新局正常重新建档');
}

// ---------------------------------------------------------------------------
// V17 决策 fallback 顺序（第一项=默认，无头 sim 零行为变化）
// ---------------------------------------------------------------------------
console.log('== V17 决策 fallback 顺序 ==');
{
  noUi();
  freshGame({ settings: { faction: 'mamluk', nation: 'baghdad' } });
  const s = mkUnit('caliphScholar', 'player', 5, 5);
  const cav = mkUnit('mamlukCavalry', 'player', 3, 3);
  game.units.push(s, cav);
  for (let i = 0; i < 5; i++) killOnce(cav);
  eq(vet.getVeterancy(cav.id).promotion, 'charge', 'V3 fallback = 第一项 charge');
  beginTurn('player', false);
  eq(vet.tacticOf('player'), 'defensive', '战术 fallback = 第一项 defensive');
  eq(pendingMl('player').length, 0, '无头 sim 无 pending 决策');
}

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------
console.log('========================================');
console.log(`马穆鲁克 harness：${passed} PASS / ${failed} FAIL`);
if (failed > 0) process.exit(1);
