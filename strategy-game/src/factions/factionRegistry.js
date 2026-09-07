'use strict';
// FactionRegistry：联盟系统注册中心。
// 注册时按 hre→goldenHorde→venice→mamluk→ming 顺序，将系统钩子订阅到 eventBus。
// main.js 只 emit 事件，不知道有哪些订阅者。
// 阶段1：定义注册中心，无系统注册 = 零行为变化。

import { eventBus } from '../core/events.js';

const systems = new Map(); // factionId -> system

// 钩子名 → 事件名映射（与 FACTION-SYSTEM-API-CONTRACT.md §2.2 一致）
const HOOK_TO_EVENT = {
  onTurnStart: 'turnStart',
  onTurnEnd: 'turnEnd',
  onBeforeMove: 'beforeMove',
  onAfterMove: 'afterMove',
  onBeforeAttack: 'beforeAttack',
  onAfterAttack: 'afterAttack',
  onUnitCreated: 'unitCreated',
  onUnitKilled: 'unitKilled',
  onSiteCaptured: 'siteCaptured',
  onIncomeCalculated: 'incomeCalculated',
  onProductionCompleted: 'productionCompleted',
};

// 固定注册顺序：决定 before 类事件中多个系统修改结果的叠加顺序
const REGISTER_ORDER = ['hre', 'goldenHorde', 'venice', 'mamluk', 'ming'];

export const factionRegistry = {
  register(factionId, system, ctx) {
    if (!REGISTER_ORDER.includes(factionId)) {
      console.error(`[factionRegistry] unknown factionId: ${factionId}`);
      return;
    }
    system.id = factionId;
    systems.set(factionId, system);
    if (typeof system.init === 'function') {
      try { system.init(ctx); } catch (e) { console.error(`[factionRegistry] ${factionId}.init error:`, e); }
    }
    // 将系统钩子订阅到 eventBus。
    // 因为 register 按 REGISTER_ORDER 调用，eventBus 内 handler 顺序也是此顺序。
    for (const [hook, event] of Object.entries(HOOK_TO_EVENT)) {
      if (typeof system[hook] === 'function') {
        eventBus.on(event, (payload) => {
          try { system[hook](ctx, payload); } catch (e) { console.error(`[factionRegistry] ${factionId}.${hook} error:`, e); }
        });
      }
    }
  },
  unregister(factionId) {
    systems.delete(factionId);
    // 注意：eventBus 已订阅的 handler 不会自动移除（阶段2需要时加 off 支持）。
    // 当前设计下联盟系统注册后不注销，所以无影响。
  },
  get(factionId) {
    return systems.get(factionId) || null;
  },
  getAll() {
    return new Map(systems);
  },
  getRegisteredOrder() {
    return REGISTER_ORDER.filter(id => systems.has(id));
  },
  isRegistered(factionId) {
    return systems.has(factionId);
  },
  clear() {
    systems.clear();
  },
};
