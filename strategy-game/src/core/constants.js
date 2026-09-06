'use strict';
// Pure game data & tuning constants. No mutable runtime state lives here.
// Bundled back into a single IIFE by esbuild; imported by src/main.js.

export const TEAMS = ['A', 'B', 'C', 'D', 'E'];
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
  // === 神圣罗马帝国（hre）阵营专属兵种 ===
  heavyInfantry: { name: '德意志重甲步兵', icon: '🗿', level: 2, hp: 18, atk: 7, def: 6, move: 2, range: 1, cost: 36, domain: 'land', faction: 'hre', text: '正面铜墙铁壁。' },
  pikeSquare: { name: '长矛方阵', icon: '🔱', level: 1, hp: 14, atk: 5, def: 6, move: 3, range: 1, cost: 30, domain: 'land', faction: 'hre', text: '不可被冲锋的密集方阵。', bonusVs: { cavalry: 5 } },
  imperialCrossbow: { name: '帝国弩手', icon: '🏹', level: 2, hp: 10, atk: 8, def: 2, move: 2, range: 2, cost: 42, domain: 'land', faction: 'hre', text: '高爆发集火。' },
  imperialGuard: { name: '帝国近卫军', icon: '💂', level: 3, hp: 22, atk: 8, def: 7, move: 3, range: 1, cost: 56, domain: 'land', faction: 'hre', text: '守点时防御+3。' },
  siegeTower: { name: '攻城塔', icon: '🏰', level: 2, hp: 30, atk: 4, def: 3, move: 1, range: 1, cost: 40, domain: 'land', faction: 'hre', text: '占领据点速度×2。' },
  heavyCatapult: { name: '重型投石车', icon: '💥', level: 3, hp: 8, atk: 14, def: 1, move: 1, range: 4, cost: 58, domain: 'land', faction: 'hre', text: '对建筑伤害×1.5。' },
  // === 神罗国家特色兵种 ===
  austrianKnight: { name: '奥地利骑士', icon: '🏇', level: 3, hp: 20, atk: 9, def: 6, move: 5, range: 1, cost: 50, domain: 'land', faction: 'hre', nation: 'austria', text: '重装冲锋骑兵。', charge: 3 },
  prussianGrenadier: { name: '普鲁士掷弹兵', icon: '🧨', level: 2, hp: 12, atk: 10, def: 3, move: 3, range: 1, cost: 44, domain: 'land', faction: 'hre', nation: 'prussia', text: '对据点内单位伤害+3。' },
  bavarianMountaineer: { name: '巴伐利亚山地弩手', icon: '⛰', level: 2, hp: 10, atk: 7, def: 2, move: 3, range: 2, cost: 40, domain: 'land', faction: 'hre', nation: 'bavaria', text: '山地地形移动不消耗，驻扎山地射程+1。' },
  // === 金帐汗国（goldenHorde）阵营专属兵种 ===
  lightCavalry: { name: '轻骑兵', icon: '🐎', level: 1, hp: 12, atk: 6, def: 2, move: 6, range: 1, cost: 28, domain: 'land', faction: 'goldenHorde', text: '高机动骚扰与追击' },
  hordeCavalry: { name: '汗国骑兵', icon: '🐴', level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 42, domain: 'land', faction: 'goldenHorde', text: '通用机动打击', charge: 2 },
  horseArcher: { name: '骑射手', icon: '🥷', level: 2, hp: 11, atk: 6, def: 2, move: 4, range: 2, cost: 38, domain: 'land', faction: 'goldenHorde', text: '移动后可攻击，打完就跑' },
  nomadArcher: { name: '游牧弓手', icon: '🪃', level: 1, hp: 9, atk: 5, def: 1, move: 3, range: 2, cost: 30, domain: 'land', faction: 'goldenHorde', text: '边走边打的轻装弓手' },
  fastGalley: { name: '快速桨帆船', icon: '🚤', level: 1, hp: 12, atk: 7, def: 2, move: 5, range: 2, cost: 32, domain: 'sea', faction: 'goldenHorde', text: '海上游击，高机动低血量' },
  nomadChariot: { name: '游牧战车', icon: '🛞', level: 2, hp: 14, atk: 8, def: 2, move: 4, range: 2, cost: 46, domain: 'land', faction: 'goldenHorde', text: '移动攻城，可移动后攻击' },
  // === 金帐汗国国家特色兵种 ===
  khanGuard: { name: '可汗亲卫', icon: '🦅', level: 3, hp: 18, atk: 10, def: 5, move: 4, range: 3, cost: 60, domain: 'land', faction: 'goldenHorde', nation: 'goldenHordeCore', text: '重装骑射手，汗国最强单位' },
  camelCavalry: { name: '骆驼骑兵', icon: '🐫', level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 44, domain: 'land', faction: 'goldenHorde', nation: 'whiteHorde', text: '沙漠平原移动不消耗，吓到敌方马匹', bonusVs: { cavalry: 3 } },
  nomadCannon: { name: '游牧重炮', icon: '💣', level: 3, hp: 10, atk: 12, def: 1, move: 3, range: 3, cost: 52, domain: 'land', faction: 'goldenHorde', nation: 'blueHorde', text: '移动攻城，比投石车灵活' },
  // === 威尼斯共和国（venice）阵营专属兵种 ===
  marine: { name: '海军陆战队', icon: '🪖', level: 2, hp: 14, atk: 7, def: 4, move: 3, range: 1, cost: 38, domain: 'land', faction: 'venice', text: '两栖移动，登陆后首回合攻击+3' },
  galleyWarship: { name: '桨帆战舰', icon: '🚣', level: 2, hp: 18, atk: 10, def: 4, move: 4, range: 2, cost: 50, domain: 'sea', faction: 'venice', text: '标准海战主力' },
  masterEngineer: { name: '大师工程师', icon: '🔧', level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 48, domain: 'land', faction: 'venice', builder: true, text: '造船费用-20%，可建高级营地' },
  venetianBattleship: { name: '威尼斯战舰', icon: '🔥', level: 3, hp: 12, atk: 14, def: 3, move: 3, range: 4, cost: 64, domain: 'sea', faction: 'venice', text: '海上远程火力压制' },
  tradeCaravan: { name: '商队', icon: '💰', level: 1, hp: 10, atk: 2, def: 2, move: 4, range: 1, cost: 30, domain: 'land', faction: 'venice', text: '占领据点后该据点收入+3/回合' },
  mercenarySwordsman: { name: '雇佣剑士', icon: '🗡', level: 2, hp: 15, atk: 8, def: 4, move: 3, range: 1, cost: 40, domain: 'land', faction: 'venice', text: '精锐雇佣兵' },
  // === 威尼斯国家特色兵种 ===
  venetianGalleon: { name: '威尼斯巨舰', icon: '⚜', level: 3, hp: 20, atk: 16, def: 5, move: 2, range: 5, cost: 70, domain: 'sea', faction: 'venice', nation: 'veniceCore', text: '超远程海军，阵营最强单位' },
  genoeseMarine: { name: '热那亚海军弩手', icon: '🔫', level: 2, hp: 10, atk: 8, def: 2, move: 4, range: 3, cost: 44, domain: 'sea', faction: 'venice', nation: 'genoa', text: '可在船上射击的海军远程单位' },
  ragusaCaravan: { name: '拉古萨巨商队', icon: '💎', level: 2, hp: 14, atk: 3, def: 3, move: 4, range: 1, cost: 36, domain: 'land', faction: 'venice', nation: 'ragusa', text: '强化商队，占领据点后收入+5/回合' },
  // === 马穆鲁克苏丹国（mamluk）阵营专属兵种 ===
  mamlukCavalry: { name: '马穆鲁克骑兵', icon: '🦁', level: 3, hp: 18, atk: 9, def: 5, move: 5, range: 1, cost: 48, domain: 'land', faction: 'mamluk', text: '精锐骑兵，击杀经验×2', charge: 2 },
  jihadist: { name: '圣战者', icon: '⚡', level: 2, hp: 14, atk: 8, def: 2, move: 3, range: 1, cost: 34, domain: 'land', faction: 'mamluk', text: '对异阵营攻击+2，狂热不怕死' },
  arabArcher: { name: '阿拉伯弓手', icon: '🪶', level: 2, hp: 9, atk: 7, def: 1, move: 3, range: 2, cost: 32, domain: 'land', faction: 'mamluk', text: '沙漠地形移动不消耗' },
  camelWarrior: { name: '骆驼骑兵', icon: '🐪', level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 42, domain: 'land', faction: 'mamluk', text: '吓到敌方马匹', bonusVs: { cavalry: 3 } },
  arabDhow: { name: '阿拉伯帆船', icon: '⚓', level: 2, hp: 16, atk: 9, def: 3, move: 5, range: 2, cost: 44, domain: 'sea', faction: 'mamluk', text: '可兼职运输2个陆军', transport: 2 },
  siegeCrossbow: { name: '攻城弩', icon: '🔨', level: 3, hp: 10, atk: 10, def: 1, move: 2, range: 3, cost: 46, domain: 'land', faction: 'mamluk', text: '对建筑伤害×1.3' },
  // === 马穆鲁克国家特色兵种 ===
  sultanGuard: { name: '苏丹禁卫军', icon: '👑', level: 3, hp: 22, atk: 11, def: 7, move: 5, range: 1, cost: 62, domain: 'land', faction: 'mamluk', nation: 'egypt', text: '超精锐骑兵，击杀后回血3', charge: 3 },
  syrianLongbow: { name: '叙利亚长弓手', icon: '🌙', level: 3, hp: 10, atk: 9, def: 2, move: 2, range: 3, cost: 46, domain: 'land', faction: 'mamluk', nation: 'syria', text: '阵营最远陆军' },
  caliphScholar: { name: '哈里发学者', icon: '📜', level: 2, hp: 8, atk: 1, def: 1, move: 2, range: 1, cost: 40, domain: 'land', faction: 'mamluk', nation: 'baghdad', text: '光环单位，周围2格友军攻防+1' },
  // === 大明帝国（ming）阵营专属兵种 ===
  shenjiBattalion: { name: '神机营火枪兵', icon: '🎇', level: 3, hp: 8, atk: 9, def: 1, move: 2, range: 3, cost: 48, domain: 'land', faction: 'ming', text: '火器齐射，攻击溅射50%到周围1格' },
  qiArmy: { name: '戚家军', icon: '🥋', level: 2, hp: 16, atk: 7, def: 6, move: 3, range: 1, cost: 44, domain: 'land', faction: 'ming', text: '高防步兵，鸳鸯阵', bonusVs: { cavalry: 3 } },
  mingCavalry: { name: '大明骑兵', icon: '🐅', level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 46, domain: 'land', faction: 'ming', text: '通用机动打击', charge: 2 },
  worksEngineer: { name: '工部工程师', icon: '🏗️', level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 46, domain: 'land', faction: 'ming', builder: true, text: '造船/建营速度+50%，费用-10%' },
  treasureShip: { name: '宝船', icon: '🐉', level: 3, hp: 30, atk: 4, def: 5, move: 3, range: 1, cost: 60, domain: 'sea', faction: 'ming', transport: 10, text: '巨型运输船，可运10个陆军' },
  hongyiCannon: { name: '红夷大炮', icon: '☄️', level: 3, hp: 6, atk: 16, def: 1, move: 1, range: 5, cost: 64, domain: 'land', faction: 'ming', text: '超远程攻城，阵营最远单位' },
  // === 大明国家特色兵种 ===
  jinyiwei: { name: '锦衣卫', icon: '🕵️', level: 2, hp: 10, atk: 8, def: 2, move: 6, range: 1, cost: 48, domain: 'land', faction: 'ming', nation: 'mingCore', text: '高机动侦察/暗杀，攻击后不被反击' },
  joseonTurtleShip: { name: '朝鲜龟船', icon: '🐢', level: 3, hp: 28, atk: 7, def: 8, move: 3, range: 2, cost: 56, domain: 'sea', faction: 'ming', nation: 'joseon', text: '装甲战船，反弹30%受到的伤害' },
  annamElephant: { name: '安南象兵', icon: '🐘', level: 3, hp: 28, atk: 12, def: 4, move: 2, range: 1, cost: 58, domain: 'land', faction: 'ming', nation: 'annam', text: '巨兽单位，对步兵践踏伤害+5' }
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

// === 阵营与国家（阶段1数据结构）===
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

// 15国据点命名体系（占领后改名用）
export const SITE_NAMES_BY_NATION = {
  austria: {
    city: ['维也纳', '格拉茨', '林茨', '萨尔茨堡', '因斯布鲁克'],
    shipyard: ['维也纳港', '林茨港', '多瑙河船坞'],
    fortress: ['霍夫堡', '萨尔茨堡要塞', '美泉宫堡垒'],
    oil: ['维也纳盆地油田', '阿尔卑斯油区'],
    barracks: ['奥地利军营', '哈布斯堡军营', '维也纳卫戍营']
  },
  prussia: {
    city: ['柏林', '柯尼斯堡', '波茨坦', '但泽', '布雷斯劳'],
    shipyard: ['基尔港', '但泽港', '波罗的海船坞'],
    fortress: ['柏林堡垒', '柯尼斯堡要塞', '波茨坦卫城'],
    oil: ['普鲁士油区', '波罗的海油田'],
    barracks: ['普鲁士军营', '条顿骑士团军营', '波茨坦近卫营']
  },
  bavaria: {
    city: ['慕尼黑', '纽伦堡', '奥格斯堡', '雷根斯堡', '维尔茨堡'],
    shipyard: ['慕尼黑河港', '多瑙河船坞'],
    fortress: ['慕尼黑堡垒', '纽伦堡城堡', '奥格斯堡要塞'],
    oil: ['巴伐利亚油区', '阿尔卑斯山麓油田'],
    barracks: ['巴伐利亚军营', '山地猎兵营', '慕尼黑卫戍营']
  },
  goldenHordeCore: {
    city: ['萨莱', '阿斯特拉罕', '保加尔', '克里米亚', '塔奈'],
    shipyard: ['萨莱港', '阿斯特拉罕港', '里海船坞'],
    fortress: ['萨莱堡垒', '克里米亚要塞', '保加尔卫城'],
    oil: ['里海油田', '巴库油区', '伏尔加油井'],
    barracks: ['金帐军营', '可汗卫军营', '游牧骑兵营']
  },
  whiteHorde: {
    city: ['玉龙杰赤', '撒马尔罕', '塔什干', '布哈拉', '安集延'],
    shipyard: ['咸海港', '玉龙杰赤港', '阿姆河船坞'],
    fortress: ['玉龙杰赤堡垒', '撒马尔罕要塞', '布哈拉卫城'],
    oil: ['咸海油区', '费尔干纳油田', '河中油井'],
    barracks: ['白帐军营', '玉龙杰赤卫戍营', '河中骑兵营']
  },
  blueHorde: {
    city: ['基辅', '莫斯科', '诺夫哥罗德', '斯摩棱斯克', '切尔尼戈夫'],
    shipyard: ['基辅港', '诺夫哥罗德港', '第聂伯河船坞'],
    fortress: ['基辅堡垒', '莫斯科克里姆林', '诺夫哥罗德要塞'],
    oil: ['第聂伯油区', '莫斯科盆地油田', '伏尔加上游油井'],
    barracks: ['蓝帐军营', '基辅卫戍营', '罗斯骑兵营']
  },
  veniceCore: {
    city: ['威尼斯', '帕多瓦', '维罗纳', '特雷维索', '基奥贾'],
    shipyard: ['威尼斯兵工厂', '基奥贾港', '亚得里亚海船坞'],
    fortress: ['威尼斯堡垒', '维罗纳要塞', '帕多瓦卫城'],
    oil: ['亚得里亚油区', '威尼斯湾油田'],
    barracks: ['威尼斯军营', '共和国卫戍营', '海军陆战营']
  },
  genoa: {
    city: ['热那亚', '比萨', '佛罗伦萨', '锡耶纳', '卢卡'],
    shipyard: ['热那亚港', '比萨港', '利古里亚海船坞'],
    fortress: ['热那亚堡垒', '比萨要塞', '佛罗伦萨卫城'],
    oil: ['利古里亚油区', '托斯卡纳油田'],
    barracks: ['热那亚军营', '共和国雇佣军营', '比萨卫戍营']
  },
  ragusa: {
    city: ['拉古萨', '扎达尔', '斯普利特', '科托尔', '杜布罗夫尼克'],
    shipyard: ['拉古萨港', '扎达尔港', '亚得里亚海南部船坞'],
    fortress: ['拉古萨堡垒', '杜布罗夫尼克要塞', '科托尔卫城'],
    oil: ['达尔马提亚油区', '亚得里亚海南部油田'],
    barracks: ['拉古萨军营', '共和国卫戍营', '达尔马提亚轻步兵营']
  },
  egypt: {
    city: ['开罗', '亚历山大', '孟菲斯', '吉萨', '塞得港'],
    shipyard: ['亚历山大港', '塞得港', '尼罗河船坞'],
    fortress: ['开罗堡垒', '亚历山大要塞', '吉萨卫城'],
    oil: ['苏伊士油区', '尼罗河三角洲油田', '红海油井'],
    barracks: ['马穆鲁克军营', '开罗卫戍营', '奴隶骑兵营']
  },
  syria: {
    city: ['大马士革', '阿勒颇', '安条克', '的黎波里', '霍姆斯'],
    shipyard: ['的黎波里港', '安条克港', '地中海东岸船坞'],
    fortress: ['大马士革堡垒', '阿勒颇要塞', '骑士堡'],
    oil: ['叙利亚油区', '幼发拉底河油田', '霍姆斯油井'],
    barracks: ['叙利亚军营', '大马士革卫戍营', '阿拉伯轻骑兵营']
  },
  baghdad: {
    city: ['巴格达', '巴士拉', '库法', '摩苏尔', '纳杰夫'],
    shipyard: ['巴士拉港', '巴格达河港', '波斯湾船坞'],
    fortress: ['巴格达堡垒', '巴士拉要塞', '圆城卫城'],
    oil: ['波斯湾油田', '巴士拉油区', '美索不达米亚油井'],
    barracks: ['哈里发军营', '巴格达卫戍营', '学者护卫营']
  },
  mingCore: {
    city: ['北京', '南京', '西安', '洛阳', '开封'],
    shipyard: ['泉州港', '广州港', '南京龙江船厂'],
    fortress: ['山海关', '嘉峪关', '居庸关'],
    oil: ['大庆油田', '胜利油田', '华北油区'],
    barracks: ['神机营', '三千营', '五军营']
  },
  joseon: {
    city: ['汉城', '平壤', '开城', '釜山', '庆州'],
    shipyard: ['釜山港', '仁川港', '朝鲜海峡船坞'],
    fortress: ['汉城堡垒', '平壤要塞', '釜山卫城'],
    oil: ['朝鲜湾油区', '平壤盆地油田'],
    barracks: ['朝鲜军营', '汉城卫戍营', '龟船水师营']
  },
  annam: {
    city: ['河内', '顺化', '岘港', '海防', '升龙'],
    shipyard: ['海防港', '岘港', '北部湾船坞'],
    fortress: ['河内堡垒', '顺化要塞', '岘港卫城'],
    oil: ['北部湾油区', '河内盆地油田'],
    barracks: ['安南军营', '河内卫戍营', '象兵训练营']
  }
};
