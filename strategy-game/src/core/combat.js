'use strict';
// 战斗计算：纯函数，零 DOM；game 状态显式传入（game.terrain / game.sites）。
// 从 src/main.js 抽取（siteBonus/matchupBonus/computeDamage/previewCombat/canAttack），行为逐字节一致。
// 有副作用的 attack/removeUnit 暂留 main.js，依赖本模块的纯计算。
import { TERRAIN } from './constants.js';
import { typeMeta, siteMeta, clamp, rnd, diagonalDist, inUnitRange } from './utils.js';
import { areAllies, areEnemies } from './teams.js';

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

export function computeDamage(game, attacker, defender, fromCell, toCell, isCounter, deterministic) {
  const attackMeta = typeMeta(attacker.type);
  const defenseMeta = typeMeta(defender.type);
  const attackSite = getSite(game, fromCell.x, fromCell.y);
  const defenseSite = getSite(game, toCell.x, toCell.y);
  const terrainDef = TERRAIN[game.terrain[toCell.y][toCell.x]].def;
  // 阵营创新机制：圣战（马穆鲁克对异阵营攻击+2）、帝国议会（神罗3+城攻击+1，5+城防御+1）
  const attackerFaction = attacker.owner === 'player' ? game.settings?.faction : game.aiProfiles?.[attacker.owner]?.faction;
  const defenderFaction = defender.owner === 'player' ? game.settings?.faction : game.aiProfiles?.[defender.owner]?.faction;
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
  const atkScholar = game.units.find(u => u.owner === attacker.owner && u.type === 'caliphScholar' && Math.abs(u.x - attacker.x) <= 2 && Math.abs(u.y - attacker.y) <= 2);
  const defScholar = game.units.find(u => u.owner === defender.owner && u.type === 'caliphScholar' && Math.abs(u.x - defender.x) <= 2 && Math.abs(u.y - defender.y) <= 2);
  const attackBuff = siteBonus(game, attackSite, attacker, 'attack') + matchupBonus(attacker, defender) + factionAtkBonus + (atkScholar ? 1 : 0);
  const defenseBuff = siteBonus(game, defenseSite, defender, 'defense') + terrainDef + factionDefBonus + (defScholar ? 1 : 0);
  const attackHpFactor = 0.55 + attacker.hp / attacker.maxHp * 0.65;
  const defendHpFactor = 0.55 + defender.hp / defender.maxHp * 0.55;
  const charge = attackMeta.charge && !isCounter && diagonalDist(fromCell, toCell) === 1 && attacker.move === attacker.maxMove ? attackMeta.charge : 0;
  const base = (attackMeta.atk + attackBuff + attacker.rank) * attackHpFactor + charge;
  const shield = (defenseMeta.def + defenseBuff) * defendHpFactor;
  const variance = deterministic ? 1 : rnd(3);
  return clamp(Math.round(base - shield * 0.58 + 2 + variance), 1, defender.hp);
}

export function previewCombat(game, attacker, defender, fromCell, deterministic) {
  const attackFrom = fromCell || { x: attacker.x, y: attacker.y };
  const damage = computeDamage(game, attacker, defender, attackFrom, { x: defender.x, y: defender.y }, false, deterministic);
  const targetLeft = Math.max(0, defender.hp - damage);
  let counter = 0;
  if (targetLeft > 0 && inUnitRange(typeMeta(defender.type).range, { x: defender.x, y: defender.y }, attackFrom)) {
    counter = clamp(Math.round(computeDamage(game, defender, attacker, { x: defender.x, y: defender.y }, attackFrom, true, deterministic) * 0.8), 0, attacker.hp);
  }
  return { damage, counter, kill: targetLeft <= 0, targetLeft, selfLeft: Math.max(0, attacker.hp - counter) };
}

export function canAttack(game, attacker, defender, fromCell = { x: attacker.x, y: attacker.y }) {
  return !!attacker && !!defender && attacker.owner === game.side && !attacker.hasAttacked && areEnemies(game.teams, attacker.owner, defender.owner) && inUnitRange(typeMeta(attacker.type).range, fromCell, defender);
}
