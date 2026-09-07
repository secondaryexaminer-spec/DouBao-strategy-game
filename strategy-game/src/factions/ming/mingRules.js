'use strict';
// 大明联盟系统注册对象（ming）——Layer 4：火力网 + 工程设施 + 三国家机制。
// 统一接口见 FACTION-SYSTEM-API-CONTRACT.md §6：缺省字段为空函数，只需实现本系统用到的钩子。
// 钩子签名按 factionRegistry 的实际分发方式：system[hook](ctx, payload)。
// 业务逻辑委托 fireZone.js / engineering.js；三国家机制（锦衣卫 stealth / 朝鲜水寨 /
// 安南丛林伏击）实现在本文件。
// 注册顺序（契约 §6 固定）：hre → goldenHorde → venice → mamluk → ming（最后一个）。
//
// 三国家机制口径（交付报告逐项列明）：
//  - 锦衣卫 stealth（mingCore）：非战斗状态（未攻击）的锦衣卫获得 'hidden' 状态标记 +
//    日志（"不易被侦测"的信息层）。AI 索敌影响无法在不改 main.js AI 的前提下实现
//    （Handoff §4-5 方案 a 降级），写进已知问题，阶段6 AI 接入时处理。
//  - 朝鲜水寨（joseon）：朝鲜单位站在己方港口（shipyard 据点格）或海岸（8 邻域有水域）
//    时被攻击伤害 -3（"大幅提高"）。combat.js 的 shipyard siteBonus 是旧机制，保留不动。
//  - 安南丛林伏击（annam）：安南陆军（land）站在森林中，每回合首次攻击伤害 +3。
//    "第一轮"定义为"每回合该单位的第一次攻击"（turnStart 无条件重置，马穆鲁克首攻先例）。
//    annam 森林移动成本已为 1（movement.js 旧机制），保留不动。

import * as fz from './fireZone.js';
import * as eng from './engineering.js';

// ---------------------------------------------------------------------------
// 三国家机制数值
// ---------------------------------------------------------------------------
export const NATION_MECHANICS = {
  joseonShuzhaiReduce: 3,   // 水寨：港口/海岸被攻击伤害 -3
  annamAmbushBonus: 3,      // 丛林伏击：森林中每回合首次攻击伤害 +3
  stealthKey: 'hidden',     // 锦衣卫 stealth 状态 key（契约 §3.1 预设 key）
};

// ---------------------------------------------------------------------------
// 模块级运行时状态（不写入 game 对象）
// ---------------------------------------------------------------------------
const state = {
  lastGameRef: null,         // 换局检测
  annamFirstHit: new Set(),  // unitId：本回合已享受丛林伏击首攻（每回合重置）
};

function resetState() {
  state.annamFirstHit.clear();
}

export function syncGameRef(ctx) {
  if (ctx && ctx.game !== state.lastGameRef) {
    resetState();
    state.lastGameRef = ctx ? ctx.game : null;
  }
}

export function resetForTests() {
  resetState();
  state.lastGameRef = null;
}

// ---------------------------------------------------------------------------
// 水寨判定：朝鲜单位站在己方港口（shipyard）或海岸（8 邻域有水域）
// ---------------------------------------------------------------------------
export function atShuzhai(ctx, defender) {
  if (!defender) return false;
  const g = ctx.game;
  if (!g || !g.terrain) return false;
  // 港口：站在己方（同盟）shipyard 据点格
  const site = ctx.getSite(defender.x, defender.y);
  if (site && site.kind === 'shipyard' && ctx.areAllies(g.teams, site.owner, defender.owner)) return true;
  // 海岸：8 邻域有 water 地形
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = defender.x + dx;
      const y = defender.y + dy;
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
      if (g.terrain[y] && g.terrain[y][x] === 'water') return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// turnStart：stealth 刷新（mingCore 锦衣卫）+ 丛林伏击首攻标记重置（无条件）
// ---------------------------------------------------------------------------
export function onTurnStart(ctx, payload) {
  const owner = payload && payload.owner;
  syncGameRef(ctx);
  // 回合级状态：任何 owner 回合开始都重置（马穆鲁克首攻先例：无条件重置）
  state.annamFirstHit.clear();
  // 锦衣卫 stealth：mingCore 的锦衣卫进入潜伏状态（非战斗状态标记 + 日志）
  if (ctx.ownerNation(owner) === 'mingCore') {
    for (const u of ctx.game.units) {
      if (u.owner !== owner) continue;
      if (u.type !== 'jinyiwei') continue;
      ctx.addStatus(u.id, NATION_MECHANICS.stealthKey, 1, { by: 'mingCore' });
      ctx.log(`${ctx.typeMeta(u.type).name}进入潜伏状态，不易被侦测。`, 'system');
    }
  }
}

// ---------------------------------------------------------------------------
// afterAttack：锦衣卫发起攻击 → 暴露行踪（移除 stealth）
// ---------------------------------------------------------------------------
export function onAfterAttack(ctx, payload) {
  const { attacker } = payload || {};
  if (!attacker) return;
  syncGameRef(ctx);
  if (attacker.type !== 'jinyiwei') return;
  if (ctx.ownerNation(attacker.owner) !== 'mingCore') return;
  ctx.removeStatus(attacker.id, NATION_MECHANICS.stealthKey);
  ctx.log(`${ctx.typeMeta(attacker.type).name}发起攻击，暴露行踪。`, 'warning');
}

// ---------------------------------------------------------------------------
// beforeAttack：水寨减伤（防守方）+ 丛林伏击加成（攻击方，只改 result.damage）
// ---------------------------------------------------------------------------
export function onBeforeAttack(ctx, payload) {
  const { attacker, defender, result } = payload || {};
  if (!attacker || !defender || !result || !result.damage) return;
  syncGameRef(ctx);

  // 朝鲜水寨：朝鲜单位在港口/海岸被攻击 → 伤害 -3
  if (ctx.ownerNation(defender.owner) === 'joseon' && atShuzhai(ctx, defender)) {
    result.damage = Math.max(1, result.damage - NATION_MECHANICS.joseonShuzhaiReduce);
    ctx.log(`${ctx.typeMeta(defender.type).name}依托水寨防御，受击伤害 -${NATION_MECHANICS.joseonShuzhaiReduce}。`, 'battle');
  }

  // 安南丛林伏击：陆军站在森林中，每回合首次攻击 → 伤害 +3
  if (ctx.ownerNation(attacker.owner) === 'annam') {
    const meta = ctx.typeMeta(attacker.type);
    const g = ctx.game;
    if (meta && meta.domain === 'land' && g.terrain && g.terrain[attacker.y] &&
        g.terrain[attacker.y][attacker.x] === 'forest' && !state.annamFirstHit.has(attacker.id)) {
      state.annamFirstHit.add(attacker.id);
      result.damage += NATION_MECHANICS.annamAmbushBonus;
      ctx.log(`${ctx.typeMeta(attacker.type).name}从丛林中发动伏击，伤害 +${NATION_MECHANICS.annamAmbushBonus}。`, 'battle');
    }
  }
}

// ---------------------------------------------------------------------------
// debug/test 入口（浏览器控制台可用）
// ---------------------------------------------------------------------------
function attachDebug(ctx) {
  const debug = {
    config: () => ({ ...NATION_MECHANICS }),
    state: () => ({ annamFirstHit: [...state.annamFirstHit] }),
    shuzhai: (unitId) => {
      const u = ctx.game.units.find(x => x.id === unitId);
      return u ? atShuzhai(ctx, u) : null;
    },
    stealth: (owner) => ctx.game.units
      .filter(u => u.owner === (owner || 'player') && u.type === 'jinyiwei')
      .map(u => ({ id: u.id, x: u.x, y: u.y, hidden: ctx.hasStatus(u.id, NATION_MECHANICS.stealthKey) })),
  };
  if (typeof globalThis !== 'undefined') globalThis.__mingDebug = { ...(globalThis.__mingDebug || {}), nations: debug };
  return debug;
}

// ---------------------------------------------------------------------------
// 联盟系统注册对象
// ---------------------------------------------------------------------------
export const mingSystem = {
  id: 'ming',

  // 注册时调用一次：挂载 debug/test 入口（浏览器控制台可用）
  init(ctx) {
    fz.attachDebug(ctx);
    eng.attachDebug(ctx);
    attachDebug(ctx);
  },

  // turnStart：fireZone 到期移除 + 炮台/补给站结算 + 部署决策 + stealth/伏击重置
  onTurnStart(ctx, payload) {
    fz.onTurnStart(ctx, payload);
    eng.onTurnStart(ctx, payload);
    onTurnStart(ctx, payload);
  },

  // beforeMove：敌方进入火力区受伤
  onBeforeMove(ctx, payload) {
    fz.onBeforeMove(ctx, payload);
  },

  // beforeAttack：交叉火力 + 壕沟/炮台/栈桥防御 + 水寨/丛林伏击（只改 result.damage）
  onBeforeAttack(ctx, payload) {
    fz.onBeforeAttack(ctx, payload);
    eng.onBeforeAttack(ctx, payload);
    onBeforeAttack(ctx, payload);
  },

  // afterAttack：fireZone 生成 + 工程设施受损 + 锦衣卫暴露
  onAfterAttack(ctx, payload) {
    fz.onAfterAttack(ctx, payload);
    eng.onAfterAttack(ctx, payload);
    onAfterAttack(ctx, payload);
  },

  // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
  reset() {
    fz.resetForTests();
    eng.resetForTests();
    resetForTests();
  },
};
