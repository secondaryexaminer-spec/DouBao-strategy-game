# 金帐掠袭与游牧营地系统 · 自测说明（SELF_TEST）

> 主对话接线前，金帐系统不会出现在 js/game.js 中。本文件给出两条自测路径：
> 1. **harness 自动化回归**（推荐，无头环境全断言）；
> 2. **浏览器 debug 手动触发**（`__goldenHordeDebug`，阶段7 UI 前的替代入口）。
>
> 接线由主对话完成（main.js `initFactionSystems` 追加 `register('goldenHorde', ...)`），本对话不接线。

## 0. 快速回归

```bash
# 1. 构建（验证不破坏主流程）
cd E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game
npm run build

# 2. harness 全断言（金帐逻辑独立自测）
node src/factions/goldenHorde/__harness_goldenHorde.mjs

# 3. 默认 sim 回归（不传联盟参数 = 神罗默认局，必须与基线一致）
node sim/run.js map=strait diff=brutal agg=balanced rounds=1 seeds=777

# 4. 金帐注入 sim（未接线时机制不生效属预期，仅验证启动与零崩溃）
node sim/run.js map=strait diff=brutal agg=balanced rounds=1 seeds=777 ai0Faction=goldenHorde ai0Nation=goldenHordeCore ai1Faction=goldenHorde ai1Nation=goldenHordeCore
```

## 1. 浏览器手动验证（`__goldenHordeDebug`）

接线后（或临时在控制台注册）打开 `index.html`，选金帐开局。控制台执行：

```js
// 1) 查看当前数值配置
__goldenHordeDebug.config()

// 2) 查看可建营地的金帐单位
__goldenHordeDebug.eligible('player')

// 3) 为所有可建单位/营地发起决策（返回请求数）
__goldenHordeDebug.requestForOwner('player')

// 4) 查看未决金帐决策与选项
__goldenHordeDebug.pending()
// 例：[{id:'ghCampBuild_u1', title:'游牧营地', options:['none','build']},
//       {id:'ghCamp_fac_3', title:'游牧营地行动', options:['none','produce:lightCavalry','migrate:8,8',...]}]

// 5) 手动解析决策（建造 / 生产 / 迁移 / 维持）
__goldenHordeDebug.resolve('ghCampBuild_u1', 'build')
__goldenHordeDebug.resolve('ghCamp_fac_3', 'produce:lightCavalry')
__goldenHordeDebug.resolve('ghCamp_fac_3', 'migrate:8,8')

// 6) 查看营地与 raided 状态
__goldenHordeDebug.camps()
__goldenHordeDebug.raided()
__goldenHordeDebug.state()
```

### 预期观察

| 操作 | 预期反馈 |
|---|---|
| 金帐单位攻击敌方单位未击杀 | 日志出现「…掠袭了…，使其陷入疲软（raided）」；`raided()` 列出该单位 |
| 金帐单位击杀敌方单位 | 日志出现「…掠袭成功，缴获 N 金币」；金币增加 |
| 击杀商队/高等级单位/据点守军 | 战利品分别为 6/5/基础+4（可叠加 raidPower 机动/等级加成） |
| 带 raided 的单位再次被金帐击杀 | 战利品翻倍（日志金币为 2 倍） |
| 带 raided 的敌方单位移动 | 每回合首次移动预扣 1 点；移动力不足 1+步成本时无法移动 |
| 金帐单位建营地 | 金币 -25；单位本回合行动耗尽；`camps()` 出现营地，duration 5 |
| 营地维持 | 每回合金币 -2（日志「获得…金币收入」后）；金币不足时「游牧营地因无力支付维护而解散」 |
| 营地生产 | 金币 -单位成本；营地格出现对应单位；日志「游牧营地（x,y）生产了…」 |
| 营地迁移 | 原格营地消失、目标格出现营地；日志「游牧营地迁移到…，原址失去生产功能」 |
| 营地过期 | 存在 5 回合后自动消失 |

## 2. 已知自测边界

- **AI 不会建营地/生产/迁移**：决策仅对 `owner==='player'` 发起（阶段6 AI 接入前为预期行为）。
- **raided 回血限制、营地/补给摧毁奖励**：本轮降级未实现（见交付报告"已知问题"）。
- **getStatus 查询本轮未开放**：debug 的 `raided()` 用 `hasStatus` 实现，不显示剩余回合数。
