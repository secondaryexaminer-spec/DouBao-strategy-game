'use strict';
// 神罗联盟系统注册对象（hre）——Layer 4：帝国工事 + 阵线稳定 + 兵种联动。
// 统一接口见 FACTION-SYSTEM-API-CONTRACT.md §6：缺省字段为空函数，只需实现本系统用到的钩子。
// 钩子签名按 factionRegistry 的实际分发方式：system[hook](ctx, payload)。
// 本文件不含业务逻辑，全部委托 fortification.js。

import * as fort from './fortification.js';
import * as nations from './nationMechanics.js';

export const hreSystem = {
  id: 'hre',

  // 注册时调用一次：挂载 debug/test 入口（globalThis.__hreDebug，浏览器控制台可用）
  init(ctx) {
    fort.attachDebug(ctx);
    nations.attachDebug(ctx);
  },

  // turnStart：工事过期、阵线检测/耐久/回血/状态、每回合追踪重置、人类玩家建造决策
  onTurnStart(ctx, payload) {
    fort.onTurnStart(ctx, payload);
    nations.onTurnStart(ctx, payload);
  },

  // beforeMove：木栅移动税 + 普鲁士军阵协同（需主对话在 moveUnit 内补 emit 'beforeMove'，见交付报告已知问题）
  onBeforeMove(ctx, payload) {
    fort.onBeforeMove(ctx, payload);
    nations.onBeforeMove(ctx, payload);
  },

  // beforeAttack：三种工事效果 + 4 个兵种联动 + 巴伐利亚山地防线（只改 result.damage）
  onBeforeAttack(ctx, payload) {
    fort.onBeforeAttack(ctx, payload);
    nations.onBeforeAttack(ctx, payload);
  },

  // afterAttack：工事可被攻击摧毁（按伤害比例受损）
  onAfterAttack(ctx, payload) {
    fort.onAfterAttack(ctx, payload);
  },

  // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
  reset() {
    fort.resetForTests();
    nations.resetForTests();
  },
};
