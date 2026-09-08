'use strict';
// AI 决策公共工具（src/ai/）：owner 判定 + 战场查询。
// 铁律：所有 AI 决策函数必须确定性（禁止调用任何随机数 / 禁止随机顺序遍历），
// 否则改变 RNG 调用序列，违反"RNG 零变化"。
// 本文件是叶子模块（不 import 任何其他模块），机制层也可安全引用 isAiOwner。

// AI owner 命名：main.js newGame 生成 ai0/ai1/...（spectator 模式下无 player）。
export function isAiOwner(owner) {
  return typeof owner === 'string' && /^ai\d+$/.test(owner);
}

// 敌方单位计数（切比雪夫距离 <= range；排除同盟与中立）
export function enemyCountNear(ctx, owner, x, y, range) {
  if (!ctx || !ctx.game || !ctx.game.units) return 0;
  let n = 0;
  for (const u of ctx.game.units) {
    if (u.owner === owner || u.owner === 'neutral') continue;
    if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
    if (Math.abs(u.x - x) <= range && Math.abs(u.y - y) <= range) n += 1;
  }
  return n;
}

// 己方受伤单位计数（切比雪夫距离 <= range）
export function ownWoundedNear(ctx, owner, x, y, range) {
  if (!ctx || !ctx.game || !ctx.game.units) return 0;
  let n = 0;
  for (const u of ctx.game.units) {
    if (u.owner !== owner) continue;
    if (u.hp >= u.maxHp) continue;
    if (Math.abs(u.x - x) <= range && Math.abs(u.y - y) <= range) n += 1;
  }
  return n;
}
