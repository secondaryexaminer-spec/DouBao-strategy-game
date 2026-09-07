'use strict';
// 威尼斯联盟系统注册对象（venice）——Layer 4：贸易网络 + 三国家机制 + 雇佣兵市场。
// 统一接口见 FACTION-SYSTEM-API-CONTRACT.md §6：缺省字段为空函数，只需实现本系统用到的钩子。
// 钩子签名按 factionRegistry 的实际分发方式：system[hook](ctx, payload)。
// 本文件不含业务逻辑，全部委托 tradeNetwork.js。
// 注册顺序（契约 §6 固定）：hre → goldenHorde → venice → mamluk → ming。

import * as trade from './tradeNetwork.js';

export const veniceSystem = {
  id: 'venice',

  // 注册时调用一次：挂载 debug/test 入口（globalThis.__veniceDebug，浏览器控制台可用）
  init(ctx) {
    attachDebug(ctx);
  },

  // turnStart：被动维护（海上垄断加速生产）+ 玩家决策请求（路线/借贷/雇佣兵/商港）
  onTurnStart(ctx, payload) {
    trade.onTurnStart(ctx, payload);
  },

  // beforeMove：敌军单位进入路线路径 → 立即标记切断（收入侧 incomeCalculated 复核）
  onBeforeMove(ctx, payload) {
    trade.onBeforeMove(ctx, payload);
  },

  // afterAttack：敌军攻击交易港格上单位 → 交易港按伤害比例掉耐久
  onAfterAttack(ctx, payload) {
    trade.onAfterAttack(ctx, payload);
  },

  // siteCaptured：敌军占领路线沿线据点 → 立即标记切断
  onSiteCaptured(ctx, payload) {
    trade.onSiteCaptured(ctx, payload);
  },

  // incomeCalculated：贸易路线收益 + 海上垄断 + 交易港收入 + 热那亚还款
  onIncomeCalculated(ctx, payload) {
    trade.onIncomeCalculated(ctx, payload);
  },

  // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
  reset() {
    trade.resetForTests();
  },
};

// ---------------------------------------------------------------------------
// debug/test 入口：浏览器控制台可触发路线/借贷/雇佣兵/商港决策与查看状态（阶段7前替代最终 UI）
// ---------------------------------------------------------------------------
function attachDebug(ctx) {
  const debug = {
    config: () => ({
      tradeRoute: { ...trade.TRADE_ROUTE },
      tradingPort: { ...trade.TRADING_PORT },
      genoaLoan: { ...trade.GENOA_LOAN },
      mercenary: { ...trade.MERCENARY },
      nodeSiteKinds: [...trade.NODE_SITE_KINDS],
      tradeTypes: [...trade.TRADE_TYPES],
    }),
    // 当前所有贸易路线（facility 数据）
    routes: (owner) => ctx.getFacilitiesByType(trade.TRADE_ROUTE.type)
      .filter(f => !owner || f.owner === owner)
      .map(f => ({ id: f.id, owner: f.owner, x: f.x, y: f.y, data: f.data })),
    // 当前所有中立商港
    ports: (owner) => ctx.getFacilitiesByType(trade.TRADING_PORT.type)
      .filter(f => !owner || f.owner === owner)
      .map(f => ({ id: f.id, owner: f.owner, x: f.x, y: f.y, hp: f.hp, data: f.data })),
    // 模块级状态（借贷/雇佣兵冷却）
    state: () => trade.debugState(),
    // 查看某 owner 的贸易节点
    nodes: (owner) => trade.collectNodes(ctx, owner),
    // 查看某 owner 的候选路线（含收益/海路/风险预览）
    candidates: (owner) => trade.routeCandidates(ctx, owner)
      .map(c => ({ a: c.a.label, b: c.b.label, len: c.path.length, income: c.income, sea: c.sea })),
    // 为某 owner 请求全部威尼斯决策（返回请求数）
    requestForOwner: (owner) => {
      let n = 0;
      if (trade.requestRouteDecision(ctx, owner)) n += 1;
      if (trade.requestLoanDecision(ctx, owner)) n += 1;
      if (trade.requestMercenaryDecision(ctx, owner)) n += 1;
      if (trade.requestTradingPortDecision(ctx, owner)) n += 1;
      return n;
    },
    // 查看未决威尼斯决策（浏览器 UI 阶段前的手动测试入口）
    pending: (owner) => ctx.getPendingDecisions(owner || 'player')
      .filter(r => String(r.id || '').startsWith('ven'))
      .map(r => ({ id: r.id, title: r.context.title, options: r.context.options.map(o => o.id) })),
    resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
  };
  if (typeof globalThis !== 'undefined') globalThis.__veniceDebug = debug;
  return debug;
}
