'use strict';
// 战斗计算：纯函数，零 DOM；game 状态显式传入（game.terrain / game.sites）。
// 从 src/main.js 抽取（siteBonus/matchupBonus/computeDamage/previewCombat/canAttack），行为逐字节一致。
// 有副作用的 attack/removeUnit 暂留 main.js，依赖本模块的纯计算。
import { TERRAIN } from './constants.js';
import { typeMeta, siteMeta, clamp, rnd, diagonalDist, inUnitRange } from './utils.js';
import { areAllies, areEnemies } from './teams.js';

// 攻城器械：对据点驻军额外伤害（规格书"投石车=攻城"定位 + 兵种描述；阶段4 补齐）
const SIEGE_DAMAGE = { catapult: 2, heavyCatapult: 3, siegeCrossbow: 2, nomadChariot: 2, nomadCannon: 2 };

export function getSite(game, x, y) {
  return game.sites.find(entry => entry.x === x && entry.y === y) || null;
}

export function siteBonus(game, siteEntry, unitEntry, mode) {
  if (!siteEntry || !areAllies(game.teams, siteEntry.owner, unitEntry.owner)) {
    return 0;
  }
  const domain = typeMeta(unitEntry.type).domain;
  if ((siteEntry.kind === 'city' || siteEntry.kind === 'camp' || siteEntry.kind === 'barracksSmall' || siteEntry.kind === 'barracksLarge') && domain === 'land') {
    const supportTier = siteMeta(siteEntry.kind).supportTier || siteEntry.tier;
    return mode === 'attack' ? supportTier : supportTier * 2;
  }
  if (siteEntry.kind === 'shipyard' && domain === 'sea') {
    return mode === 'attack' ? siteEntry.tier : siteEntry.tier + 1;
  }
  if (siteEntry.kind === 'fortress' && domain === 'sea') {
    return mode === 'attack' ? 1 : 3;
  }
  return 0;
}

export function matchupBonus(attacker, defender) {
  const bonusVs = typeMeta(attacker.type).bonusVs || {};
  return bonusVs[defender.type] || 0;
}

function combatNation(game, owner) {
  if (owner === 'player') return game.settings?.nation;
  return game.aiProfiles?.[owner]?.nation;
}

export function computeDamage(game, attacker, defender, fromCell, toCell, isCounter, deterministic) {
  const attackMeta = typeMeta(attacker.type);
  const defenseMeta = typeMeta(defender.type);
  const attackSite = getSite(game, fromCell.x, fromCell.y);
  const defenseSite = getSite(game, toCell.x, toCell.y);
  const terrainDef = TERRAIN[game.terrain[toCell.y][toCell.x]].def;
  // 联盟创新机制：圣战（马穆鲁克对异联盟攻击+2）、帝国议会（神罗3+城攻击+1，5+城防御+1）
  const attackerFaction = attacker.owner === 'player' ? game.settings?.faction : game.aiProfiles?.[attacker.owner]?.faction;
  const defenderFaction = defender.owner === 'player' ? game.settings?.faction : game.aiProfiles?.[defender.owner]?.faction;
  const atkNation = combatNation(game, attacker.owner);
  const defNation = combatNation(game, defender.owner);
  let factionAtkBonus = 0;
  let factionDefBonus = 0;
  if (attackerFaction === 'mamluk' && attackerFaction !== defenderFaction) factionAtkBonus += 2;
  if (attackerFaction === 'hre') {
    const hreCities = game.sites.filter(s => s.kind === 'city' && s.owner === attacker.owner).length;
    if (hreCities >= 3) factionAtkBonus += 1;
  }
  if (defenderFaction === 'hre') {
    const hreCities = game.sites.filter(s => s.kind === 'city' && s.owner === defender.owner).length;
    if (hreCities >= 5) factionDefBonus += 1;
  }
  const scholarRange = defNation === 'baghdad' || atkNation === 'baghdad' ? 3 : 2;
  const atkScholar = game.units.find(u => u.owner === attacker.owner && u.type === 'caliphScholar' && Math.abs(u.x - attacker.x) <= scholarRange && Math.abs(u.y - attacker.y) <= scholarRange);
  const defScholar = game.units.find(u => u.owner === defender.owner && u.type === 'caliphScholar' && Math.abs(u.x - defender.x) <= scholarRange && Math.abs(u.y - defender.y) <= scholarRange);
  const attackBuff = siteBonus(game, attackSite, attacker, 'attack') + matchupBonus(attacker, defender) + factionAtkBonus + (atkScholar ? 1 : 0);
  const defenseBuff = siteBonus(game, defenseSite, defender, 'defense') + terrainDef + factionDefBonus + (defScholar ? 1 : 0);
  const attackHpFactor = 0.55 + attacker.hp / attacker.maxHp * 0.65;
  const defendHpFactor = 0.55 + defender.hp / defender.maxHp * 0.55;
  const chargeBonus = atkNation === 'austria' && attackMeta.charge ? 1 : 0;
  const charge = attackMeta.charge && !isCounter && diagonalDist(fromCell, toCell) === 1 && attacker.move === attacker.maxMove && defender.type !== 'pikeSquare' ? attackMeta.charge + chargeBonus : 0;
  // 兵种级别效果：帝国近卫军守点防御+3，通用近卫军守点防御+1（规格书 §近卫军=守点，阶段4 补齐），
  // 安南象兵对步兵+5
  const defenderOnSite = !!getSite(game, toCell.x, toCell.y);
  const guardBonus = defender.type === 'imperialGuard' && defenderOnSite && getSite(game, toCell.x, toCell.y).owner === defender.owner ? 3
    : defender.type === 'guard' && defenderOnSite && getSite(game, toCell.x, toCell.y).owner === defender.owner ? 1 : 0;
  const elephantBonus = attacker.type === 'annamElephant' && defenseMeta.domain === 'land' && !defenseMeta.charge ? 5 : 0;
  // 国家机制：攻防加成
  let nationAtk = 0, nationDef = 0;
  // （阶段3 移除：金帐本部骑兵攻+1 → 可汗威望接管（nationMechanics.js）；白帐对骑兵+2 →
  //  绿洲网络接管；蓝帐步兵防+1 → 伏击阵地接管）
  if (atkNation === 'veniceCore' && attackMeta.domain === 'sea') nationAtk += 1; // 威尼斯本部：海军攻击+1
  if (atkNation === 'syria' && attackerFaction !== defenderFaction) nationAtk += 1; // 叙利亚：对异联盟攻击+1
  if (atkNation === 'prussia' && !!getSite(game, toCell.x, toCell.y)) nationAtk += 3; // 普鲁士：对据点内单位伤害+3
  // 攻城器械：对据点驻军额外伤害（阶段4 补齐；与普鲁士+3 不同来源可叠加）
  if (getSite(game, toCell.x, toCell.y)) nationAtk += SIEGE_DAMAGE[attacker.type] || 0;
  if (defNation === 'baghdad' && defender.type === 'caliphScholar') nationDef += 2; // 巴格达：光环单位自身防御+2
  const base = (attackMeta.atk + attackBuff + attacker.rank + elephantBonus + nationAtk) * attackHpFactor + charge;
  const shield = (defenseMeta.def + defenseBuff + guardBonus + nationDef) * defendHpFactor;
  const variance = deterministic ? 1 : rnd(3);
  return clamp(Math.round(base - shield * 0.58 + 2 + variance), 1, defender.hp);
}

export function previewCombat(game, attacker, defender, fromCell, deterministic) {
  const attackFrom = fromCell || { x: attacker.x, y: attacker.y };
  const damage = computeDamage(game, attacker, defender, attackFrom, { x: defender.x, y: defender.y }, false, deterministic);
  const targetLeft = Math.max(0, defender.hp - damage);
  let counter = 0;
  if (targetLeft > 0 && inUnitRange(effectiveRange(game, defender), { x: defender.x, y: defender.y }, attackFrom)) {
    counter = clamp(Math.round(computeDamage(game, defender, attacker, { x: defender.x, y: defender.y }, attackFrom, true, deterministic) * 0.8), 0, attacker.hp);
  }
  return { damage, counter, kill: targetLeft <= 0, targetLeft, selfLeft: Math.max(0, attacker.hp - counter) };
}

function effectiveRange(game, unitEntry) {
  const base = typeMeta(unitEntry.type).range;
  if (base <= 1) return base;
  const nat = combatNation(game, unitEntry.owner);
  // 热那亚：海军远程射程+1；叙利亚：远程射程+1
  if (nat === 'genoa' && typeMeta(unitEntry.type).domain === 'sea') return base + 1;
  if (nat === 'syria') return base + 1;
  // 巴伐利亚山地弩手：驻扎山地射程+1（阶段4 补齐，规格书/描述）
  if (nat === 'bavaria' && game.terrain[unitEntry.y]?.[unitEntry.x] === 'hill') return base + 1;
  return base;
}

export function canAttack(game, attacker, defender, fromCell = { x: attacker.x, y: attacker.y }) {
  return !!attacker && !!defender && attacker.owner === game.side && !attacker.hasAttacked && areEnemies(game.teams, attacker.owner, defender.owner) && inUnitRange(effectiveRange(game, attacker), fromCell, defender);
}
