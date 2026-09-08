'use strict';
// 威尼斯 AI 决策：贸易路线（venRoute_*）/ 热那亚借贷（venLoan_*）/
// 雇佣兵市场（venMerc_*）/ 拉古萨中立商港（venPort_*）。
// 决策只发生在本层（决策选择层）；确定性：不调用任何随机数（RNG 零变化）。

import { MERCENARY } from '../factions/venice/tradeNetwork.js';
import { enemyCountNear } from './aiUtil.js';

const LOAN_AT_GOLD = 20;      // 金币低于此值才借贷（花未来收入换当前现金）
const MERC_GOLD_MIN = 60;     // 金币低于此值不雇佣
const MERC_RESERVE = 15;      // 雇佣后保留金币
const MERC_ENEMY_RANGE = 12;  // 12 格内有敌军 = 交战中
const MERC_CAV_NEED = 2;      // 敌方骑兵 >= 2 → 反骑长枪兵

export function selectVenRoute(decisionId, context) {
  const cands = (context && Array.isArray(context.cands)) ? context.cands : [];
  if (!cands.length) return 'none';
  // 收益最高 → 风险最低 → 路径最短（路线无直接成本，建最优者即可）
  let best = 0;
  for (let i = 1; i < cands.length; i++) {
    const a = cands[best];
    const b = cands[i];
    const incomeA = a.income || 0;
    const incomeB = b.income || 0;
    const riskA = a.risk || 0;
    const riskB = b.risk || 0;
    const lenA = a.pathLen || 0;
    const lenB = b.pathLen || 0;
    if (incomeB > incomeA ||
        (incomeB === incomeA && riskB < riskA) ||
        (incomeB === incomeA && riskB === riskA && lenB < lenA)) {
      best = i;
    }
  }
  return `route:${best}`;
}

export function selectVenLoan(decisionId, context) {
  const { ctx, owner } = context || {};
  if (!ctx || !ctx.game) return 'none';
  const gold = ctx.game.goldByOwner[owner] || 0;
  return gold < LOAN_AT_GOLD ? 'loan' : 'none';
}

export function selectVenMerc(decisionId, context) {
  const { ctx, owner, options } = context || {};
  if (!ctx || !ctx.game || !Array.isArray(options)) return 'none';
  const gold = ctx.game.goldByOwner[owner] || 0;
  if (gold < MERC_GOLD_MIN) return 'none';

  // 敌方骑兵构成（charge 兵种）
  let enemyCav = 0;
  for (const u of ctx.game.units) {
    if (u.owner === owner || u.owner === 'neutral') continue;
    if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
    const meta = ctx.typeMeta(u.type);
    if (meta && meta.charge) enemyCav += 1;
  }
  // 是否交战中：己方任意单位 12 格内有敌军
  let atWar = false;
  for (const u of ctx.game.units) {
    if (u.owner !== owner) continue;
    if (enemyCountNear(ctx, owner, u.x, u.y, MERC_ENEMY_RANGE) > 0) { atWar = true; break; }
  }

  const costOf = (id) => {
    const d = MERCENARY.options.find(o => o.id === id);
    return d ? Math.round(d.baseCost * MERCENARY.markup) : Infinity;
  };
  if (enemyCav >= MERC_CAV_NEED) {
    const id = 'spearman';
    if (options.some(o => o.id === `merc:${id}`) && gold - costOf(id) >= MERC_RESERVE) return `merc:${id}`;
  }
  if (atWar) {
    const id = 'crossbow';
    if (options.some(o => o.id === `merc:${id}`) && gold - costOf(id) >= MERC_RESERVE) return `merc:${id}`;
  }
  return 'none';
}

export function selectVenPort(decisionId, context) {
  const options = (context && Array.isArray(context.options)) ? context.options : [];
  const port = options.find(o => typeof o.id === 'string' && o.id.startsWith('port:'));
  return port ? port.id : 'none';
}

export function registerVeniceAi(register) {
  register('venRoute_', selectVenRoute);
  register('venLoan_', selectVenLoan);
  register('venMerc_', selectVenMerc);
  register('venPort_', selectVenPort);
}
