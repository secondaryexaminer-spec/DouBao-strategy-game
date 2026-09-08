'use strict';
// 马穆鲁克 AI 决策：Veteran 3 晋升（mlV3_*）/ 巴格达学术指令（mlTactic_*）。
// 决策只发生在本层（决策选择层）；确定性：不调用任何随机数（RNG 零变化）。

import { enemyCountNear } from './aiUtil.js';

const TACTIC_ENEMY_RANGE = 4; // 学者 4 格内有敌军 → 守势，否则进攻

export function selectMlV3(decisionId, context) {
  const { ctx, unitId, options } = context || {};
  if (!ctx || !ctx.game) return 'charge';
  const unit = ctx.game.units.find(u => u.id === unitId);
  const meta = unit ? ctx.typeMeta(unit.type) : null;
  // 冲锋型骑兵 → 冲锋强化（满移动力攻击 +3，与骑兵打法契合）；
  // 非冲锋单位 → 移动力强化（追敌/拉扯）；击杀回血留给需要续航的场景。
  const choice = meta && meta.charge ? 'charge' : 'swift';
  return Array.isArray(options) && options.some(o => o.id === choice) ? choice : 'charge';
}

export function selectMlTactic(decisionId, context) {
  const { ctx, owner, options } = context || {};
  if (!ctx || !ctx.game) return 'defensive';
  const scholar = ctx.game.units.find(u => u.owner === owner && u.type === 'caliphScholar');
  const threat = scholar ? enemyCountNear(ctx, owner, scholar.x, scholar.y, TACTIC_ENEMY_RANGE) : 0;
  // 前线受威胁 → 守势（减伤）；无威胁 → 进攻（推线加成）
  const choice = threat >= 1 ? 'defensive' : 'offensive';
  return Array.isArray(options) && options.some(o => o.id === choice) ? choice : 'defensive';
}

export function registerMamlukAi(register) {
  register('mlV3_', selectMlV3);
  register('mlTactic_', selectMlTactic);
}
