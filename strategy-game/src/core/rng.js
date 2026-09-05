'use strict';
// 确定性随机数生成器（LCG：线性同余）。
// 从 src/main.js 的 fastBatch 局部函数 makeRng 抽取，行为逐字节一致。
// 用途：模拟器批量对局时注入确定性 Math.random，使同一种子的对局完全可复现。
// 未来模拟器升级可直接用 createRng 替代 monkey-patch Math.random。

const MODULUS = 4294967296; // 2^32
const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;

export function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state * MULTIPLIER + INCREMENT) >>> 0;
    return state / MODULUS;
  };
}
