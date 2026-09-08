'use strict';
// F1 机制生效实证脚本：跑带联盟 sim 后读取各联盟 debug 句柄，确认 AI 真的使用了 L4 机制。
// 用法：node sim/verify-f1.mjs
// 原理：__hreDebug / __goldenHordeDebug / __veniceDebug / __mamlukDebug / __mingDebug
//       （faction 模块 attachDebug 挂到 globalThis）读取的是当前局（最后一次 newGame）
//       的终局设施/档案快照，因此每个场景 rounds=1，跑完立即记录。
// 判定（各场景仅需至少一条命中即证明 AI 使用机制）：
//   HRE 工事      → __hreDebug.facilities() 中出现 owner 为 ai* 的 palisade/trench/stoneFort
//   金帐营地      → __goldenHordeDebug.camps() 存在 owner 为 ai* 的营地
//   威尼斯贸易    → __veniceDebug.routes() 存在 owner 为 ai* 的路线
//   马穆鲁克晋升  → __mamlukDebug.veterancy(owner) 中存在 promotion 字段的 ai* 档案
//   大明工程      → __mingDebug.engineering.facilities() 中出现 owner 为 ai* 的工程设施
const { createHarness, baseConfig } = require('./harness');
const FORT_TYPES = ['palisade', 'trench', 'stoneFort'];
const ENG_TYPES = ['turret', 'watchtower', 'supplyDepot', 'mingTrench', 'bridge'];

const scenarios = [
  { id: 'hre-vs-mamluk',   cfg: { ai0Faction: 'hre',        ai0Nation: 'austria',      ai1Faction: 'mamluk', ai1Nation: 'egypt',  seed: 777 },
    checks: ['hre', 'mamluk'] },
  { id: 'horde-vs-hre',    cfg: { ai0Faction: 'goldenHorde', ai0Nation: 'goldenHordeCore', ai1Faction: 'hre', ai1Nation: 'austria', seed: 101 },
    checks: ['horde'] },
  { id: 'venice-vs-hre',   cfg: { ai0Faction: 'venice',     ai0Nation: 'veniceCore',   ai1Faction: 'hre',    ai1Nation: 'austria', seed: 202 },
    checks: ['venice'] },
  { id: 'ming-vs-hre',     cfg: { ai0Faction: 'ming',       ai0Nation: 'mingCore',     ai1Faction: 'hre',    ai1Nation: 'austria', seed: 303 },
    checks: ['ming'] },
];

const isAi = (o) => typeof o === 'string' && /^ai\d+$/.test(o);
const countBy = (arr, pred) => arr.filter(pred).length;

(async () => {
  const harness = createHarness(baseConfig({ ...scenarios[0].cfg, aiSelect: '2', diff: 'brutal', agg: 'balanced' }));
  let allOk = true;
  for (const sc of scenarios) {
    harness.setConfig(baseConfig({ ...sc.cfg, aiSelect: '2', diff: 'brutal', agg: 'balanced' }));
    const res = await harness.debug.batch(140, 1, sc.cfg.seed);
    const run = res && Array.isArray(res.runs) ? res.runs[0] : null;
    const agg = (res && res.agg) || {};
    const win = Object.keys(agg.wins || {}).join(',') || '(draw)';
    const turns = agg.avgTurns;
    const owners = run ? Object.keys(run.byOwner || {}) : [];

    const facilities = (global.__hreDebug ? global.__hreDebug.facilities() : []);
    const camps = (global.__goldenHordeDebug ? global.__goldenHordeDebug.camps() : []);
    const routes = (global.__veniceDebug ? global.__veniceDebug.routes() : []);
    // mamluk 档案记录不含 owner 字段，需按 owner 分别查询（veterancy(owner) 以单位 owner 过滤）
    const aiPromo = [];
    for (const o of owners) {
      const recs = (global.__mamlukDebug ? global.__mamlukDebug.veterancy(o) : []);
      for (const r of recs) {
        if (r.promotion) aiPromo.push({ ...r, owner: o });
      }
    }
    const engFacs = (global.__mingDebug && global.__mingDebug.engineering ? global.__mingDebug.engineering.facilities() : []);

    const hreForts = facilities.filter(f => FORT_TYPES.includes(f.type) && isAi(f.owner));
    const aiCamps = camps.filter(c => isAi(c.owner));
    const aiRoutes = routes.filter(r => isAi(r.owner));
    const aiEng = engFacs.filter(f => ENG_TYPES.includes(f.type) && isAi(f.owner));

    const line = (name, ok, detail) => `  [${ok ? 'OK ' : 'MISS'}] ${name}: ${detail}`;
    const report = [`== ${sc.id}  seed=${sc.cfg.seed}  胜者=${win}  回合=${turns}  owners=${owners.join('/') || '-'} ==`];
    let ok = true;
    for (const c of sc.checks) {
      if (c === 'hre') {
        const d = `AI 工事 ${hreForts.length} 座（${hreForts.map(f => `${f.type}@(${f.x},${f.y})`).slice(0, 5).join(' ') || '-'}）`;
        report.push(line('HRE AI 建工事', hreForts.length > 0, d)); ok = ok && hreForts.length > 0;
      }
      if (c === 'horde') {
        const d = `AI 营地 ${aiCamps.length} 个（${aiCamps.map(c => `(${c.x},${c.y})`).slice(0, 5).join(' ') || '-'}）`;
        report.push(line('金帐 AI 建营地', aiCamps.length > 0, d)); ok = ok && aiCamps.length > 0;
      }
      if (c === 'venice') {
        const d = `AI 贸易路线 ${aiRoutes.length} 条`;
        report.push(line('威尼斯 AI 建路线', aiRoutes.length > 0, d)); ok = ok && aiRoutes.length > 0;
      }
      if (c === 'mamluk') {
        const d = `AI V3 晋升 ${aiPromo.length} 个（${aiPromo.map(r => `${r.type}→${r.promotion}`).slice(0, 5).join(' ') || '-'}）`;
        report.push(line('马穆鲁克 AI 触发晋升', aiPromo.length > 0, d)); ok = ok && aiPromo.length > 0;
      }
      if (c === 'ming') {
        const d = `AI 工程设施 ${aiEng.length} 座（${aiEng.map(f => `${f.type}@(${f.x},${f.y})`).slice(0, 5).join(' ') || '-'}）`;
        report.push(line('大明 AI 部署工程设施', aiEng.length > 0, d)); ok = ok && aiEng.length > 0;
      }
    }
    console.log(report.join('\n'));
    allOk = allOk && ok;
  }
  console.log(allOk ? '\nverify-f1: 全部机制命中' : '\nverify-f1: 存在未命中的机制（需人工判断是否为地图/时长因素）');
  process.exit(allOk ? 0 : 1);
})();
