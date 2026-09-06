'use strict';
// 联盟判定：基于 teams 映射的纯逻辑（零 game 闭包依赖）。
// main.js 内部保留同名薄封装（读 game.teams），调用点零改动。
import { TEAMS } from './constants.js';

// teams[owner] 缺省回退 'A'，与 main.js 原实现一致。
export function teamOf(teams, owner) {
  return (teams && teams[owner]) || 'A';
}

export function areAllies(teams, a, b) {
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  if (a === 'neutral' || b === 'neutral') {
    return false;
  }
  return teamOf(teams, a) === teamOf(teams, b);
}

export function areEnemies(teams, a, b) {
  return !!a && !!b && a !== 'neutral' && b !== 'neutral' && !areAllies(teams, a, b);
}

// 导出默认联盟（供需要完整联盟列表的场景）。
export const ALL_TEAMS = TEAMS;
