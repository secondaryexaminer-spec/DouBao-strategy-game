'use strict';
// FactionContext：依赖注入。在 main.js 闭包内构造一次，传给所有联盟系统。
// 联盟系统只通过 context 访问游戏，不直接碰 DOM、不直接调用 main.js 内部战斗函数。
// 契约：FACTION-SYSTEM-API-CONTRACT.md §5。
// v1.1（2026-09-07）：补全设施维护/查询 API、决策查询 API、纯函数转发（diagonalDist/
// movementCost/areAllies），杜绝联盟系统直接 import 状态性 core 模块。
// 注意：纯函数在此处直接转发，不走 deps（联盟系统无需在 deps 中提供它们）。

import { eventBus } from '../core/events.js';
import { statusSystem } from '../core/status.js';
import { facilitySystem } from '../core/facility.js';
import { decisionSystem } from '../core/decision.js';
import { diagonalDist as diagonalDistPure } from '../core/utils.js';
import { movementCost as movementCostPure } from '../core/movement.js';
import { areAllies as areAlliesPure } from '../core/teams.js';

export function createFactionContext(deps) {
  // deps 由 main.js 闭包注入：
  // { gameRef, getUnit, getSite, typeMeta, terrainMeta, ownerFaction, ownerNation, log, addGold, spendGold }
  return {
    // —— 只读查询 ——
    get game() { return deps.gameRef(); },
    getUnit: deps.getUnit,
    getSite: deps.getSite,
    getFacilityAt: (x, y) => facilitySystem.getFacilityAt(x, y),
    typeMeta: deps.typeMeta,
    terrainMeta: deps.terrainMeta,
    ownerFaction: deps.ownerFaction,
    ownerNation: deps.ownerNation,
    hasStatus: (unitId, key) => statusSystem.hasStatus(unitId, key),

    // —— 设施维护/查询（v1.1 补全：联盟系统不得直接 import facility.js） ——
    createFacility: (type, owner, x, y, opts) => facilitySystem.createFacility(type, owner, x, y, opts),
    removeFacility: (id) => facilitySystem.removeFacility(id),
    damageFacility: (id, amount) => facilitySystem.damageFacility(id, amount),
    expireFacilities: (owner) => facilitySystem.expireFacilities(owner),
    getFacilitiesByOwner: (owner) => facilitySystem.getFacilitiesByOwner(owner),
    getFacilitiesByType: (type) => facilitySystem.getFacilitiesByType(type),
    getFacilitiesInRange: (x, y, range) => facilitySystem.getFacilitiesInRange(x, y, range),
    getAllFacilities: () => facilitySystem.getAll(),

    // —— 决策查询（v1.1 补全：debug/UI 用，不在 UI 层直接 import decision.js） ——
    getPendingDecisions: (owner) => decisionSystem.getPendingDecisions(owner),

    // —— 纯函数转发（v1.1：联盟系统无需 import core 纯函数） ——
    diagonalDist: (a, b) => diagonalDistPure(a, b),
    movementCost: (game, unitEntry, x, y) => movementCostPure(game, unitEntry, x, y),
    areAllies: (teams, a, b) => areAlliesPure(teams, a, b),

    // —— 安全动作（不改变战斗流程） ——
    log: deps.log,
    addGold: deps.addGold,
    spendGold: deps.spendGold,
    addStatus: (unitId, key, turns, data) => statusSystem.addStatus(unitId, key, turns, data),
    removeStatus: (unitId, key) => statusSystem.removeStatus(unitId, key),

    // —— 主动决策 ——
    requestDecision: (decisionId, context) => decisionSystem.requestDecision(decisionId, context),
    resolveDecision: (decisionId, choiceId) => decisionSystem.resolveDecision(decisionId, choiceId),

    // —— 事件总线（联盟系统可自行订阅额外事件） ——
    events: eventBus,
  };
}
