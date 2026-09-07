// __harness_ming.mjs —— 大明模块临时自测文件（主对话接线后决定去留；HRE/金帐/威尼斯/马穆鲁克 harness 保留作回归）。
// 验证：非大明局零变化 / fireZone 生成（远程/近战/去重/叠加/目标死亡）/ 进入受伤（不致死/同盟豁免/站桩不结算）/
//       瞭望塔火力校正 / crossfire 判定（2 区触发/1 区不触发/校正）/ expire 时序 /
//       工程部署决策（player fallback 不建 / UI pending / resolve / AI 不请求）/
//       炮台（范围伤害不致死/防御光环）/ 补给站回血 / 壕沟冲锋减免 / 临时桥移动成本修正 /
//       设施被攻击摧毁 / 水寨（港口/海岸/非朝鲜不生效）/ 丛林伏击（首攻/森林/新回合）/
//       锦衣卫 stealth（潜伏/攻击暴露/非本部不生效）/ 跨局状态重置。
// 运行：node src/factions/ming/__harness_ming.mjs
import { createFactionContext } from '../factionContext.js';
import { factionRegistry } from '../factionRegistry.js';
import { facilitySystem } from '../../core/facility.js';
import { statusSystem } from '../../core/status.js';
import { decisionSystem } from '../../core/decision.js';
import { TYPES } from '../../core/constants.js';
import { mingSystem } from './mingRules.js';
import * as fz from './fireZone.js';
import * as eng from './engineering.js';
import * as nations from './mingRules.js';

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
factionRegistry.register('ming', mingSystem, ctx);

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
function beforeMove(unit, tx, ty) {
  const payload = { unit, from: { x: unit.x, y: unit.y }, to: { x: tx, y: ty }, cancel: false };
  ctx.events.emit('beforeMove', payload);
  if (!payload.cancel) unit.move -= 1; // 模拟 main.js moveUnit 扣步成本（plain cost 1）
  return payload;
}
function ui() { globalThis.document = {}; globalThis.window = {}; }
function noUi() { delete globalThis.document; delete globalThis.window; }
noUi();

const pendingMg = (owner) => decisionSystem.getPendingDecisions(owner || 'player')
  .filter(r => String(r.id).startsWith('mgEng_'))
  .map(r => ({ id: r.id, unitId: r.context.unitId, options: r.context.options.map(o => o.id) }));

const zonesAt = (x, y) => ctx.getFacilitiesByType('fireZone').filter(f => f.x === x && f.y === y);

// ---------------------------------------------------------------------------
// M1 非大明局零变化
// ---------------------------------------------------------------------------
console.log('== M1 非大明局零变化 ==');
{
  freshGame({ settings: { faction: 'hre', nation: 'austria' } });
  const atk = mkUnit('shenjiBattalion', 'player', 3, 3);
  const def = mkUnit('heavyInfantry', 'enemy', 4, 3);
  game.units.push(atk, def);
  const d0 = beforeAttack(atk, def, 8);
  eq(d0, 8, '非大明局伤害不变');
  afterAttack(atk, def, 8, { defenderDead: true });
  eq(zonesAt(4, 3).length, 0, '非大明局不生成 fireZone');
  beginTurn('player', false);
  eq(game.goldByOwner.player, 100, '非大明局金币不变');
  eq(pendingMg('player').length, 0, '非大明局无部署决策');
  eq(ctx.getAllFacilities().length, 0, '非大明局无任何设施');
}

// ---------------------------------------------------------------------------
// M2 fireZone 生成：远程/近战/去重/叠加/目标死亡
// ---------------------------------------------------------------------------
console.log('== M2 fireZone 生成 ==');
{
  // 大明远程攻击 → 目标格生成
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const gun = mkUnit('shenjiBattalion', 'player', 3, 3);
  const def = mkUnit('heavyInfantry', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(gun, def);
  afterAttack(gun, def, 9);
  eq(zonesAt(6, 3).length, 1, '远程攻击后目标格生成 fireZone');
  const f = zonesAt(6, 3)[0];
  eq(f.duration, 1, 'fireZone duration=1');
  eq(f.data.sourceUnitId, gun.id, 'fireZone 记录源单位');
  eq(f.data.owner, 'player', 'fireZone 记录 owner');
  eq(f.data.type, 'fire', 'fireZone data.type=fire');
  eq(f.owner, 'player', 'facility.owner=攻击方');

  // 同源同格去重：再打一次不叠加
  afterAttack(gun, def, 9);
  eq(zonesAt(6, 3).length, 1, '同源同格去重（不重复叠）');

  // 不同源同格叠加
  const gun2 = mkUnit('hongyiCannon', 'player', 3, 5);
  game.units.push(gun2);
  afterAttack(gun2, def, 16);
  eq(zonesAt(6, 3).length, 2, '不同源同格可叠加（两个火器瞄准同一格）');

  // 近战不生成
  const cav = mkUnit('mingCavalry', 'player', 4, 4);
  const def2 = mkUnit('militia', 'enemy', 4, 6, { hp: 30, maxHp: 30 });
  game.units.push(cav, def2);
  afterAttack(cav, def2, 8);
  eq(zonesAt(4, 6).length, 0, '近战攻击不生成 fireZone');

  // 目标死亡仍生成（区域效果）
  const gun3 = mkUnit('shenjiBattalion', 'player', 2, 2);
  const dead = mkUnit('militia', 'enemy', 5, 2, { hp: 9, maxHp: 9 });
  game.units.push(gun3, dead);
  afterAttack(gun3, dead, 9, { defenderDead: true });
  eq(zonesAt(5, 2).length, 1, '目标死亡仍生成 fireZone（区域效果）');
}

// ---------------------------------------------------------------------------
// M3 进入受伤：不致死/同盟豁免/站桩不结算/瞭望塔校正
// ---------------------------------------------------------------------------
console.log('== M3 进入受伤 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const gun = mkUnit('shenjiBattalion', 'player', 3, 3);
  const def = mkUnit('heavyInfantry', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(gun, def);
  afterAttack(gun, def, 9); // (6,3) 有 fireZone

  // 敌方单位进入 → 受伤 2
  const foe = mkUnit('militia', 'enemy', 6, 2, { hp: 10, maxHp: 10 });
  game.units.push(foe);
  beforeMove(foe, 6, 3);
  eq(foe.hp, 8, '敌方进入火力区受伤 2（10→8）');

  // 同盟（大明）进入不受伤
  const ally = mkUnit('mingCavalry', 'player', 6, 4, { hp: 16, maxHp: 16 });
  game.units.push(ally);
  beforeMove(ally, 6, 3);
  eq(ally.hp, 16, '同盟单位进入不受伤');

  // 站桩不结算：不移动不扣血
  eq(def.hp, 30, '站桩在火力区不额外结算（30 不变）');

  // 不致死：1 HP 进入 → 保持 1
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const g2 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const d2 = mkUnit('militia', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(g2, d2);
  afterAttack(g2, d2, 9);
  const f2 = mkUnit('scout', 'enemy', 6, 2, { hp: 1, maxHp: 1 });
  game.units.push(f2);
  beforeMove(f2, 6, 3);
  eq(f2.hp, 1, '1 HP 单位进入火力区不致死（最低保留 1）');

  // 瞭望塔校正：进入伤害 3
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const g3 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const d3 = mkUnit('militia', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(g3, d3);
  afterAttack(g3, d3, 9); // (6,3) fireZone
  eng.resolveDeploy(ctx, 'player', 'fake', 'none'); // no-op 确保方法可调
  ctx.createFacility('watchtower', 'player', 7, 4, { hp: 6, duration: null }); // 距 (6,3) Chebyshev 1 → 范围内
  const f3 = mkUnit('scout', 'enemy', 6, 2, { hp: 10, maxHp: 10 });
  game.units.push(f3);
  beforeMove(f3, 6, 3);
  eq(f3.hp, 7, '瞭望塔校正：范围内 fireZone 进入伤害 3（10→7）');
}

// ---------------------------------------------------------------------------
// M4 crossfire：2 区触发/1 区不触发/瞭望塔校正/同盟不算
// ---------------------------------------------------------------------------
console.log('== M4 crossfire ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  // 两个火器瞄准同一格 (6,3) → 2 个 fireZone
  const g1 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const g2 = mkUnit('hongyiCannon', 'player', 3, 5);
  const def = mkUnit('heavyInfantry', 'enemy', 6, 3, { hp: 40, maxHp: 40 });
  game.units.push(g1, g2, def);
  afterAttack(g1, def, 9);
  afterAttack(g2, def, 16);
  eq(zonesAt(6, 3).length, 2, '该格有 2 个 fireZone');
  eq(beforeAttack(mkUnit('militia', 'enemy', 5, 3), def, 5), 9, '被 2 区覆盖：受击 +4（5→9）');
  // 第三方攻击者也受益（crossfire 是区域 debuff）
  eq(beforeAttack(mkUnit('cavalry', 'enemy', 5, 4), def, 5), 9, '任意攻击者都享受 crossfire（区域 debuff）');

  // 1 个 fireZone 不触发
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const s1 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const d1 = mkUnit('militia', 'enemy', 6, 3, { hp: 40, maxHp: 40 });
  game.units.push(s1, d1);
  afterAttack(s1, d1, 9);
  eq(beforeAttack(mkUnit('cavalry', 'enemy', 5, 3), d1, 5), 5, '仅 1 个 fireZone 不触发 crossfire');

  // 瞭望塔校正：crossfire +5
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const w1 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const w2 = mkUnit('hongyiCannon', 'player', 3, 5);
  const wd = mkUnit('heavyInfantry', 'enemy', 6, 3, { hp: 40, maxHp: 40 });
  game.units.push(w1, w2, wd);
  afterAttack(w1, wd, 9);
  afterAttack(w2, wd, 16);
  ctx.createFacility('watchtower', 'player', 7, 4, { hp: 6, duration: null }); // 距 (6,3) ≤2
  eq(beforeAttack(mkUnit('militia', 'enemy', 5, 3), wd, 5), 10, '瞭望塔校正：crossfire +5（5→10）');

  // 同盟维度：defender 与 fireZone 同盟时不算敌对（防御性检查，真实场景为大明攻击己方目标）
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const s2 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const sd = mkUnit('militia', 'enemy', 6, 3, { hp: 40, maxHp: 40 });
  game.units.push(s2, sd);
  afterAttack(s2, sd, 9); // 1 个敌对 fireZone
  eq(zonesAt(6, 3).length, 1, '确认该格 1 个 player 的 fireZone');
  eq(beforeAttack(mkUnit('cavalry', 'enemy', 5, 3), sd, 5), 5, '仅 1 个敌对 fireZone 不触发 crossfire');
  // defender 与 fireZone 同盟（防御性构造）：不算敌对
  const s3 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const allyDef = mkUnit('qiArmy', 'player', 6, 3, { hp: 40, maxHp: 40 }); // player 站在 player 的 fireZone 上
  game.units.push(s3, allyDef);
  afterAttack(s3, allyDef, 9);
  eq(zonesAt(6, 3).length, 1, 'player 的 fireZone 覆盖 allyDef 格');
  eq(beforeAttack(mkUnit('cavalry', 'enemy', 5, 4), allyDef, 5), 5, '同盟 fireZone 不算敌对 → 不触发 crossfire');
}

// ---------------------------------------------------------------------------
// M5 expire 时序：大明 turnStart 移除 fireZone，工程设施保留
// ---------------------------------------------------------------------------
console.log('== M5 expire 时序 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const gun = mkUnit('shenjiBattalion', 'player', 3, 3);
  const def = mkUnit('heavyInfantry', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(gun, def);
  afterAttack(gun, def, 9);
  ctx.createFacility('turret', 'player', 4, 4, { hp: 10, duration: null });
  eq(zonesAt(6, 3).length, 1, 'fireZone 存在');
  eq(ctx.getAllFacilities().length, 2, 'fireZone + 炮台');
  beginTurn('player', false); // 大明回合开始 → expire
  eq(zonesAt(6, 3).length, 0, '大明 turnStart 后 fireZone 移除（持续 1 回合）');
  eq(ctx.getFacilitiesByType('turret').length, 1, '工程设施（duration null）保留');
  // 敌方回合（非大明）不触发大明 fireZone 的 expire（敌方 turnStart 只 expire 敌方设施）
  const gun2 = mkUnit('hongyiCannon', 'player', 3, 5);
  const def2 = mkUnit('militia', 'enemy', 6, 5, { hp: 30, maxHp: 30 });
  game.units.push(gun2, def2);
  afterAttack(gun2, def2, 16);
  eq(zonesAt(6, 5).length, 1, '大明回合内新 fireZone 存在');
  beginTurn('enemy', false); // 敌方回合 → 不清大明 fireZone
  eq(zonesAt(6, 5).length, 1, '敌方 turnStart 不清大明 fireZone（敌方仍受其影响）');
  beginTurn('player', false); // 大明下回合 → 清掉
  eq(zonesAt(6, 5).length, 0, '大明下回合 turnStart 后移除');
}

// ---------------------------------------------------------------------------
// M6 工程部署决策：fallback 不建 / UI pending / resolve / AI 不请求 / 行动消耗
// ---------------------------------------------------------------------------
console.log('== M6 工程部署决策 ==');
{
  // player 无 UI：fallback 选第一项"不建" → 零设施零花费
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const engr = mkUnit('worksEngineer', 'player', 3, 3);
  game.units.push(engr);
  beginTurn('player', false);
  eq(pendingMg('player').length, 0, '无头 sim 无 pending 决策');
  eq(ctx.getAllFacilities().length, 0, 'fallback 不建 → 无设施');
  eq(game.goldByOwner.player, 100, 'fallback 不建 → 金币不变');

  // player 有 UI：决策 pending，选项顺序正确
  ui();
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const engr2 = mkUnit('worksEngineer', 'player', 3, 3);
  game.units.push(engr2);
  beginTurn('player', false);
  const pend = pendingMg('player');
  eq(pend.length, 1, 'UI 下有一个待决部署决策');
  eq(pend[0].options.join(','), 'none,turret,watchtower,supplyDepot,mingTrench,bridge', '选项顺序：不建→炮台→瞭望塔→补给站→壕沟→临时桥');
  ctx.resolveDecision(pend[0].id, 'turret');
  eq(ctx.getFacilitiesByType('turret').length, 1, 'resolve 炮台 → 设施创建');
  eq(game.goldByOwner.player, 100 - 20, '建造花费 20 金币');
  eq(engr2.acted, true, '部署消耗本回合行动（acted）');
  eq(engr2.move, 0, '部署消耗本回合行动（move 归零）');
  noUi();

  // 金币不足：选项不出现（金币 15 < 炮台 20 → 只有"不建" → 不请求）
  ui();
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  game.goldByOwner.player = 15;
  const engr3 = mkUnit('worksEngineer', 'player', 3, 3);
  game.units.push(engr3);
  beginTurn('player', false);
  eq(pendingMg('player').length, 0, '金币不足（15<20）：不请求部署决策');
  noUi();

  // AI 工程师不请求决策（AI 不建工程设施）
  freshGame({
    settings: { faction: 'hre', nation: 'austria' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'mingCore' } },
  });
  ui();
  const aiEngr = mkUnit('worksEngineer', 'enemy', 3, 3);
  game.units.push(aiEngr);
  beginTurn('enemy', false);
  eq(pendingMg('enemy').length, 0, 'AI 工程师不请求部署决策（AI 不建工程设施）');
  noUi();
}

// ---------------------------------------------------------------------------
// M7 炮台：turnStart 范围伤害（不致死）+ 防御光环
// ---------------------------------------------------------------------------
console.log('== M7 炮台 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const turret = ctx.createFacility('turret', 'player', 4, 4, { hp: 10, duration: null });
  const foe1 = mkUnit('militia', 'enemy', 5, 4, { hp: 10, maxHp: 10 });  // 范围内 (1,0)
  const foe2 = mkUnit('militia', 'enemy', 7, 7, { hp: 10, maxHp: 10 });  // 范围外 (3,3)
  const ally = mkUnit('mingCavalry', 'player', 4, 5, { hp: 16, maxHp: 16 }); // 范围内己方
  const ally2 = mkUnit('mingCavalry', 'player', 8, 8, { hp: 16, maxHp: 16 }); // 范围外己方
  game.units.push(foe1, foe2, ally, ally2);
  beginTurn('player', false);
  eq(foe1.hp, 8, '炮台范围敌方每回合受 2 伤害（10→8）');
  eq(foe2.hp, 10, '范围外敌方不受伤害');
  // 不致死
  foe1.hp = 1;
  beginTurn('player', false);
  eq(foe1.hp, 1, '炮台伤害不致死（1 HP 保持）');
  // 防御光环：范围内己方被攻击 -1
  eq(beforeAttack(mkUnit('militia', 'enemy', 5, 5), ally, 5), 4, '炮台范围内己方被攻击 -1（5→4）');
  eq(beforeAttack(mkUnit('militia', 'enemy', 9, 9), ally2, 5), 5, '炮台范围外己方不减伤');
  // 同盟单位不受炮台伤害
  const friend = mkUnit('heavyInfantry', 'player', 5, 3, { hp: 18, maxHp: 18 });
  game.units.push(friend);
  beginTurn('player', false);
  eq(friend.hp, 18, '同盟（同 owner）单位不受炮台伤害');
}

// ---------------------------------------------------------------------------
// M8 补给站：turnStart 范围回血
// ---------------------------------------------------------------------------
console.log('== M8 补给站 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  ctx.createFacility('supplyDepot', 'player', 4, 4, { hp: 8, duration: null });
  const a = mkUnit('mingCavalry', 'player', 5, 4, { hp: 10, maxHp: 16 }); // 范围内
  const b = mkUnit('mingCavalry', 'player', 8, 8, { hp: 10, maxHp: 16 }); // 范围外
  const c = mkUnit('mingCavalry', 'player', 4, 5, { hp: 16, maxHp: 16 }); // 满血
  game.units.push(a, b, c);
  beginTurn('player', false);
  eq(a.hp, 12, '补给站范围己方回血 +2（10→12）');
  eq(b.hp, 10, '范围外不回血');
  eq(c.hp, 16, '满血不回血（不溢出）');
  // initial 回合不结算收益
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  ctx.createFacility('supplyDepot', 'player', 4, 4, { hp: 8, duration: null });
  const d = mkUnit('mingCavalry', 'player', 5, 4, { hp: 10, maxHp: 16 });
  game.units.push(d);
  beginTurn('player', true); // initial
  eq(d.hp, 10, 'initial 回合不结算回血（HRE 先例）');
}

// ---------------------------------------------------------------------------
// M9 壕沟：冲锋减免
// ---------------------------------------------------------------------------
console.log('== M9 壕沟 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  ctx.createFacility('mingTrench', 'player', 4, 4, { hp: 12, duration: null });
  const trenchUnit = mkUnit('qiArmy', 'player', 4, 4); // 站在壕沟上的明方单位
  const foeCav = mkUnit('cavalry', 'enemy', 3, 4); // charge 2
  const foeCavFar = mkUnit('mingCavalry', 'enemy', 3, 3); // charge 2，非满移动力
  game.units.push(trenchUnit, foeCav, foeCavFar);
  // 满移动力冲锋攻击壕沟上单位 → 减免 2（charge 2）
  eq(beforeAttack(foeCav, trenchUnit, 8), 6, '壕沟减免冲锋 2（8→6）');
  // 非满移动力 → 无冲锋，无减免
  foeCavFar.move = 1;
  eq(beforeAttack(foeCavFar, trenchUnit, 8), 8, '非满移动力无冲锋 → 不减免');
  // 无壕沟：冲锋全额
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const plainUnit = mkUnit('qiArmy', 'player', 4, 4);
  const cav2 = mkUnit('cavalry', 'enemy', 3, 4);
  game.units.push(plainUnit, cav2);
  eq(beforeAttack(cav2, plainUnit, 8), 8, '无壕沟：冲锋不减免（结果伤害不变）');
}

// ---------------------------------------------------------------------------
// M10 临时桥：桥格地形移动成本 -1（阶段3 裁决③，core 通用 moveCostMod 修正）
// ---------------------------------------------------------------------------
console.log('== M10 临时桥 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  game.terrain[4][4] = 'forest'; // 高成本地形（cost 2）
  const walker = mkUnit('qiArmy', 'player', 4, 4);
  game.units.push(walker);
  eq(ctx.movementCost(game, walker, 4, 4), 2, '无桥：森林地形移动成本 2');
  ctx.createFacility('bridge', 'player', 4, 4, { hp: 10, duration: 3, data: { moveCostMod: -1 } });
  eq(ctx.movementCost(game, walker, 4, 4), 1, '有桥：森林移动成本 -1（2→1）');
  // 平地（cost 1）不受桥影响（最低 1，成本本就 1）
  eq(ctx.movementCost(game, walker, 5, 4), 1, '平地移动成本仍 1（桥对低成本地形无额外效果）');
  // 桥对敌方单位同样生效（桥是格子属性，敌我皆可利用）
  const foe = mkUnit('militia', 'enemy', 4, 4);
  game.units.push(foe);
  eq(ctx.movementCost(game, foe, 4, 4), 1, '敌方单位过桥同样享受成本 -1');
}

// ---------------------------------------------------------------------------
// M11 水寨：朝鲜单位港口/海岸减伤
// ---------------------------------------------------------------------------
console.log('== M11 水寨 ==');
{
  freshGame({
    settings: { faction: 'hre', nation: 'austria' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'joseon' } },
  });
  // 港口：站在己方 shipyard
  const port = mkSite('shipyard', 'enemy', 5, 5);
  game.sites.push(port);
  const turtle = mkUnit('joseonTurtleShip', 'enemy', 5, 5, { hp: 28, maxHp: 28 });
  game.units.push(turtle);
  eq(beforeAttack(mkUnit('warship', 'player', 5, 6), turtle, 8), 5, '水寨：港口被攻击 -3（8→5）');
  // 海岸：相邻 water
  game.terrain[3][5] = 'water'; // turtle2(5,4) 的 (5,3) 邻格
  const turtle2 = mkUnit('joseonTurtleShip', 'enemy', 5, 4, { hp: 28, maxHp: 28 });
  game.units.push(turtle2);
  eq(beforeAttack(mkUnit('warship', 'player', 5, 3), turtle2, 8), 5, '水寨：海岸（相邻水域）被攻击 -3（8→5）');
  // 非港口/海岸
  const turtle3 = mkUnit('joseonTurtleShip', 'enemy', 8, 8, { hp: 28, maxHp: 28 });
  game.units.push(turtle3);
  eq(beforeAttack(mkUnit('warship', 'player', 8, 7), turtle3, 8), 8, '远离港口/海岸不减伤');
  // 非朝鲜国家不生效（大明本部攻击大明本部？用敌对明方验证）
  freshGame({
    settings: { faction: 'ming', nation: 'mingCore' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'joseon' } },
  });
  const mingCoreUnit = mkUnit('qiArmy', 'player', 5, 5, { hp: 16, maxHp: 16 });
  const port2 = mkSite('shipyard', 'player', 5, 5);
  game.sites.push(port2);
  game.units.push(mingCoreUnit);
  eq(beforeAttack(mkUnit('militia', 'enemy', 5, 4), mingCoreUnit, 5), 5, '非 joseon 国家单位在港口无减伤');
}

// ---------------------------------------------------------------------------
// M12 丛林伏击：安南森林首攻
// ---------------------------------------------------------------------------
console.log('== M12 丛林伏击 ==');
{
  freshGame({
    settings: { faction: 'hre', nation: 'austria' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'annam' } },
  });
  game.terrain[3][3] = 'forest'; // 攻击方所在格
  const elephant = mkUnit('annamElephant', 'enemy', 3, 3);
  const t1 = mkUnit('militia', 'player', 4, 3, { hp: 30, maxHp: 30 });
  const t2 = mkUnit('militia', 'player', 4, 4, { hp: 30, maxHp: 30 });
  game.units.push(elephant, t1, t2);
  eq(beforeAttack(elephant, t1, 12), 15, '森林首攻 +3（12→15）');
  eq(beforeAttack(elephant, t2, 12), 12, '同回合第二次不加');
  beginTurn('enemy', false); // 安南新回合
  eq(beforeAttack(elephant, t1, 12), 15, '新回合首次攻击恢复 +3');
  // 非森林
  game.terrain[3][3] = 'plain';
  beginTurn('enemy', false);
  eq(beforeAttack(elephant, t1, 12), 12, '非森林不触发');
  // 非安南国家不触发
  freshGame({
    settings: { faction: 'ming', nation: 'mingCore' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'mingCore' } },
  });
  game.terrain[3][3] = 'forest';
  const mingCav = mkUnit('mingCavalry', 'player', 3, 3);
  const mt = mkUnit('militia', 'enemy', 4, 3, { hp: 30, maxHp: 30 });
  game.units.push(mingCav, mt);
  eq(beforeAttack(mingCav, mt, 8), 8, '非安南国家森林无伏击加成');
}

// ---------------------------------------------------------------------------
// M13 锦衣卫 stealth：潜伏/攻击暴露/非本部不生效
// ---------------------------------------------------------------------------
console.log('== M13 锦衣卫 stealth ==');
{
  freshGame({
    settings: { faction: 'hre', nation: 'austria' },
    aiProfiles: { enemy: { faction: 'ming', nation: 'mingCore' } },
  });
  const spy = mkUnit('jinyiwei', 'enemy', 3, 3);
  game.units.push(spy);
  beginTurn('enemy', false);
  eq(ctx.hasStatus(spy.id, 'hidden'), true, '锦衣卫回合开始进入潜伏（hidden）');
  // 攻击后暴露
  const t = mkUnit('militia', 'player', 4, 3, { hp: 10, maxHp: 10 });
  game.units.push(t);
  afterAttack(spy, t, 8);
  eq(ctx.hasStatus(spy.id, 'hidden'), false, '攻击后移除 stealth（暴露行踪）');
  // 新回合恢复
  beginTurn('enemy', false);
  eq(ctx.hasStatus(spy.id, 'hidden'), true, '新回合重新潜伏');
  // 非 mingCore 大明单位不获得 stealth
  freshGame({ settings: { faction: 'ming', nation: 'joseon' } });
  const spy2 = mkUnit('jinyiwei', 'player', 3, 3);
  game.units.push(spy2);
  beginTurn('player', false);
  eq(ctx.hasStatus(spy2.id, 'hidden'), false, '非 mingCore（joseon）锦衣卫不获得 stealth');
}

// ---------------------------------------------------------------------------
// M14 设施被攻击摧毁（HRE 先例）
// ---------------------------------------------------------------------------
console.log('== M14 设施被攻击摧毁 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const turret = ctx.createFacility('turret', 'player', 4, 4, { hp: 10, duration: null });
  const guardUnit = mkUnit('qiArmy', 'player', 4, 4);
  game.units.push(guardUnit);
  // 敌方攻击站在炮台上的单位 → 炮台受损（50% × damage）
  beforeAttack(mkUnit('militia', 'enemy', 5, 4), guardUnit, 6);
  afterAttack(mkUnit('militia', 'enemy', 5, 4), guardUnit, 6);
  eq(turret.hp, 10 - 3, '炮台受损 50%×6=3（10→7）');
  // 摧毁：累积 damage 20 → 全毁
  for (let i = 0; i < 5; i++) {
    beforeAttack(mkUnit('militia', 'enemy', 5, 4), guardUnit, 4);
    afterAttack(mkUnit('militia', 'enemy', 5, 4), guardUnit, 4);
  }
  eq(ctx.getFacilitiesByType('turret').length, 0, '炮台被摧毁后移除');
  // fireZone 不可被摧毁（区域效果，自然过期）
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } });
  const gun = mkUnit('shenjiBattalion', 'player', 3, 3);
  const def = mkUnit('militia', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(gun, def);
  afterAttack(gun, def, 9);
  const foe = mkUnit('cavalry', 'enemy', 6, 2, { hp: 16, maxHp: 16 });
  game.units.push(foe);
  beforeAttack(foe, def, 5); // 攻击站在 fireZone 上的单位
  afterAttack(foe, def, 5);
  eq(zonesAt(6, 3).length, 1, '攻击不摧毁 fireZone（区域效果）');
}

// ---------------------------------------------------------------------------
// M15 跨局状态重置（syncGameRef）
// ---------------------------------------------------------------------------
console.log('== M15 跨局状态重置 ==');
{
  freshGame({ settings: { faction: 'ming', nation: 'annam' } });
  game.terrain[3][3] = 'forest';
  const el = mkUnit('annamElephant', 'player', 3, 3);
  const t = mkUnit('militia', 'enemy', 4, 3, { hp: 30, maxHp: 30 });
  game.units.push(el, t);
  beforeAttack(el, t, 12); // 触发伏击，标记加入
  eq(globalThis.__mingDebug.nations.state().annamFirstHit.length, 1, '伏击标记已加入');
  freshGame({ settings: { faction: 'ming', nation: 'mingCore' } }); // 新 game 对象
  fz.syncGameRef(ctx);
  eng.syncGameRef(ctx);
  nations.syncGameRef(ctx);
  eq(globalThis.__mingDebug.nations.state().annamFirstHit.length, 0, '新局开始：伏击标记已清空');
  const g2 = mkUnit('shenjiBattalion', 'player', 3, 3);
  const d2 = mkUnit('militia', 'enemy', 6, 3, { hp: 30, maxHp: 30 });
  game.units.push(g2, d2);
  afterAttack(g2, d2, 9);
  eq(zonesAt(6, 3).length, 1, '新局正常重新生成 fireZone');
}

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------
console.log('========================================');
console.log(`大明 harness：${passed} PASS / ${failed} FAIL`);
if (failed > 0) process.exit(1);
