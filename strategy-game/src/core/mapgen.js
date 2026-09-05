'use strict';
// 地图生成：纯逻辑，零 DOM / 零 game 状态依赖。
// 从 src/main.js 抽取（W/H 闭包改为显式参数），保持行为逐字节一致。
// 后续模拟器可直接 import 本模块生成确定性地图。
import { COMPLEX, MAPS } from './constants.js';
import { rnd, clamp } from './utils.js';

function grid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function inBounds(x, y, w, h) {
  return x >= 0 && y >= 0 && x < w && y < h;
}

function createEllipse(terrain, w, h, cx, cy, rx, ry, fillTerrain, chance = 1) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1 && Math.random() <= chance) {
        terrain[y][x] = fillTerrain;
      }
    }
  }
}

function paintRiver(terrain, w, h, center, phase = 0) {
  for (let y = 0; y < h; y++) {
    const riverX = Math.round(center + Math.sin(y * 0.65 + phase) * 1.6 + Math.sin(y * 0.19) * 0.8);
    terrain[y][clamp(riverX, 1, w - 2)] = 'water';
    if (y % 5 === 2) {
      terrain[y][clamp(riverX, 1, w - 2)] = 'road';
    }
  }
}

function paintRidge(terrain, w, h, center) {
  for (let x = 0; x < w; x++) {
    const ridgeY = Math.round(center + Math.sin(x * 0.52) * 1.7 + Math.sin(x * 0.18) * 1.1);
    for (let dy = -1; dy <= 1; dy++) {
      const y = clamp(ridgeY + dy, 1, h - 2);
      terrain[y][x] = 'mountain';
    }
    if (x % 7 === 3) {
      terrain[clamp(ridgeY, 1, h - 2)][x] = 'road';
    }
  }
}

function addRoadCross(terrain, w, h) {
  const midY = Math.floor(h / 2);
  const midX = Math.floor(w / 2);
  for (let x = 1; x < w - 1; x++) {
    if (terrain[midY][x] !== 'water' && terrain[midY][x] !== 'mountain') {
      terrain[midY][x] = 'road';
    }
  }
  for (let y = 1; y < h - 1; y++) {
    if (terrain[y][midX] !== 'water' && terrain[y][midX] !== 'mountain') {
      terrain[y][midX] = 'road';
    }
  }
}

function scatter(terrain, w, h, type, count, radius, allowed) {
  for (let i = 0; i < count; i++) {
    const cx = rnd(w);
    const cy = rnd(h);
    const r = 1 + rnd(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!inBounds(x, y, w, h) || !allowed.includes(terrain[y][x])) {
          continue;
        }
        if (Math.hypot(dx, dy) <= r + 0.4 && Math.random() > 0.18) {
          terrain[y][x] = type;
        }
      }
    }
  }
}

export function terrainFor(mapId, complexityId, w, h) {
  const terrain = grid(w, h, 'plain');
  const complexity = COMPLEX[complexityId];
  switch (mapId) {
    case 'frontier':
      paintRiver(terrain, w, h, w * 0.48, 0);
      paintRidge(terrain, w, h, h * 0.26);
      break;
    case 'twinrivers':
      paintRiver(terrain, w, h, w * 0.34, 0.25);
      paintRiver(terrain, w, h, w * 0.67, 1.15);
      break;
    case 'highlands':
      paintRidge(terrain, w, h, h * 0.38);
      paintRidge(terrain, w, h, h * 0.68);
      break;
    case 'plains':
      addRoadCross(terrain, w, h);
      break;
    case 'heartland':
      addRoadCross(terrain, w, h);
      createEllipse(terrain, w, h, w * 0.2, h * 0.25, 4, 2, 'forest', 0.94);
      createEllipse(terrain, w, h, w * 0.78, h * 0.72, 4, 3, 'forest', 0.94);
      break;
    case 'coast':
      for (let y = 0; y < h; y++) {
        const shore = Math.floor(w * 0.22 + Math.sin(y * 0.42) * 2);
        for (let x = 0; x <= shore; x++) {
          terrain[y][x] = 'water';
        }
      }
      paintRidge(terrain, w, h, h * 0.7);
      break;
    case 'islands':
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          terrain[y][x] = 'water';
        }
      }
      createEllipse(terrain, w, h, w * 0.22, h * 0.48, 5, 3, 'plain', 0.96);
      createEllipse(terrain, w, h, w * 0.5, h * 0.3, 4, 2, 'plain', 0.95);
      createEllipse(terrain, w, h, w * 0.72, h * 0.66, 6, 3, 'plain', 0.95);
      createEllipse(terrain, w, h, w * 0.45, h * 0.78, 3, 2, 'plain', 0.92);
      break;
    case 'innersea':
      createEllipse(terrain, w, h, w * 0.5, h * 0.52, w * 0.22, h * 0.3, 'water', 0.98);
      addRoadCross(terrain, w, h);
      break;
    case 'grandbay':
      createEllipse(terrain, w, h, w * 0.14, h * 0.78, w * 0.36, h * 0.42, 'water', 0.98);
      createEllipse(terrain, w, h, w * 0.42, h * 0.58, 3, 2, 'water', 0.9);
      break;
    case 'strait':
      for (let y = 0; y < h; y++) {
        const seaX = Math.floor(w * 0.5 + Math.sin(y * 0.42) * 1.1);
        for (let dx = -2; dx <= 2; dx++) {
          if (inBounds(seaX + dx, y, w, h)) {
            terrain[y][seaX + dx] = 'water';
          }
        }
      }
      createEllipse(terrain, w, h, w * 0.48, h * 0.24, 2, 1, 'plain', 1);
      createEllipse(terrain, w, h, w * 0.5, h * 0.73, 2, 1, 'plain', 1);
      break;
    case 'archipelago':
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          terrain[y][x] = 'water';
        }
      }
      createEllipse(terrain, w, h, w * 0.28, h * 0.34, 5, 3, 'plain', 0.96);
      createEllipse(terrain, w, h, w * 0.62, h * 0.25, 4, 2, 'plain', 0.94);
      createEllipse(terrain, w, h, w * 0.77, h * 0.62, 6, 3, 'plain', 0.95);
      createEllipse(terrain, w, h, w * 0.44, h * 0.72, 5, 2, 'plain', 0.93);
      createEllipse(terrain, w, h, w * 0.12, h * 0.74, 3, 2, 'plain', 0.92);
      break;
    case 'random':
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const roll = Math.random();
          terrain[y][x] = roll < complexity.water ? 'water' : roll < complexity.water + complexity.mountain ? 'mountain' : roll < complexity.water + complexity.mountain + complexity.forest ? 'forest' : 'plain';
        }
      }
      addRoadCross(terrain, w, h);
      break;
    default:
      break;
  }
  if (mapId !== 'random') {
    scatter(terrain, w, h, 'forest', Math.max(2, Math.round(w * h * complexity.forest / 24)), 2, ['plain']);
    scatter(terrain, w, h, 'mountain', Math.max(1, Math.round(w * h * complexity.mountain / 34)), 1, ['plain']);
    if (!MAPS[mapId].sea) {
      scatter(terrain, w, h, 'water', Math.max(0, Math.round(w * h * complexity.water / 70)), 1, ['plain']);
    }
  }
  return terrain;
}
