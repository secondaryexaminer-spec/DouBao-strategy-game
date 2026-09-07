'use strict';
// C. 战场实体 Facility：地图上的临时设施（工事/炮台/火力区等）。
// 与 sites（据点：城市/港口等，永久可占领）严格区分。
// 克制：core 层只提供统一框架，不写 if hre... if horde...。具体 type 由联盟系统定义。
// 阶段1：定义 API，无调用者 = 零行为变化。

let nextId = 1;
const facilities = []; // [{id, type, owner, x, y, hp, maxHp, duration, data}]

export const facilitySystem = {
  createFacility(type, owner, x, y, opts = {}) {
    const hp = opts.hp != null ? opts.hp : 1;
    const f = {
      id: `fac_${nextId++}`,
      type,
      owner,
      x,
      y,
      hp,
      maxHp: hp,
      duration: opts.duration != null ? opts.duration : null, // null = 不过期
      data: opts.data || {},
    };
    facilities.push(f);
    return f;
  },
  removeFacility(id) {
    const i = facilities.findIndex(f => f.id === id);
    if (i >= 0) facilities.splice(i, 1);
  },
  damageFacility(id, amount) {
    const f = facilities.find(f => f.id === id);
    if (!f) return 0;
    f.hp -= amount;
    if (f.hp <= 0) {
      this.removeFacility(id);
      return 0;
    }
    return f.hp;
  },
  expireFacilities(owner) {
    // 回合开始时调：该 owner 的 facility duration-1，归零移除。
    for (let i = facilities.length - 1; i >= 0; i--) {
      const f = facilities[i];
      if (f.owner !== owner || f.duration == null) continue;
      f.duration -= 1;
      if (f.duration <= 0) facilities.splice(i, 1);
    }
  },
  getFacilityAt(x, y) {
    return facilities.find(f => f.x === x && f.y === y) || null;
  },
  // 通用移动成本修正（阶段3 裁决③）：该格设施声明 data.moveCostMod 时叠加到地形成本。
  // core 不识别具体设施类型（如大明临时桥），只认数据字段；无修正设施返回 0。
  getMoveCostModAt(x, y) {
    const f = facilities.find(f => f.x === x && f.y === y && typeof (f.data && f.data.moveCostMod) === 'number');
    return f ? f.data.moveCostMod : 0;
  },
  getFacilitiesByOwner(owner) {
    return facilities.filter(f => f.owner === owner);
  },
  getFacilitiesByType(type) {
    return facilities.filter(f => f.type === type);
  },
  getFacilitiesInRange(x, y, range) {
    return facilities.filter(f => Math.abs(f.x - x) <= range && Math.abs(f.y - y) <= range);
  },
  getAll() {
    return [...facilities];
  },
  clear() {
    facilities.length = 0;
    nextId = 1;
  },
};
