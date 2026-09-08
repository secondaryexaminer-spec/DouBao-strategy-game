'use strict';
// 主动决策 API：requestDecision / resolveDecision。
// 硬约束：凡是玩家做 A/B/C 选择的机制，必须用此 API。禁止 autoChoose 作为正式规则。
// 无头 sim 环境用 test fallback 自动选第一项（标记为 test fallback，不算正式规则）。
// 阶段6（F1）：无头环境下若 context.owner 是 AI（ai0/ai1/...），改走 AI 决策系统
// （src/ai/）按 decisionId 前缀选选项；纯测试（无 owner 或非 AI owner）保留原 test fallback。
// 阶段1：定义 API，无调用者 = 零行为变化。

import { select as selectAiDecision, isAiOwner } from '../ai/aiDecisions.js';

const pending = new Map(); // decisionId -> {context, resolved, choiceId?}
let nextDecisionId = 1;

function hasUI() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

export const decisionSystem = {
  requestDecision(decisionId, context) {
    const id = decisionId || `dec_${nextDecisionId++}`;
    const record = { id, context, resolved: false, choiceId: null };
    pending.set(id, record);
    // AI owner（ai0/ai1/...）：阶段6 F1 起，AI 决策永不挂 UI，一律由 AI 决策系统
    // （src/ai/）即时解析——无论当前是否有 DOM（浏览器局与无头 sim 行为一致）。
    // 非 AI owner：有 UI → 挂起等玩家；无 UI（sim/测试）→ 原 test fallback 自动选第一项。
    const aiOwner = isAiOwner(context.owner);
    if (aiOwner || !hasUI()) {
      let choiceId = null;
      if (aiOwner) {
        const aiChoice = selectAiDecision(id, context);
        if (aiChoice != null) {
          choiceId = aiChoice;
          console.log(`[decision:ai-resolve] ${id} → ${choiceId} (AI decision)`);
        } else {
          // 无匹配决策函数或决策无效 → 回退 test fallback（不应发生，防御）
          const choice = context.options && context.options[0];
          choiceId = choice ? choice.id : null;
          console.log(`[decision:auto-resolve] ${id} → ${choiceId} (test fallback, no AI decisioner)`);
        }
      } else {
        // Test fallback：无头环境自动选第一项，立即 resolve。
        // 这只是测试入口，不是正式游戏规则。UI 阶段（阶段7）替换为真实玩家选择。
        const choice = context.options && context.options[0];
        choiceId = choice ? choice.id : null;
        console.log(`[decision:auto-resolve] ${id} → ${choiceId} (test fallback, not a game rule)`);
      }
      this.resolveDecision(id, choiceId);
    }
    return record;
  },
  resolveDecision(decisionId, choiceId) {
    const record = pending.get(decisionId);
    if (!record || record.resolved) return false;
    record.resolved = true;
    record.choiceId = choiceId;
    pending.delete(decisionId);
    if (typeof record.context.onResolve === 'function') {
      try {
        record.context.onResolve(choiceId);
      } catch (e) {
        console.error(`[decision] onResolve error (${decisionId}):`, e);
      }
    }
    return true;
  },
  cancelDecision(decisionId) {
    const record = pending.get(decisionId);
    if (!record || record.resolved) return false;
    record.resolved = true;
    pending.delete(decisionId);
    if (typeof record.context.onCancel === 'function') {
      try {
        record.context.onCancel();
      } catch (e) {
        console.error(`[decision] onCancel error (${decisionId}):`, e);
      }
    }
    return true;
  },
  getPendingDecisions(owner) {
    return [...pending.values()].filter(r => r.context.owner === owner && !r.resolved);
  },
  getDecision(decisionId) {
    return pending.get(decisionId) || null;
  },
  clear() {
    pending.clear();
  },
};
