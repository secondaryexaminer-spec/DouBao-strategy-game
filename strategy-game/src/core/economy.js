'use strict';
// src/core/economy.js —— 收入/据点经济/驻军修整模块（从 main.js 闭包渐进抽取，行为零变化）。
// 抽取原则：本模块零 DOM；闭包辅助函数经 deps 注入（main.js 传原函数），constants 纯函数直接 import。
// 抽取记录见 .vibecoding/MEMORY.md（main.js 拆分窗口第二刀）。

import { eventBus } from './events.js';
import { siteMeta, typeMeta, dist } from './utils.js';

// 单位可用补给点：陆战单位看城市/营地/军营，海战单位看船坞/堡垒（同盟据点）
export function supportSites(game, deps, unitEntry) {
  const { areAllies } = deps;
  return game.sites.filter(siteEntry => areAllies(siteEntry.owner, unitEntry.owner) && ((((siteEntry.kind === 'city' || siteEntry.kind === 'camp' || siteEntry.kind === 'barracksSmall' || siteEntry.kind === 'barracksLarge') && typeMeta(unitEntry.type).domain === 'land')) || ((siteEntry.kind === 'shipyard' || siteEntry.kind === 'fortress') && typeMeta(unitEntry.type).domain === 'sea')));
}

// 回合开始回血：有补给点时按距离回血（巴伐利亚 +1 为国家机制，原文照搬）
export function healOwner(game, deps, owner) {
  const { healMultiplier } = deps;
  for (const unitEntry of game.units.filter(entry => entry.owner === owner)) {
    const supports = supportSites(game, deps, unitEntry);
    if (!supports.length) {
      unitEntry.lastAttacked = false;
      continue;
    }
    const nearest = Math.min(...supports.map(siteEntry => dist(siteEntry, unitEntry)));
    if (!unitEntry.lastAttacked) {
      const ratio = (nearest === 0 ? 0.16 : nearest <= 1 ? 0.1 : nearest >= 14 ? 0.02 : Math.max(0.02, 0.1 - (nearest - 1) * 0.08 / 13)) * healMultiplier(unitEntry);
      const healNat = unitEntry.owner === 'player' ? game.settings?.nation : game.aiProfiles?.[unitEntry.owner]?.nation;
      const bavariaBonus = healNat === 'bavaria' ? 1 : 0;
      unitEntry.hp = Math.min(unitEntry.maxHp, unitEntry.hp + Math.max(1, Math.ceil(unitEntry.maxHp * ratio)) + bavariaBonus);
    }
    unitEntry.lastAttacked = false;
  }
}

// 回合收入：据点基础收入 × 联盟倍率 + 国家加成（威尼斯 1.25 / 奥地利·埃及城×2 / 热那亚 +10%）
export function grantIncome(game, deps, owner) {
  const { ownerName, log } = deps;
  const base = game.sites.filter(entry => entry.owner === owner).reduce((sum, entry) => sum + entry.income, 0);
  const incFac = owner === 'player' ? game.settings?.faction : game.aiProfiles?.[owner]?.faction;
  const incNation = owner === 'player' ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
  const factionMult = incFac === 'venice' ? 1.25 : 1;
  // 国家机制：收入加成（加法叠加，避免威尼斯过强）
  let nationIncomeBonus = 0;
  if (incNation === 'austria' || incNation === 'egypt') nationIncomeBonus += game.sites.filter(s => s.kind === 'city' && s.owner === owner).length * 2;
  if (incNation === 'genoa') nationIncomeBonus += Math.round(base * 0.1);
  const gain = Math.round(base * (game.settings?.incomeMult || 1) * factionMult) + nationIncomeBonus;
  const incomePayload = { owner, amount: gain };
  eventBus.emit('incomeCalculated', incomePayload);
  game.goldByOwner[owner] += incomePayload.amount;
  if (gain > 0) {
    log(`${ownerName(owner)}获得 ${gain} 金币收入。`, 'gold');
  }
  return incomePayload.amount; // 阶段5：返回收入额供平衡统计（原调用方不依赖返回值，零行为变化）
}

// 据点升级费用（siteMeta 的升级表）
export function siteUpgradeCost(game, deps, siteEntry) {
  return siteMeta(siteEntry.kind).upgradeCosts[siteEntry.tier] || 0;
}

// 本回合剩余建造额度
export function buildBudgetLeft(game, deps, owner) {
  return (game.settings?.buildCap ?? 100) - (game.buildsThisTurn?.[owner] || 0);
}

// 记录建造数量（回合内建造额度）
export function recordBuild(game, deps, owner, count) {
  game.buildsThisTurn = game.buildsThisTurn || {};
  game.buildsThisTurn[owner] = (game.buildsThisTurn[owner] || 0) + count;
}

// 据点升级：扣费 → tier+1 → 收入 +3(城)/+2(其他)
export function upgradeSite(game, deps, owner, siteEntry) {
  const { tierName, log } = deps;
  const cost = siteUpgradeCost(game, deps, siteEntry);
  if (!siteEntry || siteEntry.owner !== owner || siteEntry.tier >= siteMeta(siteEntry.kind).maxTier || game.goldByOwner[owner] < cost) {
    return false;
  }
  game.goldByOwner[owner] -= cost;
  siteEntry.tier += 1;
  siteEntry.income += siteEntry.kind === 'city' ? 3 : 2;
  log(`${siteEntry.name}升级为${tierName(siteEntry.tier)}${siteMeta(siteEntry.kind).name}。`, 'system');
  return true;
}

// 驻军修整：据点格内有己方单位时满血（费用按据点种类）
export function fullHealSite(game, deps, owner, siteEntry) {
  const { getUnit, log } = deps;
  const occupant = getUnit(siteEntry.x, siteEntry.y);
  const cost = siteEntry.kind === 'city' || siteEntry.kind === 'camp' ? 5 : siteEntry.kind === 'shipyard' ? 6 : 7;
  if (!siteEntry || siteEntry.owner !== owner || !occupant || occupant.owner !== owner || game.goldByOwner[owner] < cost) {
    return false;
  }
  game.goldByOwner[owner] -= cost;
  occupant.hp = occupant.maxHp;
  log(`${siteEntry.name}花费${cost}金币完成驻军修整。`, 'gold');
  return true;
}

// AI 自动修整：据点内低血量驻军（≤45%）且金币充足时满血
export function aiRepair(game, deps, owner) {
  const { getUnit, log, ownerName } = deps;
  for (const siteEntry of game.sites.filter(entry => entry.owner === owner)) {
    const occupant = getUnit(siteEntry.x, siteEntry.y);
    if (!occupant || occupant.owner !== owner || occupant.hp >= occupant.maxHp) {
      continue;
    }
    const cost = siteEntry.kind === 'city' || siteEntry.kind === 'camp' ? 5 : siteEntry.kind === 'shipyard' ? 6 : 7;
    if (occupant.hp <= occupant.maxHp * 0.45 && game.goldByOwner[owner] >= cost) {
      game.goldByOwner[owner] -= cost;
      occupant.hp = occupant.maxHp;
      log(`${ownerName(owner)}在${siteEntry.name}完成驻军修整。`, 'system');
    }
  }
}
