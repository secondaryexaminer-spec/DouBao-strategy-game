'use strict';
// AI 决策系统（src/ai/）：按 decisionId 前缀注册各联盟 AI 决策函数。
// decision.js 在无头环境下识别到 AI owner（ai0/ai1/...）时调用 select() 选选项。
// AI 决策只发生在本层（决策选择层）；机制层不写 AI 专用分支。
// 确定性要求：所有决策函数禁止调用随机数，保证 RNG 调用序列不变。

import { registerHreAi } from './hreAi.js';
import { registerGoldenHordeAi } from './goldenHordeAi.js';
import { registerVeniceAi } from './veniceAi.js';
import { registerMamlukAi } from './mamlukAi.js';
import { registerMingAi } from './mingAi.js';
import { isAiOwner } from './aiUtil.js';

const decisioners = new Map(); // prefix -> fn(decisionId, context) -> choiceId|null

export function registerAiDecision(prefix, fn) {
  decisioners.set(prefix, fn);
}

// 选择：最长前缀匹配（ghCamp_ 是 ghCampBuild_ 的前缀，必须取最长）。
// 返回 null 表示无匹配决策函数 / 决策函数未给出合法选项 → 调用方回退 test fallback。
export function select(decisionId, context) {
  const id = String(decisionId || '');
  let bestPrefix = null;
  let bestFn = null;
  for (const [prefix, fn] of decisioners) {
    if (id.startsWith(prefix) && (bestPrefix === null || prefix.length > bestPrefix.length)) {
      bestPrefix = prefix;
      bestFn = fn;
    }
  }
  if (!bestFn) return null;
  try {
    const choiceId = bestFn(id, context);
    if (choiceId != null && Array.isArray(context && context.options) &&
        context.options.some(o => o && o.id === choiceId)) {
      return choiceId;
    }
    return null;
  } catch (e) {
    console.error(`[ai:decision] ${id} error:`, e);
    return null;
  }
}

export { isAiOwner };

// 模块加载即完成注册（无循环依赖：各 faction AI 模块只依赖 aiUtil 与机制常量/查询）。
registerHreAi(registerAiDecision);
registerGoldenHordeAi(registerAiDecision);
registerVeniceAi(registerAiDecision);
registerMamlukAi(registerAiDecision);
registerMingAi(registerAiDecision);
