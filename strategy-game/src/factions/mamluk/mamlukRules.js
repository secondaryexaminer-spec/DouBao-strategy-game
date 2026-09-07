'use strict';
// 马穆鲁克联盟系统注册对象（mamluk）——Layer 4：精锐成长 + 军团士气 + 三国家机制。
// 统一接口见 FACTION-SYSTEM-API-CONTRACT.md §6：缺省字段为空函数，只需实现本系统用到的钩子。
// 钩子签名按 factionRegistry 的实际分发方式：system[hook](ctx, payload)。
// 本文件不含业务逻辑，全部委托 veterancy.js。
// 注册顺序（契约 §6 固定）：hre → goldenHorde → venice → mamluk → ming。

import * as vet from './veterancy.js';

export const mamlukSystem = {
  id: 'mamluk',

  // 注册时调用一次：挂载 debug/test 入口（globalThis.__mamlukDebug，浏览器控制台可用）
  init(ctx) {
    vet.attachDebug(ctx);
  },

  // turnStart：回合级标记重置 + 埃及尼罗河补给回血 + 巴格达整军回血 +
  //            玩家决策请求（Veteran 3 晋升兜底 / 学者学术指令）
  onTurnStart(ctx, payload) {
    vet.onTurnStart(ctx, payload);
  },

  // beforeMove：巴格达机动战术（范围内单位每回合首次移动消耗 -1，预支 +1）
  onBeforeMove(ctx, payload) {
    vet.onBeforeMove(ctx, payload);
  },

  // beforeAttack：士气影响 + Veteran 1/2/3 效果 + 巴格达战术 + 叙利亚协同射击（只改 result.damage）
  onBeforeAttack(ctx, payload) {
    vet.onBeforeAttack(ctx, payload);
  },

  // afterAttack：攻击方经验/击杀回血/士气 + 双方精锐死亡惩罚（eliteLost）
  onAfterAttack(ctx, payload) {
    vet.onAfterAttack(ctx, payload);
  },

  // siteCaptured：精锐占领据点 → 经验
  onSiteCaptured(ctx, payload) {
    vet.onSiteCaptured(ctx, payload);
  },

  // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
  reset() {
    vet.resetForTests();
  },
};
