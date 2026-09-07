'use strict';
// 极简 EventBus：同步执行，handler 异常不阻断后续，记日志。
// 阶段1：main.js 埋点 emit，无订阅者 = 零行为变化。
// 阶段2：factionRegistry 注册联盟系统时按 hre→horde→venice→mamluk→ming 顺序订阅。

const handlers = new Map(); // eventName -> Set<handler>

export const eventBus = {
  on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, new Set());
    handlers.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  },
  off(eventName, handler) {
    handlers.get(eventName)?.delete(handler);
  },
  emit(eventName, payload) {
    const set = handlers.get(eventName);
    if (!set || set.size === 0) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (e) {
        console.error(`[eventBus] ${eventName} handler error:`, e);
      }
    }
  },
  listenerCount(eventName) {
    return handlers.get(eventName)?.size || 0;
  },
};
