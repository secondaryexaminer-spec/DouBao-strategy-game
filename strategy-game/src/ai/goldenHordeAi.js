'use strict';
// 金帐 AI 决策：游牧营地建造（ghCampBuild_*）+ 营地行动（ghCamp_*）。
// 决策只发生在本层（决策选择层）；确定性：不调用任何随机数（RNG 零变化）。

import { NOMAD_CAMP } from '../factions/goldenHorde/nomadCamp.js';
import { enemyCountNear } from './aiUtil.js';

const CAMP_BUILD_RESERVE_FIRST = 15;    // 首营：建后保留金币
const CAMP_BUILD_RESERVE_SECOND = 30;   // 第二营更保守
const BUILD_ENEMY_RANGE = 4;            // 4 格内有敌军不建第二营（前线风险）
const CAMP_ALARM_RANGE = 3;             // 营地 3 格内有敌军 → 视为受威胁
const MIGRATE_SAFE_RANGE = 3;           // 迁移目标格安全半径
const PRODUCE_RESERVE = 10;             // 生产后保留金币

// 生产优先级：高机动/高掠夺价值的金帐单位优先
const PRODUCE_PRIORITY = ['hordeCavalry', 'horseArcher', 'lightCavalry', 'nomadChariot', 'nomadArcher'];

export function selectGhCampBuild(decisionId, context) {
  const { ctx, owner, unitId, options } = context || {};
  if (!ctx || !ctx.game || !Array.isArray(options)) return 'none';
  if (!options.some(o => o.id === 'build')) return 'none';
  const camps = ctx.getFacilitiesByType(NOMAD_CAMP.type).filter(f => f.owner === owner);
  if (camps.length >= NOMAD_CAMP.maxCamps) return 'none';
  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return 'none';
  const gold = ctx.game.goldByOwner[owner] || 0;

  // 首营：尽快建立经济/威望节点（即使前线，金帐靠营地扩张）；
  // 第二营：需金币更充裕且远离敌军。
  if (camps.length >= 1 && enemyCountNear(ctx, owner, unit.x, unit.y, BUILD_ENEMY_RANGE) > 0) return 'none';
  const reserve = camps.length === 0 ? CAMP_BUILD_RESERVE_FIRST : CAMP_BUILD_RESERVE_SECOND;
  if (gold - NOMAD_CAMP.buildCost < reserve) return 'none';
  return 'build';
}

export function selectGhCampAction(decisionId, context) {
  const { ctx, owner, campId, options } = context || {};
  if (!ctx || !ctx.game || !Array.isArray(options)) return 'none';
  const camp = ctx.getFacilitiesByType(NOMAD_CAMP.type).find(f => f.id === campId);
  if (!camp || camp.owner !== owner) return 'none';
  const gold = ctx.game.goldByOwner[owner] || 0;

  // 1. 营地受威胁 → 迁往最安全候选格（仅当存在比现状更安全的格）
  const curDanger = enemyCountNear(ctx, owner, camp.x, camp.y, CAMP_ALARM_RANGE);
  if (curDanger > 0) {
    let best = null; // {id, danger}
    for (const o of options) {
      if (typeof o.id !== 'string' || !o.id.startsWith('migrate:')) continue;
      const parts = o.id.slice('migrate:'.length).split(',');
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      if (Number.isNaN(x) || Number.isNaN(y)) continue;
      const danger = enemyCountNear(ctx, owner, x, y, MIGRATE_SAFE_RANGE);
      if (!best || danger < best.danger) best = { id: o.id, danger };
    }
    if (best && best.danger < curDanger) return best.id;
  }

  // 2. 生产：按优先级选可生产、且生产后保留余钱的最优单位（选项层已按金币过滤）
  for (const type of PRODUCE_PRIORITY) {
    const opt = options.find(o => o.id === `produce:${type}`);
    if (!opt) continue;
    const meta = ctx.typeMeta(type);
    if (!meta) continue;
    if (gold - meta.cost >= PRODUCE_RESERVE) return opt.id;
  }
  return 'none';
}

export function registerGoldenHordeAi(register) {
  register('ghCampBuild_', selectGhCampBuild);
  register('ghCamp_', selectGhCampAction);
}
