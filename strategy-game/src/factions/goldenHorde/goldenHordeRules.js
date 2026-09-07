'use strict';
// 金帐联盟系统注册对象（goldenHorde）——Layer 4：掠袭 + 疲软标记 + 游牧营地。
// 统一接口见 FACTION-SYSTEM-API-CONTRACT.md §6：缺省字段为空函数，只需实现本系统用到的钩子。
// 钩子签名按 factionRegistry 的实际分发方式：system[hook](ctx, payload)。
// 本文件不含业务逻辑，全部委托 raiding.js / nomadCamp.js。

import * as raid from './raiding.js';
import * as camp from './nomadCamp.js';

export const goldenHordeSystem = {
  id: 'goldenHorde',

  // 注册时调用一次：挂载 debug/test 入口（globalThis.__goldenHordeDebug，浏览器控制台可用）
  init(ctx) {
    attachDebug(ctx);
  },

  // turnStart：先无条件重置掠袭去重标记（raided 作用于被打方，所有 owner 回合都要清），
  // 再处理营地过期/维护/决策（内部判断金帐 owner）。
  onTurnStart(ctx, payload) {
    raid.onTurnStart(ctx, payload);
    camp.onTurnStart(ctx, payload);
  },

  // beforeMove：raided 移动力 -1（预扣；付不起则 cancel）
  onBeforeMove(ctx, payload) {
    raid.onBeforeMove(ctx, payload);
  },

  // afterAttack：掠袭收益（击杀战利品）+ raided 标记（未击杀）
  onAfterAttack(ctx, payload) {
    raid.onAfterAttack(ctx, payload);
  },

  // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
  reset() {
    raid.resetForTests();
    camp.resetForTests();
  },
};

// ---------------------------------------------------------------------------
// debug/test 入口：浏览器控制台可触发建造/生产/迁移决策与查看状态（阶段7前替代最终 UI）
// ---------------------------------------------------------------------------
function attachDebug(ctx) {
  const debug = {
    config: () => ({
      raidLoot: { ...raid.RAID_LOOT },
      raidPower: { moveMin: raid.RAID_POWER_MOVE_MIN, levelMin: raid.RAID_POWER_LEVEL_MIN, raidedTurns: raid.RAIDED_TURNS },
      camp: { ...camp.NOMAD_CAMP },
      producible: [...camp.CAMP_PRODUCIBLE],
    }),
    // 当前所有游牧营地
    camps: () => ctx.getFacilitiesByType(camp.NOMAD_CAMP.type).map(f => ({
      id: f.id, owner: f.owner, x: f.x, y: f.y, duration: f.duration,
      data: f.data, occupant: ctx.getUnit(f.x, f.y) ? ctx.getUnit(f.x, f.y).type : null,
    })),
    // 当前所有带 raided 标记的单位
    raided: () => ctx.game.units
      .filter(u => ctx.hasStatus(u.id, raid.RAIDED_KEY))
      .map(u => ({ id: u.id, type: u.type, owner: u.owner, x: u.x, y: u.y })),
    state: () => ({ ...raid.debugState() }),
    // 查看某 owner 可建营地的单位
    eligible: (owner) => ctx.game.units
      .filter(u => u.owner === owner && camp.canBuildCampAt(ctx, u))
      .map(u => ({ id: u.id, type: u.type, x: u.x, y: u.y })),
    // 为某 owner 所有可建单位发起建造决策；为所有营地发起行动决策（返回请求数）
    requestForOwner: (owner) => {
      let n = 0;
      for (const u of ctx.game.units) {
        if (u.owner === owner && camp.requestBuildDecision(ctx, u)) n += 1;
      }
      for (const c of camp.myCamps(ctx, owner)) {
        if (camp.requestCampDecision(ctx, c)) n += 1;
      }
      return n;
    },
    // 查看未决金帐决策（浏览器 UI 阶段前的手动测试入口）
    pending: () => ctx.getPendingDecisions('player')
      .filter(r => String(r.id || '').startsWith('ghCamp'))
      .map(r => ({ id: r.id, title: r.context.title, options: r.context.options.map(o => o.id) })),
    resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
  };
  if (typeof globalThis !== 'undefined') globalThis.__goldenHordeDebug = debug;
  return debug;
}
