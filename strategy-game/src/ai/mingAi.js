'use strict';
// 大明 AI 决策：工程设施部署（mgEng_*）。
// 按位置威胁 / 己方伤兵 / 水域判定选 炮台/补给站/临时桥/瞭望塔。
// 决策只发生在本层（决策选择层）；确定性：不调用任何随机数（RNG 零变化）。

import { ENGINEERING } from '../factions/ming/engineering.js';
import { enemyCountNear, ownWoundedNear } from './aiUtil.js';

const TURRET_ENEMY_RANGE = 6;   // 6 格内有敌军 → 炮台（范围火力 + 防御光环）
const WOUNDED_RANGE = 3;        // 附近己方伤兵判定半径
const WOUNDED_NEED = 2;         // 伤兵 >= 2 → 补给站
const GOLD_RESERVE = 12;        // 部署后保留金币

export function selectMgEng(decisionId, context) {
  const { ctx, owner, unitId, options } = context || {};
  if (!ctx || !ctx.game || !Array.isArray(options)) return 'none';
  const unit = ctx.game.units.find(u => u.id === unitId);
  if (!unit || unit.owner !== owner) return 'none';
  const gold = ctx.game.goldByOwner[owner] || 0;

  const have = (id) => options.some(o => o.id === id);
  const affordable = (id) => {
    const def = ENGINEERING[id];
    return !!def && gold - def.cost >= GOLD_RESERVE;
  };

  // 1. 前线威胁 → 炮台
  if (have('turret') && affordable('turret') &&
      enemyCountNear(ctx, owner, unit.x, unit.y, TURRET_ENEMY_RANGE) > 0) {
    return 'turret';
  }
  // 2. 附近己方伤兵密集 → 补给站
  if (have('supplyDepot') && affordable('supplyDepot') &&
      ownWoundedNear(ctx, owner, unit.x, unit.y, WOUNDED_RANGE) >= WOUNDED_NEED) {
    return 'supplyDepot';
  }
  // 3. 邻接水域 → 临时桥（跨水通道，全体可用）
  if (have('bridge') && affordable('bridge') && waterAdjacent(ctx, unit)) {
    return 'bridge';
  }
  // 4. 兜底：瞭望塔（便宜，与火力区联动）
  if (have('watchtower') && affordable('watchtower')) return 'watchtower';
  return 'none';
}

function waterAdjacent(ctx, unit) {
  const g = ctx.game;
  if (!g || !g.terrain) return false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = unit.x + dx;
      const y = unit.y + dy;
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
      if (g.terrain[y] && g.terrain[y][x] === 'water') return true;
    }
  }
  return false;
}

export function registerMingAi(register) {
  register('mgEng_', selectMgEng);
}
