'use strict';
// A. 临时状态 StatusEffect：挂在 unit 上，持续 1~N 回合，回合开始 tick。
// 与永久成长（veterancy，马穆鲁克系统）和战场实体（facility）严格区分。
// 阶段1：定义 API，无调用者 = 零行为变化。

const statuses = new Map(); // unitId -> Map<key, {turns, data}>

export const statusSystem = {
  addStatus(unitId, key, turns, data = null) {
    if (!statuses.has(unitId)) statuses.set(unitId, new Map());
    const existing = statuses.get(unitId).get(key);
    if (existing) {
      // 同 key 同 unit：刷新 turns（取较大值），不叠加
      existing.turns = Math.max(existing.turns, turns);
      if (data != null) existing.data = data;
    } else {
      statuses.get(unitId).set(key, { turns, data });
    }
  },
  removeStatus(unitId, key) {
    statuses.get(unitId)?.delete(key);
  },
  hasStatus(unitId, key) {
    return !!statuses.get(unitId)?.has(key);
  },
  getStatus(unitId, key) {
    const s = statuses.get(unitId)?.get(key);
    return s ? { key, turns: s.turns, data: s.data } : null;
  },
  getAllStatuses(unitId) {
    const map = statuses.get(unitId);
    if (!map) return [];
    return [...map.entries()].map(([key, s]) => ({ key, turns: s.turns, data: s.data }));
  },
  tickStatuses(aliveUnitIds) {
    // 回合开始时调用：aliveUnitIds = 该 owner 当前存活单位的 id 列表。
    // 死亡单位的状态清理；存活单位 turns-1，归零移除。
    for (const [unitId, map] of statuses) {
      if (!aliveUnitIds.includes(unitId)) {
        statuses.delete(unitId);
        continue;
      }
      for (const [key, s] of map) {
        s.turns -= 1;
        if (s.turns <= 0) map.delete(key);
      }
      if (map.size === 0) statuses.delete(unitId);
    }
  },
  clear() {
    statuses.clear();
  },
};
