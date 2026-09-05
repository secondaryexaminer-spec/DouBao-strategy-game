'use strict';
// 移动与寻路：纯逻辑，零 DOM。game 状态与地图尺寸显式传入。
// 从 src/main.js 抽取（movementCost/passable/movementNeighbors/reachable），行为逐字节一致。
// 有副作用的 moveUnit（改单位状态 + 触发占领）暂留 main.js。
import { TERRAIN } from './constants.js';
import { typeMeta, cellKey } from './utils.js';

function inBounds(x, y, w, h) {
  return x >= 0 && y >= 0 && x < w && y < h;
}

function adjacent8(x, y, w, h) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
    .filter(cell => inBounds(cell.x, cell.y, w, h));
}

function getUnit(game, x, y) {
  return game.units.find(entry => entry.x === x && entry.y === y) || null;
}

export function movementCost(game, unitEntry, x, y) {
  return typeMeta(unitEntry.type).domain === 'sea' ? 1 : TERRAIN[game.terrain[y][x]].cost;
}

export function passable(game, unitEntry, x, y) {
  if (!inBounds(x, y, game.w, game.h) || getUnit(game, x, y)) {
    return false;
  }
  const domain = typeMeta(unitEntry.type).domain;
  if (domain === 'sea') {
    return game.terrain[y][x] === 'water';
  }
  return game.terrain[y][x] !== 'water' && game.terrain[y][x] !== 'mountain';
}

export function movementNeighbors(game, unitEntry, currentCost, x, y) {
  // 8-directional movement, consistent with the diagonal (Chebyshev) adjacency used for attacks and reachability.
  return adjacent8(x, y, game.w, game.h);
}

export function reachable(game, unitEntry) {
  const seen = new Map([[cellKey(unitEntry.x, unitEntry.y), 0]]);
  const queue = [{ x: unitEntry.x, y: unitEntry.y, cost: 0 }];
  while (queue.length) {
    const current = queue.shift();
    for (const next of movementNeighbors(game, unitEntry, current.cost, current.x, current.y)) {
      if (!passable(game, unitEntry, next.x, next.y)) {
        continue;
      }
      // Diagonal steps cost ~√2 so the reachable area stays round (octagon) instead of a square.
      const step = movementCost(game, unitEntry, next.x, next.y);
      const diagonal = next.x !== current.x && next.y !== current.y;
      const cost = current.cost + (diagonal ? step * Math.SQRT2 : step);
      const key = cellKey(next.x, next.y);
      if (cost > unitEntry.move) {
        continue;
      }
      if (!seen.has(key) || cost < seen.get(key)) {
        seen.set(key, cost);
        queue.push({ x: next.x, y: next.y, cost });
      }
    }
  }
  return seen;
}
