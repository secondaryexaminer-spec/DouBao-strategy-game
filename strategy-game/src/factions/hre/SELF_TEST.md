# 神罗工事系统 · 自测说明

> 阶段2 无最终 UI，所有验证通过浏览器控制台 debug 入口 `__hreDebug` 完成。
> 无头验证：`node src/factions/hre/__harness_hre.mjs`（临时文件，主对话接线后删除）。

## 1. 在浏览器触发建造（debug 入口）

1. 打开 `index.html`，开始界面选择联盟 **神圣罗马帝国（hre）**（任意国家），开局。
2. 打开开发者工具 Console。
3. 查看当前可建造单位与选项：

   ```js
   __hreDebug.eligible('player')
   // → [{ id:'u5', type:'heavyInfantry', x:3, y:4, options:['none','palisade','trench'] }, ...]
   ```

4. 发起建造决策（回合开始时系统也会自动为可建造单位发起；此命令可手动补发）：

   ```js
   __hreDebug.requestForOwner('player')
   ```

5. 查看未决建造决策并解析（选择 `palisade` / `trench` / `stoneFort` / `none`）：

   ```js
   __hreDebug.pending()
   // → [{ id:'hreFort_u5', unitId:'u5', options:['none','palisade','trench'] }, ...]
   __hreDebug.resolve('hreFort_u5', 'palisade')
   ```

6. 查看工事状态（type/hp/maxHp/duration/frontlined）：

   ```js
   __hreDebug.facilities()
   ```

## 2. 验证建造与消耗

- 建造成功：日志出现「……建立了木栅，帝国防线扩展。」；`facilities()` 出现对应工事。
- 金币扣除：木栅 12 / 壕沟 18 / 石堡 36。
- 单位消耗：建造后单位 `acted=true`、`move=0`，本回合不能再移动/攻击。
- 石堡限制：仅当单位在城市/军营/堡垒（含临时营地）**相邻 2 格内**时，选项才出现 `stoneFort`。

## 3. 验证工事效果

在 `eligible()` 找到站在工事上的神罗单位，用附近敌军攻击它，观察战斗日志伤害：

| 场景 | 预期 |
|---|---|
| 神罗步兵站在**木栅**上被攻击 | 伤害 -2 |
| 德意志重甲步兵站在任意工事上被攻击 | 额外 -2（坚守）；被骑兵攻击再 -1 |
| 单位站在**壕沟**上，敌方骑兵满移动冲锋攻击 | 冲锋加成 -2（最低0）+ 第一轮 -2 |
| 单位站在**石堡**上被攻击 | 伤害 -4 |
| 神罗远程单位站在石堡**相邻格**被攻击 | 伤害 -2 |
| 长矛方阵相邻有友军步兵，第一次被近战攻击 | 伤害 -2（第二次无效） |
| 帝国近卫军守点（自身格有己方据点），同格/相邻神罗单位被攻击 | 伤害 -1 |
| 神罗**攻城塔**攻击站在据点上的敌军 | 伤害 +2 |
| 敌军单位试图进入**木栅**格 | 移动 +1；剩余移动不足 1+步成本 时被阻止 |

## 4. 验证阵线稳定（frontline）

- 在相邻格连续建造 3 个工事（或 工事—神罗据点—工事 相连）：
  - 日志出现「阵线稳定：防线上的工事耐久提升。」
  - `facilities()` 中这些工事 `frontlined:true`、`maxHp` 提升 20%（木栅 8→10、壕沟 12→14、石堡 30→36）。
  - 阵线上驻守的神罗单位每回合回血 +1（非满血时）。
- 拆掉/摧毁中间一段：日志出现「阵线失稳」，`frontlined` 变回 `false`，`maxHp` 回退。

## 5. 验证工事受击摧毁与过期

- 敌军攻击站在工事上的单位：工事按伤害 50% 受损（日志「木栅受到攻击受损（耐久 x/y）」），耐久归零被摧毁。
- 木栅持续 5 个神罗回合、壕沟 8 回合后自动过期；石堡永不过期。

## 6. 无头回归

```powershell
cd E:\WorkPlace\DouBao-WorkPlace\strategy-game\strategy-game
node src/factions/hre/__harness_hre.mjs   # 79 条断言，输出 ALL PASS
npm run build                             # 主流程不破坏
```

> 注意：本系统尚未被 main.js 加载（接线由主对话集成时完成），浏览器测试前需先完成接线。
> 当前 `js/game.js` 产物中**不包含** hre 模块代码，属预期。
