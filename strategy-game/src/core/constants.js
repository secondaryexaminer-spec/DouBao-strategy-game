'use strict';
// Pure game data & tuning constants. No mutable runtime state lives here.
// Bundled back into a single IIFE by esbuild; imported by src/main.js.

export const TEAMS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
// 队伍显示名：历史上真实存在过的势力集团（组别=同盟分组，独立于联盟/国家）
export const TEAM_NAMES = {
  A: '汉萨同盟',
  B: '拜占庭帝国',
  C: '条顿骑士团国',
  D: '莫斯科大公国',
  E: '奥斯曼帝国',
  F: '帖木儿帝国',
  G: '蒙古帝国',
  H: '波兰-立陶宛联邦',
  I: '匈牙利王国',
  J: '萨法维波斯',
  K: '德里苏丹国',
  L: '高棉帝国',
  M: '高丽王朝',
  N: '马里帝国',
  O: '埃塞俄比亚帝国',
};
export const OWNER_NAMES = ['赤岩军团', '紫晶军团', '琥珀军团', '翡翠军团', '钢青军团', '沙金军团', '苍鹰军团'];
export const OWNER_COLORS = ['#ef5c55', '#dc8cff', '#f2a65a', '#56d364', '#7aa2c9', '#d8c06b', '#5ad2c0'];
export const COLOR_PRESETS = {
  azure: { name: '蔚蓝', value: '#55a3ff' },
  crimson: { name: '赤红', value: '#ef5c55' },
  violet: { name: '紫晶', value: '#dc8cff' },
  amber: { name: '琥珀', value: '#f2a65a' },
  jade: { name: '翡翠', value: '#56d364' },
  steel: { name: '钢青', value: '#7aa2c9' },
  sand: { name: '沙金', value: '#d8c06b' },
  teal: { name: '青碧', value: '#5ad2c0' },
  rose: { name: '绯红', value: '#ff8fab' }
};
export const CITY_NAMES = ['维也纳', '柏林', '慕尼黑', '布拉格', '萨莱', '基辅', '莫斯科', '威尼斯', '热那亚', '罗马', '开罗', '大马士革', '巴格达', '北京', '南京', '西安', '君士坦丁堡', '雅典', '亚历山大', '安条克', '杭州', '成都', '广州'];
export const PORT_NAMES = ['威尼斯港', '热那亚港', '亚历山大港', '君士坦丁堡港', '泉州港', '广州港', '汉堡港', '但泽港', '克里米亚港', '阿斯特拉罕港', '贝鲁特港', '突尼斯港'];
export const FORT_NAMES = ['霍亨索伦堡', '哈布斯堡堡', '克里米亚堡', '耶路撒冷堡', '骑士堡', '山海关', '嘉峪关', '居庸关', '科孚堡', '塞浦路斯堡'];
export const OIL_NAMES = ['巴库油田', '里海油区', '波斯湾油井', '红海油田', '利比亚油区', '西西里油井', '阿尔萨斯油田', '鲁尔油区', '大庆油井', '胜利油田'];
export const BARRACK_NAMES = ['条顿军营', '普鲁士军营', '金帐军营', '雇佣军营', '马穆鲁克军营', '圣战军营', '神机营', '三千营', '五军营', '骑士团军营'];

export const VIEW_MAX_W = 1280;
export const VIEW_MAX_H = 820;

export const CAMP_DURATION = 3;
export const CAMP_COST = 24;
export const CITY_INCOME_BY_TIER = { 1: 8, 2: 11, 3: 14 };
export const UNIT_RANK_THRESHOLDS = [0, 2, 5, 9];

export const TYPES = {
  militia: { name: '民兵', icon: '⚒', level: 1, hp: 10, atk: 4, def: 2, move: 3, range: 1, cost: 16, domain: 'land', text: '低成本守备步兵。' },
  scout: { name: '侦察兵', icon: '♞', level: 1, hp: 8, atk: 3, def: 1, move: 5, range: 1, cost: 18, domain: 'land', text: '高机动侦察与抢点单位。' },
  spearman: { name: '长枪兵', icon: '⚔', level: 1, hp: 13, atk: 5, def: 4, move: 3, range: 1, cost: 26, domain: 'land', text: '克制骑兵的坚实前排。', bonusVs: { cavalry: 3 } },
  swordsman: { name: '剑士', icon: '♟', level: 2, hp: 15, atk: 6, def: 5, move: 3, range: 1, cost: 32, domain: 'land', text: '均衡的主力近战。' },
  archer: { name: '弓箭手', icon: '♜', level: 2, hp: 9, atk: 5, def: 2, move: 2, range: 2, cost: 34, domain: 'land', text: '稳定远程输出。' },
  crossbow: { name: '弩手', icon: '✚', level: 2, hp: 10, atk: 7, def: 2, move: 2, range: 2, cost: 40, domain: 'land', text: '高爆发集火兵种。' },
  engineer: { name: '工程师', icon: '⚙', level: 2, hp: 11, atk: 3, def: 2, move: 3, range: 1, cost: 42, domain: 'land', text: '能在海边造船，或就地建立临时营地。', builder: true },
  cavalry: { name: '骑兵', icon: '♘', level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 48, domain: 'land', text: '高机动冲锋单位。', charge: 2 },
  guard: { name: '近卫军', icon: '🛡', level: 3, hp: 20, atk: 7, def: 7, move: 3, range: 1, cost: 54, domain: 'land', text: '重装精锐，擅长守点。' },
  warship: { name: '战船', icon: '⛵', level: 2, hp: 20, atk: 8, def: 5, move: 4, range: 2, cost: 46, domain: 'sea', text: '主力海战单位。', bonusVs: { transport: 4 } },
  transport: { name: '运兵船', icon: '🚢', level: 2, hp: 18, atk: 2, def: 4, move: 5, range: 1, cost: 42, domain: 'sea', text: '一次最多搭载五个陆军单位。', transport: 5 },
  galley: { name: '桨帆船', icon: '🛶', level: 1, hp: 14, atk: 6, def: 3, move: 3, range: 2, cost: 30, domain: 'sea', text: '低成本海战单位，适合早期制海。', bonusVs: { transport: 2, barge: 3 } },
  barge: { name: '驳船', icon: '⛴', level: 1, hp: 12, atk: 1, def: 2, move: 4, range: 1, cost: 26, domain: 'sea', text: '一次最多搭载三个陆军单位。', transport: 3 },
  battleship: { name: '战舰', icon: '🛳', level: 3, hp: 14, atk: 13, def: 4, move: 3, range: 4, cost: 62, domain: 'sea', text: '远程重炮舰，射程远但脆弱。', bonusVs: { transport: 6, barge: 8, warship: 2, galley: 3 } },
  catapult: { name: '投石车', icon: '🎯', level: 3, hp: 8, atk: 12, def: 1, move: 2, range: 4, cost: 54, domain: 'land', text: '远程攻城器械，射程远但极度脆弱。' },
  // === 神圣罗马帝国（hre）联盟专属兵种 ===
  heavyInfantry: { name: '德意志重甲步兵', icon: '🗿', level: 2, hp: 18, atk: 7, def: 6, move: 2, range: 1, cost: 36, domain: 'land', faction: 'hre', text: '正面铜墙铁壁。' , tags: ["fortification"] },
  pikeSquare: { name: '长矛方阵', icon: '🔱', level: 1, hp: 14, atk: 5, def: 6, move: 3, range: 1, cost: 30, domain: 'land', faction: 'hre', text: '不可被冲锋的密集方阵。', bonusVs: { cavalry: 5 } , tags: ["anti_cavalry"] },
  imperialCrossbow: { name: '帝国弩手', icon: '🏹', level: 2, hp: 10, atk: 8, def: 2, move: 2, range: 2, cost: 42, domain: 'land', faction: 'hre', text: '高爆发集火。' , tags: ["artillery"] },
  imperialGuard: { name: '帝国近卫军', icon: '💂', level: 3, hp: 22, atk: 8, def: 7, move: 3, range: 1, cost: 56, domain: 'land', faction: 'hre', text: '守点时防御+3。' , tags: ["fortification"] },
  siegeTower: { name: '攻城塔', icon: '🏰', level: 2, hp: 30, atk: 4, def: 3, move: 1, range: 1, cost: 40, domain: 'land', faction: 'hre', text: '占领据点后返还全部移动力。' , tags: ["siege"] },
  heavyCatapult: { name: '重型投石车', icon: '💥', level: 3, hp: 8, atk: 14, def: 1, move: 1, range: 4, cost: 58, domain: 'land', faction: 'hre', text: '对据点驻军伤害+3。' , tags: ["siege","artillery"] },
  // === 神罗国家特色兵种 ===
  austrianKnight: { name: '奥地利骑士', icon: '🏇', level: 3, hp: 20, atk: 9, def: 6, move: 5, range: 1, cost: 50, domain: 'land', faction: 'hre', nation: 'austria', text: '重装冲锋骑兵。', charge: 3 , tags: ["raider"] },
  prussianGrenadier: { name: '普鲁士掷弹兵', icon: '🧨', level: 2, hp: 12, atk: 10, def: 3, move: 3, range: 1, cost: 44, domain: 'land', faction: 'hre', nation: 'prussia', text: '对据点内单位伤害+3。' , tags: ["siege"] },
  bavarianMountaineer: { name: '巴伐利亚山地弩手', icon: '⛰', level: 2, hp: 10, atk: 7, def: 2, move: 3, range: 2, cost: 40, domain: 'land', faction: 'hre', nation: 'bavaria', text: '山地地形移动不消耗，驻扎山地射程+1。' , tags: ["ambush"] },
  // === 金帐汗国（goldenHorde）联盟专属兵种 ===
  lightCavalry: { name: '轻骑兵', icon: '🐎', level: 1, hp: 12, atk: 6, def: 2, move: 6, range: 1, cost: 28, domain: 'land', faction: 'goldenHorde', text: '高机动骚扰与追击' , tags: ["scout","raider"] },
  hordeCavalry: { name: '汗国骑兵', icon: '🐴', level: 3, hp: 13, atk: 9, def: 4, move: 5, range: 1, cost: 38, domain: 'land', faction: 'goldenHorde', text: '轻骑突袭，更脆更狠的机动打击', charge: 2 , tags: ["raider"] },
  horseArcher: { name: '骑射手', icon: '🥷', level: 2, hp: 11, atk: 6, def: 2, move: 4, range: 2, cost: 38, domain: 'land', faction: 'goldenHorde', text: '高机动骑射，打完就跑' , tags: ["raider"] },
  nomadArcher: { name: '游牧弓手', icon: '🪃', level: 1, hp: 9, atk: 5, def: 1, move: 3, range: 2, cost: 30, domain: 'land', faction: 'goldenHorde', text: '边走边打的轻装弓手' , tags: ["raider"] },
  fastGalley: { name: '快速桨帆船', icon: '🚤', level: 1, hp: 12, atk: 7, def: 2, move: 5, range: 2, cost: 32, domain: 'sea', faction: 'goldenHorde', text: '海上游击，高机动低血量' , tags: ["raider"] },
  nomadChariot: { name: '游牧战车', icon: '🛞', level: 2, hp: 14, atk: 8, def: 2, move: 4, range: 2, cost: 46, domain: 'land', faction: 'goldenHorde', text: '移动攻城器械' , tags: ["siege","raider"] },
  // === 金帐汗国国家特色兵种 ===
  khanGuard: { name: '可汗亲卫', icon: '🦅', level: 3, hp: 18, atk: 10, def: 5, move: 4, range: 3, cost: 60, domain: 'land', faction: 'goldenHorde', nation: 'goldenHordeCore', text: '重装骑射手，汗国最强单位' , tags: ["veteran"] },
  camelCavalry: { name: '骆驼骑兵', icon: '🐫', level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 44, domain: 'land', faction: 'goldenHorde', nation: 'whiteHorde', text: '沙漠平原移动不消耗，吓到敌方马匹', bonusVs: { cavalry: 3 } , tags: ["anti_cavalry"] },
  nomadCannon: { name: '游牧重炮', icon: '💣', level: 3, hp: 10, atk: 12, def: 1, move: 3, range: 3, cost: 52, domain: 'land', faction: 'goldenHorde', nation: 'blueHorde', text: '移动攻城，比投石车灵活' , tags: ["siege","artillery"] },
  // === 威尼斯共和国（venice）联盟专属兵种 ===
  marine: { name: '海军陆战队', icon: '🪖', level: 2, hp: 14, atk: 7, def: 4, move: 3, range: 1, cost: 38, domain: 'land', faction: 'venice', text: '两栖登陆作战单位' , tags: ["amphibious"] },
  galleyWarship: { name: '桨帆战舰', icon: '🚣', level: 2, hp: 18, atk: 10, def: 4, move: 4, range: 2, cost: 50, domain: 'sea', faction: 'venice', text: '标准海战主力' , tags: ["escort"] },
  masterEngineer: { name: '大师工程师', icon: '🔧', level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 48, domain: 'land', faction: 'venice', builder: true, text: '威尼斯工程师，可造船与建营（威尼斯本部造船费用-20%）。' , tags: ["engineer"] },
  venetianBattleship: { name: '威尼斯战舰', icon: '🔥', level: 3, hp: 12, atk: 14, def: 3, move: 3, range: 4, cost: 64, domain: 'sea', faction: 'venice', text: '海上远程火力压制' , tags: ["artillery"] },
  tradeCaravan: { name: '商队', icon: '💰', level: 1, hp: 10, atk: 2, def: 2, move: 4, range: 1, cost: 30, domain: 'land', faction: 'venice', text: '占领据点后该据点收入+3/回合' , tags: ["trade"] },
  mercenarySwordsman: { name: '雇佣剑士', icon: '🗡', level: 2, hp: 15, atk: 8, def: 4, move: 3, range: 1, cost: 40, domain: 'land', faction: 'venice', text: '精锐雇佣兵' , tags: ["veteran"] },
  // === 威尼斯国家特色兵种 ===
  venetianGalleon: { name: '威尼斯巨舰', icon: '⚜', level: 3, hp: 20, atk: 16, def: 5, move: 2, range: 5, cost: 70, domain: 'sea', faction: 'venice', nation: 'veniceCore', text: '超远程海军，联盟最强单位' , tags: ["artillery"] },
  genoeseMarine: { name: '热那亚海军弩手', icon: '🔫', level: 2, hp: 10, atk: 8, def: 2, move: 4, range: 3, cost: 44, domain: 'sea', faction: 'venice', nation: 'genoa', text: '可在船上射击的海军远程单位' , tags: ["artillery"] },
  ragusaCaravan: { name: '拉古萨巨商队', icon: '💎', level: 2, hp: 14, atk: 3, def: 3, move: 4, range: 1, cost: 36, domain: 'land', faction: 'venice', nation: 'ragusa', text: '强化商队，占领据点后收入+5/回合' , tags: ["trade"] },
  // === 马穆鲁克苏丹国（mamluk）联盟专属兵种 ===
  mamlukCavalry: { name: '马穆鲁克骑兵', icon: '🦁', level: 3, hp: 18, atk: 9, def: 5, move: 5, range: 1, cost: 48, domain: 'land', faction: 'mamluk', text: '精锐骑兵，击杀经验×2', charge: 2 , tags: ["veteran"] },
  jihadist: { name: '圣战者', icon: '⚡', level: 2, hp: 14, atk: 8, def: 2, move: 3, range: 1, cost: 34, domain: 'land', faction: 'mamluk', text: '对异联盟攻击+2，狂热不怕死' , tags: ["raider"] },
  arabArcher: { name: '阿拉伯弓手', icon: '🪶', level: 2, hp: 9, atk: 7, def: 1, move: 3, range: 2, cost: 32, domain: 'land', faction: 'mamluk', text: '沙漠地形移动不消耗' , tags: ["scout"] },
  camelWarrior: { name: '骆驼骑兵', icon: '🐪', level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 42, domain: 'land', faction: 'mamluk', text: '吓到敌方马匹', bonusVs: { cavalry: 3 } , tags: ["anti_cavalry"] },
  arabDhow: { name: '阿拉伯帆船', icon: '⚓', level: 2, hp: 16, atk: 9, def: 3, move: 5, range: 2, cost: 44, domain: 'sea', faction: 'mamluk', text: '可兼职运输2个陆军', transport: 2 , tags: ["support"] },
  siegeCrossbow: { name: '攻城弩', icon: '🔨', level: 3, hp: 10, atk: 10, def: 1, move: 2, range: 3, cost: 46, domain: 'land', faction: 'mamluk', text: '对据点驻军伤害+2' , tags: ["siege"] },
  // === 马穆鲁克国家特色兵种 ===
  sultanGuard: { name: '苏丹禁卫军', icon: '👑', level: 3, hp: 22, atk: 11, def: 7, move: 5, range: 1, cost: 62, domain: 'land', faction: 'mamluk', nation: 'egypt', text: '超精锐骑兵，击杀后回血3', charge: 3 , tags: ["veteran"] },
  syrianLongbow: { name: '叙利亚长弓手', icon: '🌙', level: 3, hp: 10, atk: 9, def: 2, move: 2, range: 3, cost: 46, domain: 'land', faction: 'mamluk', nation: 'syria', text: '联盟最远陆军' , tags: ["artillery"] },
  caliphScholar: { name: '哈里发学者', icon: '📜', level: 2, hp: 8, atk: 1, def: 1, move: 2, range: 1, cost: 40, domain: 'land', faction: 'mamluk', nation: 'baghdad', text: '光环单位，周围2格友军攻防+1（巴格达3格）。' , tags: ["support","commander"] },
  // === 大明帝国（ming）联盟专属兵种 ===
  shenjiBattalion: { name: '神机营火枪兵', icon: '🎇', level: 3, hp: 8, atk: 9, def: 1, move: 2, range: 3, cost: 48, domain: 'land', faction: 'ming', text: '火器齐射，攻击溅射50%到周围1格（大明本部60%）。' , tags: ["artillery"] },
  qiArmy: { name: '戚家军', icon: '🥋', level: 2, hp: 16, atk: 7, def: 6, move: 3, range: 1, cost: 44, domain: 'land', faction: 'ming', text: '高防步兵，鸳鸯阵克制骑兵。', bonusVs: { cavalry: 3 } , tags: ["anti_cavalry"] },
  mingCavalry: { name: '大明骑兵', icon: '🐅', level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 44, domain: 'land', faction: 'ming', text: '辅助轻骑，冲锋乏力，大明主力靠火器', charge: 1 , tags: ["raider"] },
  worksEngineer: { name: '工部工程师', icon: '🏗️', level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 46, domain: 'land', faction: 'ming', builder: true, text: '大明工程师，可造船与建营并部署工程设施（大明本部费用-10%）。' , tags: ["engineer"] },
  treasureShip: { name: '宝船', icon: '🐉', level: 3, hp: 30, atk: 4, def: 5, move: 3, range: 1, cost: 60, domain: 'sea', faction: 'ming', transport: 10, text: '巨型运输船，可运10个陆军' , tags: ["support"] },
  hongyiCannon: { name: '红夷大炮', icon: '☄️', level: 3, hp: 6, atk: 16, def: 1, move: 1, range: 5, cost: 64, domain: 'land', faction: 'ming', text: '超远程攻城，联盟最远单位' , tags: ["siege","artillery"] },
  // === 大明国家特色兵种 ===
  jinyiwei: { name: '锦衣卫', icon: '🕵️', level: 2, hp: 10, atk: 8, def: 2, move: 6, range: 1, cost: 48, domain: 'land', faction: 'ming', nation: 'mingCore', text: '高机动侦察/暗杀，攻击后不被反击' , tags: ["stealth","scout"] },
  joseonTurtleShip: { name: '朝鲜龟船', icon: '🐢', level: 3, hp: 28, atk: 7, def: 8, move: 3, range: 2, cost: 56, domain: 'sea', faction: 'ming', nation: 'joseon', text: '装甲战船，反弹30%受到的伤害' , tags: ["escort"] },
  annamElephant: { name: '安南象兵', icon: '🐘', level: 3, hp: 28, atk: 12, def: 4, move: 2, range: 1, cost: 58, domain: 'land', faction: 'ming', nation: 'annam', text: '巨兽单位，对步兵践踏伤害+5' , tags: ["siege"] }
};

export const SITE_META = {
  city: { name: '城市', icon: '🏛', income: 10, maxTier: 3, upgradeCosts: { 1: 12, 2: 26 }, domain: 'land' },
  shipyard: { name: '港口/造船厂', icon: '⚓', income: 8, maxTier: 3, upgradeCosts: { 1: 14, 2: 28 }, domain: 'sea' },
  camp: { name: '临时营地', icon: '⛺', income: 0, maxTier: 2, upgradeCosts: {}, domain: 'land' },
  oilSmall: { name: '小型油田', icon: '🛢', income: CITY_INCOME_BY_TIER[3] + CITY_INCOME_BY_TIER[1], maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
  oilMedium: { name: '中型油田', icon: '🛢', income: CITY_INCOME_BY_TIER[3] + CITY_INCOME_BY_TIER[2], maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
  oilLarge: { name: '大型油田', icon: '🛢', income: CITY_INCOME_BY_TIER[3] * 2, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
  barracksSmall: { name: '小型军营', icon: '🏕', income: 0, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 2 },
  barracksLarge: { name: '大型军营', icon: '🏕', income: 0, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 3 },
  fortress: { name: '海上堡垒', icon: '⬣', income: 5, maxTier: 1, upgradeCosts: {}, domain: null }
};

export const TERRAIN = {
  plain: { name: '草原', color: '#638f4e', cost: 1, def: 0, mark: '' },
  forest: { name: '森林', color: '#356641', cost: 2, def: 2, mark: '♣' },
  mountain: { name: '山脉', color: '#696b68', cost: 99, def: 4, mark: '▲' },
  road: { name: '道路', color: '#a4865c', cost: 1, def: 0, mark: '·' },
  water: { name: '海域', color: '#2d6f9e', cost: 1, def: 0, mark: '≈' },
  desert: { name: '沙漠', color: '#c2a968', cost: 2, def: 0, mark: '∴' },
  sand: { name: '沙地', color: '#e3d29a', cost: 1, def: 0, mark: '·' },
  hill: { name: '丘陵', color: '#6b8e4e', cost: 2, def: 2, mark: '△' },
  snow: { name: '雪地', color: '#c8dce8', cost: 2, def: 1, mark: '❄' }
};

export const MAPS = {
  frontier: { name: '边境河谷', sea: false },
  twinrivers: { name: '双河走廊', sea: false },
  highlands: { name: '高地山口', sea: false },
  plains: { name: '北方平原', sea: false },
  heartland: { name: '中心平原', sea: false },
  coast: { name: '海岸丘陵', sea: true },
  islands: { name: '群岛与海峡', sea: true },
  innersea: { name: '内海争夺', sea: true },
  grandbay: { name: '海湾登陆', sea: true },
  strait: { name: '裂海海峡', sea: true },
  archipelago: { name: '断链群岛', sea: true },
  random: { name: '随机大陆', sea: true }
};

export const MODES = { conquest: '征服', skirmish: '遭遇战', survival: '守城' };
export const SIZES = {
  small: { name: '小型 · 约 240 格', cells: 240 },
  medium: { name: '中型 · 约 450 格', cells: 450 },
  large: { name: '大型 · 约 720 格', cells: 720 },
  huge: { name: '巨型 · 约 1050 格', cells: 1056 },
  giant: { name: '超大 · 约 1800 格', cells: 1800 },
  colossal: { name: '史诗 · 约 2880 格', cells: 2880 }
};
export const ASPECTS = {
  wide: { name: '宽幅', ratio: 1.95 },
  standard: { name: '标准', ratio: 1.55 },
  square: { name: '方阵', ratio: 1 },
  tall: { name: '纵深', ratio: 0.72 }
};
export const COMPLEX = {
  low: { name: '低：开阔地', water: 0.03, forest: 0.08, mountain: 0.05 },
  medium: { name: '中：混合地形', water: 0.08, forest: 0.14, mountain: 0.09 },
  high: { name: '高：险峻复杂', water: 0.12, forest: 0.2, mountain: 0.14 }
};
export const DIFF = {
  easy: { name: '简单', lookahead: 1, economy: 0.85, production: 1, risk: 0.75 },
  medium: { name: '中等', lookahead: 2, economy: 1, production: 2, risk: 1 },
  brutal: { name: '冷酷', lookahead: 3, economy: 1.2, production: 3, risk: 1.2 },
  bridgehead: { name: '桥头(测试)', lookahead: 2, economy: 1, production: 2, risk: 1, scripted: true, script: 'bridgehead' },
  naval: { name: '海防(测试)', lookahead: 2, economy: 1, production: 2, risk: 1, scripted: true, script: 'naval' }
};
export const AGG = {
  cautious: { name: '谨慎', push: 0.72, preserve: 1.45, expansion: 0.7, retreatHp: 0.55, chase: 0.5, lowGoldReserve: 55, forestBias: 1.4 },
  balanced: { name: '均衡', push: 1, preserve: 1, expansion: 1, retreatHp: 0.38, chase: 1, lowGoldReserve: 35, forestBias: 1 },
  reckless: { name: '冲动', push: 1.35, preserve: 0.72, expansion: 1.55, retreatHp: 0.22, chase: 1.55, lowGoldReserve: 18, forestBias: 0.4 }
};
export const MAX_TURNS = 120;
export const MAX_CAMPS_PER_SIDE = 3;
export const MAX_STACK = 3;
// Realistic per-transport sealift used by AI overproduction heuristics (below raw capacity: loading + turnaround losses).
export const FERRY_THROUGHPUT = 3;
export const BRIDGEHEAD_DEFEND_FRACTION = 0.75;

// === 联盟与国家（阶段1数据结构）===
export const FACTIONS = {
  hre: { name: '神圣罗马帝国', short: '神罗', color: '#c0392b', style: '重甲推进、阵地消耗', mechanic: '征召兵 / 帝国议会' },
  goldenHorde: { name: '金帐汗国', short: '金帐', color: '#e67e22', style: '骑射游击、打完就跑', mechanic: '打完就跑 / 游牧营地' },
  venice: { name: '威尼斯共和国', short: '威尼斯', color: '#27ae60', style: '海军霸权、商业贸易', mechanic: '商路经济 / 雇佣兵' },
  mamluk: { name: '马穆鲁克苏丹国', short: '马穆鲁克', color: '#8e44ad', style: '精锐骑兵、宗教狂热', mechanic: '圣战 / 马穆鲁克精锐' },
  ming: { name: '大明帝国', short: '大明', color: '#d4ac0d', style: '火器齐射、工程建筑', mechanic: '火器齐射 / 卫所制' }
};

export const NATIONS = {
  austria: { name: '奥地利', faction: 'hre', unique: '奥地利骑士' },
  prussia: { name: '普鲁士', faction: 'hre', unique: '普鲁士掷弹兵' },
  bavaria: { name: '巴伐利亚', faction: 'hre', unique: '巴伐利亚山地弩手' },
  goldenHordeCore: { name: '金帐本部', faction: 'goldenHorde', unique: '可汗亲卫' },
  whiteHorde: { name: '白帐汗国', faction: 'goldenHorde', unique: '骆驼骑兵' },
  blueHorde: { name: '蓝帐汗国', faction: 'goldenHorde', unique: '游牧重炮' },
  veniceCore: { name: '威尼斯', faction: 'venice', unique: '威尼斯巨舰' },
  genoa: { name: '热那亚', faction: 'venice', unique: '热那亚海军弩手' },
  ragusa: { name: '拉古萨', faction: 'venice', unique: '拉古萨巨商队' },
  egypt: { name: '埃及', faction: 'mamluk', unique: '苏丹禁卫军' },
  syria: { name: '叙利亚', faction: 'mamluk', unique: '叙利亚长弓手' },
  baghdad: { name: '巴格达', faction: 'mamluk', unique: '哈里发学者' },
  mingCore: { name: '大明', faction: 'ming', unique: '锦衣卫' },
  joseon: { name: '朝鲜', faction: 'ming', unique: '朝鲜龟船' },
  annam: { name: '安南', faction: 'ming', unique: '安南象兵' }
};

// 15国据点命名体系（占领后改名用）— 每国约45个名字，确保大地图不重复
export const SITE_NAMES_BY_NATION = {
  austria: {
    city: ['维也纳','格拉茨','林茨','萨尔茨堡','因斯布鲁克','克拉根福','圣帕尔滕','上瓦特','维瑟尔堡','阿姆施泰滕','多瑙河畔克雷姆斯','茨维特尔'],
    shipyard: ['维也纳港','林茨港','多瑙河船坞','克雷姆斯港','图尔恩港','维也纳新港','多瑙河畔船坞','林茨新港'],
    fortress: ['霍夫堡','美泉宫堡垒','萨尔茨堡要塞','霍亨维尔芬堡','库夫施泰因要塞','拉滕贝格堡','哈尔堡要塞','佩尔诺斯坦堡'],
    oil: ['维也纳盆地油田','阿尔卑斯油区','下奥地利油田','施蒂利亚油井','布尔根兰油田','上奥地利油区'],
    barracks: ['奥地利军营','哈布斯堡军营','维也纳卫戍营','格拉茨兵营','林茨兵营','萨尔茨堡卫戍营','因斯布鲁克兵营','圣帕尔滕兵营']
  },
  prussia: {
    city: ['柏林','柯尼斯堡','波茨坦','但泽','布雷斯劳','波美拉尼亚','勃兰登堡','斯德丁','库尔姆','托伦','阿伦施泰因','埃尔宾'],
    shipyard: ['基尔港','但泽港','波罗的海船坞','斯德丁港','柯尼斯堡港','皮劳港','维斯马港','罗斯托克港'],
    fortress: ['柏林堡垒','柯尼斯堡要塞','波茨坦卫城','斯潘道要塞','屈斯特林要塞','格劳登茨堡','托伦要塞','库尔姆堡'],
    oil: ['普鲁士油区','波罗的海油田','波美拉尼亚油井','勃兰登堡油田','西里西亚油区','东普鲁士油井'],
    barracks: ['普鲁士军营','条顿骑士团军营','波茨坦近卫营','柏林卫戍营','柯尼斯堡兵营','但泽兵营','布雷斯劳卫戍营','斯德丁兵营']
  },
  bavaria: {
    city: ['慕尼黑','纽伦堡','奥格斯堡','雷根斯堡','维尔茨堡','因戈尔施塔特','班贝格','帕绍','兰茨胡特','安贝格','魏登','肯普滕'],
    shipyard: ['慕尼黑河港','多瑙河船坞','雷根斯堡港','帕绍港','因戈尔施塔特港','美因河船坞','班贝格港','维尔茨堡港'],
    fortress: ['慕尼黑堡垒','纽伦堡城堡','奥格斯堡要塞','雷根斯堡卫城','维尔茨堡要塞','因戈尔施塔特堡','班贝格要塞','兰茨胡特堡'],
    oil: ['巴伐利亚油区','阿尔卑斯山麓油田','多瑙河油井','上巴伐利亚油区','下巴伐利亚油田','弗兰肯油井'],
    barracks: ['巴伐利亚军营','山地猎兵营','慕尼黑卫戍营','纽伦堡兵营','奥格斯堡卫戍营','雷根斯堡兵营','维尔茨堡卫戍营','因戈尔施塔特兵营']
  },
  goldenHordeCore: {
    city: ['萨莱','阿斯特拉罕','保加尔','克里米亚','塔奈','马扎尔','速答黑','喀山','阿速夫','塔纳伊斯','别尔哥罗德','新萨莱'],
    shipyard: ['萨莱港','阿斯特拉罕港','里海船坞','阿速夫港','塔奈港','喀山港','伏尔加河船坞','顿河船坞'],
    fortress: ['萨莱堡垒','克里米亚要塞','保加尔卫城','阿斯特拉罕堡','喀山要塞','塔奈堡','阿速夫要塞','别尔哥罗德堡'],
    oil: ['里海油田','巴库油区','伏尔加油井','阿斯特拉罕油区','顿河油田','乌拉尔油井','北高加索油区'],
    barracks: ['金帐军营','可汗卫军营','游牧骑兵营','萨莱卫戍营','阿斯特拉罕兵营','保加尔兵营','克里米亚骑兵营','喀山兵营']
  },
  whiteHorde: {
    city: ['玉龙杰赤','撒马尔罕','塔什干','布哈拉','安集延','浩罕','纳曼干','卡尔希','铁尔梅兹','沙赫里萨布兹','卡拉卡尔帕克','花剌子模'],
    shipyard: ['咸海港','玉龙杰赤港','阿姆河船坞','布哈拉港','塔什干河港','撒马尔罕港','泽拉夫尚河船坞','锡尔河船坞'],
    fortress: ['玉龙杰赤堡垒','撒马尔罕要塞','布哈拉卫城','塔什干堡','安集延要塞','浩罕堡','纳曼干要塞','铁尔梅兹堡'],
    oil: ['咸海油区','费尔干纳油田','河中油井','布哈拉油区','撒马尔罕油田','阿姆河油井','花剌子模油区'],
    barracks: ['白帐军营','玉龙杰赤卫戍营','河中骑兵营','撒马尔罕兵营','布哈拉兵营','塔什干卫戍营','安集延骑兵营','浩罕兵营']
  },
  blueHorde: {
    city: ['基辅','莫斯科','诺夫哥罗德','斯摩棱斯克','切尔尼戈夫','梁赞','弗拉基米尔','苏兹达尔','特维尔','普斯科夫','图拉','卡卢加'],
    shipyard: ['基辅港','诺夫哥罗德港','第聂伯河船坞','莫斯科河港','弗拉基米尔港','奥卡河船坞','伏尔加河上游船坞','普斯科夫港'],
    fortress: ['基辅堡垒','莫斯科克里姆林','诺夫哥罗德要塞','斯摩棱斯克堡','切尔尼戈夫要塞','梁赞堡','弗拉基米尔卫城','特维尔要塞'],
    oil: ['第聂伯油区','莫斯科盆地油田','伏尔加上游油井','斯摩棱斯克油区','梁赞油田','卡卢加油井','图拉油区'],
    barracks: ['蓝帐军营','基辅卫戍营','罗斯骑兵营','莫斯科兵营','诺夫哥罗德兵营','弗拉基米尔卫戍营','斯摩棱斯克兵营','梁赞兵营']
  },
  veniceCore: {
    city: ['威尼斯','帕多瓦','维罗纳','特雷维索','基奥贾','罗维戈','贝卢诺','乌迪内','的里雅斯特','普拉','扎拉','科托尔'],
    shipyard: ['威尼斯兵工厂','基奥贾港','亚得里亚海船坞','帕多瓦港','维罗纳港','特雷维索港','的里雅斯特港','普拉港'],
    fortress: ['威尼斯堡垒','维罗纳要塞','帕多瓦卫城','基奥贾堡','特雷维索要塞','乌迪内堡','的里雅斯特要塞','普拉堡'],
    oil: ['亚得里亚油区','威尼斯湾油田','波河平原油井','威尼托油区','弗留利油田','伊斯特拉油井'],
    barracks: ['威尼斯军营','共和国卫戍营','海军陆战营','帕多瓦兵营','维罗纳卫戍营','特雷维索兵营','基奥贾海军营','乌迪内兵营']
  },
  genoa: {
    city: ['热那亚','比萨','佛罗伦萨','锡耶纳','卢卡','里窝那','那不勒斯','萨勒诺','阿马尔菲','萨沃纳','拉斯佩齐亚','圣雷莫'],
    shipyard: ['热那亚港','比萨港','利古里亚海船坞','里窝那港','那不勒斯港','萨勒诺港','阿马尔菲港','萨沃纳港'],
    fortress: ['热那亚堡垒','比萨要塞','佛罗伦萨卫城','锡耶纳堡','卢卡要塞','里窝那堡','那不勒斯要塞','萨勒诺堡'],
    oil: ['利古里亚油区','托斯卡纳油田','第勒尼安海油井','热那亚湾油区','比萨平原油田','坎帕尼亚油井'],
    barracks: ['热那亚军营','共和国雇佣军营','比萨卫戍营','热那亚海军营','佛罗伦萨兵营','锡耶纳兵营','里窝那卫戍营','那不勒斯兵营']
  },
  ragusa: {
    city: ['拉古萨','扎达尔','斯普利特','科托尔','杜布罗夫尼克','希贝尼克','特罗吉尔','布拉扎','维斯','乌尔奇尼','巴尔','布德瓦'],
    shipyard: ['拉古萨港','扎达尔港','亚得里亚海南部船坞','斯普利特港','科托尔港','杜布罗夫尼克港','希贝尼克港','特罗吉尔港'],
    fortress: ['拉古萨堡垒','杜布罗夫尼克要塞','科托尔卫城','扎达尔堡','斯普利特要塞','希贝尼克堡','特罗吉尔要塞','乌尔奇尼堡'],
    oil: ['达尔马提亚油区','亚得里亚海南部油田','黑山油井','杜布罗夫尼克油区','科托尔湾油田','阿尔巴尼亚油井'],
    barracks: ['拉古萨军营','共和国卫戍营','达尔马提亚轻步兵营','杜布罗夫尼克兵营','扎达尔卫戍营','斯普利特兵营','科托尔兵营','希贝尼克兵营']
  },
  egypt: {
    city: ['开罗','亚历山大','孟菲斯','吉萨','塞得港','苏伊士','达米埃塔','罗塞塔','阿斯旺','卢克索','法尤姆','坦塔'],
    shipyard: ['亚历山大港','塞得港','尼罗河船坞','苏伊士港','达米埃塔港','罗塞塔港','红海船坞','苏伊士湾港'],
    fortress: ['开罗堡垒','亚历山大要塞','吉萨卫城','塞得港堡','苏伊士要塞','达米埃塔堡','阿斯旺要塞','孟菲斯堡'],
    oil: ['苏伊士油区','尼罗河三角洲油田','红海油井','西奈油区','亚历山大湾油田','上埃及油井','法尤姆油区'],
    barracks: ['马穆鲁克军营','开罗卫戍营','奴隶骑兵营','亚历山大兵营','吉萨兵营','塞得港卫戍营','苏伊士兵营','孟菲斯兵营']
  },
  syria: {
    city: ['大马士革','阿勒颇','安条克','的黎波里','霍姆斯','哈马','拉塔基亚','塔尔图斯','帕尔米拉','德拉','苏韦达','代尔祖尔'],
    shipyard: ['的黎波里港','安条克港','地中海东岸船坞','拉塔基亚港','塔尔图斯港','大马士革河港','霍姆斯港','哈马港'],
    fortress: ['大马士革堡垒','阿勒颇要塞','骑士堡','安条克卫城','的黎波里堡','霍姆斯要塞','哈马堡','帕尔米拉要塞'],
    oil: ['叙利亚油区','幼发拉底河油田','霍姆斯油井','代尔祖尔油区','阿勒颇平原油田','拉塔基亚油井','帕尔米拉油区'],
    barracks: ['叙利亚军营','大马士革卫戍营','阿拉伯轻骑兵营','阿勒颇兵营','安条克兵营','霍姆斯卫戍营','哈马兵营','的黎波里兵营']
  },
  baghdad: {
    city: ['巴格达','巴士拉','库法','摩苏尔','纳杰夫','卡尔巴拉','萨迈拉','费卢杰','拉马迪','提克里特','基尔库克','巴古拜'],
    shipyard: ['巴士拉港','巴格达河港','波斯湾船坞','库法港','摩苏尔港','纳杰夫港','幼发拉底河船坞','底格里斯河船坞'],
    fortress: ['巴格达堡垒','巴士拉要塞','圆城卫城','库法堡','摩苏尔要塞','纳杰夫堡','萨迈拉要塞','提克里特堡'],
    oil: ['波斯湾油田','巴士拉油区','美索不达米亚油井','基尔库克油区','摩苏尔油田','纳杰夫油井','萨迈拉油区'],
    barracks: ['哈里发军营','巴格达卫戍营','学者护卫营','巴士拉兵营','库法兵营','摩苏尔卫戍营','纳杰夫兵营','萨迈拉兵营']
  },
  mingCore: {
    city: ['北京','南京','西安','洛阳','开封','杭州','苏州','成都','武汉','广州','济南','福州'],
    shipyard: ['泉州港','广州港','南京龙江船厂','福州港','宁波港','杭州湾船坞','登州港','扬州港'],
    fortress: ['山海关','嘉峪关','居庸关','雁门关','娘子关','潼关','函谷关','剑门关'],
    oil: ['大庆油田','胜利油田','华北油区','辽河油田','中原油田','四川油井','江汉油区'],
    barracks: ['神机营','三千营','五军营','北京卫戍营','南京兵营','西安兵营','洛阳兵营','济南卫戍营']
  },
  joseon: {
    city: ['汉城','平壤','开城','釜山','庆州','全州','公州','安东','江陵','咸兴','海州','义州'],
    shipyard: ['釜山港','仁川港','朝鲜海峡船坞','汉城港','平壤港','庆州港','全罗港','东海岸船坞'],
    fortress: ['汉城堡垒','平壤要塞','釜山卫城','开城堡','庆州要塞','全州堡','公州要塞','义州堡'],
    oil: ['朝鲜湾油区','平壤盆地油田','咸镜北道油井','全罗南道油区','庆尚北道油田','平安南道油井'],
    barracks: ['朝鲜军营','汉城卫戍营','龟船水师营','平壤兵营','釜山兵营','庆州卫戍营','全州兵营','开城兵营']
  },
  annam: {
    city: ['河内','顺化','岘港','海防','升龙','清化','义安','广南','平定','富安','庆和','林邑'],
    shipyard: ['海防港','岘港','北部湾船坞','河内港','顺化港','清化港','义安港','归仁港'],
    fortress: ['河内堡垒','顺化要塞','岘港卫城','清化堡','义安要塞','广南堡','平定要塞','升龙堡'],
    oil: ['北部湾油区','河内盆地油田','清化油井','义安油区','广南油田','平定油井','富安油区'],
    barracks: ['安南军营','河内卫戍营','象兵训练营','顺化兵营','海防兵营','清化兵营','义安兵营','岘港卫戍营']
  }
};