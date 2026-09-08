(() => {
  // src/core/constants.js
  var TEAMS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  var TEAM_NAMES = {
    A: "汉萨同盟",
    B: "拜占庭帝国",
    C: "条顿骑士团国",
    D: "莫斯科大公国",
    E: "奥斯曼帝国",
    F: "帖木儿帝国",
    G: "蒙古帝国",
    H: "波兰-立陶宛联邦",
    I: "匈牙利王国",
    J: "萨法维波斯",
    K: "德里苏丹国",
    L: "高棉帝国",
    M: "高丽王朝",
    N: "马里帝国",
    O: "埃塞俄比亚帝国"
  };
  var OWNER_NAMES = ["赤岩军团", "紫晶军团", "琥珀军团", "翡翠军团", "钢青军团", "沙金军团", "苍鹰军团"];
  var OWNER_COLORS = ["#ef5c55", "#dc8cff", "#f2a65a", "#56d364", "#7aa2c9", "#d8c06b", "#5ad2c0"];
  var COLOR_PRESETS = {
    azure: { name: "蔚蓝", value: "#55a3ff" },
    crimson: { name: "赤红", value: "#ef5c55" },
    violet: { name: "紫晶", value: "#dc8cff" },
    amber: { name: "琥珀", value: "#f2a65a" },
    jade: { name: "翡翠", value: "#56d364" },
    steel: { name: "钢青", value: "#7aa2c9" },
    sand: { name: "沙金", value: "#d8c06b" },
    teal: { name: "青碧", value: "#5ad2c0" },
    rose: { name: "绯红", value: "#ff8fab" }
  };
  var CITY_NAMES = ["维也纳", "柏林", "慕尼黑", "布拉格", "萨莱", "基辅", "莫斯科", "威尼斯", "热那亚", "罗马", "开罗", "大马士革", "巴格达", "北京", "南京", "西安", "君士坦丁堡", "雅典", "亚历山大", "安条克", "杭州", "成都", "广州"];
  var PORT_NAMES = ["威尼斯港", "热那亚港", "亚历山大港", "君士坦丁堡港", "泉州港", "广州港", "汉堡港", "但泽港", "克里米亚港", "阿斯特拉罕港", "贝鲁特港", "突尼斯港"];
  var FORT_NAMES = ["霍亨索伦堡", "哈布斯堡堡", "克里米亚堡", "耶路撒冷堡", "骑士堡", "山海关", "嘉峪关", "居庸关", "科孚堡", "塞浦路斯堡"];
  var OIL_NAMES = ["巴库油田", "里海油区", "波斯湾油井", "红海油田", "利比亚油区", "西西里油井", "阿尔萨斯油田", "鲁尔油区", "大庆油井", "胜利油田"];
  var BARRACK_NAMES = ["条顿军营", "普鲁士军营", "金帐军营", "雇佣军营", "马穆鲁克军营", "圣战军营", "神机营", "三千营", "五军营", "骑士团军营"];
  var VIEW_MAX_W = 1280;
  var VIEW_MAX_H = 820;
  var CAMP_DURATION = 3;
  var CAMP_COST = 24;
  var CITY_INCOME_BY_TIER = { 1: 8, 2: 11, 3: 14 };
  var UNIT_RANK_THRESHOLDS = [0, 2, 5, 9];
  var TYPES = {
    militia: { name: "民兵", icon: "⚒", level: 1, hp: 10, atk: 4, def: 2, move: 3, range: 1, cost: 16, domain: "land", text: "低成本守备步兵。" },
    scout: { name: "侦察兵", icon: "♞", level: 1, hp: 8, atk: 3, def: 1, move: 5, range: 1, cost: 18, domain: "land", text: "高机动侦察与抢点单位。" },
    spearman: { name: "长枪兵", icon: "⚔", level: 1, hp: 13, atk: 5, def: 4, move: 3, range: 1, cost: 26, domain: "land", text: "克制骑兵的坚实前排。", bonusVs: { cavalry: 3 } },
    swordsman: { name: "剑士", icon: "♟", level: 2, hp: 15, atk: 6, def: 5, move: 3, range: 1, cost: 32, domain: "land", text: "均衡的主力近战。" },
    archer: { name: "弓箭手", icon: "♜", level: 2, hp: 9, atk: 5, def: 2, move: 2, range: 2, cost: 34, domain: "land", text: "稳定远程输出。" },
    crossbow: { name: "弩手", icon: "✚", level: 2, hp: 10, atk: 7, def: 2, move: 2, range: 2, cost: 40, domain: "land", text: "高爆发集火兵种。" },
    engineer: { name: "工程师", icon: "⚙", level: 2, hp: 11, atk: 3, def: 2, move: 3, range: 1, cost: 42, domain: "land", text: "能在海边造船，或就地建立临时营地。", builder: true },
    cavalry: { name: "骑兵", icon: "♘", level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 48, domain: "land", text: "高机动冲锋单位。", charge: 2 },
    guard: { name: "近卫军", icon: "🛡", level: 3, hp: 20, atk: 7, def: 7, move: 3, range: 1, cost: 54, domain: "land", text: "重装精锐，擅长守点。" },
    warship: { name: "战船", icon: "⛵", level: 2, hp: 20, atk: 8, def: 5, move: 4, range: 2, cost: 46, domain: "sea", text: "主力海战单位。", bonusVs: { transport: 4 } },
    transport: { name: "运兵船", icon: "🚢", level: 2, hp: 18, atk: 2, def: 4, move: 5, range: 1, cost: 42, domain: "sea", text: "一次最多搭载五个陆军单位。", transport: 5 },
    galley: { name: "桨帆船", icon: "🛶", level: 1, hp: 14, atk: 6, def: 3, move: 3, range: 2, cost: 30, domain: "sea", text: "低成本海战单位，适合早期制海。", bonusVs: { transport: 2, barge: 3 } },
    barge: { name: "驳船", icon: "⛴", level: 1, hp: 12, atk: 1, def: 2, move: 4, range: 1, cost: 26, domain: "sea", text: "一次最多搭载三个陆军单位。", transport: 3 },
    battleship: { name: "战舰", icon: "🛳", level: 3, hp: 14, atk: 13, def: 4, move: 3, range: 4, cost: 62, domain: "sea", text: "远程重炮舰，射程远但脆弱。", bonusVs: { transport: 6, barge: 8, warship: 2, galley: 3 } },
    catapult: { name: "投石车", icon: "🎯", level: 3, hp: 8, atk: 12, def: 1, move: 2, range: 4, cost: 54, domain: "land", text: "远程攻城器械，射程远但极度脆弱。" },
    // === 神圣罗马帝国（hre）联盟专属兵种 ===
    heavyInfantry: { name: "德意志重甲步兵", icon: "🗿", level: 2, hp: 18, atk: 7, def: 6, move: 2, range: 1, cost: 36, domain: "land", faction: "hre", text: "正面铜墙铁壁。" },
    pikeSquare: { name: "长矛方阵", icon: "🔱", level: 1, hp: 14, atk: 5, def: 6, move: 3, range: 1, cost: 30, domain: "land", faction: "hre", text: "不可被冲锋的密集方阵。", bonusVs: { cavalry: 5 } },
    imperialCrossbow: { name: "帝国弩手", icon: "🏹", level: 2, hp: 10, atk: 8, def: 2, move: 2, range: 2, cost: 42, domain: "land", faction: "hre", text: "高爆发集火。" },
    imperialGuard: { name: "帝国近卫军", icon: "💂", level: 3, hp: 22, atk: 8, def: 7, move: 3, range: 1, cost: 56, domain: "land", faction: "hre", text: "守点时防御+3。" },
    siegeTower: { name: "攻城塔", icon: "🏰", level: 2, hp: 30, atk: 4, def: 3, move: 1, range: 1, cost: 40, domain: "land", faction: "hre", text: "占领据点速度×2。" },
    heavyCatapult: { name: "重型投石车", icon: "💥", level: 3, hp: 8, atk: 14, def: 1, move: 1, range: 4, cost: 58, domain: "land", faction: "hre", text: "对据点驻军伤害+3。" },
    // === 神罗国家特色兵种 ===
    austrianKnight: { name: "奥地利骑士", icon: "🏇", level: 3, hp: 20, atk: 9, def: 6, move: 5, range: 1, cost: 50, domain: "land", faction: "hre", nation: "austria", text: "重装冲锋骑兵。", charge: 3 },
    prussianGrenadier: { name: "普鲁士掷弹兵", icon: "🧨", level: 2, hp: 12, atk: 10, def: 3, move: 3, range: 1, cost: 44, domain: "land", faction: "hre", nation: "prussia", text: "对据点内单位伤害+3。" },
    bavarianMountaineer: { name: "巴伐利亚山地弩手", icon: "⛰", level: 2, hp: 10, atk: 7, def: 2, move: 3, range: 2, cost: 40, domain: "land", faction: "hre", nation: "bavaria", text: "山地地形移动不消耗，驻扎山地射程+1。" },
    // === 金帐汗国（goldenHorde）联盟专属兵种 ===
    lightCavalry: { name: "轻骑兵", icon: "🐎", level: 1, hp: 12, atk: 6, def: 2, move: 6, range: 1, cost: 28, domain: "land", faction: "goldenHorde", text: "高机动骚扰与追击" },
    hordeCavalry: { name: "汗国骑兵", icon: "🐴", level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 42, domain: "land", faction: "goldenHorde", text: "通用机动打击", charge: 2 },
    horseArcher: { name: "骑射手", icon: "🥷", level: 2, hp: 11, atk: 6, def: 2, move: 4, range: 2, cost: 38, domain: "land", faction: "goldenHorde", text: "高机动骑射，打完就跑" },
    nomadArcher: { name: "游牧弓手", icon: "🪃", level: 1, hp: 9, atk: 5, def: 1, move: 3, range: 2, cost: 30, domain: "land", faction: "goldenHorde", text: "边走边打的轻装弓手" },
    fastGalley: { name: "快速桨帆船", icon: "🚤", level: 1, hp: 12, atk: 7, def: 2, move: 5, range: 2, cost: 32, domain: "sea", faction: "goldenHorde", text: "海上游击，高机动低血量" },
    nomadChariot: { name: "游牧战车", icon: "🛞", level: 2, hp: 14, atk: 8, def: 2, move: 4, range: 2, cost: 46, domain: "land", faction: "goldenHorde", text: "移动攻城器械" },
    // === 金帐汗国国家特色兵种 ===
    khanGuard: { name: "可汗亲卫", icon: "🦅", level: 3, hp: 18, atk: 10, def: 5, move: 4, range: 3, cost: 60, domain: "land", faction: "goldenHorde", nation: "goldenHordeCore", text: "重装骑射手，汗国最强单位" },
    camelCavalry: { name: "骆驼骑兵", icon: "🐫", level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 44, domain: "land", faction: "goldenHorde", nation: "whiteHorde", text: "沙漠平原移动不消耗，吓到敌方马匹", bonusVs: { cavalry: 3 } },
    nomadCannon: { name: "游牧重炮", icon: "💣", level: 3, hp: 10, atk: 12, def: 1, move: 3, range: 3, cost: 52, domain: "land", faction: "goldenHorde", nation: "blueHorde", text: "移动攻城，比投石车灵活" },
    // === 威尼斯共和国（venice）联盟专属兵种 ===
    marine: { name: "海军陆战队", icon: "🪖", level: 2, hp: 14, atk: 7, def: 4, move: 3, range: 1, cost: 38, domain: "land", faction: "venice", text: "两栖登陆作战单位" },
    galleyWarship: { name: "桨帆战舰", icon: "🚣", level: 2, hp: 18, atk: 10, def: 4, move: 4, range: 2, cost: 50, domain: "sea", faction: "venice", text: "标准海战主力" },
    masterEngineer: { name: "大师工程师", icon: "🔧", level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 48, domain: "land", faction: "venice", builder: true, text: "造船费用-20%，可建高级营地" },
    venetianBattleship: { name: "威尼斯战舰", icon: "🔥", level: 3, hp: 12, atk: 14, def: 3, move: 3, range: 4, cost: 64, domain: "sea", faction: "venice", text: "海上远程火力压制" },
    tradeCaravan: { name: "商队", icon: "💰", level: 1, hp: 10, atk: 2, def: 2, move: 4, range: 1, cost: 30, domain: "land", faction: "venice", text: "占领据点后该据点收入+3/回合" },
    mercenarySwordsman: { name: "雇佣剑士", icon: "🗡", level: 2, hp: 15, atk: 8, def: 4, move: 3, range: 1, cost: 40, domain: "land", faction: "venice", text: "精锐雇佣兵" },
    // === 威尼斯国家特色兵种 ===
    venetianGalleon: { name: "威尼斯巨舰", icon: "⚜", level: 3, hp: 20, atk: 16, def: 5, move: 2, range: 5, cost: 70, domain: "sea", faction: "venice", nation: "veniceCore", text: "超远程海军，联盟最强单位" },
    genoeseMarine: { name: "热那亚海军弩手", icon: "🔫", level: 2, hp: 10, atk: 8, def: 2, move: 4, range: 3, cost: 44, domain: "sea", faction: "venice", nation: "genoa", text: "可在船上射击的海军远程单位" },
    ragusaCaravan: { name: "拉古萨巨商队", icon: "💎", level: 2, hp: 14, atk: 3, def: 3, move: 4, range: 1, cost: 36, domain: "land", faction: "venice", nation: "ragusa", text: "强化商队，占领据点后收入+5/回合" },
    // === 马穆鲁克苏丹国（mamluk）联盟专属兵种 ===
    mamlukCavalry: { name: "马穆鲁克骑兵", icon: "🦁", level: 3, hp: 18, atk: 9, def: 5, move: 5, range: 1, cost: 48, domain: "land", faction: "mamluk", text: "精锐骑兵，击杀经验×2", charge: 2 },
    jihadist: { name: "圣战者", icon: "⚡", level: 2, hp: 14, atk: 8, def: 2, move: 3, range: 1, cost: 34, domain: "land", faction: "mamluk", text: "对异联盟攻击+2，狂热不怕死" },
    arabArcher: { name: "阿拉伯弓手", icon: "🪶", level: 2, hp: 9, atk: 7, def: 1, move: 3, range: 2, cost: 32, domain: "land", faction: "mamluk", text: "沙漠地形移动不消耗" },
    camelWarrior: { name: "骆驼骑兵", icon: "🐪", level: 3, hp: 15, atk: 8, def: 4, move: 5, range: 1, cost: 42, domain: "land", faction: "mamluk", text: "吓到敌方马匹", bonusVs: { cavalry: 3 } },
    arabDhow: { name: "阿拉伯帆船", icon: "⚓", level: 2, hp: 16, atk: 9, def: 3, move: 5, range: 2, cost: 44, domain: "sea", faction: "mamluk", text: "可兼职运输2个陆军", transport: 2 },
    siegeCrossbow: { name: "攻城弩", icon: "🔨", level: 3, hp: 10, atk: 10, def: 1, move: 2, range: 3, cost: 46, domain: "land", faction: "mamluk", text: "对据点驻军伤害+2" },
    // === 马穆鲁克国家特色兵种 ===
    sultanGuard: { name: "苏丹禁卫军", icon: "👑", level: 3, hp: 22, atk: 11, def: 7, move: 5, range: 1, cost: 62, domain: "land", faction: "mamluk", nation: "egypt", text: "超精锐骑兵，击杀后回血3", charge: 3 },
    syrianLongbow: { name: "叙利亚长弓手", icon: "🌙", level: 3, hp: 10, atk: 9, def: 2, move: 2, range: 3, cost: 46, domain: "land", faction: "mamluk", nation: "syria", text: "联盟最远陆军" },
    caliphScholar: { name: "哈里发学者", icon: "📜", level: 2, hp: 8, atk: 1, def: 1, move: 2, range: 1, cost: 40, domain: "land", faction: "mamluk", nation: "baghdad", text: "光环单位，周围2格友军攻防+1" },
    // === 大明帝国（ming）联盟专属兵种 ===
    shenjiBattalion: { name: "神机营火枪兵", icon: "🎇", level: 3, hp: 8, atk: 9, def: 1, move: 2, range: 3, cost: 48, domain: "land", faction: "ming", text: "火器齐射，攻击溅射50%到周围1格" },
    qiArmy: { name: "戚家军", icon: "🥋", level: 2, hp: 16, atk: 7, def: 6, move: 3, range: 1, cost: 44, domain: "land", faction: "ming", text: "高防步兵，鸳鸯阵", bonusVs: { cavalry: 3 } },
    mingCavalry: { name: "大明骑兵", icon: "🐅", level: 3, hp: 16, atk: 8, def: 4, move: 5, range: 1, cost: 46, domain: "land", faction: "ming", text: "通用机动打击", charge: 2 },
    worksEngineer: { name: "工部工程师", icon: "🏗️", level: 2, hp: 12, atk: 3, def: 2, move: 3, range: 1, cost: 46, domain: "land", faction: "ming", builder: true, text: "造船/建营速度+50%，费用-10%" },
    treasureShip: { name: "宝船", icon: "🐉", level: 3, hp: 30, atk: 4, def: 5, move: 3, range: 1, cost: 60, domain: "sea", faction: "ming", transport: 10, text: "巨型运输船，可运10个陆军" },
    hongyiCannon: { name: "红夷大炮", icon: "☄️", level: 3, hp: 6, atk: 16, def: 1, move: 1, range: 5, cost: 64, domain: "land", faction: "ming", text: "超远程攻城，联盟最远单位" },
    // === 大明国家特色兵种 ===
    jinyiwei: { name: "锦衣卫", icon: "🕵️", level: 2, hp: 10, atk: 8, def: 2, move: 6, range: 1, cost: 48, domain: "land", faction: "ming", nation: "mingCore", text: "高机动侦察/暗杀，攻击后不被反击" },
    joseonTurtleShip: { name: "朝鲜龟船", icon: "🐢", level: 3, hp: 28, atk: 7, def: 8, move: 3, range: 2, cost: 56, domain: "sea", faction: "ming", nation: "joseon", text: "装甲战船，反弹30%受到的伤害" },
    annamElephant: { name: "安南象兵", icon: "🐘", level: 3, hp: 28, atk: 12, def: 4, move: 2, range: 1, cost: 58, domain: "land", faction: "ming", nation: "annam", text: "巨兽单位，对步兵践踏伤害+5" }
  };
  var SITE_META = {
    city: { name: "城市", icon: "🏛", income: 10, maxTier: 3, upgradeCosts: { 1: 12, 2: 26 }, domain: "land" },
    shipyard: { name: "港口/造船厂", icon: "⚓", income: 8, maxTier: 3, upgradeCosts: { 1: 14, 2: 28 }, domain: "sea" },
    camp: { name: "临时营地", icon: "⛺", income: 0, maxTier: 2, upgradeCosts: {}, domain: "land" },
    oilSmall: { name: "小型油田", icon: "🛢", income: CITY_INCOME_BY_TIER[3] + CITY_INCOME_BY_TIER[1], maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
    oilMedium: { name: "中型油田", icon: "🛢", income: CITY_INCOME_BY_TIER[3] + CITY_INCOME_BY_TIER[2], maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
    oilLarge: { name: "大型油田", icon: "🛢", income: CITY_INCOME_BY_TIER[3] * 2, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 0 },
    barracksSmall: { name: "小型军营", icon: "🏕", income: 0, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 2 },
    barracksLarge: { name: "大型军营", icon: "🏕", income: 0, maxTier: 1, upgradeCosts: {}, domain: null, supportTier: 3 },
    fortress: { name: "海上堡垒", icon: "⬣", income: 5, maxTier: 1, upgradeCosts: {}, domain: null }
  };
  var TERRAIN = {
    plain: { name: "草原", color: "#638f4e", cost: 1, def: 0, mark: "" },
    forest: { name: "森林", color: "#356641", cost: 2, def: 2, mark: "♣" },
    mountain: { name: "山脉", color: "#696b68", cost: 99, def: 4, mark: "▲" },
    road: { name: "道路", color: "#a4865c", cost: 1, def: 0, mark: "·" },
    water: { name: "海域", color: "#2d6f9e", cost: 1, def: 0, mark: "≈" },
    desert: { name: "沙漠", color: "#c2a968", cost: 2, def: 0, mark: "∴" },
    sand: { name: "沙地", color: "#e3d29a", cost: 1, def: 0, mark: "·" },
    hill: { name: "丘陵", color: "#6b8e4e", cost: 2, def: 2, mark: "△" },
    snow: { name: "雪地", color: "#c8dce8", cost: 2, def: 1, mark: "❄" }
  };
  var MAPS = {
    frontier: { name: "边境河谷", sea: false },
    twinrivers: { name: "双河走廊", sea: false },
    highlands: { name: "高地山口", sea: false },
    plains: { name: "北方平原", sea: false },
    heartland: { name: "中心平原", sea: false },
    coast: { name: "海岸丘陵", sea: true },
    islands: { name: "群岛与海峡", sea: true },
    innersea: { name: "内海争夺", sea: true },
    grandbay: { name: "海湾登陆", sea: true },
    strait: { name: "裂海海峡", sea: true },
    archipelago: { name: "断链群岛", sea: true },
    random: { name: "随机大陆", sea: true }
  };
  var MODES = { conquest: "征服", skirmish: "遭遇战", survival: "守城" };
  var SIZES = {
    small: { name: "小型 · 约 240 格", cells: 240 },
    medium: { name: "中型 · 约 450 格", cells: 450 },
    large: { name: "大型 · 约 720 格", cells: 720 },
    huge: { name: "巨型 · 约 1050 格", cells: 1056 },
    giant: { name: "超大 · 约 1800 格", cells: 1800 },
    colossal: { name: "史诗 · 约 2880 格", cells: 2880 }
  };
  var ASPECTS = {
    wide: { name: "宽幅", ratio: 1.95 },
    standard: { name: "标准", ratio: 1.55 },
    square: { name: "方阵", ratio: 1 },
    tall: { name: "纵深", ratio: 0.72 }
  };
  var COMPLEX = {
    low: { name: "低：开阔地", water: 0.03, forest: 0.08, mountain: 0.05 },
    medium: { name: "中：混合地形", water: 0.08, forest: 0.14, mountain: 0.09 },
    high: { name: "高：险峻复杂", water: 0.12, forest: 0.2, mountain: 0.14 }
  };
  var DIFF = {
    easy: { name: "简单", lookahead: 1, economy: 0.85, production: 1, risk: 0.75 },
    medium: { name: "中等", lookahead: 2, economy: 1, production: 2, risk: 1 },
    brutal: { name: "冷酷", lookahead: 3, economy: 1.2, production: 3, risk: 1.2 },
    bridgehead: { name: "桥头(测试)", lookahead: 2, economy: 1, production: 2, risk: 1, scripted: true, script: "bridgehead" },
    naval: { name: "海防(测试)", lookahead: 2, economy: 1, production: 2, risk: 1, scripted: true, script: "naval" }
  };
  var AGG = {
    cautious: { name: "谨慎", push: 0.72, preserve: 1.45, expansion: 0.7, retreatHp: 0.55, chase: 0.5, lowGoldReserve: 55, forestBias: 1.4 },
    balanced: { name: "均衡", push: 1, preserve: 1, expansion: 1, retreatHp: 0.38, chase: 1, lowGoldReserve: 35, forestBias: 1 },
    reckless: { name: "冲动", push: 1.35, preserve: 0.72, expansion: 1.55, retreatHp: 0.22, chase: 1.55, lowGoldReserve: 18, forestBias: 0.4 }
  };
  var MAX_TURNS = 120;
  var MAX_CAMPS_PER_SIDE = 3;
  var MAX_STACK = 3;
  var FERRY_THROUGHPUT = 3;
  var BRIDGEHEAD_DEFEND_FRACTION = 0.75;
  var FACTIONS = {
    hre: { name: "神圣罗马帝国", short: "神罗", color: "#c0392b", style: "重甲推进、阵地消耗", mechanic: "征召兵 / 帝国议会" },
    goldenHorde: { name: "金帐汗国", short: "金帐", color: "#e67e22", style: "骑射游击、打完就跑", mechanic: "打完就跑 / 游牧营地" },
    venice: { name: "威尼斯共和国", short: "威尼斯", color: "#27ae60", style: "海军霸权、商业贸易", mechanic: "商路经济 / 雇佣兵" },
    mamluk: { name: "马穆鲁克苏丹国", short: "马穆鲁克", color: "#8e44ad", style: "精锐骑兵、宗教狂热", mechanic: "圣战 / 马穆鲁克精锐" },
    ming: { name: "大明帝国", short: "大明", color: "#d4ac0d", style: "火器齐射、工程建筑", mechanic: "火器齐射 / 卫所制" }
  };
  var NATIONS = {
    austria: { name: "奥地利", faction: "hre", unique: "奥地利骑士" },
    prussia: { name: "普鲁士", faction: "hre", unique: "普鲁士掷弹兵" },
    bavaria: { name: "巴伐利亚", faction: "hre", unique: "巴伐利亚山地弩手" },
    goldenHordeCore: { name: "金帐本部", faction: "goldenHorde", unique: "可汗亲卫" },
    whiteHorde: { name: "白帐汗国", faction: "goldenHorde", unique: "骆驼骑兵" },
    blueHorde: { name: "蓝帐汗国", faction: "goldenHorde", unique: "游牧重炮" },
    veniceCore: { name: "威尼斯", faction: "venice", unique: "威尼斯巨舰" },
    genoa: { name: "热那亚", faction: "venice", unique: "热那亚海军弩手" },
    ragusa: { name: "拉古萨", faction: "venice", unique: "拉古萨巨商队" },
    egypt: { name: "埃及", faction: "mamluk", unique: "苏丹禁卫军" },
    syria: { name: "叙利亚", faction: "mamluk", unique: "叙利亚长弓手" },
    baghdad: { name: "巴格达", faction: "mamluk", unique: "哈里发学者" },
    mingCore: { name: "大明", faction: "ming", unique: "锦衣卫" },
    joseon: { name: "朝鲜", faction: "ming", unique: "朝鲜龟船" },
    annam: { name: "安南", faction: "ming", unique: "安南象兵" }
  };
  var SITE_NAMES_BY_NATION = {
    austria: {
      city: ["维也纳", "格拉茨", "林茨", "萨尔茨堡", "因斯布鲁克", "克拉根福", "圣帕尔滕", "上瓦特", "维瑟尔堡", "阿姆施泰滕", "多瑙河畔克雷姆斯", "茨维特尔"],
      shipyard: ["维也纳港", "林茨港", "多瑙河船坞", "克雷姆斯港", "图尔恩港", "维也纳新港", "多瑙河畔船坞", "林茨新港"],
      fortress: ["霍夫堡", "美泉宫堡垒", "萨尔茨堡要塞", "霍亨维尔芬堡", "库夫施泰因要塞", "拉滕贝格堡", "哈尔堡要塞", "佩尔诺斯坦堡"],
      oil: ["维也纳盆地油田", "阿尔卑斯油区", "下奥地利油田", "施蒂利亚油井", "布尔根兰油田", "上奥地利油区"],
      barracks: ["奥地利军营", "哈布斯堡军营", "维也纳卫戍营", "格拉茨兵营", "林茨兵营", "萨尔茨堡卫戍营", "因斯布鲁克兵营", "圣帕尔滕兵营"]
    },
    prussia: {
      city: ["柏林", "柯尼斯堡", "波茨坦", "但泽", "布雷斯劳", "波美拉尼亚", "勃兰登堡", "斯德丁", "库尔姆", "托伦", "阿伦施泰因", "埃尔宾"],
      shipyard: ["基尔港", "但泽港", "波罗的海船坞", "斯德丁港", "柯尼斯堡港", "皮劳港", "维斯马港", "罗斯托克港"],
      fortress: ["柏林堡垒", "柯尼斯堡要塞", "波茨坦卫城", "斯潘道要塞", "屈斯特林要塞", "格劳登茨堡", "托伦要塞", "库尔姆堡"],
      oil: ["普鲁士油区", "波罗的海油田", "波美拉尼亚油井", "勃兰登堡油田", "西里西亚油区", "东普鲁士油井"],
      barracks: ["普鲁士军营", "条顿骑士团军营", "波茨坦近卫营", "柏林卫戍营", "柯尼斯堡兵营", "但泽兵营", "布雷斯劳卫戍营", "斯德丁兵营"]
    },
    bavaria: {
      city: ["慕尼黑", "纽伦堡", "奥格斯堡", "雷根斯堡", "维尔茨堡", "因戈尔施塔特", "班贝格", "帕绍", "兰茨胡特", "安贝格", "魏登", "肯普滕"],
      shipyard: ["慕尼黑河港", "多瑙河船坞", "雷根斯堡港", "帕绍港", "因戈尔施塔特港", "美因河船坞", "班贝格港", "维尔茨堡港"],
      fortress: ["慕尼黑堡垒", "纽伦堡城堡", "奥格斯堡要塞", "雷根斯堡卫城", "维尔茨堡要塞", "因戈尔施塔特堡", "班贝格要塞", "兰茨胡特堡"],
      oil: ["巴伐利亚油区", "阿尔卑斯山麓油田", "多瑙河油井", "上巴伐利亚油区", "下巴伐利亚油田", "弗兰肯油井"],
      barracks: ["巴伐利亚军营", "山地猎兵营", "慕尼黑卫戍营", "纽伦堡兵营", "奥格斯堡卫戍营", "雷根斯堡兵营", "维尔茨堡卫戍营", "因戈尔施塔特兵营"]
    },
    goldenHordeCore: {
      city: ["萨莱", "阿斯特拉罕", "保加尔", "克里米亚", "塔奈", "马扎尔", "速答黑", "喀山", "阿速夫", "塔纳伊斯", "别尔哥罗德", "新萨莱"],
      shipyard: ["萨莱港", "阿斯特拉罕港", "里海船坞", "阿速夫港", "塔奈港", "喀山港", "伏尔加河船坞", "顿河船坞"],
      fortress: ["萨莱堡垒", "克里米亚要塞", "保加尔卫城", "阿斯特拉罕堡", "喀山要塞", "塔奈堡", "阿速夫要塞", "别尔哥罗德堡"],
      oil: ["里海油田", "巴库油区", "伏尔加油井", "阿斯特拉罕油区", "顿河油田", "乌拉尔油井", "北高加索油区"],
      barracks: ["金帐军营", "可汗卫军营", "游牧骑兵营", "萨莱卫戍营", "阿斯特拉罕兵营", "保加尔兵营", "克里米亚骑兵营", "喀山兵营"]
    },
    whiteHorde: {
      city: ["玉龙杰赤", "撒马尔罕", "塔什干", "布哈拉", "安集延", "浩罕", "纳曼干", "卡尔希", "铁尔梅兹", "沙赫里萨布兹", "卡拉卡尔帕克", "花剌子模"],
      shipyard: ["咸海港", "玉龙杰赤港", "阿姆河船坞", "布哈拉港", "塔什干河港", "撒马尔罕港", "泽拉夫尚河船坞", "锡尔河船坞"],
      fortress: ["玉龙杰赤堡垒", "撒马尔罕要塞", "布哈拉卫城", "塔什干堡", "安集延要塞", "浩罕堡", "纳曼干要塞", "铁尔梅兹堡"],
      oil: ["咸海油区", "费尔干纳油田", "河中油井", "布哈拉油区", "撒马尔罕油田", "阿姆河油井", "花剌子模油区"],
      barracks: ["白帐军营", "玉龙杰赤卫戍营", "河中骑兵营", "撒马尔罕兵营", "布哈拉兵营", "塔什干卫戍营", "安集延骑兵营", "浩罕兵营"]
    },
    blueHorde: {
      city: ["基辅", "莫斯科", "诺夫哥罗德", "斯摩棱斯克", "切尔尼戈夫", "梁赞", "弗拉基米尔", "苏兹达尔", "特维尔", "普斯科夫", "图拉", "卡卢加"],
      shipyard: ["基辅港", "诺夫哥罗德港", "第聂伯河船坞", "莫斯科河港", "弗拉基米尔港", "奥卡河船坞", "伏尔加河上游船坞", "普斯科夫港"],
      fortress: ["基辅堡垒", "莫斯科克里姆林", "诺夫哥罗德要塞", "斯摩棱斯克堡", "切尔尼戈夫要塞", "梁赞堡", "弗拉基米尔卫城", "特维尔要塞"],
      oil: ["第聂伯油区", "莫斯科盆地油田", "伏尔加上游油井", "斯摩棱斯克油区", "梁赞油田", "卡卢加油井", "图拉油区"],
      barracks: ["蓝帐军营", "基辅卫戍营", "罗斯骑兵营", "莫斯科兵营", "诺夫哥罗德兵营", "弗拉基米尔卫戍营", "斯摩棱斯克兵营", "梁赞兵营"]
    },
    veniceCore: {
      city: ["威尼斯", "帕多瓦", "维罗纳", "特雷维索", "基奥贾", "罗维戈", "贝卢诺", "乌迪内", "的里雅斯特", "普拉", "扎拉", "科托尔"],
      shipyard: ["威尼斯兵工厂", "基奥贾港", "亚得里亚海船坞", "帕多瓦港", "维罗纳港", "特雷维索港", "的里雅斯特港", "普拉港"],
      fortress: ["威尼斯堡垒", "维罗纳要塞", "帕多瓦卫城", "基奥贾堡", "特雷维索要塞", "乌迪内堡", "的里雅斯特要塞", "普拉堡"],
      oil: ["亚得里亚油区", "威尼斯湾油田", "波河平原油井", "威尼托油区", "弗留利油田", "伊斯特拉油井"],
      barracks: ["威尼斯军营", "共和国卫戍营", "海军陆战营", "帕多瓦兵营", "维罗纳卫戍营", "特雷维索兵营", "基奥贾海军营", "乌迪内兵营"]
    },
    genoa: {
      city: ["热那亚", "比萨", "佛罗伦萨", "锡耶纳", "卢卡", "里窝那", "那不勒斯", "萨勒诺", "阿马尔菲", "萨沃纳", "拉斯佩齐亚", "圣雷莫"],
      shipyard: ["热那亚港", "比萨港", "利古里亚海船坞", "里窝那港", "那不勒斯港", "萨勒诺港", "阿马尔菲港", "萨沃纳港"],
      fortress: ["热那亚堡垒", "比萨要塞", "佛罗伦萨卫城", "锡耶纳堡", "卢卡要塞", "里窝那堡", "那不勒斯要塞", "萨勒诺堡"],
      oil: ["利古里亚油区", "托斯卡纳油田", "第勒尼安海油井", "热那亚湾油区", "比萨平原油田", "坎帕尼亚油井"],
      barracks: ["热那亚军营", "共和国雇佣军营", "比萨卫戍营", "热那亚海军营", "佛罗伦萨兵营", "锡耶纳兵营", "里窝那卫戍营", "那不勒斯兵营"]
    },
    ragusa: {
      city: ["拉古萨", "扎达尔", "斯普利特", "科托尔", "杜布罗夫尼克", "希贝尼克", "特罗吉尔", "布拉扎", "维斯", "乌尔奇尼", "巴尔", "布德瓦"],
      shipyard: ["拉古萨港", "扎达尔港", "亚得里亚海南部船坞", "斯普利特港", "科托尔港", "杜布罗夫尼克港", "希贝尼克港", "特罗吉尔港"],
      fortress: ["拉古萨堡垒", "杜布罗夫尼克要塞", "科托尔卫城", "扎达尔堡", "斯普利特要塞", "希贝尼克堡", "特罗吉尔要塞", "乌尔奇尼堡"],
      oil: ["达尔马提亚油区", "亚得里亚海南部油田", "黑山油井", "杜布罗夫尼克油区", "科托尔湾油田", "阿尔巴尼亚油井"],
      barracks: ["拉古萨军营", "共和国卫戍营", "达尔马提亚轻步兵营", "杜布罗夫尼克兵营", "扎达尔卫戍营", "斯普利特兵营", "科托尔兵营", "希贝尼克兵营"]
    },
    egypt: {
      city: ["开罗", "亚历山大", "孟菲斯", "吉萨", "塞得港", "苏伊士", "达米埃塔", "罗塞塔", "阿斯旺", "卢克索", "法尤姆", "坦塔"],
      shipyard: ["亚历山大港", "塞得港", "尼罗河船坞", "苏伊士港", "达米埃塔港", "罗塞塔港", "红海船坞", "苏伊士湾港"],
      fortress: ["开罗堡垒", "亚历山大要塞", "吉萨卫城", "塞得港堡", "苏伊士要塞", "达米埃塔堡", "阿斯旺要塞", "孟菲斯堡"],
      oil: ["苏伊士油区", "尼罗河三角洲油田", "红海油井", "西奈油区", "亚历山大湾油田", "上埃及油井", "法尤姆油区"],
      barracks: ["马穆鲁克军营", "开罗卫戍营", "奴隶骑兵营", "亚历山大兵营", "吉萨兵营", "塞得港卫戍营", "苏伊士兵营", "孟菲斯兵营"]
    },
    syria: {
      city: ["大马士革", "阿勒颇", "安条克", "的黎波里", "霍姆斯", "哈马", "拉塔基亚", "塔尔图斯", "帕尔米拉", "德拉", "苏韦达", "代尔祖尔"],
      shipyard: ["的黎波里港", "安条克港", "地中海东岸船坞", "拉塔基亚港", "塔尔图斯港", "大马士革河港", "霍姆斯港", "哈马港"],
      fortress: ["大马士革堡垒", "阿勒颇要塞", "骑士堡", "安条克卫城", "的黎波里堡", "霍姆斯要塞", "哈马堡", "帕尔米拉要塞"],
      oil: ["叙利亚油区", "幼发拉底河油田", "霍姆斯油井", "代尔祖尔油区", "阿勒颇平原油田", "拉塔基亚油井", "帕尔米拉油区"],
      barracks: ["叙利亚军营", "大马士革卫戍营", "阿拉伯轻骑兵营", "阿勒颇兵营", "安条克兵营", "霍姆斯卫戍营", "哈马兵营", "的黎波里兵营"]
    },
    baghdad: {
      city: ["巴格达", "巴士拉", "库法", "摩苏尔", "纳杰夫", "卡尔巴拉", "萨迈拉", "费卢杰", "拉马迪", "提克里特", "基尔库克", "巴古拜"],
      shipyard: ["巴士拉港", "巴格达河港", "波斯湾船坞", "库法港", "摩苏尔港", "纳杰夫港", "幼发拉底河船坞", "底格里斯河船坞"],
      fortress: ["巴格达堡垒", "巴士拉要塞", "圆城卫城", "库法堡", "摩苏尔要塞", "纳杰夫堡", "萨迈拉要塞", "提克里特堡"],
      oil: ["波斯湾油田", "巴士拉油区", "美索不达米亚油井", "基尔库克油区", "摩苏尔油田", "纳杰夫油井", "萨迈拉油区"],
      barracks: ["哈里发军营", "巴格达卫戍营", "学者护卫营", "巴士拉兵营", "库法兵营", "摩苏尔卫戍营", "纳杰夫兵营", "萨迈拉兵营"]
    },
    mingCore: {
      city: ["北京", "南京", "西安", "洛阳", "开封", "杭州", "苏州", "成都", "武汉", "广州", "济南", "福州"],
      shipyard: ["泉州港", "广州港", "南京龙江船厂", "福州港", "宁波港", "杭州湾船坞", "登州港", "扬州港"],
      fortress: ["山海关", "嘉峪关", "居庸关", "雁门关", "娘子关", "潼关", "函谷关", "剑门关"],
      oil: ["大庆油田", "胜利油田", "华北油区", "辽河油田", "中原油田", "四川油井", "江汉油区"],
      barracks: ["神机营", "三千营", "五军营", "北京卫戍营", "南京兵营", "西安兵营", "洛阳兵营", "济南卫戍营"]
    },
    joseon: {
      city: ["汉城", "平壤", "开城", "釜山", "庆州", "全州", "公州", "安东", "江陵", "咸兴", "海州", "义州"],
      shipyard: ["釜山港", "仁川港", "朝鲜海峡船坞", "汉城港", "平壤港", "庆州港", "全罗港", "东海岸船坞"],
      fortress: ["汉城堡垒", "平壤要塞", "釜山卫城", "开城堡", "庆州要塞", "全州堡", "公州要塞", "义州堡"],
      oil: ["朝鲜湾油区", "平壤盆地油田", "咸镜北道油井", "全罗南道油区", "庆尚北道油田", "平安南道油井"],
      barracks: ["朝鲜军营", "汉城卫戍营", "龟船水师营", "平壤兵营", "釜山兵营", "庆州卫戍营", "全州兵营", "开城兵营"]
    },
    annam: {
      city: ["河内", "顺化", "岘港", "海防", "升龙", "清化", "义安", "广南", "平定", "富安", "庆和", "林邑"],
      shipyard: ["海防港", "岘港", "北部湾船坞", "河内港", "顺化港", "清化港", "义安港", "归仁港"],
      fortress: ["河内堡垒", "顺化要塞", "岘港卫城", "清化堡", "义安要塞", "广南堡", "平定要塞", "升龙堡"],
      oil: ["北部湾油区", "河内盆地油田", "清化油井", "义安油区", "广南油田", "平定油井", "富安油区"],
      barracks: ["安南军营", "河内卫戍营", "象兵训练营", "顺化兵营", "海防兵营", "清化兵营", "义安兵营", "岘港卫戍营"]
    }
  };

  // src/core/utils.js
  var cellKey = (x, y) => `${x},${y}`;
  var rnd = (n) => Math.floor(Math.random() * n);
  var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  var dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  var shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  function diagonalDist(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }
  function inUnitRange(range, fromCell, targetCell) {
    return range <= 1 ? diagonalDist(fromCell, targetCell) <= range : dist(fromCell, targetCell) <= range;
  }
  function siteMeta(kind) {
    return SITE_META[kind];
  }
  function siteStars(siteEntry) {
    switch (siteEntry.kind) {
      case "oilSmall":
        return 1;
      case "oilMedium":
        return 2;
      case "oilLarge":
        return 3;
      case "barracksSmall":
        return 1;
      case "barracksLarge":
        return 2;
      default:
        return siteEntry.tier;
    }
  }
  function typeMeta(type) {
    return TYPES[type];
  }
  function colorOptions() {
    return Object.entries(COLOR_PRESETS);
  }
  var isTransportType = (type) => !!TYPES[type]?.transport;
  var isTransportUnit = (unit) => !!unit?.type && !!TYPES[unit.type]?.transport;

  // src/io/storage.js
  function createLocalStorageBackend() {
    const ok = typeof localStorage !== "undefined";
    return {
      kind: "localStorage",
      // Survives page reloads, but NOT a browser cache/site-data clear.
      durable: false,
      available: ok,
      getItem(key) {
        return ok ? localStorage.getItem(key) : null;
      },
      setItem(key, value) {
        if (ok) localStorage.setItem(key, value);
      },
      removeItem(key) {
        if (ok) localStorage.removeItem(key);
      },
      keys() {
        if (!ok) return [];
        const out = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) out.push(k);
        }
        return out;
      }
    };
  }
  var saveStore = createLocalStorageBackend();

  // src/core/mapgen.js
  function grid(w, h, fill) {
    return Array.from({ length: h }, () => Array(w).fill(fill));
  }
  function inBounds(x, y, w, h) {
    return x >= 0 && y >= 0 && x < w && y < h;
  }
  function createEllipse(terrain, w, h, cx, cy, rx, ry, fillTerrain, chance = 1) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1 && Math.random() <= chance) {
          terrain[y][x] = fillTerrain;
        }
      }
    }
  }
  function paintRiver(terrain, w, h, center, phase = 0) {
    for (let y = 0; y < h; y++) {
      const riverX = Math.round(center + Math.sin(y * 0.65 + phase) * 1.6 + Math.sin(y * 0.19) * 0.8);
      terrain[y][clamp(riverX, 1, w - 2)] = "water";
      if (y % 5 === 2) {
        terrain[y][clamp(riverX, 1, w - 2)] = "road";
      }
    }
  }
  function paintRidge(terrain, w, h, center) {
    for (let x = 0; x < w; x++) {
      const ridgeY = Math.round(center + Math.sin(x * 0.52) * 1.7 + Math.sin(x * 0.18) * 1.1);
      for (let dy = -1; dy <= 1; dy++) {
        const y = clamp(ridgeY + dy, 1, h - 2);
        terrain[y][x] = "mountain";
      }
      if (x % 7 === 3) {
        terrain[clamp(ridgeY, 1, h - 2)][x] = "road";
      }
    }
  }
  function addRoadCross(terrain, w, h) {
    const midY = Math.floor(h / 2);
    const midX = Math.floor(w / 2);
    for (let x = 1; x < w - 1; x++) {
      if (terrain[midY][x] !== "water" && terrain[midY][x] !== "mountain") {
        terrain[midY][x] = "road";
      }
    }
    for (let y = 1; y < h - 1; y++) {
      if (terrain[y][midX] !== "water" && terrain[y][midX] !== "mountain") {
        terrain[y][midX] = "road";
      }
    }
  }
  function scatter(terrain, w, h, type, count, radius, allowed) {
    for (let i = 0; i < count; i++) {
      const cx = rnd(w);
      const cy = rnd(h);
      const r = 1 + rnd(radius);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (!inBounds(x, y, w, h) || !allowed.includes(terrain[y][x])) {
            continue;
          }
          if (Math.hypot(dx, dy) <= r + 0.4 && Math.random() > 0.18) {
            terrain[y][x] = type;
          }
        }
      }
    }
  }
  function terrainFor(mapId, complexityId, w, h) {
    const terrain = grid(w, h, "plain");
    const complexity = COMPLEX[complexityId];
    switch (mapId) {
      case "frontier":
        paintRiver(terrain, w, h, w * 0.48, 0);
        paintRidge(terrain, w, h, h * 0.26);
        break;
      case "twinrivers":
        paintRiver(terrain, w, h, w * 0.34, 0.25);
        paintRiver(terrain, w, h, w * 0.67, 1.15);
        break;
      case "highlands":
        paintRidge(terrain, w, h, h * 0.38);
        paintRidge(terrain, w, h, h * 0.68);
        break;
      case "plains":
        addRoadCross(terrain, w, h);
        break;
      case "heartland":
        addRoadCross(terrain, w, h);
        createEllipse(terrain, w, h, w * 0.2, h * 0.25, 4, 2, "forest", 0.94);
        createEllipse(terrain, w, h, w * 0.78, h * 0.72, 4, 3, "forest", 0.94);
        break;
      case "coast":
        for (let y = 0; y < h; y++) {
          const shore = Math.floor(w * 0.22 + Math.sin(y * 0.42) * 2);
          for (let x = 0; x <= shore; x++) {
            terrain[y][x] = "water";
          }
        }
        paintRidge(terrain, w, h, h * 0.7);
        break;
      case "islands":
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            terrain[y][x] = "water";
          }
        }
        createEllipse(terrain, w, h, w * 0.22, h * 0.48, 5, 3, "plain", 0.96);
        createEllipse(terrain, w, h, w * 0.5, h * 0.3, 4, 2, "plain", 0.95);
        createEllipse(terrain, w, h, w * 0.72, h * 0.66, 6, 3, "plain", 0.95);
        createEllipse(terrain, w, h, w * 0.45, h * 0.78, 3, 2, "plain", 0.92);
        break;
      case "innersea":
        createEllipse(terrain, w, h, w * 0.5, h * 0.52, w * 0.22, h * 0.3, "water", 0.98);
        addRoadCross(terrain, w, h);
        break;
      case "grandbay":
        createEllipse(terrain, w, h, w * 0.14, h * 0.78, w * 0.36, h * 0.42, "water", 0.98);
        createEllipse(terrain, w, h, w * 0.42, h * 0.58, 3, 2, "water", 0.9);
        break;
      case "strait":
        for (let y = 0; y < h; y++) {
          const seaX = Math.floor(w * 0.5 + Math.sin(y * 0.42) * 1.1);
          for (let dx = -2; dx <= 2; dx++) {
            if (inBounds(seaX + dx, y, w, h)) {
              terrain[y][seaX + dx] = "water";
            }
          }
        }
        createEllipse(terrain, w, h, w * 0.48, h * 0.24, 2, 1, "plain", 1);
        createEllipse(terrain, w, h, w * 0.5, h * 0.73, 2, 1, "plain", 1);
        break;
      case "archipelago":
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            terrain[y][x] = "water";
          }
        }
        createEllipse(terrain, w, h, w * 0.28, h * 0.34, 5, 3, "plain", 0.96);
        createEllipse(terrain, w, h, w * 0.62, h * 0.25, 4, 2, "plain", 0.94);
        createEllipse(terrain, w, h, w * 0.77, h * 0.62, 6, 3, "plain", 0.95);
        createEllipse(terrain, w, h, w * 0.44, h * 0.72, 5, 2, "plain", 0.93);
        createEllipse(terrain, w, h, w * 0.12, h * 0.74, 3, 2, "plain", 0.92);
        break;
      case "random":
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const roll = Math.random();
            terrain[y][x] = roll < complexity.water ? "water" : roll < complexity.water + complexity.mountain ? "mountain" : roll < complexity.water + complexity.mountain + complexity.forest ? "forest" : "plain";
          }
        }
        addRoadCross(terrain, w, h);
        break;
      default:
        break;
    }
    if (mapId !== "random") {
      scatter(terrain, w, h, "forest", Math.max(2, Math.round(w * h * complexity.forest / 24)), 2, ["plain"]);
      scatter(terrain, w, h, "mountain", Math.max(1, Math.round(w * h * complexity.mountain / 34)), 1, ["plain"]);
      if (!MAPS[mapId].sea) {
        scatter(terrain, w, h, "water", Math.max(0, Math.round(w * h * complexity.water / 70)), 1, ["plain"]);
      }
    }
    scatter(terrain, w, h, "hill", Math.max(1, Math.round(w * h * complexity.forest / 28)), 1, ["plain"]);
    scatter(terrain, w, h, "desert", Math.max(0, Math.round(w * h * complexity.water / 45)), 2, ["plain"]);
    for (let y = 0; y < Math.floor(h * 0.15); y++) {
      for (let x = 0; x < w; x++) {
        if (terrain[y][x] === "plain" && Math.random() < 0.35) terrain[y][x] = "snow";
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (terrain[y][x] !== "plain") continue;
        let nearWater = false;
        for (let dy = -1; dy <= 1 && !nearWater; dy++) {
          for (let dx = -1; dx <= 1 && !nearWater; dx++) {
            const nx = x + dx, ny = y + dy;
            if (inBounds(nx, ny, w, h) && terrain[ny][nx] === "water") nearWater = true;
          }
        }
        if (nearWater && Math.random() < 0.5) terrain[y][x] = "sand";
      }
    }
    return terrain;
  }

  // src/core/teams.js
  function teamOf(teams, owner) {
    return teams && teams[owner] || "A";
  }
  function areAllies(teams, a, b) {
    if (!a || !b) {
      return false;
    }
    if (a === b) {
      return true;
    }
    if (a === "neutral" || b === "neutral") {
      return false;
    }
    return teamOf(teams, a) === teamOf(teams, b);
  }
  function areEnemies(teams, a, b) {
    return !!a && !!b && a !== "neutral" && b !== "neutral" && !areAllies(teams, a, b);
  }

  // src/core/combat.js
  function getSite(game, x, y) {
    return game.sites.find((entry) => entry.x === x && entry.y === y) || null;
  }
  function siteBonus(game, siteEntry, unitEntry, mode) {
    if (!siteEntry || !areAllies(game.teams, siteEntry.owner, unitEntry.owner)) {
      return 0;
    }
    const domain = typeMeta(unitEntry.type).domain;
    if ((siteEntry.kind === "city" || siteEntry.kind === "camp" || siteEntry.kind === "barracksSmall" || siteEntry.kind === "barracksLarge") && domain === "land") {
      const supportTier = siteMeta(siteEntry.kind).supportTier || siteEntry.tier;
      return mode === "attack" ? supportTier : supportTier * 2;
    }
    if (siteEntry.kind === "shipyard" && domain === "sea") {
      return mode === "attack" ? siteEntry.tier : siteEntry.tier + 1;
    }
    if (siteEntry.kind === "fortress" && domain === "sea") {
      return mode === "attack" ? 1 : 3;
    }
    return 0;
  }
  function matchupBonus(attacker, defender) {
    const bonusVs = typeMeta(attacker.type).bonusVs || {};
    return bonusVs[defender.type] || 0;
  }
  function combatNation(game, owner) {
    if (owner === "player") return game.settings?.nation;
    return game.aiProfiles?.[owner]?.nation;
  }
  function computeDamage(game, attacker, defender, fromCell, toCell, isCounter, deterministic) {
    const attackMeta = typeMeta(attacker.type);
    const defenseMeta = typeMeta(defender.type);
    const attackSite = getSite(game, fromCell.x, fromCell.y);
    const defenseSite = getSite(game, toCell.x, toCell.y);
    const terrainDef = TERRAIN[game.terrain[toCell.y][toCell.x]].def;
    const attackerFaction = attacker.owner === "player" ? game.settings?.faction : game.aiProfiles?.[attacker.owner]?.faction;
    const defenderFaction = defender.owner === "player" ? game.settings?.faction : game.aiProfiles?.[defender.owner]?.faction;
    const atkNation = combatNation(game, attacker.owner);
    const defNation = combatNation(game, defender.owner);
    let factionAtkBonus = 0;
    let factionDefBonus = 0;
    if (attackerFaction === "mamluk" && attackerFaction !== defenderFaction) factionAtkBonus += 2;
    if (attackerFaction === "hre") {
      const hreCities = game.sites.filter((s) => s.kind === "city" && s.owner === attacker.owner).length;
      if (hreCities >= 3) factionAtkBonus += 1;
    }
    if (defenderFaction === "hre") {
      const hreCities = game.sites.filter((s) => s.kind === "city" && s.owner === defender.owner).length;
      if (hreCities >= 5) factionDefBonus += 1;
    }
    const scholarRange = defNation === "baghdad" || atkNation === "baghdad" ? 3 : 2;
    const atkScholar = game.units.find((u) => u.owner === attacker.owner && u.type === "caliphScholar" && Math.abs(u.x - attacker.x) <= scholarRange && Math.abs(u.y - attacker.y) <= scholarRange);
    const defScholar = game.units.find((u) => u.owner === defender.owner && u.type === "caliphScholar" && Math.abs(u.x - defender.x) <= scholarRange && Math.abs(u.y - defender.y) <= scholarRange);
    const attackBuff = siteBonus(game, attackSite, attacker, "attack") + matchupBonus(attacker, defender) + factionAtkBonus + (atkScholar ? 1 : 0);
    const defenseBuff = siteBonus(game, defenseSite, defender, "defense") + terrainDef + factionDefBonus + (defScholar ? 1 : 0);
    const attackHpFactor = 0.55 + attacker.hp / attacker.maxHp * 0.65;
    const defendHpFactor = 0.55 + defender.hp / defender.maxHp * 0.55;
    const chargeBonus = atkNation === "austria" && attackMeta.charge ? 1 : 0;
    const charge = attackMeta.charge && !isCounter && diagonalDist(fromCell, toCell) === 1 && attacker.move === attacker.maxMove && defender.type !== "pikeSquare" ? attackMeta.charge + chargeBonus : 0;
    const defenderOnSite = !!getSite(game, toCell.x, toCell.y);
    const guardBonus = defender.type === "imperialGuard" && defenderOnSite && getSite(game, toCell.x, toCell.y).owner === defender.owner ? 3 : 0;
    const elephantBonus = attacker.type === "annamElephant" && defenseMeta.domain === "land" && !defenseMeta.charge ? 5 : 0;
    let nationAtk = 0, nationDef = 0;
    if (atkNation === "veniceCore" && attackMeta.domain === "sea") nationAtk += 1;
    if (atkNation === "syria" && attackerFaction !== defenderFaction) nationAtk += 1;
    if (atkNation === "prussia" && !!getSite(game, toCell.x, toCell.y)) nationAtk += 3;
    if (defNation === "baghdad" && defender.type === "caliphScholar") nationDef += 2;
    const base = (attackMeta.atk + attackBuff + attacker.rank + elephantBonus + nationAtk) * attackHpFactor + charge;
    const shield = (defenseMeta.def + defenseBuff + guardBonus + nationDef) * defendHpFactor;
    const variance = deterministic ? 1 : rnd(3);
    return clamp(Math.round(base - shield * 0.58 + 2 + variance), 1, defender.hp);
  }
  function previewCombat(game, attacker, defender, fromCell, deterministic) {
    const attackFrom = fromCell || { x: attacker.x, y: attacker.y };
    const damage = computeDamage(game, attacker, defender, attackFrom, { x: defender.x, y: defender.y }, false, deterministic);
    const targetLeft = Math.max(0, defender.hp - damage);
    let counter = 0;
    if (targetLeft > 0 && inUnitRange(effectiveRange(game, defender), { x: defender.x, y: defender.y }, attackFrom)) {
      counter = clamp(Math.round(computeDamage(game, defender, attacker, { x: defender.x, y: defender.y }, attackFrom, true, deterministic) * 0.8), 0, attacker.hp);
    }
    return { damage, counter, kill: targetLeft <= 0, targetLeft, selfLeft: Math.max(0, attacker.hp - counter) };
  }
  function effectiveRange(game, unitEntry) {
    const base = typeMeta(unitEntry.type).range;
    if (base <= 1) return base;
    const nat = combatNation(game, unitEntry.owner);
    if (nat === "genoa" && typeMeta(unitEntry.type).domain === "sea") return base + 1;
    if (nat === "syria") return base + 1;
    return base;
  }
  function canAttack(game, attacker, defender, fromCell = { x: attacker.x, y: attacker.y }) {
    return !!attacker && !!defender && attacker.owner === game.side && !attacker.hasAttacked && areEnemies(game.teams, attacker.owner, defender.owner) && inUnitRange(effectiveRange(game, attacker), fromCell, defender);
  }

  // src/core/rng.js
  var MODULUS = 4294967296;
  var MULTIPLIER = 1664525;
  var INCREMENT = 1013904223;
  function createRng(seed) {
    let state11 = seed >>> 0;
    return function rng() {
      state11 = state11 * MULTIPLIER + INCREMENT >>> 0;
      return state11 / MODULUS;
    };
  }

  // src/core/facility.js
  var nextId = 1;
  var facilities = [];
  var facilitySystem = {
    createFacility(type, owner, x, y, opts = {}) {
      const hp = opts.hp != null ? opts.hp : 1;
      const f = {
        id: `fac_${nextId++}`,
        type,
        owner,
        x,
        y,
        hp,
        maxHp: hp,
        duration: opts.duration != null ? opts.duration : null,
        // null = 不过期
        data: opts.data || {}
      };
      facilities.push(f);
      return f;
    },
    removeFacility(id) {
      const i = facilities.findIndex((f) => f.id === id);
      if (i >= 0) facilities.splice(i, 1);
    },
    damageFacility(id, amount) {
      const f = facilities.find((f2) => f2.id === id);
      if (!f) return 0;
      f.hp -= amount;
      if (f.hp <= 0) {
        this.removeFacility(id);
        return 0;
      }
      return f.hp;
    },
    expireFacilities(owner) {
      for (let i = facilities.length - 1; i >= 0; i--) {
        const f = facilities[i];
        if (f.owner !== owner || f.duration == null) continue;
        f.duration -= 1;
        if (f.duration <= 0) facilities.splice(i, 1);
      }
    },
    getFacilityAt(x, y) {
      return facilities.find((f) => f.x === x && f.y === y) || null;
    },
    // 通用移动成本修正（阶段3 裁决③）：该格设施声明 data.moveCostMod 时叠加到地形成本。
    // core 不识别具体设施类型（如大明临时桥），只认数据字段；无修正设施返回 0。
    getMoveCostModAt(x, y) {
      const f = facilities.find((f2) => f2.x === x && f2.y === y && typeof (f2.data && f2.data.moveCostMod) === "number");
      return f ? f.data.moveCostMod : 0;
    },
    getFacilitiesByOwner(owner) {
      return facilities.filter((f) => f.owner === owner);
    },
    getFacilitiesByType(type) {
      return facilities.filter((f) => f.type === type);
    },
    getFacilitiesInRange(x, y, range) {
      return facilities.filter((f) => Math.abs(f.x - x) <= range && Math.abs(f.y - y) <= range);
    },
    getAll() {
      return [...facilities];
    },
    clear() {
      facilities.length = 0;
      nextId = 1;
    }
  };

  // src/core/movement.js
  function inBounds2(x, y, w, h) {
    return x >= 0 && y >= 0 && x < w && y < h;
  }
  function adjacent8(x, y, w, h) {
    return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy })).filter((cell) => inBounds2(cell.x, cell.y, w, h));
  }
  function getUnit(game, x, y) {
    return game.units.find((entry) => entry.x === x && entry.y === y) || null;
  }
  function ownerNation(game, owner) {
    if (owner === "player") return game.settings?.nation;
    return game.aiProfiles?.[owner]?.nation;
  }
  function movementCost(game, unitEntry, x, y) {
    if (typeMeta(unitEntry.type).domain === "sea") return 1;
    const terrain = game.terrain[y][x];
    const baseCost = TERRAIN[terrain].cost;
    if (baseCost <= 1) return 1;
    const nation = ownerNation(game, unitEntry.owner);
    if (nation === "whiteHorde" && (terrain === "desert" || terrain === "sand")) return 1;
    if (nation === "blueHorde" && terrain === "snow") return 1;
    if ((nation === "bavaria" || nation === "joseon") && terrain === "hill") return 1;
    if (nation === "annam" && terrain === "forest") return 1;
    let cost = baseCost;
    cost += facilitySystem.getMoveCostModAt(x, y);
    return Math.max(1, cost);
  }
  function passable(game, unitEntry, x, y) {
    if (!inBounds2(x, y, game.w, game.h) || getUnit(game, x, y)) {
      return false;
    }
    const domain = typeMeta(unitEntry.type).domain;
    if (domain === "sea") {
      return game.terrain[y][x] === "water";
    }
    return game.terrain[y][x] !== "water" && game.terrain[y][x] !== "mountain";
  }
  function movementNeighbors(game, unitEntry, currentCost, x, y) {
    return adjacent8(x, y, game.w, game.h);
  }
  function reachable(game, unitEntry) {
    const seen = /* @__PURE__ */ new Map([[cellKey(unitEntry.x, unitEntry.y), 0]]);
    const queue = [{ x: unitEntry.x, y: unitEntry.y, cost: 0 }];
    while (queue.length) {
      const current = queue.shift();
      for (const next of movementNeighbors(game, unitEntry, current.cost, current.x, current.y)) {
        if (!passable(game, unitEntry, next.x, next.y)) {
          continue;
        }
        const step = movementCost(game, unitEntry, next.x, next.y);
        const diagonal = next.x !== current.x && next.y !== current.y;
        const cost = current.cost + (diagonal ? step * Math.SQRT2 : step);
        const key = cellKey(next.x, next.y);
        if (cost > unitEntry.move) {
          continue;
        }
        if (!seen.has(key) || cost < seen.get(key)) {
          seen.set(key, cost);
          queue.push({ x: next.x, y: next.y, cost });
        }
      }
    }
    return seen;
  }

  // src/core/turn.js
  function teamStandings(game, deps) {
    const { teamOf: teamOf2 } = deps;
    const standings = {};
    const ensure = (team) => standings[team] = standings[team] || { cities: 0, sites: 0, units: 0 };
    for (const siteEntry of game.sites) {
      if (siteEntry.owner === "neutral") {
        continue;
      }
      const bucket = ensure(teamOf2(siteEntry.owner));
      bucket.sites += 1;
      if (siteEntry.kind === "city") {
        bucket.cities += 1;
      }
    }
    for (const unitEntry of game.units) {
      ensure(teamOf2(unitEntry.owner)).units += 1;
    }
    return standings;
  }
  function resolveStalemate(game, deps) {
    const { teamOf: teamOf2, teamName, finish } = deps;
    const standings = teamStandings(game, deps);
    const ranked = Object.entries(standings).sort((a, b) => b[1].cities - a[1].cities || b[1].sites - a[1].sites || b[1].units - a[1].units);
    if (!ranked.length) {
      finish(false, `战局在第 ${game.turn} 回合陷入僵局，双方均无立足点。`);
      return;
    }
    const [leadTeam, lead] = ranked[0];
    const playerWin = !game.settings?.spectator && teamOf2("player") === leadTeam;
    finish(playerWin, `战局在第 ${game.turn} 回合达到回合上限，判定 ${teamName(leadTeam)} 以 ${lead.cities} 城 / ${lead.sites} 据点领先胜出。`);
  }
  function landUnitCanReachForeignCity(game, deps, unitEntry) {
    const { typeMeta: typeMeta2, cellKey: cellKey2, getSite: getSite2, areAllies: areAllies2, adjacent8: adjacent82, isLandTile } = deps;
    if (typeMeta2(unitEntry.type).domain !== "land") {
      return false;
    }
    const seen = /* @__PURE__ */ new Set([cellKey2(unitEntry.x, unitEntry.y)]);
    const queue = [{ x: unitEntry.x, y: unitEntry.y }];
    while (queue.length) {
      const current = queue.shift();
      const siteEntry = getSite2(current.x, current.y);
      if (siteEntry?.kind === "city" && !areAllies2(siteEntry.owner, unitEntry.owner)) {
        return true;
      }
      for (const next of adjacent82(current.x, current.y)) {
        if (!isLandTile(next.x, next.y)) {
          continue;
        }
        const nextKey = cellKey2(next.x, next.y);
        if (seen.has(nextKey)) {
          continue;
        }
        seen.add(nextKey);
        queue.push(next);
      }
    }
    return false;
  }
  function teamCanContestLand(game, deps, team) {
    const { teamOf: teamOf2, isTransportUnit: isTransportUnit2, typeMeta: typeMeta2 } = deps;
    if (game.sites.some((siteEntry) => siteEntry.kind === "city" && siteEntry.owner !== "neutral" && teamOf2(siteEntry.owner) === team)) {
      return true;
    }
    if (game.units.some((unitEntry) => teamOf2(unitEntry.owner) === team && isTransportUnit2(unitEntry) && unitEntry.cargo?.length)) {
      return true;
    }
    const landUnits = game.units.filter((unitEntry) => teamOf2(unitEntry.owner) === team && typeMeta2(unitEntry.type).domain === "land");
    if (landUnits.some((u) => landUnitCanReachForeignCity(game, deps, u))) {
      return true;
    }
    const hasTransport = game.units.some((unitEntry) => teamOf2(unitEntry.owner) === team && isTransportUnit2(unitEntry));
    const hasShipyard = game.sites.some((siteEntry) => siteEntry.kind === "shipyard" && teamOf2(siteEntry.owner) === team);
    return !!landUnits.length && (hasTransport || hasShipyard);
  }
  function dominantCityTeam(game, deps) {
    const { teamOf: teamOf2 } = deps;
    const cityTeams = [...new Set(game.sites.filter((siteEntry) => siteEntry.kind === "city" && siteEntry.owner !== "neutral").map((siteEntry) => teamOf2(siteEntry.owner)))];
    return cityTeams.length === 1 ? cityTeams[0] : null;
  }
  function checkEnd(game, deps) {
    const { teamOf: teamOf2, areAllies: areAllies2, teamName, finish } = deps;
    if (game.over || game.freeplay) {
      return;
    }
    if (game.settings?.spectator) {
      const activeTeams2 = /* @__PURE__ */ new Set();
      for (const unitEntry of game.units) {
        activeTeams2.add(teamOf2(unitEntry.owner));
      }
      for (const siteEntry of game.sites) {
        if (siteEntry.owner !== "neutral") {
          activeTeams2.add(teamOf2(siteEntry.owner));
        }
      }
      if (game.settings.mode === "skirmish") {
        const combatTeams = new Set(game.units.map((unitEntry) => teamOf2(unitEntry.owner)));
        if (combatTeams.size === 1 && combatTeams.size > 0) {
          finish(true, `${teamName([...combatTeams][0])} 赢得了观战遭遇战。`);
        }
        return;
      }
      if (game.settings.mode === "survival" && game.turn >= 12) {
        const ranked = [...activeTeams2].sort((a, b) => game.sites.filter((siteEntry) => siteEntry.kind === "city" && teamOf2(siteEntry.owner) === b).length - game.sites.filter((siteEntry) => siteEntry.kind === "city" && teamOf2(siteEntry.owner) === a).length);
        if (ranked[0]) {
          finish(true, `${teamName(ranked[0])} 在观战守城模式中存活到第12回合。`);
        }
        return;
      }
      const hostileTeams2 = new Set(game.sites.filter((siteEntry) => (siteEntry.kind === "city" || siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && siteEntry.owner !== "neutral").map((siteEntry) => teamOf2(siteEntry.owner)));
      if (hostileTeams2.size === 1) {
        const winnerTeam = [...hostileTeams2][0];
        const enemyEngineers = game.units.some((unitEntry) => unitEntry.type === "engineer" && teamOf2(unitEntry.owner) !== winnerTeam || unitEntry.cargo?.some((payload) => payload.type === "engineer" && teamOf2(payload.owner) !== winnerTeam));
        if (!enemyEngineers) {
          finish(true, `${teamName(winnerTeam)} 完成了全部敌对城市与海上据点占领，并清除了敌方工程师。`);
          return;
        }
      }
      if (activeTeams2.size === 1 && activeTeams2.size > 0) {
        finish(true, `${teamName([...activeTeams2][0])} 成为战场最后赢家。`);
      }
      return;
    }
    const playerTeam = teamOf2("player");
    const activeTeams = /* @__PURE__ */ new Set();
    for (const unitEntry of game.units) {
      activeTeams.add(teamOf2(unitEntry.owner));
    }
    for (const siteEntry of game.sites) {
      if (siteEntry.owner !== "neutral") {
        activeTeams.add(teamOf2(siteEntry.owner));
      }
    }
    const playerAlive = [...activeTeams].includes(playerTeam);
    if (game.settings.mode === "survival") {
      const alliedCity = game.sites.some((siteEntry) => siteEntry.kind === "city" && areAllies2(siteEntry.owner, "player"));
      if (!alliedCity && !game.units.some((unitEntry) => areAllies2(unitEntry.owner, "player"))) {
        finish(false, "你的组已经失去全部立足点。");
        return;
      }
      if (game.turn >= 12 && alliedCity) {
        finish(true, "你成功守住了关键城市直到第12回合。");
      }
      return;
    }
    if (game.settings.mode === "skirmish") {
      const combatTeams = new Set(game.units.map((unitEntry) => teamOf2(unitEntry.owner)));
      if (!combatTeams.has(playerTeam)) {
        finish(false, "你的组全部野战部队已被消灭。");
        return;
      }
      if (combatTeams.size === 1 && combatTeams.has(playerTeam)) {
        finish(true, "敌对组野战部队已全部被消灭。");
      }
      return;
    }
    const enemyControlledCities = game.sites.filter((siteEntry) => siteEntry.kind === "city" && siteEntry.owner !== "neutral" && teamOf2(siteEntry.owner) !== playerTeam);
    const enemyControlledSeaSites = game.sites.filter((siteEntry) => (siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && siteEntry.owner !== "neutral" && teamOf2(siteEntry.owner) !== playerTeam);
    if (!enemyControlledCities.length && !enemyControlledSeaSites.length) {
      const enemyEngineers = game.units.some((unitEntry) => unitEntry.type === "engineer" && teamOf2(unitEntry.owner) !== playerTeam || unitEntry.cargo?.some((payload) => payload.type === "engineer" && teamOf2(payload.owner) !== playerTeam));
      if (!enemyEngineers) {
        finish(true, "你已占领全部敌对城市与海上据点，并清除了全部敌方工程师。");
        return;
      }
    }
    const hostileTeams = new Set(game.sites.filter((siteEntry) => (siteEntry.kind === "city" || siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && siteEntry.owner !== "neutral").map((siteEntry) => teamOf2(siteEntry.owner)));
    if (hostileTeams.size === 1 && !hostileTeams.has(playerTeam)) {
      const winnerTeam = [...hostileTeams][0];
      const enemyEngineers = game.units.some((unitEntry) => unitEntry.type === "engineer" && teamOf2(unitEntry.owner) !== winnerTeam || unitEntry.cargo?.some((payload) => payload.type === "engineer" && teamOf2(payload.owner) !== winnerTeam));
      if (!enemyEngineers) {
        finish(false, "敌方已占领全部城市与海上据点，并清除了你方全部工程师。");
        return;
      }
    }
    if (!playerAlive) {
      finish(false, "你的组已经失去全部据点与部队。");
      return;
    }
    if (activeTeams.size === 1 && activeTeams.has(playerTeam)) {
      finish(true, "战场上只剩下你的组仍具战争能力。");
    }
  }

  // src/core/events.js
  var handlers = /* @__PURE__ */ new Map();
  var eventBus = {
    on(eventName, handler) {
      if (!handlers.has(eventName)) handlers.set(eventName, /* @__PURE__ */ new Set());
      handlers.get(eventName).add(handler);
      return () => this.off(eventName, handler);
    },
    off(eventName, handler) {
      handlers.get(eventName)?.delete(handler);
    },
    emit(eventName, payload) {
      const set = handlers.get(eventName);
      if (!set || set.size === 0) return;
      for (const handler of set) {
        try {
          handler(payload);
        } catch (e) {
          console.error(`[eventBus] ${eventName} handler error:`, e);
        }
      }
    },
    listenerCount(eventName) {
      return handlers.get(eventName)?.size || 0;
    }
  };

  // src/core/status.js
  var statuses = /* @__PURE__ */ new Map();
  var statusSystem = {
    addStatus(unitId, key, turns, data = null) {
      if (!statuses.has(unitId)) statuses.set(unitId, /* @__PURE__ */ new Map());
      const existing = statuses.get(unitId).get(key);
      if (existing) {
        existing.turns = Math.max(existing.turns, turns);
        if (data != null) existing.data = data;
      } else {
        statuses.get(unitId).set(key, { turns, data });
      }
    },
    removeStatus(unitId, key) {
      statuses.get(unitId)?.delete(key);
    },
    hasStatus(unitId, key) {
      return !!statuses.get(unitId)?.has(key);
    },
    getStatus(unitId, key) {
      const s = statuses.get(unitId)?.get(key);
      return s ? { key, turns: s.turns, data: s.data } : null;
    },
    getAllStatuses(unitId) {
      const map = statuses.get(unitId);
      if (!map) return [];
      return [...map.entries()].map(([key, s]) => ({ key, turns: s.turns, data: s.data }));
    },
    tickStatuses(aliveUnitIds) {
      for (const [unitId, map] of statuses) {
        if (!aliveUnitIds.includes(unitId)) {
          statuses.delete(unitId);
          continue;
        }
        for (const [key, s] of map) {
          s.turns -= 1;
          if (s.turns <= 0) map.delete(key);
        }
        if (map.size === 0) statuses.delete(unitId);
      }
    },
    clear() {
      statuses.clear();
    }
  };

  // src/core/decision.js
  var pending = /* @__PURE__ */ new Map();
  var nextDecisionId = 1;
  function hasUI() {
    return typeof document !== "undefined" && typeof window !== "undefined";
  }
  var decisionSystem = {
    requestDecision(decisionId, context) {
      const id = decisionId || `dec_${nextDecisionId++}`;
      const record = { id, context, resolved: false, choiceId: null };
      pending.set(id, record);
      if (!hasUI()) {
        const choice = context.options && context.options[0];
        const choiceId = choice ? choice.id : null;
        console.log(`[decision:auto-resolve] ${id} → ${choiceId} (test fallback, not a game rule)`);
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
      if (typeof record.context.onResolve === "function") {
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
      if (typeof record.context.onCancel === "function") {
        try {
          record.context.onCancel();
        } catch (e) {
          console.error(`[decision] onCancel error (${decisionId}):`, e);
        }
      }
      return true;
    },
    getPendingDecisions(owner) {
      return [...pending.values()].filter((r) => r.context.owner === owner && !r.resolved);
    },
    getDecision(decisionId) {
      return pending.get(decisionId) || null;
    },
    clear() {
      pending.clear();
    }
  };

  // src/factions/factionContext.js
  function createFactionContext(deps) {
    return {
      // —— 只读查询 ——
      get game() {
        return deps.gameRef();
      },
      getUnit: deps.getUnit,
      getSite: deps.getSite,
      getFacilityAt: (x, y) => facilitySystem.getFacilityAt(x, y),
      typeMeta: deps.typeMeta,
      terrainMeta: deps.terrainMeta,
      ownerFaction: deps.ownerFaction,
      ownerNation: deps.ownerNation,
      hasStatus: (unitId, key) => statusSystem.hasStatus(unitId, key),
      // —— 设施维护/查询（v1.1 补全：联盟系统不得直接 import facility.js） ——
      createFacility: (type, owner, x, y, opts) => facilitySystem.createFacility(type, owner, x, y, opts),
      removeFacility: (id) => facilitySystem.removeFacility(id),
      damageFacility: (id, amount) => facilitySystem.damageFacility(id, amount),
      expireFacilities: (owner) => facilitySystem.expireFacilities(owner),
      getFacilitiesByOwner: (owner) => facilitySystem.getFacilitiesByOwner(owner),
      getFacilitiesByType: (type) => facilitySystem.getFacilitiesByType(type),
      getFacilitiesInRange: (x, y, range) => facilitySystem.getFacilitiesInRange(x, y, range),
      getAllFacilities: () => facilitySystem.getAll(),
      // —— 决策查询（v1.1 补全：debug/UI 用，不在 UI 层直接 import decision.js） ——
      getPendingDecisions: (owner) => decisionSystem.getPendingDecisions(owner),
      // —— 纯函数转发（v1.1：联盟系统无需 import core 纯函数） ——
      diagonalDist: (a, b) => diagonalDist(a, b),
      movementCost: (game, unitEntry, x, y) => movementCost(game, unitEntry, x, y),
      areAllies: (teams, a, b) => areAllies(teams, a, b),
      // —— 单位创建（v1.2：GH-02，委托 main.js 闭包 unit() 工厂；不做金币/上限/位置校验，业务由调用方自查） ——
      createUnit: (type, owner, x, y) => deps.createUnit(type, owner, x, y),
      // —— 安全动作（不改变战斗流程） ——
      log: deps.log,
      addGold: deps.addGold,
      spendGold: deps.spendGold,
      addStatus: (unitId, key, turns, data) => statusSystem.addStatus(unitId, key, turns, data),
      removeStatus: (unitId, key) => statusSystem.removeStatus(unitId, key),
      // —— 主动决策 ——
      requestDecision: (decisionId, context) => decisionSystem.requestDecision(decisionId, context),
      resolveDecision: (decisionId, choiceId) => decisionSystem.resolveDecision(decisionId, choiceId),
      // —— 事件总线（联盟系统可自行订阅额外事件） ——
      events: eventBus
    };
  }

  // src/factions/factionRegistry.js
  var systems = /* @__PURE__ */ new Map();
  var HOOK_TO_EVENT = {
    onTurnStart: "turnStart",
    onTurnEnd: "turnEnd",
    onBeforeMove: "beforeMove",
    onAfterMove: "afterMove",
    onBeforeAttack: "beforeAttack",
    onAfterAttack: "afterAttack",
    onUnitCreated: "unitCreated",
    onUnitKilled: "unitKilled",
    onSiteCaptured: "siteCaptured",
    onIncomeCalculated: "incomeCalculated",
    onProductionCompleted: "productionCompleted"
  };
  var REGISTER_ORDER = ["hre", "goldenHorde", "venice", "mamluk", "ming"];
  var factionRegistry = {
    register(factionId, system, ctx) {
      if (!REGISTER_ORDER.includes(factionId)) {
        console.error(`[factionRegistry] unknown factionId: ${factionId}`);
        return;
      }
      system.id = factionId;
      systems.set(factionId, system);
      if (typeof system.init === "function") {
        try {
          system.init(ctx);
        } catch (e) {
          console.error(`[factionRegistry] ${factionId}.init error:`, e);
        }
      }
      for (const [hook, event] of Object.entries(HOOK_TO_EVENT)) {
        if (typeof system[hook] === "function") {
          eventBus.on(event, (payload) => {
            try {
              system[hook](ctx, payload);
            } catch (e) {
              console.error(`[factionRegistry] ${factionId}.${hook} error:`, e);
            }
          });
        }
      }
    },
    unregister(factionId) {
      systems.delete(factionId);
    },
    get(factionId) {
      return systems.get(factionId) || null;
    },
    getAll() {
      return new Map(systems);
    },
    getRegisteredOrder() {
      return REGISTER_ORDER.filter((id) => systems.has(id));
    },
    isRegistered(factionId) {
      return systems.has(factionId);
    },
    clear() {
      systems.clear();
    }
  };

  // src/factions/hre/fortification.js
  var FORTIFICATIONS = {
    palisade: {
      id: "palisade",
      label: "木栅",
      cost: 12,
      duration: 5,
      hp: 8,
      desc: "敌军进入+1移动消耗；神罗步兵驻守防御+2；可被攻击摧毁"
    },
    trench: {
      id: "trench",
      label: "壕沟",
      cost: 18,
      duration: 8,
      hp: 12,
      desc: "敌方骑兵冲锋-2（最低0）；敌方第一轮攻击伤害-2"
    },
    stoneFort: {
      id: "stoneFort",
      label: "石堡",
      cost: 36,
      duration: null,
      hp: 30,
      desc: "驻守单位防御+4；相邻远程单位防御+2；相邻单位每回合回血+1；仅限城市/军营/堡垒2格内"
    }
  };
  var FORT_SUPPORT_KINDS = /* @__PURE__ */ new Set(["city", "camp", "barracksSmall", "barracksLarge", "fortress"]);
  var FRONTLINE_MIN_CHAIN = 3;
  var FRONTLINE_HP_MULT = 1.2;
  var FRONTLINE_HEAL = 1;
  var STONE_FORT_RANGE = 2;
  var STONE_FORT_HEAL = 1;
  var FACILITY_CHIP_RATIO = 0.5;
  var state = {
    lastGameRef: null,
    // 用于检测 newGame 换局，自动清空模块状态
    baseMaxHp: /* @__PURE__ */ new Map(),
    // facilityId -> 初始 maxHp（阵线耐久加成基准）
    trenchFirstHit: /* @__PURE__ */ new Set(),
    // unitId：本回合壕沟"第一轮攻击-2"已生效
    pikeGuardUsed: /* @__PURE__ */ new Set()
    // unitId：本回合长矛方阵"方阵-2"已生效
  };
  function resetState() {
    state.baseMaxHp.clear();
    state.trenchFirstHit.clear();
    state.pikeGuardUsed.clear();
  }
  function syncGameRef(ctx) {
    if (ctx && ctx.game !== state.lastGameRef) {
      resetState();
      state.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests() {
    resetState();
    state.lastGameRef = null;
  }
  function isHreOwner(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "hre";
  }
  function isBuilderUnit(ctx, unit) {
    if (!unit || !isHreOwner(ctx, unit.owner)) return false;
    const meta = ctx.typeMeta(unit.type);
    if (!meta) return false;
    if (meta.domain !== "land") return false;
    if (meta.charge) return false;
    return true;
  }
  function isLandCell(ctx, x, y) {
    const g = ctx.game;
    if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
    const t = g.terrain[y] && g.terrain[y][x];
    return !!t && t !== "water" && t !== "mountain";
  }
  function nearSupportSite(ctx, unit) {
    for (const s of ctx.game.sites) {
      if (!FORT_SUPPORT_KINDS.has(s.kind)) continue;
      if (!ctx.areAllies(ctx.game.teams, s.owner, unit.owner)) continue;
      if (ctx.diagonalDist(s, unit) <= STONE_FORT_RANGE) return true;
    }
    return false;
  }
  function canBuildAt(ctx, unit, type) {
    const def = FORTIFICATIONS[type];
    if (!def) return false;
    if (!isBuilderUnit(ctx, unit)) return false;
    if (!isLandCell(ctx, unit.x, unit.y)) return false;
    if (ctx.getSite(unit.x, unit.y)) return false;
    if (ctx.getFacilityAt(unit.x, unit.y)) return false;
    if ((ctx.game.goldByOwner[unit.owner] || 0) < def.cost) return false;
    if (type === "stoneFort" && !nearSupportSite(ctx, unit)) return false;
    return true;
  }
  function buildOptionsFor(ctx, unit) {
    const options = [{ id: "none", label: "不建", description: "保留金币与本回合行动，不建造工事。" }];
    if (!isBuilderUnit(ctx, unit)) return options;
    const gold = ctx.game.goldByOwner[unit.owner] || 0;
    if (gold >= FORTIFICATIONS.palisade.cost) {
      const d = FORTIFICATIONS.palisade;
      options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，持续${d.duration}回合）` });
    }
    if (gold >= FORTIFICATIONS.trench.cost) {
      const d = FORTIFICATIONS.trench;
      options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，持续${d.duration}回合）` });
    }
    if (gold >= FORTIFICATIONS.stoneFort.cost && nearSupportSite(ctx, unit)) {
      const d = FORTIFICATIONS.stoneFort;
      options.push({ id: d.id, label: `建${d.label}`, description: `${d.desc}（${d.cost}金币，永久）` });
    }
    return options;
  }
  function requestBuildDecision(ctx, unit) {
    if (!unit || !isBuilderUnit(ctx, unit)) return null;
    if (!isLandCell(ctx, unit.x, unit.y)) return null;
    if (ctx.getSite(unit.x, unit.y)) return null;
    if (ctx.getFacilityAt(unit.x, unit.y)) return null;
    if ((ctx.game.goldByOwner[unit.owner] || 0) < FORTIFICATIONS.palisade.cost) return null;
    const options = buildOptionsFor(ctx, unit);
    if (options.length <= 1) return null;
    const owner = unit.owner;
    const unitId = unit.id;
    const decisionId = `hreFort_${unitId}`;
    return ctx.requestDecision(decisionId, {
      owner,
      unitId,
      title: "帝国工事",
      description: `${ctx.typeMeta(unit.type).name}可在此格建造工事（消耗本回合行动并花费金币）。`,
      options,
      onResolve: (choiceId) => {
        resolveBuild(ctx, owner, unitId, choiceId);
      }
    });
  }
  function resolveBuild(ctx, owner, unitId, choiceId) {
    const unit = ctx.game.units.find((u) => u.id === unitId);
    if (!unit || unit.owner !== owner) return false;
    if (!choiceId || choiceId === "none") return false;
    const def = FORTIFICATIONS[choiceId];
    if (!def) return false;
    if (!canBuildAt(ctx, unit, choiceId)) {
      ctx.log(`${ctx.typeMeta(unit.type).name}无法在此格建造${def.label}（条件不再满足）。`, "warning");
      return false;
    }
    if (!ctx.spendGold(owner, def.cost)) return false;
    const fac = ctx.createFacility(choiceId, owner, unit.x, unit.y, { hp: def.hp, duration: def.duration });
    state.baseMaxHp.set(fac.id, def.hp);
    unit.acted = true;
    unit.move = 0;
    unit.hasAttacked = true;
    ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）建立了${def.label}，帝国防线扩展。`, "system");
    return true;
  }
  function computeFrontline(ctx, owner) {
    const facilities2 = ctx.getFacilitiesByOwner(owner).filter((f) => isHreOwner(ctx, f.owner));
    const sites = ctx.game.sites.filter((s) => isHreOwner(ctx, s.owner));
    const nodes = [
      ...facilities2.map((f) => ({ kind: "fac", ref: f, key: `f:${f.id}` })),
      ...sites.map((s) => ({ kind: "site", ref: s, key: `s:${s.id}` }))
    ];
    const byKey = new Map(nodes.map((n) => [n.key, n]));
    const adj = new Map(nodes.map((n) => [n.key, []]));
    const at = (x, y) => {
      for (const n of nodes) if (n.ref.x === x && n.ref.y === y) return n.key;
      return null;
    };
    for (const n of nodes) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = at(n.ref.x + dx, n.ref.y + dy);
        if (k) adj.get(n.key).push(k);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    const components = [];
    for (const n of nodes) {
      if (seen.has(n.key)) continue;
      const comp = [];
      const queue = [n.key];
      seen.add(n.key);
      while (queue.length) {
        const k = queue.shift();
        comp.push(k);
        for (const nk of adj.get(k)) {
          if (!seen.has(nk)) {
            seen.add(nk);
            queue.push(nk);
          }
        }
      }
      components.push(comp);
    }
    const frontlined = /* @__PURE__ */ new Set();
    for (const comp of components) {
      if (comp.length < FRONTLINE_MIN_CHAIN) continue;
      for (const k of comp) {
        const node = byKey.get(k);
        if (node.kind === "fac") frontlined.add(node.ref.id);
      }
    }
    return { frontlined, facilities: facilities2, sites };
  }
  function applyFrontline(ctx, owner, initial) {
    const { frontlined, facilities: facilities2 } = computeFrontline(ctx, owner);
    const onFrontline = /* @__PURE__ */ new Set();
    for (const f of facilities2) {
      const wasFront = !!f.data.frontlined;
      const isFront = frontlined.has(f.id);
      f.data.frontlined = isFront;
      const base = state.baseMaxHp.get(f.id) ?? f.data.baseMaxHp ?? f.maxHp;
      state.baseMaxHp.set(f.id, base);
      f.data.baseMaxHp = base;
      if (isFront) {
        const bonusMax = Math.round(base * FRONTLINE_HP_MULT);
        f.maxHp = bonusMax;
        f.hp = Math.min(f.hp, bonusMax);
        if (!wasFront) ctx.log("阵线稳定：防线上的工事耐久提升。", "system");
        const u = ctx.getUnit(f.x, f.y);
        if (u && isHreOwner(ctx, u.owner)) onFrontline.add(u.id);
      } else {
        f.maxHp = base;
        f.hp = Math.min(f.hp, base);
        if (wasFront) ctx.log("阵线失稳：该段工事失去阵线加固。", "warning");
      }
    }
    for (const unit of ctx.game.units) {
      if (!isHreOwner(ctx, unit.owner)) continue;
      if (onFrontline.has(unit.id)) {
        ctx.addStatus(unit.id, "frontline", 1, { owner });
        if (!initial && unit.hp < unit.maxHp) {
          unit.hp = Math.min(unit.maxHp, unit.hp + FRONTLINE_HEAL);
        }
      } else {
        ctx.removeStatus(unit.id, "frontline");
      }
    }
    if (!initial) {
      for (const f of facilities2) {
        if (f.type !== "stoneFort") continue;
        for (const unit of ctx.game.units) {
          if (!isHreOwner(ctx, unit.owner)) continue;
          if (ctx.diagonalDist(unit, f) <= 1 && unit.hp < unit.maxHp) {
            unit.hp = Math.min(unit.maxHp, unit.hp + STONE_FORT_HEAL);
          }
        }
      }
    }
    return { frontlinedCount: frontlined.size, facilityCount: facilities2.length };
  }
  function onTurnStart(ctx, payload) {
    const owner = payload && payload.owner;
    const initial = !!(payload && payload.initial);
    syncGameRef(ctx);
    if (!isHreOwner(ctx, owner)) return;
    const beforeIds = new Set(ctx.getFacilitiesByOwner(owner).map((f) => f.id));
    ctx.expireFacilities(owner);
    for (const id of beforeIds) {
      if (!ctx.getFacilitiesByOwner(owner).some((f) => f.id === id)) {
        state.baseMaxHp.delete(id);
      }
    }
    applyFrontline(ctx, owner, initial);
    state.trenchFirstHit.clear();
    state.pikeGuardUsed.clear();
    if (owner === "player") {
      for (const unit of ctx.game.units) {
        if (unit.owner !== owner) continue;
        requestBuildDecision(ctx, unit);
      }
    }
  }
  function onBeforeMove(ctx, payload) {
    const { unit, from, to } = payload || {};
    if (!unit || !to || !from) return;
    if (isHreOwner(ctx, unit.owner)) return;
    if (unit.move <= 0) return;
    const fac = ctx.getFacilityAt(to.x, to.y);
    if (!fac || fac.type !== "palisade" || !isHreOwner(ctx, fac.owner)) return;
    if (ctx.areAllies(ctx.game.teams, unit.owner, fac.owner)) return;
    const step = ctx.movementCost(ctx.game, unit, to.x, to.y);
    const stepCost = to.x !== from.x && to.y !== from.y ? step * Math.SQRT2 : step;
    if (unit.move < stepCost + 1) {
      payload.cancel = true;
      return;
    }
    unit.move -= 1;
  }
  function reduceDamage(damage, n) {
    return Math.max(1, damage - n);
  }
  function isCharging(ctx, attacker, fromCell, toCell, isCounter, defender) {
    if (isCounter) return false;
    if (!attacker || attacker.move !== attacker.maxMove) return false;
    const meta = ctx.typeMeta(attacker.type);
    if (!meta || !meta.charge) return false;
    if (defender && defender.type === "pikeSquare") return false;
    const from = fromCell || { x: attacker.x, y: attacker.y };
    const to = toCell || { x: attacker.x, y: attacker.y };
    return ctx.diagonalDist(from, to) === 1;
  }
  function hasAdjacentFriendlyInfantry(ctx, defender) {
    for (const u of ctx.game.units) {
      if (u.id === defender.id) continue;
      if (u.owner !== defender.owner) continue;
      if (ctx.diagonalDist(u, defender) !== 1) continue;
      const meta = ctx.typeMeta(u.type);
      if (!meta || meta.domain !== "land" || meta.charge) continue;
      return true;
    }
    return false;
  }
  function royalGuardNear(ctx, defender) {
    for (const u of ctx.game.units) {
      if (u.type !== "imperialGuard") continue;
      if (!isHreOwner(ctx, u.owner)) continue;
      if (ctx.diagonalDist(u, defender) > 1) continue;
      const site = ctx.getSite(u.x, u.y);
      if (!site) continue;
      if (!ctx.areAllies(ctx.game.teams, site.owner, u.owner)) continue;
      return true;
    }
    return false;
  }
  function onBeforeAttack(ctx, payload) {
    const { attacker, defender, fromCell, toCell, result, isCounter } = payload || {};
    if (!attacker || !defender || !result || !result.damage) return;
    const defenderIsHre = isHreOwner(ctx, defender.owner);
    const attackerIsHre = isHreOwner(ctx, attacker.owner);
    if (!defenderIsHre && !(attackerIsHre && attacker.type === "siegeTower")) return;
    if (attackerIsHre && attacker.type === "siegeTower" && ctx.getSite(defender.x, defender.y)) {
      result.damage += 2;
    }
    if (!defenderIsHre) return;
    const fac = ctx.getFacilityAt(defender.x, defender.y);
    const defOnFort = !!fac && isHreOwner(ctx, fac.owner);
    const atkMeta = ctx.typeMeta(attacker.type);
    const defMeta = ctx.typeMeta(defender.type);
    const isCavalry = !!atkMeta && !!atkMeta.charge;
    if (defOnFort) {
      if (fac.type === "palisade") {
        if (isBuilderUnit(ctx, defender)) result.damage = reduceDamage(result.damage, 2);
      } else if (fac.type === "trench") {
        if (!state.trenchFirstHit.has(defender.id)) {
          result.damage = reduceDamage(result.damage, 2);
          state.trenchFirstHit.add(defender.id);
        }
        if (isCavalry && isCharging(ctx, attacker, fromCell, toCell, isCounter, defender)) {
          const chargeVal = (atkMeta.charge || 0) + (ctx.ownerNation(attacker.owner) === "austria" ? 1 : 0);
          result.damage = reduceDamage(result.damage, Math.min(chargeVal, 2));
        }
      } else if (fac.type === "stoneFort") {
        result.damage = reduceDamage(result.damage, 4);
      }
    }
    if (!(defOnFort && fac.type === "stoneFort")) {
      const stoneNearby = ctx.getFacilitiesInRange(defender.x, defender.y, 1).filter((f) => f.type === "stoneFort" && isHreOwner(ctx, f.owner) && !(f.x === defender.x && f.y === defender.y));
      if (stoneNearby.length && defMeta && defMeta.range > 1) {
        result.damage = reduceDamage(result.damage, 2);
      }
    }
    if (defender.type === "heavyInfantry" && defOnFort) {
      result.damage = reduceDamage(result.damage, 2);
      if (isCavalry) result.damage = reduceDamage(result.damage, 1);
    }
    if (defender.type === "pikeSquare" && !state.pikeGuardUsed.has(defender.id)) {
      if (atkMeta && atkMeta.range <= 1 && hasAdjacentFriendlyInfantry(ctx, defender)) {
        result.damage = reduceDamage(result.damage, 2);
        state.pikeGuardUsed.add(defender.id);
      }
    }
    if (royalGuardNear(ctx, defender)) {
      result.damage = reduceDamage(result.damage, 1);
    }
  }
  function onAfterAttack(ctx, payload) {
    const { attacker, defender, result } = payload || {};
    if (!attacker || !defender || !result) return;
    if (isHreOwner(ctx, attacker.owner)) return;
    const fac = ctx.getFacilityAt(defender.x, defender.y);
    if (!fac || !isHreOwner(ctx, fac.owner)) return;
    if (ctx.areAllies(ctx.game.teams, attacker.owner, fac.owner)) return;
    const chip = Math.max(1, Math.round((result.damage || 0) * FACILITY_CHIP_RATIO));
    const remaining = ctx.damageFacility(fac.id, chip);
    const label = FORTIFICATIONS[fac.type]?.label || fac.type;
    if (remaining <= 0) {
      state.baseMaxHp.delete(fac.id);
      ctx.log(`${label}在战火中被摧毁。`, "warning");
    } else {
      ctx.log(`${label}受到攻击受损（耐久 ${remaining}/${fac.maxHp}）。`, "warning");
    }
  }
  function attachDebug(ctx) {
    const debug = {
      fortifications: () => ({ ...FORTIFICATIONS }),
      facilities: () => ctx.getAllFacilities().map((f) => ({ id: f.id, type: f.type, owner: f.owner, x: f.x, y: f.y, hp: f.hp, maxHp: f.maxHp, duration: f.duration, frontlined: !!f.data.frontlined })),
      state: () => ({
        baseMaxHp: [...state.baseMaxHp.entries()],
        trenchFirstHit: [...state.trenchFirstHit],
        pikeGuardUsed: [...state.pikeGuardUsed]
      }),
      // 查看某 owner 当前可建造的单位及其可选方案
      eligible: (owner) => ctx.game.units.filter((u) => u.owner === owner && isBuilderUnit(ctx, u)).map((u) => ({ id: u.id, type: u.type, x: u.x, y: u.y, options: buildOptionsFor(ctx, u).map((o) => o.id) })),
      // 为某 owner 所有可建造单位发起建造决策（返回请求数）
      requestForOwner: (owner) => {
        let n = 0;
        for (const u of ctx.game.units) {
          if (u.owner === owner && requestBuildDecision(ctx, u)) n += 1;
        }
        return n;
      },
      // 查看未决建造决策并手动解析（浏览器 UI 阶段前的手动测试入口）
      pending: () => ctx.getPendingDecisions("player").filter((r) => String(r.id || "").startsWith("hreFort_")).map((r) => ({ id: r.id, unitId: r.context.unitId, options: r.context.options.map((o) => o.id) })),
      resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId)
    };
    if (typeof globalThis !== "undefined") globalThis.__hreDebug = debug;
    return debug;
  }

  // src/factions/hre/nationMechanics.js
  var HRE_NATION = {
    prussiaFormationMove: 1,
    // 军阵协同：首次移动消耗 -1（预支移动力）
    bavariaHillDefense: 1
    // 山地防线：丘陵受击伤害 -1
  };
  var state2 = {
    lastGameRef: null,
    prussiaFormationUsed: /* @__PURE__ */ new Set()
    // unitId：本回合已享受军阵协同（每回合重置）
  };
  function resetState2() {
    state2.prussiaFormationUsed.clear();
  }
  function syncGameRef2(ctx) {
    if (ctx && ctx.game !== state2.lastGameRef) {
      resetState2();
      state2.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests2() {
    resetState2();
    state2.lastGameRef = null;
  }
  function hasFriendlyAdjacent(ctx, unit) {
    for (const other of ctx.game.units) {
      if (other === unit) continue;
      if (!ctx.areAllies(ctx.game.teams, unit.owner, other.owner)) continue;
      if (Math.abs(other.x - unit.x) <= 1 && Math.abs(other.y - unit.y) <= 1) return true;
    }
    return false;
  }
  function onTurnStart2(ctx, payload) {
    syncGameRef2(ctx);
    state2.prussiaFormationUsed.clear();
  }
  function onBeforeMove2(ctx, payload) {
    const { unit } = payload || {};
    if (!unit) return;
    syncGameRef2(ctx);
    if (ctx.ownerNation(unit.owner) !== "prussia") return;
    if (unit.move <= 0) return;
    if (state2.prussiaFormationUsed.has(unit.id)) return;
    if (!hasFriendlyAdjacent(ctx, unit)) return;
    state2.prussiaFormationUsed.add(unit.id);
    unit.move = unit.move + HRE_NATION.prussiaFormationMove;
    ctx.log(`${ctx.typeMeta(unit.type).name}与友军列阵协同推进，本次移动消耗 -1。`, "system");
  }
  function onBeforeAttack2(ctx, payload) {
    const { defender, result } = payload || {};
    if (!defender || !result || !result.damage) return;
    syncGameRef2(ctx);
    if (ctx.ownerNation(defender.owner) !== "bavaria") return;
    const g = ctx.game;
    if (!g.terrain || !g.terrain[defender.y]) return;
    if (g.terrain[defender.y][defender.x] !== "hill") return;
    result.damage = Math.max(1, result.damage - HRE_NATION.bavariaHillDefense);
    ctx.log(`${ctx.typeMeta(defender.type).name}依托山地防线固守，受击伤害 -1。`, "battle");
  }
  function attachDebug2(ctx) {
    const debug = {
      config: () => ({ ...HRE_NATION }),
      state: () => ({ prussiaFormationUsed: [...state2.prussiaFormationUsed] })
    };
    if (typeof globalThis !== "undefined") globalThis.__hreDebug = { ...globalThis.__hreDebug || {}, nations: debug };
    return debug;
  }

  // src/factions/hre/hreRules.js
  var hreSystem = {
    id: "hre",
    // 注册时调用一次：挂载 debug/test 入口（globalThis.__hreDebug，浏览器控制台可用）
    init(ctx) {
      attachDebug(ctx);
      attachDebug2(ctx);
    },
    // turnStart：工事过期、阵线检测/耐久/回血/状态、每回合追踪重置、人类玩家建造决策
    onTurnStart(ctx, payload) {
      onTurnStart(ctx, payload);
      onTurnStart2(ctx, payload);
    },
    // beforeMove：木栅移动税 + 普鲁士军阵协同（需主对话在 moveUnit 内补 emit 'beforeMove'，见交付报告已知问题）
    onBeforeMove(ctx, payload) {
      onBeforeMove(ctx, payload);
      onBeforeMove2(ctx, payload);
    },
    // beforeAttack：三种工事效果 + 4 个兵种联动 + 巴伐利亚山地防线（只改 result.damage）
    onBeforeAttack(ctx, payload) {
      onBeforeAttack(ctx, payload);
      onBeforeAttack2(ctx, payload);
    },
    // afterAttack：工事可被攻击摧毁（按伤害比例受损）
    onAfterAttack(ctx, payload) {
      onAfterAttack(ctx, payload);
    },
    // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
    reset() {
      resetForTests();
      resetForTests2();
    }
  };

  // src/factions/goldenHorde/raiding.js
  var RAIDED_KEY = "raided";
  var RAIDED_TURNS = 3;
  var RAID_LOOT = {
    normal: 3,
    // 普通单位击杀
    elite: 5,
    // 高等级单位（level>=3）击杀
    trade: 6,
    // 商队/运输单位击杀
    siteBonus: 4,
    // 袭击据点：击杀站在敌方据点格上的单位
    raidedMult: 2
    // 带 raided 标记的单位被击杀 → 战利品翻倍
  };
  var RAID_POWER_MOVE_MIN = 5;
  var RAID_POWER_LEVEL_MIN = 3;
  var TRADE_TYPES = /* @__PURE__ */ new Set(["tradeCaravan", "ragusaCaravan"]);
  var state3 = {
    lastGameRef: null,
    // 换局检测
    slowUsedThisTurn: /* @__PURE__ */ new Set()
    // unitId：本回合已因 raided 预扣过移动力（每 beginTurn 重置）
  };
  function resetState3() {
    state3.slowUsedThisTurn.clear();
  }
  function syncGameRef3(ctx) {
    if (ctx && ctx.game !== state3.lastGameRef) {
      resetState3();
      state3.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests3() {
    resetState3();
    state3.lastGameRef = null;
  }
  function debugState() {
    return {
      slowUsedThisTurn: [...state3.slowUsedThisTurn]
    };
  }
  function isGoldenHordeOwner(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "goldenHorde";
  }
  function isGoldenHordeUnit(ctx, unit) {
    return !!unit && isGoldenHordeOwner(ctx, unit.owner);
  }
  function isTradeTarget(ctx, unit) {
    if (!unit) return false;
    if (TRADE_TYPES.has(unit.type)) return true;
    const meta = ctx.typeMeta(unit.type);
    return !!(meta && meta.transport);
  }
  function raidPower(ctx, unit) {
    const meta = ctx.typeMeta(unit.type);
    if (!meta) return 0;
    return (meta.move >= RAID_POWER_MOVE_MIN ? 1 : 0) + (meta.level >= RAID_POWER_LEVEL_MIN ? 1 : 0);
  }
  function baseLoot(ctx, defender) {
    if (isTradeTarget(ctx, defender)) return RAID_LOOT.trade;
    const meta = ctx.typeMeta(defender.type);
    if (meta && meta.level >= 3) return RAID_LOOT.elite;
    return RAID_LOOT.normal;
  }
  function siteBonusFor(ctx, attacker, defender) {
    const site = ctx.getSite(defender.x, defender.y);
    if (!site) return 0;
    if (site.owner === "neutral") return 0;
    if (ctx.areAllies(ctx.game.teams, site.owner, attacker.owner)) return 0;
    return RAID_LOOT.siteBonus;
  }
  function onAfterAttack2(ctx, payload) {
    const { attacker, defender, defenderDead } = payload || {};
    if (!attacker || !defender) return;
    if (!isGoldenHordeUnit(ctx, attacker)) return;
    if (ctx.areAllies(ctx.game.teams, attacker.owner, defender.owner)) return;
    if (!defenderDead) {
      ctx.addStatus(defender.id, RAIDED_KEY, RAIDED_TURNS, { by: attacker.owner });
      ctx.log(`${ctx.typeMeta(attacker.type).name}掠袭了${ctx.typeMeta(defender.type).name}，使其陷入疲软（raided）。`, "battle");
      return;
    }
    let gold = baseLoot(ctx, defender) + siteBonusFor(ctx, attacker, defender) + raidPower(ctx, attacker);
    if (ctx.hasStatus(defender.id, RAIDED_KEY)) {
      gold *= RAID_LOOT.raidedMult;
    }
    if (gold > 0) {
      ctx.addGold(attacker.owner, gold, "raid");
      ctx.log(`${ctx.typeMeta(attacker.type).name}掠袭成功，缴获 ${gold} 金币。`, "gold");
    }
  }
  function onBeforeMove3(ctx, payload) {
    const { unit, from, to } = payload || {};
    if (!unit || !to || !from) return;
    if (unit.move <= 0) return;
    if (!ctx.hasStatus(unit.id, RAIDED_KEY)) return;
    if (state3.slowUsedThisTurn.has(unit.id)) return;
    const step = ctx.movementCost(ctx.game, unit, to.x, to.y);
    const stepCost = to.x !== from.x && to.y !== from.y ? step * Math.SQRT2 : step;
    if (unit.move < stepCost + 1) {
      payload.cancel = true;
      return;
    }
    unit.move -= 1;
    state3.slowUsedThisTurn.add(unit.id);
  }
  function onTurnStart3(ctx, payload) {
    syncGameRef3(ctx);
    state3.slowUsedThisTurn.clear();
  }

  // src/factions/goldenHorde/nationMechanics.js
  var GOLDEN_HORDE_NATION = {
    prestigePerKill: 1,
    // 每击杀 +1 威望
    tierCavalry: 5,
    tierCavBonus: 1,
    // 5：骑兵每回合首次攻击 +1
    tierCamp: 10,
    tierCampCostMult: 0.8,
    // 10：营地生产成本 -20%
    tierElite: 15,
    tierEliteAtk: 2,
    // 15：可汗亲卫攻击 +2
    oasisRange: 2,
    oasisHeal: 2,
    oasisRaidBonus: 2,
    oasisCampDuration: 1,
    ambushFirstHit: 2,
    // 伏击：首击伤害 +2
    ambushTerrains: ["snow", "forest"]
  };
  var state4 = {
    lastGameRef: null,
    prestige: /* @__PURE__ */ new Map(),
    // owner → 威望（本局动态积累）
    cavFirstUsed: /* @__PURE__ */ new Set(),
    // unitId：本回合已享受威望5骑兵首攻
    ambushUsed: /* @__PURE__ */ new Set()
    // unitId：本回合已享受蓝帐伏击
  };
  function resetState4() {
    state4.prestige.clear();
    state4.cavFirstUsed.clear();
    state4.ambushUsed.clear();
  }
  function syncGameRef4(ctx) {
    if (ctx && ctx.game !== state4.lastGameRef) {
      resetState4();
      state4.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests4() {
    resetState4();
    state4.lastGameRef = null;
  }
  function getPrestige(ctx, owner) {
    return state4.prestige.get(owner) || 0;
  }
  function isGoldenHordeCore(ctx, owner) {
    return !!owner && ctx.ownerNation(owner) === "goldenHordeCore";
  }
  function oasisNodes(ctx) {
    const g = ctx.game;
    if (!g || !g.sites || !g.terrain) return [];
    const nodes = [];
    for (const s of g.sites) {
      if (!s.owner || s.owner === "neutral") continue;
      if (ctx.ownerNation(s.owner) !== "whiteHorde") continue;
      const t = g.terrain[s.y] && g.terrain[s.y][s.x];
      if (t === "desert" || t === "sand") nodes.push(s);
    }
    return nodes;
  }
  function inOasisNetwork(ctx, x, y, range = GOLDEN_HORDE_NATION.oasisRange) {
    return oasisNodes(ctx).some((s) => Math.abs(s.x - x) <= range && Math.abs(s.y - y) <= range);
  }
  function isAmbushTerrain(ctx, unit) {
    const g = ctx.game;
    if (!g.terrain || !g.terrain[unit.y]) return false;
    return GOLDEN_HORDE_NATION.ambushTerrains.includes(g.terrain[unit.y][unit.x]);
  }
  function onTurnStart4(ctx, payload) {
    const owner = payload && payload.owner;
    const initial = !!(payload && payload.initial);
    syncGameRef4(ctx);
    state4.cavFirstUsed.clear();
    state4.ambushUsed.clear();
    if (initial) return;
    const nodes = oasisNodes(ctx);
    if (!nodes.length) return;
    for (const u of ctx.game.units) {
      if (u.hp >= u.maxHp) continue;
      if (ctx.ownerFaction(u.owner) !== "goldenHorde") continue;
      if (!nodes.some((s) => Math.abs(s.x - u.x) <= GOLDEN_HORDE_NATION.oasisRange && Math.abs(s.y - u.y) <= GOLDEN_HORDE_NATION.oasisRange)) continue;
      u.hp = Math.min(u.maxHp, u.hp + GOLDEN_HORDE_NATION.oasisHeal);
      ctx.log(`${ctx.typeMeta(u.type).name}依托绿洲网络补给，回复 ${GOLDEN_HORDE_NATION.oasisHeal} 点生命。`, "battle");
    }
  }
  function onBeforeAttack3(ctx, payload) {
    const { attacker, defender, result } = payload || {};
    if (!attacker || !defender || !result || !result.damage) return;
    syncGameRef4(ctx);
    if (isGoldenHordeCore(ctx, attacker.owner)) {
      const atkMeta = ctx.typeMeta(attacker.type);
      if (atkMeta && atkMeta.charge && getPrestige(ctx, attacker.owner) >= GOLDEN_HORDE_NATION.tierCavalry && !state4.cavFirstUsed.has(attacker.id)) {
        state4.cavFirstUsed.add(attacker.id);
        result.damage += GOLDEN_HORDE_NATION.tierCavBonus;
        ctx.log(`${atkMeta.name}借可汗威望发动首轮猛攻，伤害 +${GOLDEN_HORDE_NATION.tierCavBonus}。`, "battle");
      }
      if (attacker.type === "khanGuard" && getPrestige(ctx, attacker.owner) >= GOLDEN_HORDE_NATION.tierElite) {
        result.damage += GOLDEN_HORDE_NATION.tierEliteAtk;
        ctx.log("可汗亲卫受威望加持，伤害 +" + GOLDEN_HORDE_NATION.tierEliteAtk + "。", "battle");
      }
    }
    if (ctx.ownerNation(attacker.owner) === "whiteHorde") {
      const defMeta = ctx.typeMeta(defender.type);
      if (defMeta && defMeta.charge && inOasisNetwork(ctx, attacker.x, attacker.y)) {
        result.damage += GOLDEN_HORDE_NATION.oasisRaidBonus;
        ctx.log(`${ctx.typeMeta(attacker.type).name}依托绿洲网络夹击骑兵，伤害 +${GOLDEN_HORDE_NATION.oasisRaidBonus}。`, "battle");
      }
    }
    if (ctx.ownerNation(attacker.owner) === "blueHorde") {
      if (isAmbushTerrain(ctx, attacker) && !state4.ambushUsed.has(attacker.id)) {
        state4.ambushUsed.add(attacker.id);
        result.damage += GOLDEN_HORDE_NATION.ambushFirstHit;
        ctx.log(`${ctx.typeMeta(attacker.type).name}从雪地/丛林边缘发动伏击，伤害 +${GOLDEN_HORDE_NATION.ambushFirstHit}。`, "battle");
      }
    }
  }
  function onAfterAttack3(ctx, payload) {
    const { attacker, defender, defenderDead } = payload || {};
    if (!attacker) return;
    syncGameRef4(ctx);
    if (defenderDead && isGoldenHordeCore(ctx, attacker.owner)) {
      const next = getPrestige(ctx, attacker.owner) + GOLDEN_HORDE_NATION.prestigePerKill;
      state4.prestige.set(attacker.owner, next);
      const tiers = [GOLDEN_HORDE_NATION.tierCavalry, GOLDEN_HORDE_NATION.tierCamp, GOLDEN_HORDE_NATION.tierElite];
      const unlocked = tiers.filter((t) => next >= t).length - tiers.filter((t) => next - 1 >= t).length;
      if (unlocked > 0) {
        ctx.log(`可汗威望提升至 ${next}，解锁新的汗权效果！`, "system");
      } else {
        ctx.log(`可汗威望提升至 ${next}。`, "system");
      }
    }
    if (defenderDead && ctx.ownerFaction(attacker.owner) === "goldenHorde" && inOasisNetwork(ctx, attacker.x, attacker.y)) {
      ctx.addGold(attacker.owner, GOLDEN_HORDE_NATION.oasisRaidBonus);
      ctx.log(`${ctx.typeMeta(attacker.type).name}在绿洲网络内掠袭，额外获得 ${GOLDEN_HORDE_NATION.oasisRaidBonus} 金币。`, "system");
    }
    if (ctx.ownerNation(attacker.owner) === "blueHorde" && state4.ambushUsed.has(attacker.id)) {
      attacker.move = attacker.maxMove;
      ctx.log(`${ctx.typeMeta(attacker.type).name}伏击得手后迅速撤离，移动力恢复。`, "system");
    }
  }
  function attachDebug3(ctx) {
    const debug = {
      config: () => ({ ...GOLDEN_HORDE_NATION }),
      prestige: (owner) => getPrestige(ctx, owner),
      state: () => ({ cavFirstUsed: [...state4.cavFirstUsed], ambushUsed: [...state4.ambushUsed] }),
      oasis: () => oasisNodes(ctx).map((s) => ({ x: s.x, y: s.y, kind: s.kind, owner: s.owner }))
    };
    if (typeof globalThis !== "undefined") globalThis.__goldenHordeDebug = { ...globalThis.__goldenHordeDebug || {}, nations: debug };
    return debug;
  }

  // src/factions/goldenHorde/nomadCamp.js
  var NOMAD_CAMP = {
    type: "nomadCamp",
    buildCost: 25,
    // 建造费用
    duration: 5,
    // 基础存在回合数；金帐本部 +2（阶段3 国家机制）、绿洲网络内 +1 由建造时叠加
    upkeep: 2,
    // 每回合维护费
    maxCamps: 2,
    // 每方同时存在的游牧营地上限
    migrateRange: 2,
    // 迁移候选格：营地切比雪夫距离 <= 2
    migrateMaxOptions: 8
    // 迁移候选格最多列出的选项数
  };
  var CAMP_PRODUCIBLE = ["lightCavalry", "hordeCavalry", "horseArcher", "nomadArcher", "nomadChariot"];
  var state5 = {
    lastGameRef: null
  };
  function resetState5() {
  }
  function syncGameRef5(ctx) {
    if (ctx && ctx.game !== state5.lastGameRef) {
      resetState5();
      state5.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests5() {
    resetState5();
    state5.lastGameRef = null;
  }
  function isLandCell2(ctx, x, y) {
    const g = ctx.game;
    if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
    const t = g.terrain[y] && g.terrain[y][x];
    return !!t && t !== "water" && t !== "mountain";
  }
  function campCount(ctx, owner) {
    return ctx.getFacilitiesByType(NOMAD_CAMP.type).filter((f) => f.owner === owner).length;
  }
  function myCamps(ctx, owner) {
    return ctx.getFacilitiesByType(NOMAD_CAMP.type).filter((f) => f.owner === owner);
  }
  function canBuildCampAt(ctx, unit) {
    if (!unit || !isGoldenHordeOwner(ctx, unit.owner)) return false;
    const meta = ctx.typeMeta(unit.type);
    if (!meta || meta.domain !== "land") return false;
    if (unit.acted || unit.hasAttacked) return false;
    if (!isLandCell2(ctx, unit.x, unit.y)) return false;
    if (ctx.getSite(unit.x, unit.y)) return false;
    if (ctx.getFacilityAt(unit.x, unit.y)) return false;
    if ((ctx.game.goldByOwner[unit.owner] || 0) < NOMAD_CAMP.buildCost) return false;
    if (campCount(ctx, unit.owner) >= NOMAD_CAMP.maxCamps) return false;
    return true;
  }
  function isValidCampCell(ctx, x, y) {
    if (!isLandCell2(ctx, x, y)) return false;
    if (ctx.getSite(x, y)) return false;
    if (ctx.getFacilityAt(x, y)) return false;
    if (ctx.getUnit(x, y)) return false;
    return true;
  }
  function requestBuildDecision2(ctx, unit) {
    if (!canBuildCampAt(ctx, unit)) return null;
    const options = [
      { id: "none", label: "不建", description: "保留金币与本回合行动，不建立营地。" },
      { id: "build", label: "建游牧营地", description: `${NOMAD_CAMP.buildCost}金币，存在${NOMAD_CAMP.duration}回合，每回合${NOMAD_CAMP.upkeep}金币维护。` }
    ];
    const owner = unit.owner;
    const unitId = unit.id;
    const decisionId = `ghCampBuild_${unitId}`;
    return ctx.requestDecision(decisionId, {
      owner,
      unitId,
      title: "游牧营地",
      description: `${ctx.typeMeta(unit.type).name}可在此格建立游牧营地（消耗本回合行动并花费金币）。`,
      options,
      onResolve: (choiceId) => {
        resolveBuild2(ctx, owner, unitId, choiceId);
      }
    });
  }
  function resolveBuild2(ctx, owner, unitId, choiceId) {
    if (!choiceId || choiceId === "none") return false;
    const unit = ctx.game.units.find((u) => u.id === unitId);
    if (!unit || unit.owner !== owner) return false;
    if (!canBuildCampAt(ctx, unit)) {
      ctx.log("营地建造条件不再满足（金币/占位/上限变化）。", "warning");
      return false;
    }
    if (!ctx.spendGold(owner, NOMAD_CAMP.buildCost)) return false;
    const natBonus = ctx.ownerNation(owner) === "goldenHordeCore" ? 2 : 0;
    const oasisBonus = inOasisNetwork(ctx, unit.x, unit.y) ? 1 : 0;
    const totalDuration = NOMAD_CAMP.duration + natBonus + oasisBonus;
    const fac = ctx.createFacility(NOMAD_CAMP.type, owner, unit.x, unit.y, {
      duration: totalDuration,
      data: { builtTurn: ctx.game.turn }
    });
    unit.acted = true;
    unit.move = 0;
    unit.hasAttacked = true;
    ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）建立了游牧营地，可维持 ${totalDuration} 回合。`, "system");
    return !!fac;
  }
  function migrateCandidates(ctx, camp) {
    const out = [];
    const r = NOMAD_CAMP.migrateRange;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx === 0 && dy === 0) continue;
        const x = camp.x + dx;
        const y = camp.y + dy;
        if (!isValidCampCell(ctx, x, y)) continue;
        out.push({ x, y });
        if (out.length >= NOMAD_CAMP.migrateMaxOptions) return out;
      }
    }
    return out;
  }
  function requestCampDecision(ctx, camp) {
    if (!camp || camp.type !== NOMAD_CAMP.type) return null;
    const owner = camp.owner;
    const options = [{ id: "none", label: "维持营地", description: "本回合不生产、不迁移。" }];
    const gold = ctx.game.goldByOwner[owner] || 0;
    const occupant = ctx.getUnit(camp.x, camp.y);
    if (!occupant) {
      for (const type of CAMP_PRODUCIBLE) {
        const meta = ctx.typeMeta(type);
        if (!meta) continue;
        if (gold < meta.cost) continue;
        options.push({ id: `produce:${type}`, label: `生产${meta.name}`, description: `${meta.name}（${meta.cost}金币，立即部署于营地格）` });
      }
    }
    for (const cell of migrateCandidates(ctx, camp)) {
      options.push({ id: `migrate:${cell.x},${cell.y}`, label: `迁移到（${cell.x},${cell.y}）`, description: "营地迁往目标格，原址失去生产功能。" });
    }
    if (options.length <= 1) return null;
    const decisionId = `ghCamp_${camp.id}`;
    return ctx.requestDecision(decisionId, {
      owner,
      title: "游牧营地行动",
      description: `游牧营地（${camp.x},${camp.y}）本回合可生产金帐单位或迁移（消耗营地本回合行动）。`,
      options,
      onResolve: (choiceId) => {
        resolveCampAction(ctx, owner, camp.id, choiceId);
      }
    });
  }
  function resolveCampAction(ctx, owner, campId, choiceId) {
    if (!choiceId || choiceId === "none") return false;
    const camp = ctx.getFacilitiesByType(NOMAD_CAMP.type).find((f) => f.id === campId);
    if (!camp || camp.owner !== owner) return false;
    if (choiceId.startsWith("produce:")) {
      return doProduce(ctx, owner, camp, choiceId.slice("produce:".length));
    }
    if (choiceId.startsWith("migrate:")) {
      const parts = choiceId.slice("migrate:".length).split(",");
      const tx = parseInt(parts[0], 10);
      const ty = parseInt(parts[1], 10);
      return doMigrate(ctx, owner, camp, tx, ty);
    }
    return false;
  }
  function doProduce(ctx, owner, camp, type) {
    const meta = ctx.typeMeta(type);
    if (!meta || !CAMP_PRODUCIBLE.includes(type)) return false;
    if (ctx.getUnit(camp.x, camp.y)) {
      ctx.log("营地格已被占用，无法生产。", "warning");
      return false;
    }
    const cost = getPrestige(ctx, owner) >= GOLDEN_HORDE_NATION.tierCamp ? Math.ceil(meta.cost * GOLDEN_HORDE_NATION.tierCampCostMult) : meta.cost;
    if (!ctx.spendGold(owner, cost)) {
      ctx.log("金币不足，无法生产。", "warning");
      return false;
    }
    const unitEntry = ctx.createUnit(type, owner, camp.x, camp.y);
    ctx.events.emit("productionCompleted", { owner, unit: unitEntry, site: camp, kind: "unit" });
    ctx.log(`游牧营地（${camp.x},${camp.y}）生产了${meta.name}。`, "system");
    return true;
  }
  function doMigrate(ctx, owner, camp, tx, ty) {
    if (!isValidCampCell(ctx, tx, ty)) {
      ctx.log("目标格不再适合营地（占位/地形变化）。", "warning");
      return false;
    }
    if (ctx.diagonalDist(camp, { x: tx, y: ty }) > NOMAD_CAMP.migrateRange) {
      ctx.log("目标格超出营地迁移范围。", "warning");
      return false;
    }
    const data = { ...camp.data || {}, migrated: (camp.data?.migrated || 0) + 1 };
    ctx.removeFacility(camp.id);
    ctx.createFacility(NOMAD_CAMP.type, owner, tx, ty, { duration: camp.duration, data });
    ctx.log(`游牧营地迁移到（${tx},${ty}），原址失去生产功能。`, "system");
    return true;
  }
  function onTurnStart5(ctx, payload) {
    syncGameRef5(ctx);
    const owner = payload && payload.owner;
    const initial = !!(payload && payload.initial);
    if (!isGoldenHordeOwner(ctx, owner)) return;
    ctx.expireFacilities(owner);
    if (!initial) {
      for (const camp of myCamps(ctx, owner)) {
        if (!ctx.spendGold(owner, NOMAD_CAMP.upkeep)) {
          ctx.removeFacility(camp.id);
          ctx.log("游牧营地因无力支付维护而解散。", "warning");
        }
      }
    }
    if (owner === "player") {
      for (const unit of ctx.game.units) {
        if (unit.owner === owner && canBuildCampAt(ctx, unit)) {
          requestBuildDecision2(ctx, unit);
        }
      }
      for (const camp of myCamps(ctx, owner)) {
        requestCampDecision(ctx, camp);
      }
    }
  }

  // src/factions/goldenHorde/goldenHordeRules.js
  var goldenHordeSystem = {
    id: "goldenHorde",
    // 注册时调用一次：挂载 debug/test 入口（globalThis.__goldenHordeDebug，浏览器控制台可用）
    init(ctx) {
      attachDebug4(ctx);
      attachDebug3(ctx);
    },
    // turnStart：先无条件重置掠袭去重标记（raided 作用于被打方，所有 owner 回合都要清），
    // 再处理营地过期/维护/决策（内部判断金帐 owner）+ 国家机制（首攻标记重置/绿洲回血）。
    onTurnStart(ctx, payload) {
      onTurnStart3(ctx, payload);
      onTurnStart5(ctx, payload);
      onTurnStart4(ctx, payload);
    },
    // beforeMove：raided 移动力 -1（预扣；付不起则 cancel）+ 国家机制（无 beforeMove 项）
    onBeforeMove(ctx, payload) {
      onBeforeMove3(ctx, payload);
    },
    // beforeAttack：国家机制（可汗威望骑兵首攻/绿洲对骑兵/蓝帐伏击首攻，只改 result.damage）
    onBeforeAttack(ctx, payload) {
      onBeforeAttack3(ctx, payload);
    },
    // afterAttack：掠袭收益（击杀战利品）+ raided 标记（未击杀）+ 国家机制（威望/绿洲/撤离）
    onAfterAttack(ctx, payload) {
      onAfterAttack2(ctx, payload);
      onAfterAttack3(ctx, payload);
    },
    // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
    reset() {
      resetForTests3();
      resetForTests5();
      resetForTests4();
    }
  };
  function attachDebug4(ctx) {
    const debug = {
      config: () => ({
        raidLoot: { ...RAID_LOOT },
        raidPower: { moveMin: RAID_POWER_MOVE_MIN, levelMin: RAID_POWER_LEVEL_MIN, raidedTurns: RAIDED_TURNS },
        camp: { ...NOMAD_CAMP },
        producible: [...CAMP_PRODUCIBLE]
      }),
      // 当前所有游牧营地
      camps: () => ctx.getFacilitiesByType(NOMAD_CAMP.type).map((f) => ({
        id: f.id,
        owner: f.owner,
        x: f.x,
        y: f.y,
        duration: f.duration,
        data: f.data,
        occupant: ctx.getUnit(f.x, f.y) ? ctx.getUnit(f.x, f.y).type : null
      })),
      // 当前所有带 raided 标记的单位
      raided: () => ctx.game.units.filter((u) => ctx.hasStatus(u.id, RAIDED_KEY)).map((u) => ({ id: u.id, type: u.type, owner: u.owner, x: u.x, y: u.y })),
      state: () => ({ ...debugState() }),
      // 查看某 owner 可建营地的单位
      eligible: (owner) => ctx.game.units.filter((u) => u.owner === owner && canBuildCampAt(ctx, u)).map((u) => ({ id: u.id, type: u.type, x: u.x, y: u.y })),
      // 为某 owner 所有可建单位发起建造决策；为所有营地发起行动决策（返回请求数）
      requestForOwner: (owner) => {
        let n = 0;
        for (const u of ctx.game.units) {
          if (u.owner === owner && requestBuildDecision2(ctx, u)) n += 1;
        }
        for (const c of myCamps(ctx, owner)) {
          if (requestCampDecision(ctx, c)) n += 1;
        }
        return n;
      },
      // 查看未决金帐决策（浏览器 UI 阶段前的手动测试入口）
      pending: () => ctx.getPendingDecisions("player").filter((r) => String(r.id || "").startsWith("ghCamp")).map((r) => ({ id: r.id, title: r.context.title, options: r.context.options.map((o) => o.id) })),
      resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId)
    };
    if (typeof globalThis !== "undefined") globalThis.__goldenHordeDebug = debug;
    return debug;
  }

  // src/factions/venice/tradeNetwork.js
  var TRADE_ROUTE = {
    type: "tradeRoute",
    baseIncome: 2,
    // 每条路线每回合基础 +2 金币
    incomeCap: 5,
    // 单条路线长度收益上限 +5（避免无限堆路线；国家加成叠加在其后）
    maxRoutes: 6,
    // 每方同时存在的贸易路线上限（防设施无限增长）
    navyGuardRange: 3,
    // 海路保护：水域路径格需有己方海军在切比雪夫距离 <= 3 内
    pathSearchCap: 800,
    // 路径 BFS 最大探索格数（防性能失控）
    maxCandidates: 5
    // 单回合最多列出 5 条候选路线（决策选项上限）
  };
  var TRADING_PORT = {
    type: "tradingPort",
    // 拉古萨中立商港（facility，放在敌方港口格上）
    income: 2,
    // 每个交易港每回合 +2 金币（少量收入）
    hp: 6,
    // 可被攻击摧毁（每击按伤害 50% 掉耐久）
    chipRatio: 0.5,
    // 敌军攻击交易港格上单位时对交易港的耐久伤害比例
    maxPorts: 2,
    // 每方同时存在的交易港上限
    caravanRange: 1
    // 拉古萨商队需在港口切比雪夫距离 <= 1 内（"商队进入"）
  };
  var GENOA_LOAN = {
    amount: 15,
    // 立即获得 +15 金币
    repayment: 6,
    // 随后 3 回合每回合 -6
    repayTurns: 3,
    cooldown: 2,
    // 还清后冷却 2 回合（不可无限使用）
    maxLoans: 3
    // 每局借贷硬上限
  };
  var MERCENARY = {
    // 按当前战场购买"临时解决方案"（规格书 §7.4）：反骑买长枪兵 / 攻城买投石车 / 远程买弩手
    // 价格沿用现有"非己方联盟兵种 ×1.5"概念（factionAdjustedCost 的 venice markup）
    markup: 1.5,
    options: [
      { id: "spearman", label: "长枪兵", baseCost: 26, desc: "临时方案·反骑：克制骑兵冲锋，坚实前排" },
      { id: "crossbow", label: "弩手", baseCost: 40, desc: "临时方案·远程：高爆发集火" },
      { id: "catapult", label: "投石车", baseCost: 54, desc: "临时方案·攻城：远程攻城器械，射程远但脆弱" }
    ]
  };
  var TRADE_TYPES2 = /* @__PURE__ */ new Set(["tradeCaravan", "ragusaCaravan"]);
  var NODE_SITE_KINDS = /* @__PURE__ */ new Set(["city", "shipyard", "fortress"]);
  var state6 = {
    lastGameRef: null,
    loans: /* @__PURE__ */ new Map(),
    // owner -> { active, repayLeft, cooldownLeft, totalTaken }
    mercs: /* @__PURE__ */ new Map()
    // owner -> { lastBuyTurn }（每回合最多买 1 次）
  };
  function resetState6() {
    state6.loans.clear();
    state6.mercs.clear();
  }
  function syncGameRef6(ctx) {
    if (ctx && ctx.game !== state6.lastGameRef) {
      resetState6();
      state6.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests6() {
    resetState6();
    state6.lastGameRef = null;
  }
  function debugState2() {
    return {
      loans: [...state6.loans.entries()].map(([o, r]) => ({ owner: o, ...r })),
      mercs: [...state6.mercs.entries()].map(([o, r]) => ({ owner: o, ...r }))
    };
  }
  function isVeniceOwner(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "venice";
  }
  function isCaravanType(type) {
    return !!type && TRADE_TYPES2.has(type);
  }
  function isWater(ctx, x, y) {
    const g = ctx.game;
    return !!(g && g.terrain[y] && g.terrain[y][x] === "water");
  }
  function ownerShipyards(ctx, owner) {
    return ctx.game.sites.filter((s) => s.kind === "shipyard" && s.owner === owner);
  }
  function typeLabel(ctx, type) {
    const m = ctx.typeMeta(type);
    return m && m.name ? m.name : type;
  }
  function routeLabel(route) {
    const d = route.data || {};
    return `贸易路线（${d.startNode ? d.startNode.x + "," + d.startNode.y : route.x + "," + route.y} ↔ ${d.endNode ? d.endNode.x + "," + d.endNode.y : ""}）`;
  }
  var NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function findPath(ctx, owner, a, b) {
    if (!a || !b) return null;
    if (a.x === b.x && a.y === b.y) return null;
    const g = ctx.game;
    const w = g.w, h = g.h;
    const startKey = `${a.x},${a.y}`;
    const goalKey = `${b.x},${b.y}`;
    const prev = /* @__PURE__ */ new Map([[startKey, null]]);
    const queue = [[a.x, a.y]];
    let head = 0;
    while (head < queue.length && head < TRADE_ROUTE.pathSearchCap) {
      const [x, y] = queue[head++];
      const key = `${x},${y}`;
      if (key === goalKey) break;
      for (const [dx, dy] of NEIGHBORS) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (g.terrain[ny][nx] === "mountain") continue;
        const nk = `${nx},${ny}`;
        if (prev.has(nk)) continue;
        const isEndpoint = nx === a.x && ny === a.y || nx === b.x && ny === b.y;
        if (!isEndpoint) {
          const s = ctx.getSite(nx, ny);
          if (s && s.owner !== "neutral" && !ctx.areAllies(ctx.game.teams, s.owner, owner)) continue;
        }
        prev.set(nk, [x, y]);
        queue.push([nx, ny]);
      }
    }
    if (!prev.has(goalKey)) return null;
    const cells = [];
    let cur = goalKey;
    while (cur) {
      const [cx, cy] = cur.split(",").map(Number);
      cells.unshift({ x: cx, y: cy });
      const par = prev.get(cur);
      cur = par ? `${par[0]},${par[1]}` : null;
    }
    return cells;
  }
  function routeIncomeForPath(pathCells) {
    if (!pathCells || pathCells.length < 2) return 0;
    const L = pathCells.length;
    return Math.min(TRADE_ROUTE.incomeCap, TRADE_ROUTE.baseIncome + Math.floor((L - 2) / 2));
  }
  function hasNavyGuard(ctx, owner, path) {
    const waterCells = path.filter((c) => isWater(ctx, c.x, c.y));
    if (!waterCells.length) return true;
    const navies = ctx.game.units.filter((u) => u.owner === owner && ctx.typeMeta(u.type) && ctx.typeMeta(u.type).domain === "sea");
    if (!navies.length) return false;
    return waterCells.some((c) => navies.some((n) => ctx.diagonalDist(n, c) <= TRADE_ROUTE.navyGuardRange));
  }
  function collectNodes(ctx, owner) {
    const nodes = [];
    for (const s of ctx.game.sites) {
      if (s.owner !== owner || !NODE_SITE_KINDS.has(s.kind)) continue;
      nodes.push({ kind: "site", id: s.id, x: s.x, y: s.y, label: s.name || `${s.kind}(${s.x},${s.y})` });
    }
    for (const u of ctx.game.units) {
      if (u.owner !== owner || !isCaravanType(u.type)) continue;
      nodes.push({ kind: "unit", id: u.id, x: u.x, y: u.y, label: `${typeLabel(ctx, u.type)}（商队）` });
    }
    if (ctx.ownerNation(owner) === "ragusa") {
      for (const f of ctx.getFacilitiesByType(TRADING_PORT.type)) {
        if (f.owner !== owner) continue;
        nodes.push({ kind: "facility", id: f.id, x: f.x, y: f.y, label: "交易港" });
      }
    }
    return nodes;
  }
  function existingRoutePairs(ctx, owner) {
    const pairs = /* @__PURE__ */ new Set();
    for (const f of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
      if (f.owner !== owner) continue;
      const d = f.data || {};
      if (d.startNode && d.endNode) {
        pairs.add([d.startNode.kind, d.startNode.id, d.endNode.kind, d.endNode.id].join(":"));
      }
    }
    return pairs;
  }
  function routesOf(ctx, owner) {
    return ctx.getFacilitiesByType(TRADE_ROUTE.type).filter((f) => f.owner === owner);
  }
  function routeCandidates(ctx, owner) {
    const nodes = collectNodes(ctx, owner);
    if (nodes.length < 2) return [];
    const used = existingRoutePairs(ctx, owner);
    const cands = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const key = [a.kind, a.id, b.kind, b.id].join(":");
        if (used.has(key)) continue;
        const path = findPath(ctx, owner, a, b);
        if (!path) continue;
        const sea = path.some((c) => isWater(ctx, c.x, c.y));
        if (sea && !hasNavyGuard(ctx, owner, path)) continue;
        cands.push({ a, b, path, income: routeIncomeForPath(path), sea });
      }
    }
    cands.sort((p, q) => p.path.length - q.path.length || q.income - p.income);
    return cands.slice(0, TRADE_ROUTE.maxCandidates);
  }
  function resolveNodeRef(ctx, node) {
    if (!node) return null;
    if (node.kind === "site") {
      const s = ctx.game.sites.find((e) => e.id === node.id);
      return s ? { kind: "site", id: s.id, x: s.x, y: s.y, label: node.label } : null;
    }
    if (node.kind === "unit") {
      const u = ctx.game.units.find((e) => e.id === node.id);
      return u ? { kind: "unit", id: u.id, x: u.x, y: u.y, label: node.label } : null;
    }
    if (node.kind === "facility") {
      const f = ctx.getAllFacilities().find((e) => e.id === node.id);
      return f ? { kind: "facility", id: f.id, x: f.x, y: f.y, label: node.label } : null;
    }
    return null;
  }
  function establishRoute(ctx, owner, a, b) {
    if (routesOf(ctx, owner).length >= TRADE_ROUTE.maxRoutes) {
      ctx.log("贸易路线上限已到，无法再建立。", "warning");
      return false;
    }
    const ra = resolveNodeRef(ctx, a);
    const rb = resolveNodeRef(ctx, b);
    if (!ra || !rb) {
      ctx.log("节点已失效，贸易路线建立失败。", "warning");
      return false;
    }
    const path = findPath(ctx, owner, ra, rb);
    if (!path) {
      ctx.log("两端节点已不可达，贸易路线建立失败。", "warning");
      return false;
    }
    const sea = path.some((c) => isWater(ctx, c.x, c.y));
    if (sea && !hasNavyGuard(ctx, owner, path)) {
      ctx.log("海路缺少己方海军保护，贸易路线建立失败。", "warning");
      return false;
    }
    const income = routeIncomeForPath(path);
    const fac = ctx.createFacility(TRADE_ROUTE.type, owner, ra.x, ra.y, {
      hp: 1,
      duration: null,
      // 贸易路线不过期，直到端点失效/被切断
      data: {
        startNode: { kind: ra.kind, id: ra.id, x: ra.x, y: ra.y },
        endNode: { kind: rb.kind, id: rb.id, x: rb.x, y: rb.y },
        path,
        income,
        status: "active",
        establishedTurn: ctx.game.turn,
        sea,
        seaCells: path.filter((c) => isWater(ctx, c.x, c.y)).length
      }
    });
    ctx.log(`${routeLabel(fac)}建立成功，每回合 +${income} 金币${sea ? "（海路，需海军保护）" : ""}。`, "system");
    return !!fac;
  }
  function nodeAlive(ctx, owner, node) {
    if (!node) return false;
    if (node.kind === "site") {
      const s = ctx.game.sites.find((e) => e.id === node.id);
      return !!s && s.owner === owner && NODE_SITE_KINDS.has(s.kind);
    }
    if (node.kind === "unit") {
      const u = ctx.game.units.find((e) => e.id === node.id);
      return !!u && u.owner === owner && isCaravanType(u.type);
    }
    if (node.kind === "facility") {
      const f = ctx.getAllFacilities().find((e) => e.id === node.id);
      return !!f && f.owner === owner && f.type === TRADING_PORT.type;
    }
    return false;
  }
  function refreshRoute(ctx, route) {
    const d = route.data || {};
    const owner = route.owner;
    if (!nodeAlive(ctx, owner, d.startNode) || !nodeAlive(ctx, owner, d.endNode)) {
      if (d.status !== "removed") {
        ctx.log(`${routeLabel(route)}端点失效，贸易路线被移除。`, "warning");
        d.status = "removed";
      }
      return "removed";
    }
    let newStatus = "active";
    for (const c of d.path || []) {
      const s = ctx.getSite(c.x, c.y);
      if (s && s.owner !== "neutral" && !ctx.areAllies(ctx.game.teams, s.owner, owner)) {
        newStatus = "disrupted";
        break;
      }
      const u = ctx.getUnit(c.x, c.y);
      if (u && !ctx.areAllies(ctx.game.teams, u.owner, owner)) {
        newStatus = "disrupted";
        break;
      }
    }
    if (newStatus !== d.status) {
      if (newStatus === "disrupted") {
        ctx.log(`${routeLabel(route)}被敌军切断，贸易收入暂停（商队可另建新路线）。`, "warning");
      } else {
        ctx.log(`${routeLabel(route)}恢复通商。`, "system");
      }
      d.status = newStatus;
    }
    return newStatus;
  }
  function onBeforeMove4(ctx, payload) {
    const { unit, to } = payload || {};
    if (!unit || !to) return;
    for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
      if (ctx.areAllies(ctx.game.teams, unit.owner, route.owner)) continue;
      const d = route.data || {};
      if (d.status === "disrupted") continue;
      if ((d.path || []).some((c) => c.x === to.x && c.y === to.y)) {
        d.status = "disrupted";
        ctx.log(`${typeLabel(ctx, unit.type)}进入${routeLabel(route)}，贸易路线被切断！`, "warning");
      }
    }
  }
  function onSiteCaptured(ctx, payload) {
    const { unit, site } = payload || {};
    if (!unit || !site) return;
    for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
      if (ctx.areAllies(ctx.game.teams, unit.owner, route.owner)) continue;
      const d = route.data || {};
      if (d.status === "disrupted") continue;
      if ((d.path || []).some((c) => c.x === site.x && c.y === site.y)) {
        d.status = "disrupted";
        ctx.log(`${routeLabel(route)}沿线据点失守，贸易路线被切断！`, "warning");
      }
    }
  }
  function onIncomeCalculated(ctx, payload) {
    if (!payload || !payload.owner) return;
    const owner = payload.owner;
    if (!isVeniceOwner(ctx, owner)) return;
    syncGameRef6(ctx);
    const nation = ctx.ownerNation(owner);
    let bonus = 0;
    const ports = ownerShipyards(ctx, owner).length;
    let seaBonus = 0;
    let landBonus = 0;
    if (nation === "veniceCore") {
      if (ports >= 2) seaBonus = 1;
      if (ports >= 3) {
        seaBonus = 2;
        landBonus = 1;
      }
    }
    for (const route of ctx.getFacilitiesByType(TRADE_ROUTE.type)) {
      if (route.owner !== owner) continue;
      const st = refreshRoute(ctx, route);
      if (st === "removed") {
        ctx.removeFacility(route.id);
        continue;
      }
      if (st !== "active") continue;
      const d = route.data || {};
      let inc = d.income || 0;
      if (d.sea) inc += seaBonus;
      else inc += landBonus;
      bonus += inc;
    }
    for (const port of ctx.getFacilitiesByType(TRADING_PORT.type)) {
      if (port.owner !== owner) continue;
      const site = ctx.getSite(port.x, port.y);
      const stale = !site || site.kind !== "shipyard" || ctx.areAllies(ctx.game.teams, site.owner, owner);
      const occupied = !!ctx.getUnit(port.x, port.y) && !ctx.areAllies(ctx.game.teams, ctx.getUnit(port.x, port.y).owner, owner);
      if (stale || occupied) {
        ctx.removeFacility(port.id);
        ctx.log("中立商港失效：港口被己方收复或敌军重占，交易港关闭。", "warning");
        continue;
      }
      bonus += TRADING_PORT.income;
    }
    if (nation === "genoa") {
      const rec = state6.loans.get(owner);
      if (rec && rec.active) {
        payload.amount -= GENOA_LOAN.repayment;
        rec.repayLeft -= 1;
        if (rec.repayLeft <= 0) {
          rec.active = false;
          rec.cooldownLeft = GENOA_LOAN.cooldown;
          ctx.log("热那亚贷款已还清，进入信用冷却。", "gold");
        }
      } else if (rec && rec.cooldownLeft > 0) {
        rec.cooldownLeft -= 1;
      }
    }
    if (bonus > 0) {
      payload.amount += bonus;
    }
  }
  function onTurnStart6(ctx, payload) {
    const owner = payload && payload.owner;
    const initial = !!(payload && payload.initial);
    syncGameRef6(ctx);
    if (!isVeniceOwner(ctx, owner)) return;
    if (!initial && ctx.ownerNation(owner) === "veniceCore") {
      maybePortProduction(ctx, owner);
    }
    if (owner === "player") {
      requestRouteDecision(ctx, owner);
      requestLoanDecision(ctx, owner);
      requestMercenaryDecision(ctx, owner);
      requestTradingPortDecision(ctx, owner);
    }
  }
  function maybePortProduction(ctx, owner) {
    const shipyards = ownerShipyards(ctx, owner);
    if (shipyards.length < 2) return;
    const site = shipyards.find((s) => !ctx.getUnit(s.x, s.y));
    if (!site) return;
    const cost = Math.round((ctx.typeMeta("galley").cost || 30) * 0.5);
    if ((ctx.game.goldByOwner[owner] || 0) < cost) return;
    if (!ctx.spendGold(owner, cost)) return;
    const u = ctx.createUnit("galley", owner, site.x, site.y);
    ctx.events.emit("productionCompleted", { owner, unit: u, site, kind: "unit" });
    ctx.log(`海上垄断：${site.name || "港口"}（${site.x},${site.y}）以半价 ${cost} 金币加速生产了桨帆船。`, "gold");
    return u;
  }
  function requestRouteDecision(ctx, owner) {
    if (!isVeniceOwner(ctx, owner)) return null;
    if (routesOf(ctx, owner).length >= TRADE_ROUTE.maxRoutes) return null;
    const cands = routeCandidates(ctx, owner);
    if (!cands.length) return null;
    const options = [{ id: "none", label: "不建", description: "保留金币，不建立贸易路线。" }];
    cands.forEach((c, idx) => {
      const risk = c.path.filter((p) => {
        const u = ctx.getUnit(p.x, p.y);
        return u && !ctx.areAllies(ctx.game.teams, u.owner, owner);
      }).length;
      options.push({
        id: `route:${idx}`,
        label: `${c.a.label} ↔ ${c.b.label}`,
        description: `路径 ${c.path.length} 格${c.sea ? "（海路）" : ""}，每回合 +${c.income} 金币${risk ? `；路径上有 ${risk} 个敌军单位，存在被切断风险` : ""}`
      });
    });
    return ctx.requestDecision(`venRoute_${owner}`, {
      owner,
      title: "贸易路线",
      description: "选择两座己方节点建立贸易路线（无直接成本，但可被敌军切断；海路需己方海军保护）。",
      options,
      onResolve: (choiceId) => resolveRouteChoice(ctx, owner, cands, choiceId)
    });
  }
  function resolveRouteChoice(ctx, owner, cands, choiceId) {
    if (!choiceId || choiceId === "none") return false;
    const idx = parseInt(String(choiceId).slice("route:".length), 10);
    const cand = cands[idx];
    if (!cand) return false;
    return establishRoute(ctx, owner, cand.a, cand.b);
  }
  function canLoan(ctx, owner) {
    if (ctx.ownerNation(owner) !== "genoa") return false;
    const rec = state6.loans.get(owner);
    if (!rec) return true;
    return !rec.active && rec.cooldownLeft <= 0 && rec.totalTaken < GENOA_LOAN.maxLoans;
  }
  function requestLoanDecision(ctx, owner) {
    if (!canLoan(ctx, owner)) return null;
    const options = [
      { id: "none", label: "不贷", description: "维持现状，不借贷。" },
      { id: "loan", label: "贷款 15 金币", description: `立即 +${GENOA_LOAN.amount}，随后 ${GENOA_LOAN.repayTurns} 回合每回合 -${GENOA_LOAN.repayment}（净利息 ${GENOA_LOAN.repayment * GENOA_LOAN.repayTurns - GENOA_LOAN.amount}），还清后冷却 ${GENOA_LOAN.cooldown} 回合。` }
    ];
    return ctx.requestDecision(`venLoan_${owner}`, {
      owner,
      title: "热那亚银行信用",
      description: "花未来收入换当前现金——这是借贷/投资决策，请判断是否值得承担还款压力。",
      options,
      onResolve: (choiceId) => resolveLoanChoice(ctx, owner, choiceId)
    });
  }
  function resolveLoanChoice(ctx, owner, choiceId) {
    if (!choiceId || choiceId !== "loan") return false;
    if (!canLoan(ctx, owner)) return false;
    const rec = state6.loans.get(owner) || { active: false, repayLeft: 0, cooldownLeft: 0, totalTaken: 0 };
    ctx.addGold(owner, GENOA_LOAN.amount, "genoaLoan");
    rec.active = true;
    rec.repayLeft = GENOA_LOAN.repayTurns;
    rec.cooldownLeft = 0;
    rec.totalTaken += 1;
    state6.loans.set(owner, rec);
    ctx.log(`热那亚银行放贷：立即获得 ${GENOA_LOAN.amount} 金币，接下来 ${GENOA_LOAN.repayTurns} 回合每回合还款 ${GENOA_LOAN.repayment}。`, "gold");
    return true;
  }
  function requestMercenaryDecision(ctx, owner) {
    if (!isVeniceOwner(ctx, owner)) return null;
    if (state6.mercs.get(owner) && state6.mercs.get(owner).lastBuyTurn === ctx.game.turn) return null;
    const market = marketSite(ctx, owner);
    if (!market) return null;
    const options = [{ id: "none", label: "不购买", description: "保留金币，本回合不雇佣。" }];
    for (const o of MERCENARY.options) {
      const cost = Math.round(o.baseCost * MERCENARY.markup);
      options.push({ id: `merc:${o.id}`, label: `雇佣${o.label}（${cost}金币）`, description: o.desc });
    }
    return ctx.requestDecision(`venMerc_${owner}`, {
      owner,
      title: "雇佣兵市场",
      description: `按当前战场购买"临时解决方案"（部署于 ${market.name || "市场"}${market.x},${market.y}）。`,
      options,
      onResolve: (choiceId) => resolveMercChoice(ctx, owner, choiceId)
    });
  }
  function marketSite(ctx, owner) {
    return ctx.game.sites.find((s) => s.owner === owner && (s.kind === "city" || s.kind === "shipyard") && !ctx.getUnit(s.x, s.y));
  }
  function resolveMercChoice(ctx, owner, choiceId) {
    if (!choiceId || choiceId === "none") return false;
    if (!choiceId.startsWith("merc:")) return false;
    const type = choiceId.slice("merc:".length);
    const def = MERCENARY.options.find((o) => o.id === type);
    if (!def) return false;
    const market = marketSite(ctx, owner);
    if (!market) {
      ctx.log("市场格已被占用，雇佣兵无法部署。", "warning");
      return false;
    }
    const cost = Math.round(def.baseCost * MERCENARY.markup);
    if ((ctx.game.goldByOwner[owner] || 0) < cost) {
      ctx.log("金币不足，无法雇佣。", "warning");
      return false;
    }
    if (!ctx.spendGold(owner, cost)) return false;
    const u = ctx.createUnit(type, owner, market.x, market.y);
    state6.mercs.set(owner, { lastBuyTurn: ctx.game.turn });
    ctx.log(`雇佣兵市场：${typeLabel(ctx, type)}抵达（${market.x},${market.y}），花费 ${cost} 金币。`, "system");
    return !!u;
  }
  function eligiblePorts(ctx, owner) {
    if (ctx.ownerNation(owner) !== "ragusa") return [];
    const count = ctx.getFacilitiesByType(TRADING_PORT.type).filter((f) => f.owner === owner).length;
    if (count >= TRADING_PORT.maxPorts) return [];
    const out = [];
    for (const site of ctx.game.sites) {
      if (site.kind !== "shipyard") continue;
      if (site.owner === "neutral" || ctx.areAllies(ctx.game.teams, site.owner, owner)) continue;
      if (ctx.getFacilitiesByType(TRADING_PORT.type).some((f) => f.x === site.x && f.y === site.y)) continue;
      const caravan = ctx.game.units.find((u) => u.owner === owner && isCaravanType(u.type) && ctx.diagonalDist(u, site) <= TRADING_PORT.caravanRange);
      if (!caravan) continue;
      out.push(site);
    }
    return out;
  }
  function requestTradingPortDecision(ctx, owner) {
    const ports = eligiblePorts(ctx, owner);
    if (!ports.length) return null;
    const options = [{ id: "none", label: "不转化", description: "保留现状，不设立中立商港。" }];
    ports.slice(0, 3).forEach((site, idx) => {
      options.push({
        id: `port:${idx}`,
        label: `转化${site.name || "港口"}（${site.x},${site.y}）`,
        description: `中立商港：不完全占领，每回合 +${TRADING_PORT.income} 金币，并为拉古萨贸易网络提供连接。`
      });
    });
    return ctx.requestDecision(`venPort_${owner}`, {
      owner,
      title: "拉古萨中立商港",
      description: "拉古萨商队已抵达敌方港口，可将其变为交易港（不占领，可被敌军摧毁/重占）。",
      options,
      onResolve: (choiceId) => resolvePortChoice(ctx, owner, ports, choiceId)
    });
  }
  function resolvePortChoice(ctx, owner, ports, choiceId) {
    if (!choiceId || choiceId === "none") return false;
    const idx = parseInt(String(choiceId).slice("port:".length), 10);
    const site = ports[idx];
    if (!site) return false;
    const count = ctx.getFacilitiesByType(TRADING_PORT.type).filter((f) => f.owner === owner).length;
    if (count >= TRADING_PORT.maxPorts) return false;
    const caravan = ctx.game.units.find((u) => u.owner === owner && isCaravanType(u.type) && ctx.diagonalDist(u, site) <= TRADING_PORT.caravanRange);
    if (!caravan) {
      ctx.log("商队已离开，商港转化条件不再满足。", "warning");
      return false;
    }
    const fac = ctx.createFacility(TRADING_PORT.type, owner, site.x, site.y, {
      hp: TRADING_PORT.hp,
      duration: null,
      data: { siteId: site.id, establishedTurn: ctx.game.turn }
    });
    ctx.log(`中立商港建立：${site.name || "港口"}（${site.x},${site.y}）成为拉古萨交易港，每回合 +${TRADING_PORT.income} 金币。`, "system");
    return !!fac;
  }
  function onAfterAttack4(ctx, payload) {
    const { attacker, defender, result } = payload || {};
    if (!attacker || !defender || !result) return;
    const port = ctx.getFacilitiesByType(TRADING_PORT.type).find((f) => f.x === defender.x && f.y === defender.y);
    if (!port) return;
    if (ctx.areAllies(ctx.game.teams, attacker.owner, port.owner)) return;
    const chip = Math.max(1, Math.round((result.damage || 0) * TRADING_PORT.chipRatio));
    const remaining = ctx.damageFacility(port.id, chip);
    if (remaining <= 0) {
      ctx.log("中立商港在战火中被摧毁。", "warning");
    } else {
      ctx.log(`中立商港受到攻击受损（耐久 ${remaining}/${port.maxHp}）。`, "warning");
    }
  }

  // src/factions/venice/veniceRules.js
  var veniceSystem = {
    id: "venice",
    // 注册时调用一次：挂载 debug/test 入口（globalThis.__veniceDebug，浏览器控制台可用）
    init(ctx) {
      attachDebug5(ctx);
    },
    // turnStart：被动维护（海上垄断加速生产）+ 玩家决策请求（路线/借贷/雇佣兵/商港）
    onTurnStart(ctx, payload) {
      onTurnStart6(ctx, payload);
    },
    // beforeMove：敌军单位进入路线路径 → 立即标记切断（收入侧 incomeCalculated 复核）
    onBeforeMove(ctx, payload) {
      onBeforeMove4(ctx, payload);
    },
    // afterAttack：敌军攻击交易港格上单位 → 交易港按伤害比例掉耐久
    onAfterAttack(ctx, payload) {
      onAfterAttack4(ctx, payload);
    },
    // siteCaptured：敌军占领路线沿线据点 → 立即标记切断
    onSiteCaptured(ctx, payload) {
      onSiteCaptured(ctx, payload);
    },
    // incomeCalculated：贸易路线收益 + 海上垄断 + 交易港收入 + 热那亚还款
    onIncomeCalculated(ctx, payload) {
      onIncomeCalculated(ctx, payload);
    },
    // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
    reset() {
      resetForTests6();
    }
  };
  function attachDebug5(ctx) {
    const debug = {
      config: () => ({
        tradeRoute: { ...TRADE_ROUTE },
        tradingPort: { ...TRADING_PORT },
        genoaLoan: { ...GENOA_LOAN },
        mercenary: { ...MERCENARY },
        nodeSiteKinds: [...NODE_SITE_KINDS],
        tradeTypes: [...TRADE_TYPES2]
      }),
      // 当前所有贸易路线（facility 数据）
      routes: (owner) => ctx.getFacilitiesByType(TRADE_ROUTE.type).filter((f) => !owner || f.owner === owner).map((f) => ({ id: f.id, owner: f.owner, x: f.x, y: f.y, data: f.data })),
      // 当前所有中立商港
      ports: (owner) => ctx.getFacilitiesByType(TRADING_PORT.type).filter((f) => !owner || f.owner === owner).map((f) => ({ id: f.id, owner: f.owner, x: f.x, y: f.y, hp: f.hp, data: f.data })),
      // 模块级状态（借贷/雇佣兵冷却）
      state: () => debugState2(),
      // 查看某 owner 的贸易节点
      nodes: (owner) => collectNodes(ctx, owner),
      // 查看某 owner 的候选路线（含收益/海路/风险预览）
      candidates: (owner) => routeCandidates(ctx, owner).map((c) => ({ a: c.a.label, b: c.b.label, len: c.path.length, income: c.income, sea: c.sea })),
      // 为某 owner 请求全部威尼斯决策（返回请求数）
      requestForOwner: (owner) => {
        let n = 0;
        if (requestRouteDecision(ctx, owner)) n += 1;
        if (requestLoanDecision(ctx, owner)) n += 1;
        if (requestMercenaryDecision(ctx, owner)) n += 1;
        if (requestTradingPortDecision(ctx, owner)) n += 1;
        return n;
      },
      // 查看未决威尼斯决策（浏览器 UI 阶段前的手动测试入口）
      pending: (owner) => ctx.getPendingDecisions(owner || "player").filter((r) => String(r.id || "").startsWith("ven")).map((r) => ({ id: r.id, title: r.context.title, options: r.context.options.map((o) => o.id) })),
      resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId)
    };
    if (typeof globalThis !== "undefined") globalThis.__veniceDebug = debug;
    return debug;
  }

  // src/factions/mamluk/veterancy.js
  var VETERANCY = {
    // 特殊单位集合（适用 veterancy 的精锐单位）
    specialUnits: ["mamlukCavalry", "camelWarrior", "sultanGuard"],
    // 经验
    xpPerDamage: 1,
    // 造成伤害：每点 1 XP
    killXp: 10,
    // 击杀
    keyBattleXp: 5,
    // 关键战斗：击杀 level>=3 单位
    captureXp: 15,
    // 占领据点
    // 等级阈值
    v1Threshold: 30,
    v2Threshold: 70,
    v3Threshold: 120,
    eliteThreshold: 200,
    // Veteran 效果数值
    v1Atk: 1,
    // Veteran 1：攻击 +1
    v2Def: 1,
    // Veteran 2：防御 +1
    chargeBonus: 3,
    // Veteran 3 冲锋强化：满移动力攻击伤害 +3
    bloodlustHeal: 2,
    // Veteran 3 击杀回血：击杀后回血 +2
    swiftMove: 1,
    // Veteran 3 移动力强化：永久移动力 +1
    // 埃及（尼罗河补给）
    egyptHeal: 2,
    // 河边/城市附近每回合额外回血
    egyptXpMult: 1.5,
    // 河边经验获取 ×1.5
    egyptRange: 1,
    // "附近" = Chebyshev 距离 <=1（8 邻域含自身）
    // 叙利亚（长弓火线）
    syriaFocusBonus: 2,
    // 协同射击：第二个远程单位攻击同一目标伤害 +2
    // 巴格达（学术指令）
    tacticDef: 1,
    // 守势：范围内己方单位被攻击伤害 -1
    tacticOff: 2,
    // 进攻：范围内己方单位攻击伤害 +2
    tacticDrillHeal: 1,
    // 整军：范围内己方单位每回合回血 +1
    mobilityPrepay: 1
    // 机动：每回合首次移动消耗 -1（beforeMove 预支）
  };
  var MORALE = {
    init: 50,
    // 初始士气（0~100）
    high: 70,
    // 高士气阈值
    low: 30,
    // 低士气阈值
    killGain: 1,
    // 精锐击杀 +1
    lostPenalty: 3,
    // 精锐死亡 -3
    highXpMult: 1.5,
    // 高士气：精锐经验获取 ×1.5
    cavalryFirstHitBonus: 2,
    // 高士气：骑兵每回合首次攻击伤害 +2
    greenPenalty: 1
    // 低士气：新生兵攻击 -1
  };
  var ELITE_LOST = {
    gold: 15,
    // 精锐死亡金币损失
    moralePenalty: 3
    // 精锐死亡士气损失（与 MORALE.lostPenalty 一致）
  };
  var state7 = {
    lastGameRef: null,
    // 换局检测
    veterancy: /* @__PURE__ */ new Map(),
    // unitId -> {unitId, xp, veteranLevel, kills, lastPromotionTurn, promotion, elite, dead}
    morale: /* @__PURE__ */ new Map(),
    // owner -> number（0~100，懒初始化 50）
    fireLine: /* @__PURE__ */ new Map(),
    // defenderId -> {lastAttackerId, count}（叙利亚协同射击，回合内）
    cavalryFirstHit: /* @__PURE__ */ new Set(),
    // unitId：本回合已享受高士气骑兵首攻（每回合重置）
    mobilityUsed: /* @__PURE__ */ new Set(),
    // unitId：本回合已享受机动预支（每回合重置）
    v3Requested: /* @__PURE__ */ new Set(),
    // unitId：已请求过 Veteran 3 晋升决策（去重）
    tactic: /* @__PURE__ */ new Map()
    // owner -> 'defensive'|'offensive'|'mobility'|'drill'（巴格达学术指令）
  };
  function resetState7() {
    state7.veterancy.clear();
    state7.morale.clear();
    state7.fireLine.clear();
    state7.cavalryFirstHit.clear();
    state7.mobilityUsed.clear();
    state7.v3Requested.clear();
    state7.tactic.clear();
  }
  function syncGameRef7(ctx) {
    if (ctx && ctx.game !== state7.lastGameRef) {
      resetState7();
      state7.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests7() {
    resetState7();
    state7.lastGameRef = null;
  }
  function isMamlukOwner(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "mamluk";
  }
  function isSpecialUnit(ctx, unit) {
    return !!unit && VETERANCY.specialUnits.includes(unit.type);
  }
  function ensureRecord(unit) {
    let rec = state7.veterancy.get(unit.id);
    if (!rec) {
      rec = {
        unitId: unit.id,
        xp: 0,
        veteranLevel: 0,
        kills: 0,
        lastPromotionTurn: 0,
        promotion: null,
        // 'charge' | 'bloodlust' | 'swift'
        elite: false,
        dead: false
      };
      state7.veterancy.set(unit.id, rec);
    }
    return rec;
  }
  function getMorale(owner) {
    if (!state7.morale.has(owner)) state7.morale.set(owner, MORALE.init);
    return state7.morale.get(owner);
  }
  function adjustMorale(owner, delta) {
    const v = Math.max(0, Math.min(100, getMorale(owner) + delta));
    state7.morale.set(owner, v);
    return v;
  }
  function nearNile(ctx, unit) {
    const g = ctx.game;
    if (!g || !g.terrain || !unit) return false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = unit.x + dx;
        const y = unit.y + dy;
        if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
        if (g.terrain[y] && g.terrain[y][x] === "water") return true;
      }
    }
    for (const s of g.sites || []) {
      if (s.kind !== "city") continue;
      if (Math.abs(s.x - unit.x) <= VETERANCY.egyptRange && Math.abs(s.y - unit.y) <= VETERANCY.egyptRange && ctx.areAllies(g.teams, s.owner, unit.owner)) {
        return true;
      }
    }
    return false;
  }
  function hasScholarNearby(ctx, unit) {
    if (!unit) return false;
    const range = ctx.ownerNation(unit.owner) === "baghdad" ? 3 : 2;
    return ctx.game.units.some((u) => u.owner === unit.owner && u.type === "caliphScholar" && Math.abs(u.x - unit.x) <= range && Math.abs(u.y - unit.y) <= range);
  }
  function checkLevel(ctx, unit, rec) {
    if (rec.veteranLevel < 1 && rec.xp >= VETERANCY.v1Threshold) {
      rec.veteranLevel = 1;
      rec.lastPromotionTurn = ctx.game.turn || 0;
      ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 1（攻击 +1）。`, "system");
    }
    if (rec.veteranLevel < 2 && rec.xp >= VETERANCY.v2Threshold) {
      rec.veteranLevel = 2;
      rec.lastPromotionTurn = ctx.game.turn || 0;
      ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 2（防御 +1）。`, "system");
    }
    if (rec.veteranLevel === 2 && rec.xp >= VETERANCY.v3Threshold && !rec.promotion) {
      if (unit.owner === "player") {
        if (!state7.v3Requested.has(unit.id)) {
          requestV3Decision(ctx, unit, rec);
        }
      }
    }
    if (rec.veteranLevel >= 3 && !rec.elite && rec.xp >= VETERANCY.eliteThreshold) {
      rec.elite = true;
      rec.lastPromotionTurn = ctx.game.turn || 0;
      ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Elite——马穆鲁克精英！`, "system");
    }
  }
  function addXp(ctx, unit, amount, reason) {
    if (!isSpecialUnit(ctx, unit)) return;
    syncGameRef7(ctx);
    const rec = ensureRecord(unit);
    if (rec.dead) return;
    let xp = amount;
    if (ctx.ownerNation(unit.owner) === "egypt" && nearNile(ctx, unit)) {
      xp = Math.round(xp * VETERANCY.egyptXpMult);
    }
    if (getMorale(unit.owner) >= MORALE.high) {
      xp = Math.round(xp * MORALE.highXpMult);
    }
    rec.xp += xp;
    if (reason === "kill") rec.kills += 1;
    checkLevel(ctx, unit, rec);
  }
  var V3_OPTION_LABEL = { charge: "冲锋强化", bloodlust: "击杀回血", swift: "移动力强化" };
  function requestV3Decision(ctx, unit, rec) {
    state7.v3Requested.add(unit.id);
    const options = [
      { id: "charge", label: "冲锋强化", description: "满移动力发起攻击时伤害 +3。" },
      { id: "bloodlust", label: "击杀回血", description: "击杀单位后回复 2 点生命。" },
      { id: "swift", label: "移动力强化", description: "永久移动力 +1。" }
    ];
    return ctx.requestDecision(`mlV3_${unit.id}`, {
      owner: unit.owner,
      unitId: unit.id,
      title: "精锐晋升",
      description: `${ctx.typeMeta(unit.type).name}达到 Veteran 3，选择晋升方向。`,
      options,
      onResolve: (choiceId) => {
        applyV3Promotion(ctx, unit, choiceId);
      }
    });
  }
  function applyV3Promotion(ctx, unit, choiceId) {
    const rec = state7.veterancy.get(unit.id);
    if (!rec || rec.dead) return false;
    if (!["charge", "bloodlust", "swift"].includes(choiceId)) return false;
    rec.promotion = choiceId;
    rec.veteranLevel = 3;
    rec.lastPromotionTurn = ctx.game.turn || 0;
    if (choiceId === "swift") {
      unit.baseMove += VETERANCY.swiftMove;
      unit.maxMove += VETERANCY.swiftMove;
      unit.move += VETERANCY.swiftMove;
    }
    ctx.log(`${ctx.typeMeta(unit.type).name}晋升为 Veteran 3（${V3_OPTION_LABEL[choiceId]}）。`, "system");
    return true;
  }
  var TACTIC_OPTIONS = [
    { id: "defensive", label: "守势", description: "学者范围内己方单位被攻击时伤害 -1。" },
    { id: "offensive", label: "进攻", description: "学者范围内己方单位攻击时伤害 +2。" },
    { id: "mobility", label: "机动", description: "学者范围内己方单位每回合首次移动消耗 -1。" },
    { id: "drill", label: "整军", description: "学者范围内己方单位每回合恢复 1 点生命。" }
  ];
  function requestTacticDecision(ctx, owner) {
    if (ctx.ownerNation(owner) !== "baghdad") return null;
    const scholar = ctx.game.units.find((u) => u.owner === owner && u.type === "caliphScholar");
    if (!scholar) return null;
    return ctx.requestDecision(`mlTactic_${owner}_${ctx.game.turn || 0}`, {
      owner,
      unitId: scholar.id,
      title: "学术指令",
      description: "哈里发学者每回合可选择一种战术，替代固定光环。",
      options: TACTIC_OPTIONS,
      onResolve: (choiceId) => {
        if (TACTIC_OPTIONS.some((o) => o.id === choiceId)) {
          state7.tactic.set(owner, choiceId);
          ctx.log(`巴格达发布学术指令：${TACTIC_OPTIONS.find((o) => o.id === choiceId).label}。`, "system");
        }
      }
    });
  }
  function onAfterAttack5(ctx, payload) {
    const { attacker, defender, result, defenderDead, attackerDead } = payload || {};
    if (!attacker || !defender) return;
    syncGameRef7(ctx);
    const atkIsMamluk = isMamlukOwner(ctx, attacker.owner);
    const defIsMamluk = isMamlukOwner(ctx, defender.owner);
    if (!atkIsMamluk && !defIsMamluk) return;
    if (atkIsMamluk && isSpecialUnit(ctx, attacker)) {
      const damage = result && result.damage || 0;
      if (damage > 0) addXp(ctx, attacker, damage * VETERANCY.xpPerDamage, "damage");
      if (defenderDead) {
        addXp(ctx, attacker, VETERANCY.killXp, "kill");
        const dmeta = ctx.typeMeta(defender.type);
        if (dmeta && dmeta.level >= 3) addXp(ctx, attacker, VETERANCY.keyBattleXp, "keyBattle");
        const rec = state7.veterancy.get(attacker.id);
        if (!attackerDead && rec && !rec.dead && rec.promotion === "bloodlust") {
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + VETERANCY.bloodlustHeal);
        }
        if (rec && !rec.dead && rec.veteranLevel >= 1) {
          adjustMorale(attacker.owner, MORALE.killGain);
        }
      }
    }
    if (defIsMamluk && defenderDead) {
      eliteLost(ctx, defender);
    }
    if (atkIsMamluk && attackerDead) {
      eliteLost(ctx, attacker);
    }
  }
  function eliteLost(ctx, unit) {
    const rec = state7.veterancy.get(unit.id);
    if (!rec || rec.dead || rec.veteranLevel < 3) return;
    const paid = ctx.spendGold(unit.owner, ELITE_LOST.gold);
    adjustMorale(unit.owner, -ELITE_LOST.moralePenalty);
    rec.xp = 0;
    rec.veteranLevel = 0;
    rec.dead = true;
    ctx.log(
      `${ctx.typeMeta(unit.type).name}（精锐）阵亡：损失${ELITE_LOST.gold}金币${paid ? "" : "（金币不足，实际未扣）"}，军团士气 -${ELITE_LOST.moralePenalty}，累计经验清零。`,
      "warning"
    );
  }
  function onSiteCaptured2(ctx, payload) {
    const { unit } = payload || {};
    if (!unit) return;
    syncGameRef7(ctx);
    if (!isMamlukOwner(ctx, unit.owner)) return;
    addXp(ctx, unit, VETERANCY.captureXp, "capture");
  }
  function onBeforeAttack4(ctx, payload) {
    const { attacker, defender, result, isCounter } = payload || {};
    if (!attacker || !defender || !result || !result.damage) return;
    syncGameRef7(ctx);
    const atkMamluk = isMamlukOwner(ctx, attacker.owner);
    const defMamluk = isMamlukOwner(ctx, defender.owner);
    if (!atkMamluk && !defMamluk) return;
    if (atkMamluk) {
      const rec = state7.veterancy.get(attacker.id);
      const morale = getMorale(attacker.owner);
      if (morale <= MORALE.low && (!rec || rec.dead || rec.veteranLevel === 0)) {
        result.damage = Math.max(1, result.damage - MORALE.greenPenalty);
      }
      if (rec && !rec.dead && rec.veteranLevel >= 1) {
        result.damage += VETERANCY.v1Atk;
      }
      if (rec && !rec.dead && rec.promotion === "charge" && attacker.move === attacker.maxMove) {
        result.damage += VETERANCY.chargeBonus;
      }
      if (morale >= MORALE.high && isSpecialUnit(ctx, attacker) && !state7.cavalryFirstHit.has(attacker.id)) {
        result.damage += MORALE.cavalryFirstHitBonus;
        state7.cavalryFirstHit.add(attacker.id);
        ctx.log(`${ctx.typeMeta(attacker.type).name}趁高涨士气发起猛攻，伤害 +${MORALE.cavalryFirstHitBonus}。`, "battle");
      }
      if (ctx.ownerNation(attacker.owner) === "baghdad" && state7.tactic.get(attacker.owner) === "offensive" && hasScholarNearby(ctx, attacker)) {
        result.damage += VETERANCY.tacticOff;
      }
      if (ctx.ownerNation(attacker.owner) === "syria") {
        applySyriaFocus(ctx, attacker, defender, result);
      }
    }
    if (defMamluk) {
      const drec = state7.veterancy.get(defender.id);
      if (drec && !drec.dead && drec.veteranLevel >= 2) {
        result.damage = Math.max(1, result.damage - VETERANCY.v2Def);
      }
      if (ctx.ownerNation(defender.owner) === "baghdad" && state7.tactic.get(defender.owner) === "defensive" && hasScholarNearby(ctx, defender)) {
        result.damage = Math.max(1, result.damage - VETERANCY.tacticDef);
      }
    }
  }
  function applySyriaFocus(ctx, attacker, defender, result) {
    const meta = ctx.typeMeta(attacker.type);
    if (!meta || meta.range <= 1) return;
    const prev = state7.fireLine.get(defender.id);
    if (prev && prev.lastAttackerId !== attacker.id) {
      result.damage += VETERANCY.syriaFocusBonus;
      prev.count += 1;
      prev.lastAttackerId = attacker.id;
      ctx.log(`${ctx.typeMeta(attacker.type).name}与友军协同射击，伤害 +${VETERANCY.syriaFocusBonus}。`, "battle");
    } else {
      state7.fireLine.set(defender.id, { lastAttackerId: attacker.id, count: prev ? prev.count : 1 });
    }
  }
  function onBeforeMove5(ctx, payload) {
    const { unit, to } = payload || {};
    if (!unit || !to) return;
    if (unit.move <= 0) return;
    syncGameRef7(ctx);
    if (ctx.ownerNation(unit.owner) !== "baghdad") return;
    if (state7.tactic.get(unit.owner) !== "mobility") return;
    if (state7.mobilityUsed.has(unit.id)) return;
    if (!hasScholarNearby(ctx, unit)) return;
    unit.move += VETERANCY.mobilityPrepay;
    state7.mobilityUsed.add(unit.id);
  }
  function onTurnStart7(ctx, payload) {
    const owner = payload && payload.owner;
    syncGameRef7(ctx);
    state7.cavalryFirstHit.clear();
    state7.fireLine.clear();
    state7.mobilityUsed.clear();
    if (!isMamlukOwner(ctx, owner)) return;
    if (ctx.ownerNation(owner) === "egypt") {
      for (const u of ctx.game.units) {
        if (u.owner !== owner || u.hp >= u.maxHp) continue;
        if (!isSpecialUnit(ctx, u)) continue;
        if (nearNile(ctx, u)) {
          u.hp = Math.min(u.maxHp, u.hp + VETERANCY.egyptHeal);
          ctx.log(`${ctx.typeMeta(u.type).name}获得尼罗河补给，回复 ${VETERANCY.egyptHeal} 点生命。`, "battle");
        }
      }
    }
    if (ctx.ownerNation(owner) === "baghdad" && state7.tactic.get(owner) === "drill") {
      for (const u of ctx.game.units) {
        if (u.owner !== owner || u.hp >= u.maxHp) continue;
        if (hasScholarNearby(ctx, u)) {
          u.hp = Math.min(u.maxHp, u.hp + VETERANCY.tacticDrillHeal);
        }
      }
    }
    if (owner === "player") {
      for (const u of ctx.game.units) {
        if (u.owner !== owner) continue;
        const rec = state7.veterancy.get(u.id);
        if (rec && !rec.dead && rec.veteranLevel === 2 && rec.xp >= VETERANCY.v3Threshold && !rec.promotion && !state7.v3Requested.has(u.id)) {
          requestV3Decision(ctx, u, rec);
        }
      }
      requestTacticDecision(ctx, owner);
    }
  }
  function attachDebug6(ctx) {
    const debug = {
      config: () => ({
        veterancy: { ...VETERANCY },
        morale: { ...MORALE },
        eliteLost: { ...ELITE_LOST },
        specialUnits: [...VETERANCY.specialUnits]
      }),
      // 当前全部精锐档案（可选按 owner 过滤）
      veterancy: (owner) => {
        const out = [];
        for (const [id, r] of state7.veterancy) {
          const u = ctx.game.units.find((x) => x.id === id);
          if (owner && (!u || u.owner !== owner)) continue;
          out.push({ ...r, type: u ? u.type : null, x: u ? u.x : null, y: u ? u.y : null });
        }
        return out;
      },
      morale: (owner) => owner ? { [owner]: getMorale(owner) } : Object.fromEntries([...state7.morale.entries()]),
      tactic: (owner) => owner ? { [owner]: state7.tactic.get(owner) || null } : Object.fromEntries([...state7.tactic.entries()]),
      state: () => ({
        fireLine: [...state7.fireLine.entries()].map(([id, f]) => ({ defender: id, ...f })),
        cavalryFirstHit: [...state7.cavalryFirstHit],
        mobilityUsed: [...state7.mobilityUsed],
        v3Requested: [...state7.v3Requested]
      }),
      // 手动为某单位请求 V3 晋升决策（UI 阶段前的测试入口）
      requestV3: (unitId) => {
        const u = ctx.game.units.find((x) => x.id === unitId);
        if (!u) return null;
        const rec = state7.veterancy.get(unitId);
        if (!rec) return null;
        return requestV3Decision(ctx, u, rec);
      },
      // 手动为某 owner 请求学术指令决策
      requestTactic: (owner) => requestTacticDecision(ctx, owner),
      // 查看未决马穆鲁克决策（浏览器 UI 阶段前的手动测试入口）
      pending: (owner) => ctx.getPendingDecisions(owner || "player").filter((r) => String(r.id || "").startsWith("ml")).map((r) => ({ id: r.id, title: r.context.title, options: r.context.options.map((o) => o.id) })),
      resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId),
      reset: () => resetForTests7()
    };
    if (typeof globalThis !== "undefined") globalThis.__mamlukDebug = debug;
    return debug;
  }

  // src/factions/mamluk/mamlukRules.js
  var mamlukSystem = {
    id: "mamluk",
    // 注册时调用一次：挂载 debug/test 入口（globalThis.__mamlukDebug，浏览器控制台可用）
    init(ctx) {
      attachDebug6(ctx);
    },
    // turnStart：回合级标记重置 + 埃及尼罗河补给回血 + 巴格达整军回血 +
    //            玩家决策请求（Veteran 3 晋升兜底 / 学者学术指令）
    onTurnStart(ctx, payload) {
      onTurnStart7(ctx, payload);
    },
    // beforeMove：巴格达机动战术（范围内单位每回合首次移动消耗 -1，预支 +1）
    onBeforeMove(ctx, payload) {
      onBeforeMove5(ctx, payload);
    },
    // beforeAttack：士气影响 + Veteran 1/2/3 效果 + 巴格达战术 + 叙利亚协同射击（只改 result.damage）
    onBeforeAttack(ctx, payload) {
      onBeforeAttack4(ctx, payload);
    },
    // afterAttack：攻击方经验/击杀回血/士气 + 双方精锐死亡惩罚（eliteLost）
    onAfterAttack(ctx, payload) {
      onAfterAttack5(ctx, payload);
    },
    // siteCaptured：精锐占领据点 → 经验
    onSiteCaptured(ctx, payload) {
      onSiteCaptured2(ctx, payload);
    },
    // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
    reset() {
      resetForTests7();
    }
  };

  // src/factions/ming/fireZone.js
  var FIREZONE = {
    type: "fireZone",
    // facility type 字符串（core 不枚举，联盟系统定义）
    duration: 1,
    // 持续 1 回合
    damage: 2,
    // 进入伤害（不致死，最低保留 1 HP）
    crossfireBonus: 4,
    // ≥2 个火力区覆盖 → 受击伤害 +4（"大幅降低防御"）
    crossfireMin: 2,
    // 触发 crossfire 所需的最小火力区数
    watchtowerRange: 2,
    // 瞭望塔校正范围（Chebyshev）
    watchtowerFzBonus: 1,
    // 瞭望塔范围内 fireZone 进入伤害 +1（2→3）
    watchtowerXfBonus: 1
    // 瞭望塔范围内 crossfire 加成 +1（4→5）
  };
  var state8 = {
    lastGameRef: null
    // 换局检测
  };
  function resetState8() {
  }
  function syncGameRef8(ctx) {
    if (ctx && ctx.game !== state8.lastGameRef) {
      resetState8();
      state8.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests8() {
    resetState8();
    state8.lastGameRef = null;
  }
  function isMingOwner(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "ming";
  }
  function isMingRemoteUnit(ctx, unit) {
    if (!unit) return false;
    if (!isMingOwner(ctx, unit.owner)) return false;
    const meta = ctx.typeMeta(unit.type);
    return !!meta && meta.range > 1;
  }
  function inRange(a, b, range) {
    return Math.abs(a.x - b.x) <= range && Math.abs(a.y - b.y) <= range;
  }
  function fireZonesAt(ctx, x, y) {
    return ctx.getFacilitiesByType(FIREZONE.type).filter((f) => f.x === x && f.y === y);
  }
  function watchtowerCovers(ctx, x, y) {
    return ctx.getFacilitiesByType("watchtower").some((f) => isMingOwner(ctx, f.owner) && inRange(f, { x, y }, FIREZONE.watchtowerRange));
  }
  function entryDamageAt(ctx, unit, x, y) {
    let best = 0;
    for (const fz of fireZonesAt(ctx, x, y)) {
      if (ctx.areAllies(ctx.game.teams, unit.owner, fz.owner)) continue;
      let dmg = FIREZONE.damage;
      if (watchtowerCovers(ctx, fz.x, fz.y)) dmg += FIREZONE.watchtowerFzBonus;
      if (dmg > best) best = dmg;
    }
    return best;
  }
  function crossfireBonusAt(ctx, unit, x, y) {
    const hostile = fireZonesAt(ctx, x, y).filter((fz) => !ctx.areAllies(ctx.game.teams, unit.owner, fz.owner));
    if (hostile.length < FIREZONE.crossfireMin) return 0;
    let bonus = FIREZONE.crossfireBonus;
    if (watchtowerCovers(ctx, x, y)) bonus += FIREZONE.watchtowerXfBonus;
    return bonus;
  }
  function onAfterAttack6(ctx, payload) {
    const { attacker, defender } = payload || {};
    if (!attacker || !defender) return;
    syncGameRef8(ctx);
    if (!isMingRemoteUnit(ctx, attacker)) return;
    if (ctx.areAllies(ctx.game.teams, attacker.owner, defender.owner)) return;
    const dup = fireZonesAt(ctx, defender.x, defender.y).some((f) => f.data.sourceUnitId === attacker.id);
    if (dup) return;
    ctx.createFacility(FIREZONE.type, attacker.owner, defender.x, defender.y, {
      hp: 1,
      duration: FIREZONE.duration,
      data: {
        owner: attacker.owner,
        sourceUnitId: attacker.id,
        x: defender.x,
        y: defender.y,
        damage: FIREZONE.damage,
        type: "fire"
      }
    });
    ctx.log(`${ctx.typeMeta(attacker.type).name}在（${defender.x},${defender.y}）布下火力区，敌军进入将遭到火力打击。`, "battle");
  }
  function onBeforeMove6(ctx, payload) {
    const { unit, to } = payload || {};
    if (!unit || !to) return;
    if (unit.move <= 0) return;
    syncGameRef8(ctx);
    const dmg = entryDamageAt(ctx, unit, to.x, to.y);
    if (dmg <= 0) return;
    unit.hp = Math.max(1, unit.hp - dmg);
    ctx.log(`${ctx.typeMeta(unit.type).name}闯入火力区，受到 ${dmg} 点火力打击（剩余 ${unit.hp} HP）。`, "battle");
  }
  function onBeforeAttack5(ctx, payload) {
    const { defender, result } = payload || {};
    if (!defender || !result || !result.damage) return;
    syncGameRef8(ctx);
    const bonus = crossfireBonusAt(ctx, defender, defender.x, defender.y);
    if (bonus <= 0) return;
    result.damage += bonus;
    ctx.log(`${ctx.typeMeta(defender.type).name}陷入交叉火力（${crossfireCoverCount(ctx, defender)} 个火力区），防御被压制，受击伤害 +${bonus}。`, "battle");
  }
  function crossfireCoverCount(ctx, defender) {
    return fireZonesAt(ctx, defender.x, defender.y).filter((fz) => !ctx.areAllies(ctx.game.teams, defender.owner, fz.owner)).length;
  }
  function onTurnStart8(ctx, payload) {
    const owner = payload && payload.owner;
    syncGameRef8(ctx);
    if (!isMingOwner(ctx, owner)) return;
    ctx.expireFacilities(owner);
  }
  function attachDebug7(ctx) {
    const debug = {
      config: () => ({ ...FIREZONE }),
      zones: () => ctx.getFacilitiesByType(FIREZONE.type).map((f) => ({ id: f.id, owner: f.owner, sourceUnitId: f.data.sourceUnitId, x: f.x, y: f.y, damage: f.data.damage, duration: f.duration })),
      entryDamage: (unit, x, y) => entryDamageAt(ctx, unit, x, y),
      crossfire: (unit, x, y) => crossfireBonusAt(ctx, unit, x, y)
    };
    if (typeof globalThis !== "undefined") globalThis.__mingDebug = { ...globalThis.__mingDebug || {}, fireZone: debug };
    return debug;
  }

  // src/factions/ming/engineering.js
  var ENGINEERING = {
    turret: {
      id: "turret",
      label: "炮台",
      cost: 20,
      hp: 10,
      duration: null,
      range: 2,
      atk: 2,
      def: 1,
      desc: "每回合对范围内敌方单位造成 2 点火力打击；范围内己方单位被攻击时伤害 -1"
    },
    watchtower: {
      id: "watchtower",
      label: "瞭望塔",
      cost: 14,
      hp: 6,
      duration: null,
      range: 2,
      desc: "范围内火力区进入伤害 +1、交叉火力加成 +1（视野效果降级，见已知问题）"
    },
    supplyDepot: {
      id: "supplyDepot",
      label: "补给站",
      cost: 18,
      hp: 8,
      duration: null,
      range: 2,
      heal: 2,
      desc: "每回合为范围内己方单位回复 2 点生命"
    },
    mingTrench: {
      id: "mingTrench",
      label: "壕沟",
      cost: 16,
      hp: 12,
      duration: null,
      desc: "壕沟上的单位免受冲锋加成（最多减免 2 点）"
    },
    bridge: {
      id: "bridge",
      label: "临时桥",
      cost: 12,
      hp: 10,
      duration: 3,
      moveCostMod: -1,
      desc: "桥格地形移动成本 -1（持续 3 回合，敌我单位均可利用）"
    }
  };
  var state9 = {
    lastGameRef: null,
    // 换局检测
    deployedThisTurn: /* @__PURE__ */ new Set()
    // unitId：本回合已请求过部署决策（去重）
  };
  function resetState9() {
    state9.deployedThisTurn.clear();
  }
  function syncGameRef9(ctx) {
    if (ctx && ctx.game !== state9.lastGameRef) {
      resetState9();
      state9.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests9() {
    resetState9();
    state9.lastGameRef = null;
  }
  function isMingOwner2(ctx, owner) {
    return !!owner && ctx.ownerFaction(owner) === "ming";
  }
  function isEngineerUnit(ctx, unit) {
    return !!unit && isMingOwner2(ctx, unit.owner) && unit.type === "worksEngineer";
  }
  function inRange2(a, b, range) {
    return Math.abs(a.x - b.x) <= range && Math.abs(a.y - b.y) <= range;
  }
  function isLandCell3(ctx, x, y) {
    const g = ctx.game;
    if (!g || x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
    const t = g.terrain[y] && g.terrain[y][x];
    return !!t && t !== "water" && t !== "mountain";
  }
  function canBuildAt2(ctx, unit, type) {
    const def = ENGINEERING[type];
    if (!def) return false;
    if (!isEngineerUnit(ctx, unit)) return false;
    if (!isLandCell3(ctx, unit.x, unit.y)) return false;
    if (ctx.getSite(unit.x, unit.y)) return false;
    const existing = ctx.getFacilityAt(unit.x, unit.y);
    if (existing && existing.type !== "fireZone") return false;
    if ((ctx.game.goldByOwner[unit.owner] || 0) < def.cost) return false;
    return true;
  }
  function deployOptionsFor(ctx, unit) {
    const options = [{ id: "none", label: "不建", description: "保留金币与本回合行动，不部署设施。" }];
    if (!isEngineerUnit(ctx, unit)) return options;
    const gold = ctx.game.goldByOwner[unit.owner] || 0;
    for (const key of ["turret", "watchtower", "supplyDepot", "mingTrench", "bridge"]) {
      const d = ENGINEERING[key];
      if (gold >= d.cost) {
        options.push({ id: d.id, label: `部署${d.label}`, description: `${d.desc}（${d.cost}金币，${d.duration == null ? "持久" : d.duration + "回合"}）` });
      }
    }
    return options;
  }
  function requestDeployDecision(ctx, unit) {
    if (!unit || !isEngineerUnit(ctx, unit)) return null;
    if (state9.deployedThisTurn.has(unit.id)) return null;
    if (!isLandCell3(ctx, unit.x, unit.y)) return null;
    if (ctx.getSite(unit.x, unit.y)) return null;
    const existing = ctx.getFacilityAt(unit.x, unit.y);
    if (existing && existing.type !== "fireZone") return null;
    if ((ctx.game.goldByOwner[unit.owner] || 0) < ENGINEERING.turret.cost) return null;
    const options = deployOptionsFor(ctx, unit);
    if (options.length <= 1) return null;
    state9.deployedThisTurn.add(unit.id);
    const owner = unit.owner;
    const unitId = unit.id;
    const decisionId = `mgEng_${unitId}`;
    return ctx.requestDecision(decisionId, {
      owner,
      unitId,
      title: "工程部署",
      description: `${ctx.typeMeta(unit.type).name}可在此格部署工程设施（消耗本回合行动并花费金币）。`,
      options,
      onResolve: (choiceId) => {
        resolveDeploy(ctx, owner, unitId, choiceId);
      }
    });
  }
  function resolveDeploy(ctx, owner, unitId, choiceId) {
    const unit = ctx.game.units.find((u) => u.id === unitId);
    if (!unit || unit.owner !== owner) return false;
    if (!choiceId || choiceId === "none") return false;
    const def = ENGINEERING[choiceId];
    if (!def) return false;
    if (!canBuildAt2(ctx, unit, choiceId)) {
      ctx.log(`${ctx.typeMeta(unit.type).name}无法在此格部署${def.label}（条件不再满足）。`, "warning");
      return false;
    }
    if (!ctx.spendGold(owner, def.cost)) return false;
    ctx.createFacility(choiceId, owner, unit.x, unit.y, {
      hp: def.hp,
      duration: def.duration,
      data: { ...typeof def.moveCostMod === "number" ? { moveCostMod: def.moveCostMod } : {} }
    });
    unit.acted = true;
    unit.move = 0;
    unit.hasAttacked = true;
    ctx.log(`${ctx.typeMeta(unit.type).name}在（${unit.x},${unit.y}）部署了${def.label}。`, "system");
    return true;
  }
  var FACILITY_CHIP_RATIO2 = 0.5;
  function onAfterAttack7(ctx, payload) {
    const { attacker, defender, result } = payload || {};
    if (!attacker || !defender || !result) return;
    if (isMingOwner2(ctx, attacker.owner)) return;
    const fac = ctx.getFacilityAt(defender.x, defender.y);
    if (!fac || !isMingOwner2(ctx, fac.owner)) return;
    if (fac.type === "fireZone") return;
    if (ctx.areAllies(ctx.game.teams, attacker.owner, fac.owner)) return;
    const chip = Math.max(1, Math.round((result.damage || 0) * FACILITY_CHIP_RATIO2));
    const remaining = ctx.damageFacility(fac.id, chip);
    const label = ENGINEERING[fac.type]?.label || fac.type;
    if (remaining <= 0) {
      ctx.log(`${label}在战火中被摧毁。`, "warning");
    } else {
      ctx.log(`${label}受到攻击受损（耐久 ${remaining}/${fac.maxHp}）。`, "warning");
    }
  }
  function onTurnStart9(ctx, payload) {
    const owner = payload && payload.owner;
    const initial = !!(payload && payload.initial);
    syncGameRef9(ctx);
    if (!isMingOwner2(ctx, owner)) return;
    state9.deployedThisTurn.clear();
    if (!initial) {
      const facilities2 = ctx.getFacilitiesByOwner(owner);
      for (const f of facilities2) {
        if (f.type !== "turret") continue;
        const def = ENGINEERING.turret;
        for (const u of ctx.game.units) {
          if (u.owner === owner) continue;
          if (ctx.areAllies(ctx.game.teams, u.owner, owner)) continue;
          if (!inRange2(u, f, def.range)) continue;
          if (u.hp <= 1) continue;
          u.hp = Math.max(1, u.hp - def.atk);
          ctx.log(`${def.label}轰击${ctx.typeMeta(u.type).name}，造成 ${def.atk} 点伤害（剩余 ${u.hp} HP）。`, "battle");
        }
      }
      for (const f of facilities2) {
        if (f.type !== "supplyDepot") continue;
        const def = ENGINEERING.supplyDepot;
        for (const u of ctx.game.units) {
          if (u.owner !== owner) continue;
          if (u.hp >= u.maxHp) continue;
          if (!inRange2(u, f, def.range)) continue;
          u.hp = Math.min(u.maxHp, u.hp + def.heal);
          ctx.log(`${def.label}为${ctx.typeMeta(u.type).name}补给，回复 ${def.heal} 点生命。`, "battle");
        }
      }
    }
    if (owner === "player") {
      for (const unit of ctx.game.units) {
        if (unit.owner !== owner) continue;
        requestDeployDecision(ctx, unit);
      }
    }
  }
  function onBeforeAttack6(ctx, payload) {
    const { attacker, defender, fromCell, toCell, result, isCounter } = payload || {};
    if (!attacker || !defender || !result || !result.damage) return;
    syncGameRef9(ctx);
    const fac = ctx.getFacilityAt(defender.x, defender.y);
    if (fac && fac.type === "mingTrench" && isMingOwner2(ctx, fac.owner)) {
      if (isCharging2(ctx, attacker, fromCell, toCell, isCounter, defender)) {
        const atkMeta = ctx.typeMeta(attacker.type);
        const chargeVal = (atkMeta.charge || 0) + (ctx.ownerNation(attacker.owner) === "austria" ? 1 : 0);
        if (chargeVal > 0) {
          result.damage = Math.max(1, result.damage - Math.min(chargeVal, 2));
          ctx.log(`${ctx.typeMeta(attacker.type).name}的冲锋被壕沟阻挡，伤害 -${Math.min(chargeVal, 2)}。`, "battle");
        }
      }
    }
    if (isMingOwner2(ctx, defender.owner)) {
      const turrets = ctx.getFacilitiesByType("turret").filter((f) => isMingOwner2(ctx, f.owner) && inRange2(defender, f, ENGINEERING.turret.range));
      if (turrets.length) {
        result.damage = Math.max(1, result.damage - ENGINEERING.turret.def);
      }
    }
  }
  function isCharging2(ctx, attacker, fromCell, toCell, isCounter, defender) {
    if (isCounter) return false;
    if (!attacker || attacker.move !== attacker.maxMove) return false;
    const meta = ctx.typeMeta(attacker.type);
    if (!meta || !meta.charge) return false;
    if (defender && defender.type === "pikeSquare") return false;
    const from = fromCell || { x: attacker.x, y: attacker.y };
    const to = toCell || { x: attacker.x, y: attacker.y };
    return ctx.diagonalDist(from, to) === 1;
  }
  function attachDebug8(ctx) {
    const debug = {
      config: () => ({ ...ENGINEERING }),
      facilities: () => ctx.getAllFacilities().map((f) => ({ id: f.id, type: f.type, owner: f.owner, x: f.x, y: f.y, hp: f.hp, maxHp: f.maxHp, duration: f.duration, data: f.data })),
      state: () => ({ deployedThisTurn: [...state9.deployedThisTurn] }),
      // 为某 owner 所有工部工程师发起部署决策（返回请求数）
      requestForOwner: (owner) => {
        let n = 0;
        for (const u of ctx.game.units) {
          if (u.owner === owner && requestDeployDecision(ctx, u)) n += 1;
        }
        return n;
      },
      pending: (owner) => ctx.getPendingDecisions(owner || "player").filter((r) => String(r.id || "").startsWith("mgEng_")).map((r) => ({ id: r.id, unitId: r.context.unitId, options: r.context.options.map((o) => o.id) })),
      resolve: (decisionId, choiceId) => ctx.resolveDecision(decisionId, choiceId)
    };
    if (typeof globalThis !== "undefined") globalThis.__mingDebug = { ...globalThis.__mingDebug || {}, engineering: debug };
    return debug;
  }

  // src/factions/ming/mingRules.js
  var NATION_MECHANICS = {
    joseonShuzhaiReduce: 3,
    // 水寨：港口/海岸被攻击伤害 -3
    annamAmbushBonus: 3,
    // 丛林伏击：森林中每回合首次攻击伤害 +3
    stealthKey: "hidden"
    // 锦衣卫 stealth 状态 key（契约 §3.1 预设 key）
  };
  var state10 = {
    lastGameRef: null,
    // 换局检测
    annamFirstHit: /* @__PURE__ */ new Set()
    // unitId：本回合已享受丛林伏击首攻（每回合重置）
  };
  function resetState10() {
    state10.annamFirstHit.clear();
  }
  function syncGameRef10(ctx) {
    if (ctx && ctx.game !== state10.lastGameRef) {
      resetState10();
      state10.lastGameRef = ctx ? ctx.game : null;
    }
  }
  function resetForTests10() {
    resetState10();
    state10.lastGameRef = null;
  }
  function atShuzhai(ctx, defender) {
    if (!defender) return false;
    const g = ctx.game;
    if (!g || !g.terrain) return false;
    const site = ctx.getSite(defender.x, defender.y);
    if (site && site.kind === "shipyard" && ctx.areAllies(g.teams, site.owner, defender.owner)) return true;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const x = defender.x + dx;
        const y = defender.y + dy;
        if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
        if (g.terrain[y] && g.terrain[y][x] === "water") return true;
      }
    }
    return false;
  }
  function onTurnStart10(ctx, payload) {
    const owner = payload && payload.owner;
    syncGameRef10(ctx);
    state10.annamFirstHit.clear();
    if (ctx.ownerNation(owner) === "mingCore") {
      for (const u of ctx.game.units) {
        if (u.owner !== owner) continue;
        if (u.type !== "jinyiwei") continue;
        ctx.addStatus(u.id, NATION_MECHANICS.stealthKey, 1, { by: "mingCore" });
        ctx.log(`${ctx.typeMeta(u.type).name}进入潜伏状态，不易被侦测。`, "system");
      }
    }
  }
  function onAfterAttack8(ctx, payload) {
    const { attacker } = payload || {};
    if (!attacker) return;
    syncGameRef10(ctx);
    if (attacker.type !== "jinyiwei") return;
    if (ctx.ownerNation(attacker.owner) !== "mingCore") return;
    ctx.removeStatus(attacker.id, NATION_MECHANICS.stealthKey);
    ctx.log(`${ctx.typeMeta(attacker.type).name}发起攻击，暴露行踪。`, "warning");
  }
  function onBeforeAttack7(ctx, payload) {
    const { attacker, defender, result } = payload || {};
    if (!attacker || !defender || !result || !result.damage) return;
    syncGameRef10(ctx);
    if (ctx.ownerNation(defender.owner) === "joseon" && atShuzhai(ctx, defender)) {
      result.damage = Math.max(1, result.damage - NATION_MECHANICS.joseonShuzhaiReduce);
      ctx.log(`${ctx.typeMeta(defender.type).name}依托水寨防御，受击伤害 -${NATION_MECHANICS.joseonShuzhaiReduce}。`, "battle");
    }
    if (ctx.ownerNation(attacker.owner) === "annam") {
      const meta = ctx.typeMeta(attacker.type);
      const g = ctx.game;
      if (meta && meta.domain === "land" && g.terrain && g.terrain[attacker.y] && g.terrain[attacker.y][attacker.x] === "forest" && !state10.annamFirstHit.has(attacker.id)) {
        state10.annamFirstHit.add(attacker.id);
        result.damage += NATION_MECHANICS.annamAmbushBonus;
        ctx.log(`${ctx.typeMeta(attacker.type).name}从丛林中发动伏击，伤害 +${NATION_MECHANICS.annamAmbushBonus}。`, "battle");
      }
    }
  }
  function attachDebug9(ctx) {
    const debug = {
      config: () => ({ ...NATION_MECHANICS }),
      state: () => ({ annamFirstHit: [...state10.annamFirstHit] }),
      shuzhai: (unitId) => {
        const u = ctx.game.units.find((x) => x.id === unitId);
        return u ? atShuzhai(ctx, u) : null;
      },
      stealth: (owner) => ctx.game.units.filter((u) => u.owner === (owner || "player") && u.type === "jinyiwei").map((u) => ({ id: u.id, x: u.x, y: u.y, hidden: ctx.hasStatus(u.id, NATION_MECHANICS.stealthKey) }))
    };
    if (typeof globalThis !== "undefined") globalThis.__mingDebug = { ...globalThis.__mingDebug || {}, nations: debug };
    return debug;
  }
  var mingSystem = {
    id: "ming",
    // 注册时调用一次：挂载 debug/test 入口（浏览器控制台可用）
    init(ctx) {
      attachDebug7(ctx);
      attachDebug8(ctx);
      attachDebug9(ctx);
    },
    // turnStart：fireZone 到期移除 + 炮台/补给站结算 + 部署决策 + stealth/伏击重置
    onTurnStart(ctx, payload) {
      onTurnStart8(ctx, payload);
      onTurnStart9(ctx, payload);
      onTurnStart10(ctx, payload);
    },
    // beforeMove：敌方进入火力区受伤
    onBeforeMove(ctx, payload) {
      onBeforeMove6(ctx, payload);
    },
    // beforeAttack：交叉火力 + 壕沟/炮台/栈桥防御 + 水寨/丛林伏击（只改 result.damage）
    onBeforeAttack(ctx, payload) {
      onBeforeAttack5(ctx, payload);
      onBeforeAttack6(ctx, payload);
      onBeforeAttack7(ctx, payload);
    },
    // afterAttack：fireZone 生成 + 工程设施受损 + 锦衣卫暴露
    onAfterAttack(ctx, payload) {
      onAfterAttack6(ctx, payload);
      onAfterAttack7(ctx, payload);
      onAfterAttack8(ctx, payload);
    },
    // 测试/换局用：清空模块内跨局状态（主对话也可在 newGame 时调用）
    reset() {
      resetForTests8();
      resetForTests9();
      resetForTests10();
    }
  };

  // src/main.js
  (() => {
    "use strict";
    const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    const $ = (id) => document.getElementById(id);
    let W = 28;
    let H = 16;
    let S = 40;
    let cam = { x: 0, y: 0 };
    let zoom = 1;
    let panState = null;
    let panSuppressContext = false;
    let selectedSaveKey = null;
    let currentSaveKey = null;
    let toastTimer = null;
    let game = null;
    let factionCtx = null;
    function initFactionSystems() {
      if (factionCtx) return factionCtx;
      factionCtx = createFactionContext({
        gameRef: () => game,
        getUnit: getUnit2,
        getSite: getSite2,
        typeMeta,
        terrainMeta: (k) => TERRAIN[k],
        ownerFaction,
        ownerNation: ownerNation2,
        log,
        addGold: (owner, amount) => {
          game.goldByOwner[owner] = (game.goldByOwner[owner] || 0) + amount;
        },
        spendGold: (owner, amount) => {
          if ((game.goldByOwner[owner] || 0) < amount) return false;
          game.goldByOwner[owner] -= amount;
          return true;
        },
        // v0.2 GH-02：合规单位创建通道。委托闭包 unit() 工厂（randomId/字段与主流程
        // 完全一致），push 后计入 produced 统计。金币/上限/位置校验与日志由调用方负责。
        createUnit: (type, owner, x, y) => {
          if (!typeMeta(type)) return null;
          const created = unit(type, owner, x, y);
          game.units.push(created);
          incrementStat("produced", owner, 1);
          return created;
        }
      });
      factionRegistry.register("hre", hreSystem, factionCtx);
      factionRegistry.register("goldenHorde", goldenHordeSystem, factionCtx);
      factionRegistry.register("venice", veniceSystem, factionCtx);
      factionRegistry.register("mamluk", mamlukSystem, factionCtx);
      factionRegistry.register("ming", mingSystem, factionCtx);
      return factionCtx;
    }
    let fastSim = false;
    const distFieldCache = /* @__PURE__ */ new Map();
    const landReachCache = /* @__PURE__ */ new Map();
    const uiState = {
      shipyardCargo: ["none", "none", "none", "none", "none"],
      engineerCargo: ["none", "none", "none", "none", "none"]
    };
    function inBounds3(x, y) {
      return x >= 0 && y >= 0 && x < W && y < H;
    }
    function adjacent4(x, y) {
      return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy })).filter((cell) => inBounds3(cell.x, cell.y));
    }
    function adjacent82(x, y) {
      return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy })).filter((cell) => inBounds3(cell.x, cell.y));
    }
    function ownerColor(owner) {
      if (game?.ownerColors?.[owner]) {
        return game.ownerColors[owner];
      }
      if (owner === "player") {
        return "#55a3ff";
      }
      if (owner === "neutral") {
        return "#d4b15a";
      }
      return OWNER_COLORS[Number(owner.slice(2))] || OWNER_COLORS[0];
    }
    function selectedSite() {
      return game?.selected?.kind === "site" ? game.selected.ref : game?.selected?.site || null;
    }
    function selectedUnit() {
      if (!game?.selected) {
        return null;
      }
      return game.selected.kind === "unit" ? game.selected.ref : game.selected.unit || null;
    }
    function ensureStatsStarted() {
      if (game && !game.stats.startTime) {
        game.stats.startTime = Date.now();
        recordStatSnapshot("start");
      }
    }
    function debugSummary() {
      if (!game) {
        return null;
      }
      return {
        turn: game.turn,
        over: game.over,
        side: game.side,
        spectator: game.settings?.spectator,
        result: game.result || null,
        strat: game.stats?.strat ? JSON.parse(JSON.stringify(game.stats.strat)) : null,
        teams: { ...game.teams },
        logs: [...game.logs],
        ownerOrder: [...game.ownerOrder],
        sites: game.sites.map((siteEntry) => ({ owner: siteEntry.owner, kind: siteEntry.kind, name: siteEntry.name, x: siteEntry.x, y: siteEntry.y })),
        units: game.units.map((unitEntry) => ({ owner: unitEntry.owner, type: unitEntry.type, x: unitEntry.x, y: unitEntry.y, hp: unitEntry.hp, rank: unitEntry.rank }))
      };
    }
    function aggregateStratByTeam() {
      const byTeam = {};
      const strat = game?.stats?.strat || {};
      for (const owner of Object.keys(strat)) {
        const team = teamOf2(owner);
        byTeam[team] = byTeam[team] || {};
        for (const key of Object.keys(strat[owner])) {
          byTeam[team][key] = (byTeam[team][key] || 0) + strat[owner][key];
        }
      }
      return byTeam;
    }
    function debugRunResult() {
      const strat = game?.stats?.strat || {};
      const totals = {};
      for (const owner of Object.keys(strat)) {
        for (const key of Object.keys(strat[owner])) {
          totals[key] = (totals[key] || 0) + strat[owner][key];
        }
      }
      return {
        turn: game.turn,
        over: game.over,
        result: game.result || null,
        totals,
        byOwner: JSON.parse(JSON.stringify(strat)),
        byTeam: aggregateStratByTeam(),
        cityOwners: game.sites.filter((s) => s.kind === "city").reduce((acc, s) => {
          const t = s.owner === "neutral" ? "neutral" : teamOf2(s.owner);
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {}),
        unitsAlive: game.units.length
      };
    }
    async function fastRun(cap = 150) {
      if (!game) {
        return null;
      }
      fastSim = true;
      let guard = 0;
      const guardMax = cap * Math.max(1, game.ownerOrder.length) + 80;
      while (!game.over && game.turn <= cap && guard < guardMax) {
        const owner = game.side;
        if (!ownerExists(owner) || owner === "player") {
          advanceTurn();
        } else {
          await aiTurn(owner);
        }
        guard += 1;
        if (guard % 40 === 0) {
          await macroYield();
        }
      }
      fastSim = false;
      const result = debugRunResult();
      refresh();
      return result;
    }
    async function fastBatch(cap = 150, rounds = 10, seed = 20260804) {
      const runs = [];
      const origRandom = Math.random;
      try {
        for (let i = 0; i < rounds; i++) {
          Math.random = createRng(seed + i * 2654435761);
          fastSim = true;
          newGame();
          const result = await fastRun(cap);
          runs.push(result);
        }
      } finally {
        Math.random = origRandom;
      }
      const agg = { rounds: runs.length, seed, wins: {}, avgTurns: 0, totals: {} };
      for (const run of runs) {
        const winnerTeam = (() => {
          const m = run.result?.text?.match(/^(.*?)\s*组/);
          if (!m) {
            const fallback = Object.entries(run.cityOwners).filter(([t]) => t !== "neutral").sort((a, b) => b[1] - a[1])[0]?.[0];
            return fallback || "未定";
          }
          const label = m[1];
          return Object.keys(TEAM_NAMES).find((k) => TEAM_NAMES[k] === label) || label;
        })();
        agg.wins[winnerTeam] = (agg.wins[winnerTeam] || 0) + 1;
        agg.avgTurns += run.turn;
        for (const key of Object.keys(run.totals)) {
          agg.totals[key] = (agg.totals[key] || 0) + run.totals[key];
        }
      }
      agg.avgTurns = Math.round(agg.avgTurns / Math.max(1, runs.length) * 10) / 10;
      for (const key of Object.keys(agg.totals)) {
        agg.totals[key] = Math.round(agg.totals[key] / Math.max(1, runs.length) * 10) / 10;
      }
      return { agg, runs };
    }
    function emptyOwnerMap(seed = 0) {
      return Object.fromEntries(game.ownerOrder.map((owner) => [owner, seed]));
    }
    function statTimeSeconds() {
      if (!game?.stats?.startTime) {
        return 0;
      }
      const end = game.stats.endTime || Date.now();
      return Math.max(0, Math.round((end - game.stats.startTime) / 1e3));
    }
    function recordStatSnapshot(label = "") {
      if (!game?.stats) {
        return;
      }
      game.stats.history.push({
        label,
        time: statTimeSeconds(),
        produced: { ...game.stats.produced },
        kills: { ...game.stats.kills },
        losses: { ...game.stats.losses },
        captures: { ...game.stats.captures },
        lostSites: { ...game.stats.lostSites }
      });
    }
    function incrementStat(bucket, owner, value = 1) {
      if (!game?.stats?.[bucket]?.[owner] && game?.stats?.[bucket]?.[owner] !== 0) {
        return;
      }
      game.stats[bucket][owner] += value;
    }
    function incrementStrat(owner, key, value = 1) {
      const bucket = game?.stats?.strat?.[owner];
      if (!bucket || typeof bucket[key] !== "number") {
        return;
      }
      bucket[key] += value;
    }
    function chartMetrics() {
      return [
        { key: "produced", title: "生产单位数对比" },
        { key: "kills", title: "击杀数对比" },
        { key: "losses", title: "伤亡数对比" },
        { key: "captures", title: "占领据点数对比" },
        { key: "lostSites", title: "丢失据点数对比" }
      ];
    }
    function statLabel(owner) {
      return owner === "player" ? "玩家" : `AI ${Number(owner.slice(2)) + 1}`;
    }
    function renderStatsSummary(animate = true) {
      if (!game?.stats) {
        return;
      }
      const summary = document.getElementById("statsSummary");
      if (!summary) {
        return;
      }
      const totalProduced = Object.values(game.stats.produced).reduce((sum, value) => sum + value, 0);
      const totalKills = Object.values(game.stats.kills).reduce((sum, value) => sum + value, 0);
      const totalLosses = Object.values(game.stats.losses).reduce((sum, value) => sum + value, 0);
      const totalCaptures = Object.values(game.stats.captures).reduce((sum, value) => sum + value, 0);
      const totalLost = Object.values(game.stats.lostSites).reduce((sum, value) => sum + value, 0);
      const items = [
        { label: "本局时长", value: statTimeSeconds(), suffix: "s" },
        { label: "总生产数", value: totalProduced, suffix: "" },
        { label: "总击杀数", value: totalKills, suffix: "" },
        { label: "总伤亡数", value: totalLosses, suffix: "" },
        { label: "总占领数", value: totalCaptures, suffix: "" },
        { label: "总丢失数", value: totalLost, suffix: "" }
      ];
      summary.innerHTML = items.map((item, index) => `<div class="summary-card"><span class="label">${item.label}</span><span class="value" data-stat-index="${index}" data-final="${item.value}" data-suffix="${item.suffix}">0${item.suffix}</span></div>`).join("");
      if (!animate) {
        summary.querySelectorAll("[data-final]").forEach((node) => {
          node.textContent = `${node.dataset.final}${node.dataset.suffix || ""}`;
        });
        return;
      }
      const start = performance.now();
      const duration = 600;
      const values = [...summary.querySelectorAll("[data-final]")];
      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        values.forEach((node) => {
          const target = Number(node.dataset.final || 0);
          node.textContent = `${Math.round(target * progress)}${node.dataset.suffix || ""}`;
        });
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
    }
    function drawStatsChart() {
      if (!game?.stats) {
        return;
      }
      const canvasEl = document.getElementById("statsChart");
      const titleEl = document.getElementById("chartTitle");
      if (!canvasEl || !titleEl) {
        return;
      }
      const metric = chartMetrics()[game.stats.chartIndex % chartMetrics().length];
      titleEl.textContent = metric.title;
      const chartCtx = canvasEl.getContext("2d");
      const width = canvasEl.width;
      const height = canvasEl.height;
      chartCtx.clearRect(0, 0, width, height);
      chartCtx.fillStyle = "#101820";
      chartCtx.fillRect(0, 0, width, height);
      chartCtx.strokeStyle = "rgba(255,255,255,0.08)";
      chartCtx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = 20 + i * (height - 40) / 4;
        chartCtx.beginPath();
        chartCtx.moveTo(40, y);
        chartCtx.lineTo(width - 10, y);
        chartCtx.stroke();
      }
      const history = game.stats.history.length ? game.stats.history : [{ time: 0, [metric.key]: { ...game.stats[metric.key] } }];
      const maxTime = Math.max(1, ...history.map((point) => point.time));
      const maxValue = Math.max(1, ...history.flatMap((point) => Object.values(point[metric.key] || {})));
      ownerOrder().forEach((owner) => {
        chartCtx.strokeStyle = ownerColor(owner);
        chartCtx.lineWidth = 2;
        chartCtx.beginPath();
        history.forEach((point, index) => {
          const x = 40 + point.time / maxTime * (width - 60);
          const y = height - 20 - (point[metric.key]?.[owner] || 0) / maxValue * (height - 40);
          if (index === 0) {
            chartCtx.moveTo(x, y);
          } else {
            chartCtx.lineTo(x, y);
          }
        });
        chartCtx.stroke();
        chartCtx.fillStyle = ownerColor(owner);
        chartCtx.fillRect(width - 130, 16 + ownerOrder().indexOf(owner) * 16, 10, 10);
        chartCtx.fillStyle = "#d8e6f7";
        chartCtx.font = "11px sans-serif";
        chartCtx.fillText(statLabel(owner), width - 115, 25 + ownerOrder().indexOf(owner) * 16);
      });
      chartCtx.fillStyle = "#8b9bb0";
      chartCtx.font = "11px sans-serif";
      chartCtx.fillText("时间", width / 2 - 10, height - 6);
    }
    function showStatsPanel() {
      if (!game?.stats) {
        return;
      }
      game.stats.endTime = Date.now();
      recordStatSnapshot("finish");
      $("statsPanel").classList.remove("hidden");
      renderStatsSummary(true);
      drawStatsChart();
    }
    function pause(ms) {
      if (fastSim) {
        return Promise.resolve();
      }
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    function macroYield() {
      if (typeof setImmediate === "function") {
        return new Promise((resolve) => setImmediate(resolve));
      }
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(0);
      });
    }
    function aiStepDelay() {
      if (game?.settings?.spectator) {
        return 0;
      }
      return Math.max(120, Math.round((game?.settings?.aiSpeed || 3) * 1e3 / 10));
    }
    function frontMemory(owner) {
      if (!game.aiFrontMemory[owner]) {
        game.aiFrontMemory[owner] = {};
      }
      return game.aiFrontMemory[owner];
    }
    function decayFrontMemory(owner) {
      const memory = frontMemory(owner);
      for (const key of Object.keys(memory)) {
        if (memory[key].cooldown > 0) {
          memory[key].cooldown -= 1;
        }
        if (memory[key].cooldown <= 0 && memory[key].stalls <= 0) {
          delete memory[key];
        }
      }
    }
    function rememberFrontOutcome(owner, objectiveKey, movedThisTurn) {
      if (!objectiveKey || !objectiveKey.startsWith("site:")) {
        return;
      }
      const memory = frontMemory(owner);
      const entry = memory[objectiveKey] || { stalls: 0, cooldown: 0 };
      if (movedThisTurn) {
        entry.stalls = Math.max(0, entry.stalls - 1);
      } else {
        entry.stalls += 1;
        if (entry.stalls >= 3) {
          entry.cooldown = Math.max(entry.cooldown, 3);
          entry.stalls = 0;
        }
      }
      memory[objectiveKey] = entry;
    }
    function teamOf2(owner) {
      return teamOf(game?.teams, owner);
    }
    function teamName(t) {
      return TEAM_NAMES[t] || `${t}组`;
    }
    function areAllies2(a, b) {
      return areAllies(game?.teams, a, b);
    }
    function areEnemies2(a, b) {
      return areEnemies(game?.teams, a, b);
    }
    function ownerName(owner) {
      if (owner === "player") {
        return `蓝方·${teamName(teamOf2(owner))}`;
      }
      if (owner === "neutral") {
        return "中立势力";
      }
      return `${OWNER_NAMES[Number(owner.slice(2))] || "敌军"}·${teamName(teamOf2(owner))}`;
    }
    function ownerShort(owner) {
      if (owner === "player") {
        return "你方";
      }
      if (owner === "neutral") {
        return "中立";
      }
      return `AI ${Number(owner.slice(2)) + 1}`;
    }
    function tierName(tier) {
      return ["", "初级", "中级", "高级"][tier] || "特殊";
    }
    function domainName(domain) {
      return domain === "sea" ? "海军" : "陆军";
    }
    function randomId() {
      return Math.random().toString(36).slice(2);
    }
    function computeDimensions(sizeKey, aspectKey) {
      const base = SIZES[sizeKey];
      const ratio = ASPECTS[aspectKey].ratio;
      const area = base.cells;
      let width = Math.max(16, Math.round(Math.sqrt(area * ratio)));
      let height = Math.max(12, Math.round(area / width));
      if (aspectKey === "tall" && height < width) {
        [width, height] = [height, width];
      }
      if (aspectKey === "wide" && width < height) {
        [width, height] = [height, width];
      }
      return { w: width, h: height };
    }
    function unit(type, owner, x, y) {
      const meta = typeMeta(type);
      return {
        id: randomId(),
        type,
        owner,
        x,
        y,
        hp: meta.hp,
        maxHp: meta.hp,
        move: meta.move,
        maxMove: meta.move,
        baseMove: meta.move,
        acted: false,
        hasAttacked: false,
        lastAttacked: false,
        kills: 0,
        rank: 0,
        cargo: meta.transport ? [] : null
      };
    }
    function createCargoPayload(owner, type) {
      return {
        type,
        owner,
        hp: typeMeta(type).hp,
        maxHp: typeMeta(type).hp,
        lastAttacked: false
      };
    }
    function createLoadedTransport(owner, x, y, cargoTypes = [], transportType = "transport") {
      const transport = unit(transportType, owner, x, y);
      transport.cargo = normalizeCargoTypes(cargoTypes, transportType).map((type) => createCargoPayload(owner, type));
      return transport;
    }
    function site(kind, owner, x, y, name, tier = 1, income = null) {
      return {
        id: randomId(),
        kind,
        owner,
        x,
        y,
        name,
        tier,
        income: income == null ? siteMeta(kind).income : income
      };
    }
    function createCamp(owner, x, y) {
      const camp = site("camp", owner, x, y, "临时营地", 2, 0);
      const campNat = owner === "player" ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
      camp.duration = CAMP_DURATION + (campNat === "goldenHordeCore" ? 2 : 0);
      camp.uncapturable = true;
      return camp;
    }
    function getUnit2(x, y) {
      return game.units.find((entry) => entry.x === x && entry.y === y);
    }
    function unitsAt(x, y) {
      return game.units.filter((entry) => entry.x === x && entry.y === y);
    }
    function getSite2(x, y) {
      return game.sites.find((entry) => entry.x === x && entry.y === y);
    }
    function isLandTile(x, y) {
      return inBounds3(x, y) && game.terrain[y][x] !== "water" && game.terrain[y][x] !== "mountain";
    }
    function isWaterTile(x, y) {
      return inBounds3(x, y) && game.terrain[y][x] === "water";
    }
    function isCoastalWater(x, y) {
      return isWaterTile(x, y) && adjacent82(x, y).some((cell) => isLandTile(cell.x, cell.y));
    }
    function isDeepWater(x, y) {
      if (!isWaterTile(x, y)) {
        return false;
      }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (isLandTile(x + dx, y + dy)) {
            return false;
          }
        }
      }
      return true;
    }
    function ownerOrder() {
      return game ? game.ownerOrder : [];
    }
    function terrainCellCounts() {
      if (game.__cellCounts) {
        return game.__cellCounts;
      }
      let land = 0;
      let sea = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (game.terrain[y][x] === "water") {
            sea += 1;
          } else if (game.terrain[y][x] !== "mountain") {
            land += 1;
          }
        }
      }
      game.__cellCounts = { land, sea };
      return game.__cellCounts;
    }
    function unitCapFor(domain) {
      const counts = terrainCellCounts();
      const participants = Math.max(1, game.ownerOrder.length);
      const cells = domain === "sea" ? counts.sea : counts.land;
      return Math.max(1, Math.floor(cells / (participants + 1)));
    }
    function ownedUnitCount(owner, domain) {
      return game.units.filter((entry) => entry.owner === owner && typeMeta(entry.type).domain === domain).length;
    }
    function atUnitCap(owner, domain) {
      return ownedUnitCount(owner, domain) >= unitCapFor(domain);
    }
    function campCount2(owner) {
      return game.sites.filter((entry) => entry.kind === "camp" && entry.owner === owner).length;
    }
    function unitBuildCost(unitEntry) {
      if (isTransportUnit(unitEntry)) {
        return transportCost((unitEntry.cargo || []).map((payload) => payload.type), unitEntry.type);
      }
      return typeMeta(unitEntry.type).cost;
    }
    function sellRefund(unitEntry) {
      return Math.floor(unitBuildCost(unitEntry) / 2);
    }
    function sellUnit(owner, unitEntry) {
      if (!unitEntry || unitEntry.owner !== owner || game.side !== owner || game.over) {
        return false;
      }
      const refund = sellRefund(unitEntry);
      game.goldByOwner[owner] += refund;
      game.units = game.units.filter((entry) => entry !== unitEntry);
      incrementStrat(owner, "sells");
      if (game.selected?.ref === unitEntry) {
        game.selected = null;
      }
      log(`${ownerName(owner)}变卖了${typeMeta(unitEntry.type).name}，回收 ${refund} 🪙。`, "gold");
      return true;
    }
    function forceCrowding(owner) {
      const units = game.units.filter((entry) => entry.owner === owner);
      if (!units.length) {
        return 0;
      }
      const stalled = units.filter((entry) => (entry.aiState?.stalledTurns || 0) >= 2).length;
      return stalled / units.length;
    }
    function capacityPressure(owner) {
      const landRatio = ownedUnitCount(owner, "land") / Math.max(1, unitCapFor("land"));
      const seaRatio = ownedUnitCount(owner, "sea") / Math.max(1, unitCapFor("sea"));
      return Math.max(landRatio, seaRatio);
    }
    function cargoOptionTypes() {
      return Object.keys(TYPES).filter((type) => typeMeta(type).domain === "land");
    }
    function normalizeCargoTypes(types, transportType = "transport") {
      return (types || []).filter((type) => type && type !== "none" && TYPES[type] && typeMeta(type).domain === "land").slice(0, typeMeta(transportType).transport);
    }
    function sameCell(a, b) {
      return !!a && !!b && a.x === b.x && a.y === b.y;
    }
    function rankFromKills(kills) {
      let rank = 0;
      for (let index = 0; index < UNIT_RANK_THRESHOLDS.length; index++) {
        if (kills >= UNIT_RANK_THRESHOLDS[index]) {
          rank = index;
        }
      }
      return rank;
    }
    function effectiveMove(unitEntry) {
      return unitEntry.baseMove + Math.floor(unitEntry.rank / 2);
    }
    function healMultiplier(unitEntry) {
      return 1 + unitEntry.rank * 0.15;
    }
    function grantKills(unitEntry, kills) {
      if (!unitEntry) {
        return;
      }
      const killFac = unitEntry.owner === "player" ? game.settings?.faction : game.aiProfiles?.[unitEntry.owner]?.faction;
      const effectiveKills = killFac === "mamluk" ? kills * 2 : kills;
      unitEntry.kills += effectiveKills;
      const nextRank = rankFromKills(unitEntry.kills);
      if (nextRank !== unitEntry.rank) {
        unitEntry.rank = nextRank;
        unitEntry.maxMove = effectiveMove(unitEntry);
        unitEntry.move = Math.max(unitEntry.move, Math.min(unitEntry.maxMove, unitEntry.move + 1));
        log(`${ownerName(unitEntry.owner)}的${typeMeta(unitEntry.type).name}晋升为 ${nextRank} 级老兵。`, "system");
      }
    }
    function transportCost(cargoTypes = [], transportType = "transport") {
      return typeMeta(transportType).cost + normalizeCargoTypes(cargoTypes, transportType).reduce((sum, type) => sum + typeMeta(type).cost, 0);
    }
    function factionAdjustedCost(owner, type, cargoTypes = []) {
      const base = isTransportType(type) ? transportCost(cargoTypes, type) : typeMeta(type).cost;
      const fac = owner === "player" ? game.settings?.faction : game.aiProfiles?.[owner]?.faction;
      const nat = owner === "player" ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
      const typeFac = typeMeta(type).faction;
      let markup = fac === "venice" && typeFac && typeFac !== "venice" ? 1.5 : 1;
      if (nat === "ragusa") markup *= 0.95;
      if (nat === "veniceCore" && typeMeta(type).domain === "sea") markup *= 0.8;
      if (nat === "mingCore" && (typeMeta(type).domain === "sea" || type === "engineer" || type === "worksEngineer")) markup *= 0.9;
      return Math.round(base * markup);
    }
    function cargoLabel(type) {
      return type === "none" ? "空位" : `${typeMeta(type).icon} ${typeMeta(type).name}`;
    }
    function describeCargo(cargoTypes = []) {
      const types = normalizeCargoTypes(cargoTypes);
      return types.length ? types.map((type) => typeMeta(type).name).join("、") : "空舱";
    }
    function transportConfigMarkup(presetKey, title) {
      const capacity = typeMeta("transport").transport;
      const rows = [];
      for (let slot = 0; slot < capacity; slot++) {
        const options = ["none", ...cargoOptionTypes()].map((type) => `<option value="${type}" ${uiState[presetKey][slot] === type ? "selected" : ""}>${cargoLabel(type)}</option>`).join("");
        rows.push(`<label class="cargo-row"><span>槽位${slot + 1}</span><select data-cargo-preset="${presetKey}" data-cargo-slot="${slot}">${options}</select></label>`);
      }
      return [
        '<div class="build-config">',
        `<h3>${title}</h3>`,
        '<div class="cargo-grid">',
        rows.join(""),
        "</div>",
        `<div class="config-note">当前配置：${describeCargo(uiState[presetKey])} · 总价 ${transportCost(uiState[presetKey])} 🪙</div>`,
        "</div>"
      ].join("");
    }
    function setCargoPreset(presetKey, slot, value) {
      if (!uiState[presetKey]) {
        return;
      }
      uiState[presetKey][slot] = value;
    }
    function engineerSelected() {
      return game?.selected?.kind === "unit" && game.selected.ref.type === "engineer" ? game.selected.ref : null;
    }
    function clearPendingOrder() {
      if (game) {
        game.pendingOrder = null;
      }
    }
    function ownerExists(owner) {
      return game.units.some((entry) => entry.owner === owner) || game.sites.some((entry) => entry.owner === owner);
    }
    function log(text, kind = "") {
      game.logs.push({ text, kind });
      if (game.logs.length > 80) {
        game.logs.shift();
      }
    }
    function toast(text) {
      $("toast").textContent = text;
      $("toast").classList.remove("hidden");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 1800);
    }
    function removeUnit(unitEntry) {
      eventBus.emit("unitKilled", { victim: unitEntry, killer: null, reason: "removeUnit" });
      if (unitEntry.cargo?.length) {
        log(`${typeMeta(unitEntry.type).name}被击沉，船上搭载单位全部损失。`, "warning");
      }
      incrementStat("losses", unitEntry.owner, 1 + (unitEntry.cargo?.length || 0));
      game.units = game.units.filter((entry) => entry !== unitEntry);
      recordStatSnapshot("loss");
      if (!game.over) {
        checkEnd2();
      }
    }
    function attack(attacker, defender) {
      const result = previewCombat(game, attacker, defender, { x: attacker.x, y: attacker.y }, false);
      const atkPayload = { attacker, defender, fromCell: { x: attacker.x, y: attacker.y }, toCell: { x: defender.x, y: defender.y }, result, isCounter: false, cancel: false };
      eventBus.emit("beforeAttack", atkPayload);
      if (atkPayload.cancel) return;
      defender.hp -= result.damage;
      defender.lastAttacked = true;
      const atkFaction = attacker.owner === "player" ? game.settings?.faction : game.aiProfiles?.[attacker.owner]?.faction;
      if (atkFaction === "goldenHorde") {
        attacker.move = Math.max(1, Math.floor(attacker.maxMove * 0.5));
      } else {
        attacker.move = 0;
      }
      attacker.hasAttacked = true;
      attacker.acted = true;
      if (atkFaction === "ming" && typeMeta(attacker.type).range > 1) {
        const splashNat = attacker.owner === "player" ? game.settings?.nation : game.aiProfiles?.[attacker.owner]?.nation;
        const splashRatio = splashNat === "mingCore" ? 0.6 : 0.5;
        const splashDamage = Math.max(1, Math.round(result.damage * splashRatio));
        for (const nearby of game.units.filter((u) => u.owner !== attacker.owner && Math.abs(u.x - defender.x) <= 1 && Math.abs(u.y - defender.y) <= 1 && (u.x !== defender.x || u.y !== defender.y))) {
          nearby.hp -= splashDamage;
          log(`${typeMeta(attacker.type).name}的火器齐射溅射到${typeMeta(nearby.type).name}，造成 ${splashDamage} 点伤害。`, "battle");
          if (nearby.hp <= 0) {
            incrementStat("kills", attacker.owner, 1);
            grantKills(attacker, 1);
            removeUnit(nearby);
          }
        }
      }
      log(`${ownerName(attacker.owner)}的${typeMeta(attacker.type).name}攻击${ownerName(defender.owner)}的${typeMeta(defender.type).name}，造成 ${result.damage} 点伤害。`, "battle");
      if (defender.hp <= 0) {
        incrementStat("kills", attacker.owner, 1 + (defender.cargo?.length || 0));
        grantKills(attacker, 1 + (defender.cargo?.length || 0));
        if (attacker.type === "sultanGuard") {
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + 3);
        }
        removeUnit(defender);
        log(`${typeMeta(defender.type).name}被消灭。`, "battle");
      } else if (result.counter > 0 && attacker.type !== "jinyiwei") {
        attacker.hp -= result.counter;
        log(`${typeMeta(defender.type).name}反击，造成 ${result.counter} 点伤害。`, "battle");
        if (defender.type === "joseonTurtleShip" && defender.hp > 0) {
          const reflect = Math.max(1, Math.round(result.damage * 0.3));
          attacker.hp -= reflect;
          log(`${typeMeta(defender.type).name}的装甲反弹了 ${reflect} 点伤害。`, "battle");
        }
        if (attacker.hp <= 0) {
          incrementStat("kills", defender.owner, 1 + (attacker.cargo?.length || 0));
          grantKills(defender, 1 + (attacker.cargo?.length || 0));
          removeUnit(attacker);
          log(`${typeMeta(attacker.type).name}在反击中被击毁。`, "battle");
        }
      }
      eventBus.emit("afterAttack", { attacker, defender, result, defenderDead: defender.hp <= 0, attackerDead: attacker.hp <= 0 });
      checkEnd2();
    }
    function strategicSiteValue(siteEntry, owner, unitEntry) {
      if (siteEntry.owner === owner || areAllies2(siteEntry.owner, owner)) {
        return 0;
      }
      let score = siteEntry.kind === "city" ? 26 : siteEntry.kind === "shipyard" ? 24 : siteEntry.kind === "camp" ? 14 : siteEntry.kind.startsWith("oil") ? 24 : siteEntry.kind.startsWith("barracks") ? 20 : 18;
      score += siteEntry.income + siteEntry.tier * 5;
      if (siteEntry.owner === "neutral") {
        score *= 0.82;
      }
      if (unitEntry) {
        const domain = typeMeta(unitEntry.type).domain;
        if ((siteEntry.kind === "city" || siteEntry.kind.startsWith("oil") || siteEntry.kind.startsWith("barracks")) && domain === "sea") {
          score *= 0.3;
        }
        if ((siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && domain === "land") {
          score *= 0.25;
        }
      }
      return score;
    }
    function captureSite(unitEntry) {
      const siteEntry = getSite2(unitEntry.x, unitEntry.y);
      if (!siteEntry || siteEntry.owner === unitEntry.owner || areAllies2(siteEntry.owner, unitEntry.owner)) {
        return;
      }
      if (siteEntry.kind === "camp") {
        game.sites = game.sites.filter((entry) => entry !== siteEntry);
        if (game.selected?.ref === siteEntry) {
          game.selected = null;
        }
        incrementStat("lostSites", siteEntry.owner, 1);
        incrementStat("captures", unitEntry.owner, 1);
        recordStatSnapshot("camp-destroyed");
        log(`${ownerName(unitEntry.owner)}摧毁了${siteEntry.owner === "player" ? "你的" : ownerName(siteEntry.owner)}临时营地。`, "system");
        return;
      }
      const domain = typeMeta(unitEntry.type).domain;
      if (siteEntry.kind === "city" && domain !== "land") {
        return;
      }
      if ((siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && domain !== "sea") {
        return;
      }
      const oldTier = siteEntry.tier;
      const oldOwner = siteEntry.owner;
      siteEntry.owner = unitEntry.owner;
      eventBus.emit("siteCaptured", { unit: unitEntry, site: siteEntry, oldOwner });
      if ((unitEntry.type === "tradeCaravan" || unitEntry.type === "ragusaCaravan") && !siteEntry._caravanBonus) {
        siteEntry.income += 5;
        siteEntry._caravanBonus = true;
      }
      if (unitEntry.type === "siegeTower") {
        unitEntry.move = unitEntry.maxMove;
      }
      if (oldOwner !== "neutral" && Math.random() < 0.4) {
        const capturerNation = unitEntry.owner === "player" ? game.settings?.nation : game.aiProfiles?.[unitEntry.owner]?.nation;
        const nameSet = SITE_NAMES_BY_NATION?.[capturerNation];
        if (nameSet) {
          const kindKey = siteEntry.kind.startsWith("oil") ? "oil" : siteEntry.kind.startsWith("barracks") ? "barracks" : siteEntry.kind;
          const names = nameSet[kindKey];
          if (names && names.length) {
            const usedNames = new Set(game.sites.map((s) => s.name));
            const available = names.filter((n) => !usedNames.has(n));
            if (available.length) {
              siteEntry.name = available[Math.floor(Math.random() * available.length)];
            }
          }
        }
      }
      if (siteEntry.kind !== "fortress" && Math.random() < 0.12) {
        siteEntry.tier = Math.max(1, siteEntry.tier - 1);
        siteEntry.income = Math.max(4, siteMeta(siteEntry.kind).income + (siteEntry.tier - 1) * (siteEntry.kind === "city" ? 3 : 2));
      }
      if (oldOwner !== "neutral") {
        incrementStat("lostSites", oldOwner, 1);
      }
      incrementStat("captures", unitEntry.owner, 1);
      if (siteEntry.kind === "city") {
        incrementStrat(unitEntry.owner, "cityCaptures");
      } else if (siteEntry.kind.startsWith("oil")) {
        incrementStrat(unitEntry.owner, "oilCaptures");
      } else if (siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") {
        incrementStrat(unitEntry.owner, "shipyardCaptures");
      }
      recordStatSnapshot("capture");
      log(`${ownerName(unitEntry.owner)}夺取了${siteEntry.name}${siteEntry.tier < oldTier ? "，设施战损降级。" : "。"}`, "system");
      checkEnd2();
    }
    function moveUnit(unitEntry, x, y) {
      const cost = reachable(game, unitEntry).get(cellKey(x, y));
      if (cost === void 0 || unitEntry.hasAttacked) {
        return false;
      }
      const movePayload = { unit: unitEntry, from: { x: unitEntry.x, y: unitEntry.y }, to: { x, y }, cancel: false };
      eventBus.emit("beforeMove", movePayload);
      if (movePayload.cancel) {
        return false;
      }
      unitEntry.x = x;
      unitEntry.y = y;
      unitEntry.move -= cost;
      unitEntry.acted = true;
      captureSite(unitEntry);
      return true;
    }
    function canLoadTransport(transport, passenger) {
      return !!transport && !!passenger && !!typeMeta(transport.type).transport && typeMeta(passenger.type).domain === "land" && transport.owner === passenger.owner && diagonalDist(transport, passenger) === 1 && transport.cargo.length < typeMeta(transport.type).transport;
    }
    function loadTransport(transport, passenger) {
      if (!canLoadTransport(transport, passenger)) {
        return false;
      }
      transport.cargo.push({ type: passenger.type, owner: passenger.owner, hp: passenger.hp, maxHp: passenger.maxHp, lastAttacked: passenger.lastAttacked });
      game.units = game.units.filter((entry) => entry !== passenger);
      transport.acted = true;
      log(`${typeMeta(passenger.type).name}登上了${typeMeta(transport.type).name}。`, "system");
      return true;
    }
    function canUnloadTransport(transport, x, y) {
      if (!transport || !transport.cargo?.length || diagonalDist(transport, { x, y }) !== 1 || !isLandTile(x, y)) {
        return false;
      }
      const occupants = unitsAt(x, y);
      return occupants.length < MAX_STACK && occupants.every((entry) => entry.owner === transport.owner && typeMeta(entry.type).domain === "land");
    }
    function unloadTransport(transport, x, y) {
      if (!canUnloadTransport(transport, x, y)) {
        return false;
      }
      const payload = transport.cargo.shift();
      const unitEntry = unit(payload.type, payload.owner, x, y);
      unitEntry.hp = payload.hp;
      unitEntry.maxHp = payload.maxHp;
      unitEntry.move = 0;
      unitEntry.acted = true;
      unitEntry.hasAttacked = true;
      unitEntry.lastAttacked = payload.lastAttacked;
      game.units.push(unitEntry);
      transport.acted = true;
      if (unitEntry.type === "engineer") {
        incrementStrat(unitEntry.owner, "engineerLandings");
      }
      log(`${typeMeta(unitEntry.type).name}完成登陆。`, "system");
      captureSite(unitEntry);
      return true;
    }
    function autoLoadAdjacent(transport) {
      const options = game.units.filter((entry) => entry.owner === transport.owner && typeMeta(entry.type).domain === "land" && diagonalDist(entry, transport) === 1);
      options.sort((a, b) => typeMeta(b.type).level - typeMeta(a.type).level || b.hp - a.hp);
      return options.length ? loadTransport(transport, options[0]) : false;
    }
    function strategicLandingScore(owner, cell) {
      let score = 0;
      for (const siteEntry of game.sites) {
        if (areEnemies2(siteEntry.owner, owner) && (siteEntry.kind === "city" || siteEntry.kind.startsWith("oil"))) {
          score += 18 / (1 + dist(siteEntry, cell));
        }
      }
      score -= nearbyEnemies(cell, owner, 2) * 8;
      score -= nearbyEnemies(cell, owner, 4) * 3;
      return score;
    }
    function autoUnloadAdjacent(transport) {
      const cells = adjacent82(transport.x, transport.y).filter((cell) => canUnloadTransport(transport, cell.x, cell.y));
      if (!cells.length) {
        return false;
      }
      cells.sort((a, b) => strategicLandingScore(transport.owner, b) - strategicLandingScore(transport.owner, a));
      return unloadTransport(transport, cells[0].x, cells[0].y);
    }
    function supportSites(unitEntry) {
      return game.sites.filter((siteEntry) => areAllies2(siteEntry.owner, unitEntry.owner) && ((siteEntry.kind === "city" || siteEntry.kind === "camp" || siteEntry.kind === "barracksSmall" || siteEntry.kind === "barracksLarge") && typeMeta(unitEntry.type).domain === "land" || (siteEntry.kind === "shipyard" || siteEntry.kind === "fortress") && typeMeta(unitEntry.type).domain === "sea"));
    }
    function decayTemporarySites(owner) {
      const expired = [];
      for (const siteEntry of game.sites) {
        if (siteEntry.kind !== "camp" || siteEntry.owner !== owner) {
          continue;
        }
        siteEntry.duration -= 1;
        if (siteEntry.duration <= 0) {
          expired.push(siteEntry);
        }
      }
      if (!expired.length) {
        return;
      }
      game.sites = game.sites.filter((siteEntry) => !expired.includes(siteEntry));
      if (expired.includes(game.selected?.ref)) {
        game.selected = null;
      }
      expired.forEach((siteEntry) => log(`${siteEntry.name}补给耗尽，已自行拆除。`, "warning"));
    }
    function healOwner(owner) {
      for (const unitEntry of game.units.filter((entry) => entry.owner === owner)) {
        const supports = supportSites(unitEntry);
        if (!supports.length) {
          unitEntry.lastAttacked = false;
          continue;
        }
        const nearest = Math.min(...supports.map((siteEntry) => dist(siteEntry, unitEntry)));
        if (!unitEntry.lastAttacked) {
          const ratio = (nearest === 0 ? 0.16 : nearest <= 1 ? 0.1 : nearest >= 14 ? 0.02 : Math.max(0.02, 0.1 - (nearest - 1) * 0.08 / 13)) * healMultiplier(unitEntry);
          const healNat = unitEntry.owner === "player" ? game.settings?.nation : game.aiProfiles?.[unitEntry.owner]?.nation;
          const bavariaBonus = healNat === "bavaria" ? 1 : 0;
          unitEntry.hp = Math.min(unitEntry.maxHp, unitEntry.hp + Math.max(1, Math.ceil(unitEntry.maxHp * ratio)) + bavariaBonus);
        }
        unitEntry.lastAttacked = false;
      }
    }
    function grantIncome(owner) {
      const base = game.sites.filter((entry) => entry.owner === owner).reduce((sum, entry) => sum + entry.income, 0);
      const incFac = owner === "player" ? game.settings?.faction : game.aiProfiles?.[owner]?.faction;
      const incNation = owner === "player" ? game.settings?.nation : game.aiProfiles?.[owner]?.nation;
      const factionMult = incFac === "venice" ? 1.25 : 1;
      let nationIncomeBonus = 0;
      if (incNation === "austria" || incNation === "egypt") nationIncomeBonus += game.sites.filter((s) => s.kind === "city" && s.owner === owner).length * 2;
      if (incNation === "genoa") nationIncomeBonus += Math.round(base * 0.1);
      const gain = Math.round(base * (game.settings?.incomeMult || 1) * factionMult) + nationIncomeBonus;
      const incomePayload = { owner, amount: gain };
      eventBus.emit("incomeCalculated", incomePayload);
      game.goldByOwner[owner] += incomePayload.amount;
      if (gain > 0) {
        log(`${ownerName(owner)}获得 ${gain} 金币收入。`, "gold");
      }
    }
    function beginTurn(owner, initial) {
      if (game.over) {
        return;
      }
      if (!ownerExists(owner)) {
        advanceTurn();
        return;
      }
      game.side = owner;
      game.buildsThisTurn = game.buildsThisTurn || {};
      game.buildsThisTurn[owner] = 0;
      statusSystem.tickStatuses(game.units.map((u) => u.id));
      if (!initial) {
        decayFrontMemory(owner);
        decayTemporarySites(owner);
        healOwner(owner);
        grantIncome(owner);
        aiRepair(owner);
        const ownerFac = owner === "player" ? game.settings?.faction : game.aiProfiles?.[owner]?.faction;
        if (ownerFac === "hre") {
          for (const siteEntry of game.sites.filter((s) => s.kind === "city" && s.owner === owner)) {
            if (!getUnit2(siteEntry.x, siteEntry.y)) {
              game.units.push(unit("militia", owner, siteEntry.x, siteEntry.y));
            }
          }
        }
        if (ownerFac === "ming" && game.turn % 3 === 0) {
          for (const siteEntry of game.sites.filter((s) => (s.kind === "city" || s.kind === "barracks") && s.owner === owner)) {
            if (!getUnit2(siteEntry.x, siteEntry.y)) {
              game.units.push(unit("militia", owner, siteEntry.x, siteEntry.y));
            }
          }
        }
      }
      eventBus.emit("turnStart", { owner, initial });
      for (const unitEntry of game.units.filter((entry) => entry.owner === owner)) {
        unitEntry.maxMove = effectiveMove(unitEntry);
        unitEntry.move = unitEntry.maxMove;
        unitEntry.acted = false;
        unitEntry.hasAttacked = false;
      }
      if (owner !== "player") {
        game.selected = null;
      }
      refresh();
      if (!initial) {
        checkEnd2();
      }
      if (owner !== "player" && !fastSim) {
        setTimeout(() => {
          if (!game.over && game.side === owner) {
            void aiTurn(owner);
          }
        }, 260);
      }
    }
    function advanceTurn() {
      if (game.over) {
        return;
      }
      game.currentIndex = (game.currentIndex + 1) % game.ownerOrder.length;
      if (game.currentIndex === 0) {
        game.turn += 1;
        if (game.turn > MAX_TURNS && !game.freeplay && !game.over) {
          resolveStalemate2();
          if (game.over) {
            return;
          }
        }
      }
      const endedOwner = game.ownerOrder[(game.currentIndex - 1 + game.ownerOrder.length) % game.ownerOrder.length];
      eventBus.emit("turnEnd", { owner: endedOwner });
      beginTurn(game.ownerOrder[game.currentIndex], false);
    }
    const turnDeps = { teamOf: teamOf2, areAllies: areAllies2, teamName, typeMeta, isTransportUnit, cellKey, getSite: getSite2, adjacent8: adjacent82, isLandTile, finish };
    function teamStandings2() {
      return teamStandings(game, turnDeps);
    }
    function resolveStalemate2() {
      return resolveStalemate(game, turnDeps);
    }
    function landUnitCanReachForeignCity2(unitEntry) {
      return landUnitCanReachForeignCity(game, turnDeps, unitEntry);
    }
    function teamCanContestLand2(team) {
      return teamCanContestLand(game, turnDeps, team);
    }
    function dominantCityTeam2() {
      return dominantCityTeam(game, turnDeps);
    }
    function checkEnd2() {
      return checkEnd(game, turnDeps);
    }
    function finish(win, text) {
      game.over = true;
      game.stats.endTime = Date.now();
      game.result = { win, text };
      recordStatSnapshot("finish");
      if (fastSim) {
        return;
      }
      $("modalTitle").textContent = win === null ? "对局结束" : win ? "胜利！" : "战败";
      $("modalText").textContent = text;
      $("statsPanel").classList.remove("hidden");
      renderStatsSummary(true);
      drawStatsChart();
      $("overlay").classList.remove("hidden");
      refresh();
    }
    function endGameNeutral() {
      if (!game || game.over) {
        return;
      }
      $("pauseModal")?.classList.add("hidden");
      finish(null, "本局已手动结束，以下为本局统计。");
    }
    function sideLabel() {
      if (game.settings?.spectator) {
        return `观战中 · ${ownerShort(game.side)}行动中 · ${teamName(teamOf2(game.side))}`;
      }
      return game.side === "player" ? `你的回合 · ${teamName(teamOf2("player"))}` : `${ownerShort(game.side)}行动中 · ${teamName(teamOf2(game.side))}`;
    }
    function ownerFaction(owner) {
      if (owner === "player") return game.settings?.faction;
      return game.aiProfiles?.[owner]?.faction;
    }
    function ownerNation2(owner) {
      if (owner === "player") return game.settings?.nation;
      return game.aiProfiles?.[owner]?.nation;
    }
    function buildableTypes(siteEntry) {
      const domain = siteMeta(siteEntry.kind).domain;
      if (!domain) {
        return [];
      }
      const faction = ownerFaction(siteEntry.owner);
      const nation = ownerNation2(siteEntry.owner);
      const isVenice = faction === "venice";
      return Object.keys(TYPES).filter((type) => {
        const meta = typeMeta(type);
        if (meta.domain !== domain || meta.level > siteEntry.tier) return false;
        if (!isVenice && meta.faction && meta.faction !== faction) return false;
        if (!isVenice && meta.nation && meta.nation !== nation) return false;
        return true;
      });
    }
    function siteUpgradeCost(siteEntry) {
      return siteMeta(siteEntry.kind).upgradeCosts[siteEntry.tier] || 0;
    }
    function buildBudgetLeft(owner) {
      return (game.settings?.buildCap ?? 100) - (game.buildsThisTurn?.[owner] || 0);
    }
    function recordBuild(owner, count) {
      game.buildsThisTurn = game.buildsThisTurn || {};
      game.buildsThisTurn[owner] = (game.buildsThisTurn[owner] || 0) + count;
    }
    function buildAtSite(owner, siteEntry, type, options = {}) {
      const cargoTypes = isTransportType(type) ? normalizeCargoTypes(options.cargoTypes) : [];
      const totalCost = factionAdjustedCost(owner, type, cargoTypes);
      const builtUnits = isTransportType(type) ? 1 + cargoTypes.length : 1;
      if (!siteEntry || siteEntry.owner !== owner || !buildableTypes(siteEntry).includes(type) || getUnit2(siteEntry.x, siteEntry.y) || game.goldByOwner[owner] < totalCost) {
        return false;
      }
      if (atUnitCap(owner, typeMeta(type).domain) || buildBudgetLeft(owner) < builtUnits) {
        return false;
      }
      recordBuild(owner, builtUnits);
      game.goldByOwner[owner] -= totalCost;
      let created = null;
      if (isTransportType(type)) {
        created = createLoadedTransport(owner, siteEntry.x, siteEntry.y, cargoTypes, type);
        game.units.push(created);
        log(`${ownerName(owner)}在${siteEntry.name}下水了${typeMeta(type).name}，预载 ${describeCargo(cargoTypes)}。`, "system");
        incrementStat("produced", owner, 1 + cargoTypes.length);
      } else {
        created = unit(type, owner, siteEntry.x, siteEntry.y);
        game.units.push(created);
        log(`${ownerName(owner)}在${siteEntry.name}部署了${typeMeta(type).name}。`, "system");
        incrementStat("produced", owner, 1);
      }
      recordStatSnapshot("build");
      eventBus.emit("productionCompleted", { owner, unit: created, site: siteEntry, kind: isTransportType(type) ? "ship" : "unit" });
      return true;
    }
    function upgradeSite(owner, siteEntry) {
      const cost = siteUpgradeCost(siteEntry);
      if (!siteEntry || siteEntry.owner !== owner || siteEntry.tier >= siteMeta(siteEntry.kind).maxTier || game.goldByOwner[owner] < cost) {
        return false;
      }
      game.goldByOwner[owner] -= cost;
      siteEntry.tier += 1;
      siteEntry.income += siteEntry.kind === "city" ? 3 : 2;
      log(`${siteEntry.name}升级为${tierName(siteEntry.tier)}${siteMeta(siteEntry.kind).name}。`, "system");
      return true;
    }
    function fullHealSite(owner, siteEntry) {
      const occupant = getUnit2(siteEntry.x, siteEntry.y);
      const cost = siteEntry.kind === "city" || siteEntry.kind === "camp" ? 5 : siteEntry.kind === "shipyard" ? 6 : 7;
      if (!siteEntry || siteEntry.owner !== owner || !occupant || occupant.owner !== owner || game.goldByOwner[owner] < cost) {
        return false;
      }
      game.goldByOwner[owner] -= cost;
      occupant.hp = occupant.maxHp;
      log(`${siteEntry.name}花费${cost}金币完成驻军修整。`, "gold");
      return true;
    }
    function aiRepair(owner) {
      for (const siteEntry of game.sites.filter((entry) => entry.owner === owner)) {
        const occupant = getUnit2(siteEntry.x, siteEntry.y);
        if (!occupant || occupant.owner !== owner || occupant.hp >= occupant.maxHp) {
          continue;
        }
        const cost = siteEntry.kind === "city" || siteEntry.kind === "camp" ? 5 : siteEntry.kind === "shipyard" ? 6 : 7;
        if (occupant.hp <= occupant.maxHp * 0.45 && game.goldByOwner[owner] >= cost) {
          game.goldByOwner[owner] -= cost;
          occupant.hp = occupant.maxHp;
          log(`${ownerName(owner)}在${siteEntry.name}完成驻军修整。`, "system");
        }
      }
    }
    function consumeAction(unitEntry) {
      unitEntry.move = 0;
      unitEntry.acted = true;
      unitEntry.hasAttacked = true;
    }
    function engineerBuildCells(unitEntry) {
      return adjacent82(unitEntry.x, unitEntry.y).filter((cell) => isWaterTile(cell.x, cell.y) && !getUnit2(cell.x, cell.y));
    }
    function canBuildCamp(unitEntry) {
      return !!unitEntry && unitEntry.type === "engineer" && unitEntry.owner === game.side && !unitEntry.acted && isLandTile(unitEntry.x, unitEntry.y) && !getSite2(unitEntry.x, unitEntry.y) && game.goldByOwner[unitEntry.owner] >= CAMP_COST && campCount2(unitEntry.owner) < MAX_CAMPS_PER_SIDE;
    }
    function canEngineerLaunch(unitEntry, type, cell, cargoTypes = []) {
      const totalCost = factionAdjustedCost(unitEntry.owner, type, cargoTypes);
      return !!unitEntry && unitEntry.type === "engineer" && unitEntry.owner === game.side && !unitEntry.acted && !!cell && diagonalDist(unitEntry, cell) === 1 && isWaterTile(cell.x, cell.y) && !getUnit2(cell.x, cell.y) && game.goldByOwner[unitEntry.owner] >= totalCost;
    }
    function buildCamp(unitEntry) {
      if (!canBuildCamp(unitEntry) || campCount2(unitEntry.owner) >= MAX_CAMPS_PER_SIDE) {
        return false;
      }
      game.goldByOwner[unitEntry.owner] -= CAMP_COST;
      game.sites.push(createCamp(unitEntry.owner, unitEntry.x, unitEntry.y));
      consumeAction(unitEntry);
      clearPendingOrder();
      incrementStat("captures", unitEntry.owner, 1);
      incrementStrat(unitEntry.owner, "campsBuilt");
      recordStatSnapshot("camp");
      log(`${ownerName(unitEntry.owner)}的工程师建立了临时营地，可维持 ${CAMP_DURATION} 回合。`, "system");
      return true;
    }
    function engineerLaunch(unitEntry, type, cell, cargoTypes = []) {
      const totalCost = factionAdjustedCost(unitEntry.owner, type, cargoTypes);
      const builtUnits = isTransportType(type) ? 1 + cargoTypes.length : 1;
      if (!canEngineerLaunch(unitEntry, type, cell, cargoTypes)) {
        return false;
      }
      if (atUnitCap(unitEntry.owner, typeMeta(type).domain) || buildBudgetLeft(unitEntry.owner) < builtUnits) {
        return false;
      }
      recordBuild(unitEntry.owner, builtUnits);
      game.goldByOwner[unitEntry.owner] -= totalCost;
      game.units.push(isTransportType(type) ? createLoadedTransport(unitEntry.owner, cell.x, cell.y, cargoTypes, type) : unit(type, unitEntry.owner, cell.x, cell.y));
      consumeAction(unitEntry);
      clearPendingOrder();
      incrementStat("produced", unitEntry.owner, isTransportType(type) ? 1 + cargoTypes.length : 1);
      if (isTransportType(type)) {
        incrementStrat(unitEntry.owner, "transportLaunches");
      }
      recordStatSnapshot("engineer-build");
      log(`${ownerName(unitEntry.owner)}的工程师在海边建造了${isTransportType(type) ? `${typeMeta(type).name}（${describeCargo(cargoTypes)}）` : typeMeta(type).name}。`, "system");
      return true;
    }
    function drawSelection(x, y, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x * S + 3, y * S + 3, S - 6, S - 6);
      ctx.restore();
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.setTransform(zoom, 0, 0, zoom, -cam.x * zoom, -cam.y * zoom);
      const activeUnit = selectedUnit();
      const activeSite = selectedSite();
      const canMoveNow = activeUnit && !activeUnit.hasAttacked && activeUnit.move > 0;
      const moves = canMoveNow && game.side === "player" ? reachable(game, activeUnit) : /* @__PURE__ */ new Map();
      const unloadHints = activeUnit && typeMeta(activeUnit.type).transport && activeUnit.cargo.length ? adjacent82(activeUnit.x, activeUnit.y).filter((cell) => canUnloadTransport(activeUnit, cell.x, cell.y)) : [];
      const engineerHints = game.pendingOrder?.kind === "engineer-launch" && activeUnit?.id === game.pendingOrder.builderId ? engineerBuildCells(activeUnit) : [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const tile = TERRAIN[game.terrain[y][x]];
          const px = x * S;
          const py = y * S;
          ctx.fillStyle = tile.color;
          ctx.fillRect(px, py, S, S);
          ctx.strokeStyle = "rgba(5,15,22,.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, S, S);
          if (tile.mark) {
            ctx.fillStyle = "rgba(255,255,255,.26)";
            ctx.font = `${Math.floor(S * 0.35)}px serif`;
            ctx.textAlign = "center";
            ctx.fillText(tile.mark, px + S / 2, py + S * 0.64);
          }
          if (moves.has(cellKey(x, y)) && (!activeUnit || x !== activeUnit.x || y !== activeUnit.y)) {
            ctx.fillStyle = "rgba(77,164,255,.24)";
            ctx.fillRect(px + 2, py + 2, S - 4, S - 4);
          }
          if (unloadHints.some((cell) => cell.x === x && cell.y === y)) {
            ctx.fillStyle = "rgba(86,211,100,.22)";
            ctx.fillRect(px + 4, py + 4, S - 8, S - 8);
          }
          if (engineerHints.some((cell) => cell.x === x && cell.y === y)) {
            ctx.fillStyle = "rgba(242,166,90,.22)";
            ctx.fillRect(px + 6, py + 6, S - 12, S - 12);
          }
        }
      }
      for (const siteEntry of game.sites) {
        const px = siteEntry.x * S;
        const py = siteEntry.y * S;
        const pad = S * 0.14;
        ctx.fillStyle = ownerColor(siteEntry.owner);
        ctx.fillRect(px + pad, py + pad, S - pad * 2, S - pad * 2);
        ctx.strokeStyle = "rgba(6,12,18,.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + pad, py + pad, S - pad * 2, S - pad * 2);
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(S * 0.42)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(siteMeta(siteEntry.kind).icon, px + S / 2, py + S * 0.56);
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ffe08a";
        ctx.font = `${Math.max(8, Math.floor(S * 0.2))}px sans-serif`;
        ctx.fillText("★".repeat(siteStars(siteEntry)), px + S / 2, py + pad + S * 0.17);
      }
      const cellStacks = /* @__PURE__ */ new Map();
      for (const unitEntry of game.units) {
        const key = cellKey(unitEntry.x, unitEntry.y);
        if (!cellStacks.has(key)) {
          cellStacks.set(key, []);
        }
        cellStacks.get(key).push(unitEntry);
      }
      for (const unitEntry of game.units) {
        const stack = cellStacks.get(cellKey(unitEntry.x, unitEntry.y));
        const stackIndex = stack.indexOf(unitEntry);
        const spread = stack.length > 1 ? (stackIndex - (stack.length - 1) / 2) * S * 0.16 : 0;
        const px = unitEntry.x * S + S / 2 + spread;
        const py = unitEntry.y * S + S / 2 - spread;
        ctx.fillStyle = "rgba(6,13,20,.72)";
        if (typeMeta(unitEntry.type).domain === "sea") {
          ctx.fillRect(px - S * 0.28, py - S * 0.22, S * 0.56, S * 0.44);
          ctx.strokeStyle = ownerColor(unitEntry.owner);
          ctx.lineWidth = 3;
          ctx.strokeRect(px - S * 0.28, py - S * 0.22, S * 0.56, S * 0.44);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, S * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = ownerColor(unitEntry.owner);
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(S * 0.44)}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(typeMeta(unitEntry.type).icon, px, py + S * 0.12);
        ctx.fillStyle = unitEntry.owner === "player" ? "#55d77a" : "#ff6c66";
        ctx.fillRect(px - S * 0.3, py + S * 0.34, S * 0.6 * unitEntry.hp / unitEntry.maxHp, 4);
        if (unitEntry.cargo?.length) {
          ctx.fillStyle = "#e3b341";
          ctx.font = `${Math.max(9, Math.floor(S * 0.22))}px sans-serif`;
          ctx.fillText(`${unitEntry.cargo.length}`, px + S * 0.22, py - S * 0.18);
        }
        if (stack.length > 1 && stackIndex === 0) {
          ctx.fillStyle = "#7fd0ff";
          ctx.font = `${Math.max(9, Math.floor(S * 0.24))}px sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(`≡${stack.length}`, unitEntry.x * S + 3, unitEntry.y * S + S - 4);
          ctx.textAlign = "center";
        }
      }
      if (activeUnit) {
        drawSelection(activeUnit.x, activeUnit.y, "#9ecbff");
      }
      if (activeSite) {
        drawSelection(activeSite.x, activeSite.y, "#ffd36c");
      }
      ctx.restore();
      drawMinimap();
    }
    function clampCam() {
      const viewW = canvas.width / zoom;
      const viewH = canvas.height / zoom;
      cam.x = W * S <= viewW ? (W * S - viewW) / 2 : clamp(cam.x, 0, W * S - viewW);
      cam.y = H * S <= viewH ? (H * S - viewH) / 2 : clamp(cam.y, 0, H * S - viewH);
    }
    function centerCamOn(x, y) {
      cam.x = x * S + S / 2 - canvas.width / zoom / 2;
      cam.y = y * S + S / 2 - canvas.height / zoom / 2;
      clampCam();
    }
    function minZoom() {
      return clamp(Math.min(canvas.width / (W * S), canvas.height / (H * S)), 0.2, 1);
    }
    function mapIsPanned() {
      return W * S * zoom > canvas.width + 0.5 || H * S * zoom > canvas.height + 0.5;
    }
    function drawMinimap() {
      if (!mapIsPanned()) {
        return;
      }
      const mmW = 132;
      const mmH = Math.round(mmW * H / W);
      const ox = canvas.width - mmW - 10;
      const oy = canvas.height - mmH - 10;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(6,12,18,.8)";
      ctx.fillRect(ox - 2, oy - 2, mmW + 4, mmH + 4);
      const sx = mmW / W;
      const sy = mmH / H;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          ctx.fillStyle = TERRAIN[game.terrain[y][x]].color || "#26333f";
          ctx.fillRect(ox + x * sx, oy + y * sy, Math.ceil(sx), Math.ceil(sy));
        }
      }
      for (const siteEntry of game.sites) {
        ctx.fillStyle = ownerColor(siteEntry.owner);
        ctx.fillRect(ox + siteEntry.x * sx, oy + siteEntry.y * sy, Math.max(2, sx), Math.max(2, sy));
      }
      for (const unitEntry of game.units) {
        ctx.fillStyle = ownerColor(unitEntry.owner);
        ctx.fillRect(ox + unitEntry.x * sx, oy + unitEntry.y * sy, Math.max(1, sx * 0.7), Math.max(1, sy * 0.7));
      }
      ctx.strokeStyle = "#ffe08a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + cam.x / S * sx, oy + cam.y / S * sy, canvas.width / zoom / S * sx, canvas.height / zoom / S * sy);
    }
    function updatePanels() {
      $("gold").textContent = game.settings?.spectator ? game.goldByOwner[game.side] ?? 0 : game.goldByOwner.player;
      $("turn").textContent = game.turn;
      $("sideLabel").textContent = sideLabel();
      $("sideLabel").classList.toggle("enemy", game.side !== "player");
      $("btnEndTurn").disabled = game.settings?.spectator || game.side !== "player" || game.over;
      const selected = game.selected;
      const activeUnit = selectedUnit();
      const activeSite = selectedSite();
      $("selectionEmpty").classList.toggle("hidden", !!activeUnit || !!activeSite);
      $("selectionBody").classList.toggle("hidden", !activeUnit);
      if (activeUnit) {
        const unitEntry = activeUnit;
        const meta = typeMeta(unitEntry.type);
        const siteEntry = getSite2(unitEntry.x, unitEntry.y);
        const attackBuff = siteBonus(game, siteEntry, unitEntry, "attack");
        const defenseBuff = siteBonus(game, siteEntry, unitEntry, "defense");
        $("selIcon").textContent = meta.icon;
        $("selName").textContent = meta.name;
        $("selOwner").textContent = ownerName(unitEntry.owner);
        $("selHp").textContent = `${unitEntry.hp}/${unitEntry.maxHp}`;
        $("selMove").textContent = `${Math.floor(unitEntry.move)}/${unitEntry.maxMove}`;
        $("selHpBar").style.width = `${unitEntry.hp / unitEntry.maxHp * 100}%`;
        $("selMoveBar").style.width = `${unitEntry.move / unitEntry.maxMove * 100}%`;
        $("selAttrs").innerHTML = [
          `<div><span>军种：</span>${domainName(meta.domain)}</div>`,
          `<div><span>射程：</span>${meta.range}</div>`,
          `<div><span>等级：</span>${unitEntry.rank}</div>`,
          `<div><span>击杀：</span>${unitEntry.kills}</div>`,
          `<div><span>攻击：</span>${meta.atk + attackBuff}</div>`,
          `<div><span>防御：</span>${meta.def + defenseBuff}</div>`,
          `<div><span>状态：</span>${unitEntry.hasAttacked ? "已攻击" : unitEntry.move < unitEntry.maxMove ? "已机动" : "待命"}</div>`,
          `<div><span>特性：</span>${meta.transport ? `载员 ${unitEntry.cargo.length}/${meta.transport}` : meta.text}</div>`
        ].join("");
        const actions = [];
        if (meta.transport) {
          actions.push(`<button class="btn" data-unit-action="load" ${unitEntry.cargo.length >= meta.transport ? "disabled" : ""}>装载邻近陆军</button>`);
          actions.push(`<button class="btn" data-unit-action="unload" ${unitEntry.cargo.length ? "" : "disabled"}>自动卸载到临近空地</button>`);
        }
        if (unitEntry.owner === "player" && game.side === "player") {
          actions.push(`<button class="btn" data-unit-action="sell">变卖回收 ${sellRefund(unitEntry)} 🪙</button>`);
        }
        const cellStack = unitsAt(unitEntry.x, unitEntry.y);
        if (cellStack.length > 1) {
          actions.push(`<div class="config-note">同格单位（${cellStack.length}）：</div>`);
          cellStack.forEach((entry) => {
            actions.push(`<button class="btn" data-select-unit="${entry.id}" ${entry === unitEntry ? "disabled" : ""}>${typeMeta(entry.type).icon} ${typeMeta(entry.type).name}</button>`);
          });
        }
        $("selActions").innerHTML = actions.join("");
        let selectionHint = meta.text;
        if (game.pendingOrder?.kind === "engineer-launch" && unitEntry.id === game.pendingOrder.builderId) {
          const productText = isTransportType(game.pendingOrder.product) ? `${typeMeta(game.pendingOrder.product).name}（${describeCargo(game.pendingOrder.cargoTypes)}）` : typeMeta(game.pendingOrder.product).name;
          selectionHint = `已选择建造${productText}，请点击相邻海格下水。`;
        } else if (siteEntry) {
          const attackText = attackBuff ? `攻击 +${attackBuff}` : "";
          const defenseText = defenseBuff ? `防御 +${defenseBuff}` : "";
          const joinText = attackText && defenseText ? "，" : "";
          selectionHint = `${siteEntry.name}提供${attackText}${joinText}${defenseText}。`;
        }
        $("selHint").textContent = selectionHint;
      } else {
        $("selActions").innerHTML = "";
      }
      const engineer = engineerSelected();
      $("engineerCard").classList.toggle("hidden", !engineer || game.side !== "player");
      if (engineer && game.side === "player") {
        const coastCells = engineerBuildCells(engineer);
        const warshipDisabled = coastCells.length && game.goldByOwner.player >= typeMeta("warship").cost && !engineer.acted ? "" : "disabled";
        const transportDisabled = coastCells.length && game.goldByOwner.player >= transportCost(uiState.engineerCargo) && !engineer.acted ? "" : "disabled";
        const campDisabled = canBuildCamp(engineer) ? "" : "disabled";
        const engineerPendingText = game.pendingOrder?.kind === "engineer-launch" && game.pendingOrder.builderId === engineer.id ? "待下水：点击高亮海格完成建造。" : coastCells.length ? "海边施工可用。" : "先移动到靠海陆格，才能下水建造舰船。";
        $("engineerBody").innerHTML = [
          '<div class="engineer-panel">',
          `<h3>${typeMeta(engineer.type).icon} ${typeMeta(engineer.type).name}</h3>`,
          `<div class="config-note">工程师可在相邻海格建造舰船，也可在当前位置建立可维持 ${CAMP_DURATION} 回合的临时营地。</div>`,
          transportConfigMarkup("engineerCargo", "工程师运兵船预载"),
          '<div class="engineer-actions">',
          `<button class="btn" data-engineer-build="galley" ${warshipDisabled}>在相邻海格建造桨帆船（${typeMeta("galley").cost} 🪙）</button>`,
          `<button class="btn" data-engineer-build="warship" ${warshipDisabled}>在相邻海格建造战船（${typeMeta("warship").cost} 🪙）</button>`,
          `<button class="btn" data-engineer-build="battleship" ${warshipDisabled}>在相邻海格建造战舰（${typeMeta("battleship").cost} 🪙）</button>`,
          `<button class="btn" data-engineer-build="barge" ${transportDisabled}>在相邻海格建造驳船（${transportCost(uiState.engineerCargo, "barge")} 🪙）</button>`,
          `<button class="btn" data-engineer-build="transport" ${transportDisabled}>在相邻海格建造运兵船（${transportCost(uiState.engineerCargo, "transport")} 🪙）</button>`,
          `<button class="btn" data-engineer-build="camp" ${campDisabled}>建立临时营地（${CAMP_COST} 🪙）</button>`,
          "</div>",
          `<div class="engineer-pending">${engineerPendingText}</div>`,
          "</div>"
        ].join("");
      } else {
        $("engineerBody").innerHTML = "";
      }
      const showSite = !!activeSite;
      const manageable = !!activeSite && activeSite.owner === "player" && game.side === "player";
      $("buildEmpty").classList.toggle("hidden", showSite);
      $("buildBody").classList.toggle("hidden", !showSite);
      if (showSite) {
        const siteEntry = activeSite;
        const occupant = getUnit2(siteEntry.x, siteEntry.y);
        const cost = siteEntry.kind === "city" || siteEntry.kind === "camp" ? 5 : siteEntry.kind === "shipyard" ? 6 : 7;
        $("cityName").textContent = siteEntry.name;
        $("cityTier").textContent = `${tierName(siteEntry.tier)}${siteMeta(siteEntry.kind).name}`;
        $("cityIncome").textContent = `+${siteEntry.income}`;
        $("cityBonus").textContent = siteEntry.kind === "city" ? `生产陆军，驻军攻击 +${siteEntry.tier}，防御 +${siteEntry.tier * 2}。` : siteEntry.kind === "shipyard" ? `生产海军；运兵船可直接预载 0~5 个陆军单位下水。` : siteEntry.kind === "camp" ? `视为中级城市，不产金币，可存在 ${siteEntry.duration ?? CAMP_DURATION} 回合。` : siteEntry.kind.startsWith("oil") ? `不可升级、不可造兵；每回合收益 ${siteEntry.income} 🪙。` : siteEntry.kind.startsWith("barracks") ? `不可升级、不可产金币；驻军加成等同 ${siteMeta(siteEntry.kind).supportTier} 级普通据点。` : "海上堡垒不可生产单位，但提供海上防御。";
        $("btnUpgrade").textContent = siteEntry.tier < siteMeta(siteEntry.kind).maxTier ? `升级至${tierName(siteEntry.tier + 1)}（${siteUpgradeCost(siteEntry)} 🪙）` : "已达最高等级";
        $("btnUpgrade").disabled = !manageable || siteEntry.tier >= siteMeta(siteEntry.kind).maxTier || game.goldByOwner.player < siteUpgradeCost(siteEntry);
        $("btnFullHeal").textContent = occupant ? `花费${cost}金币：驻军修整` : "当前据点无驻军";
        $("btnFullHeal").disabled = !manageable || !occupant || game.goldByOwner.player < cost;
        $("shipyardConfig").classList.toggle("hidden", siteEntry.kind !== "shipyard");
        $("shipyardConfig").innerHTML = siteEntry.kind === "shipyard" ? transportConfigMarkup("shipyardCargo", "运兵船预载") : "";
        const types = buildableTypes(siteEntry);
        $("buildGrid").innerHTML = types.length ? types.map((type) => {
          const costText = isTransportType(type) ? transportCost(uiState.shipyardCargo, button.dataset.type) : typeMeta(type).cost;
          const disabled = !manageable || game.goldByOwner.player < costText || getUnit2(siteEntry.x, siteEntry.y);
          const suffix = isTransportType(type) ? `<small> 预载：${describeCargo(uiState.shipyardCargo)}</small>` : `<small> ${domainName(typeMeta(type).domain)} ${tierName(typeMeta(type).level)}</small>`;
          return `<button class="btn build" data-type="${type}" ${disabled ? "disabled" : ""}><span>${typeMeta(type).icon} ${typeMeta(type).name}${suffix}</span><span class="cost">${costText} 🪙</span></button>`;
        }).join("") : '<div class="muted">该据点不能生产单位。</div>';
      } else {
        $("shipyardConfig").classList.add("hidden");
        $("shipyardConfig").innerHTML = "";
      }
      $("log").innerHTML = game.logs.map((entry) => `<div class="entry ${entry.kind}">${entry.text}</div>`).join("");
    }
    function refresh() {
      if (fastSim) {
        return;
      }
      draw();
      updatePanels();
    }
    function selectRef(kind, ref) {
      if (!ref || game.selected?.ref?.id !== ref.id) {
        clearPendingOrder();
      }
      if (!ref) {
        game.selected = null;
        refresh();
        return;
      }
      game.selected = {
        kind,
        ref,
        unit: kind === "unit" ? ref : getUnit2(ref.x, ref.y),
        site: kind === "site" ? ref : getSite2(ref.x, ref.y)
      };
      refresh();
    }
    function tileFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      const sx = (event.clientX - rect.left) * canvas.width / rect.width;
      const sy = (event.clientY - rect.top) * canvas.height / rect.height;
      return {
        x: Math.floor((cam.x + sx / zoom) / S),
        y: Math.floor((cam.y + sy / zoom) / S)
      };
    }
    function onBoard(event) {
      if (!game || game.over) {
        return;
      }
      const cell = tileFromEvent(event);
      if (!inBounds3(cell.x, cell.y)) {
        return;
      }
      const targetUnit = getUnit2(cell.x, cell.y);
      const targetSite = getSite2(cell.x, cell.y);
      const selectedUnit2 = game.selected?.kind === "unit" ? game.selected.ref : null;
      const ownUnit = selectedUnit2 && selectedUnit2.owner === "player" ? selectedUnit2 : null;
      if (game.settings?.spectator) {
        if (targetUnit) {
          selectRef("unit", targetUnit);
          return;
        }
        if (targetSite) {
          selectRef("site", targetSite);
        }
        return;
      }
      if (game.pendingOrder?.kind === "engineer-launch" && ownUnit && ownUnit.id === game.pendingOrder.builderId && canEngineerLaunch(ownUnit, game.pendingOrder.product, cell, game.pendingOrder.cargoTypes)) {
        engineerLaunch(ownUnit, game.pendingOrder.product, cell, game.pendingOrder.cargoTypes);
        selectRef("unit", ownUnit);
        return;
      }
      if (ownUnit && targetUnit && isTransportUnit(ownUnit) && canLoadTransport(ownUnit, targetUnit)) {
        loadTransport(ownUnit, targetUnit);
        selectRef("unit", ownUnit);
        return;
      }
      if (ownUnit && targetUnit && isTransportUnit(targetUnit) && canLoadTransport(targetUnit, ownUnit)) {
        loadTransport(targetUnit, ownUnit);
        selectRef("unit", targetUnit);
        return;
      }
      if (ownUnit && !targetUnit && isTransportUnit(ownUnit) && canUnloadTransport(ownUnit, cell.x, cell.y)) {
        unloadTransport(ownUnit, cell.x, cell.y);
        selectRef("unit", ownUnit);
        return;
      }
      if (targetUnit?.owner === "player") {
        ensureStatsStarted();
        const ownStack = unitsAt(cell.x, cell.y).filter((entry) => entry.owner === "player");
        if (ownStack.length > 1 && ownUnit && ownStack.includes(ownUnit)) {
          selectRef("unit", ownStack[(ownStack.indexOf(ownUnit) + 1) % ownStack.length]);
        } else {
          selectRef("unit", targetUnit);
        }
        return;
      }
      if (ownUnit && targetUnit && canAttack(game, ownUnit, targetUnit)) {
        attack(ownUnit, targetUnit);
        selectRef(game.units.includes(ownUnit) ? "unit" : null, game.units.includes(ownUnit) ? ownUnit : null);
        return;
      }
      if (targetUnit) {
        selectRef("unit", targetUnit);
        return;
      }
      if (ownUnit && !targetUnit && moveUnit(ownUnit, cell.x, cell.y)) {
        selectRef("unit", ownUnit);
        return;
      }
      if (targetSite) {
        if (targetSite.owner === "player") {
          ensureStatsStarted();
        }
        selectRef("site", targetSite);
        return;
      }
      toast("请选择己方单位，或点击有效的移动、攻击、装载、卸载目标。");
    }
    function endTurn() {
      if (!game || game.settings?.spectator || game.side !== "player" || game.over) {
        return;
      }
      clearPendingOrder();
      game.selected = null;
      advanceTurn();
    }
    function collectLandCells() {
      const cells = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (game.terrain[y][x] !== "water" && game.terrain[y][x] !== "mountain") {
            cells.push({ x, y });
          }
        }
      }
      return cells;
    }
    function pickSpacedCells(pool, count, minGap) {
      const picks = [];
      for (const cell of shuffle(pool)) {
        if (picks.length >= count) {
          break;
        }
        if (picks.every((other) => dist(cell, other) >= minGap)) {
          picks.push(cell);
        }
      }
      return picks;
    }
    function farthestPointSample(pool, count, usedKeys) {
      if (count <= 0 || !pool.length) {
        return [];
      }
      const avail = usedKeys ? pool.filter((cell) => !usedKeys.has(cellKey(cell.x, cell.y))) : pool.slice();
      if (!avail.length) {
        return [];
      }
      const minD = new Array(avail.length).fill(Infinity);
      const picks = [];
      let idx = Math.floor(Math.random() * avail.length);
      for (let k = 0; k < count && k < avail.length; k++) {
        const chosen = avail[idx];
        picks.push(chosen);
        let farIdx = -1;
        let farDist = -1;
        for (let i = 0; i < avail.length; i++) {
          const d = dist(avail[i], chosen);
          if (d < minD[i]) {
            minD[i] = d;
          }
          if (minD[i] > farDist) {
            farDist = minD[i];
            farIdx = i;
          }
        }
        idx = farIdx;
      }
      return picks;
    }
    function distributeCells(pool, count, spread) {
      if (!pool.length || count <= 0) {
        return [];
      }
      count = Math.min(count, pool.length);
      const clusterFactor = clamp((spread ?? 50) / 100, 0, 1);
      const clusterShare = clusterFactor * (0.5 + Math.random() * 0.4);
      const clusterCount = Math.min(count, Math.round(clusterShare * count));
      const uniformCount = count - clusterCount;
      const used = /* @__PURE__ */ new Set();
      const picks = [];
      for (const cell of farthestPointSample(pool, uniformCount, used)) {
        picks.push(cell);
        used.add(cellKey(cell.x, cell.y));
      }
      if (clusterCount > 0) {
        const centerN = clamp(1 + Math.floor(Math.random() * 4), 1, Math.max(1, Math.ceil(clusterCount / 2)));
        const centers = Array.from({ length: centerN }, () => pool[Math.floor(Math.random() * pool.length)]);
        for (let i = 0; i < clusterCount; i++) {
          const center = centers[i % centers.length];
          let best = null;
          let bestD = Infinity;
          const tries = Math.min(pool.length, 200);
          for (let t = 0; t < tries; t++) {
            const cell = pool[Math.floor(Math.random() * pool.length)];
            if (used.has(cellKey(cell.x, cell.y))) {
              continue;
            }
            const d = dist(cell, center) + Math.random() * 3;
            if (d < bestD) {
              bestD = d;
              best = cell;
            }
          }
          if (best) {
            picks.push(best);
            used.add(cellKey(best.x, best.y));
          }
        }
      }
      return picks;
    }
    function makeCities(aiCount, sizeKey, spread) {
      const cells = collectLandCells();
      const owners = ["player", ...Array.from({ length: aiCount }, (_, index) => `ai${index}`)];
      let ownerGap = clamp(Math.round(Math.sqrt(2 * W * H / owners.length) * 0.72), 4, Math.floor((W + H) / 2));
      let ownerCells = pickSpacedCells(cells, owners.length, ownerGap);
      while (ownerCells.length < owners.length && ownerGap > 3) {
        ownerGap = Math.max(3, Math.floor(ownerGap * 0.75));
        ownerCells = pickSpacedCells(cells, owners.length, ownerGap);
      }
      if (ownerCells.length < owners.length) {
        const chosen = new Set(ownerCells.map((cell) => cellKey(cell.x, cell.y)));
        for (const cell of shuffle(cells)) {
          if (ownerCells.length >= owners.length) {
            break;
          }
          const key = cellKey(cell.x, cell.y);
          if (!chosen.has(key)) {
            chosen.add(key);
            ownerCells.push(cell);
          }
        }
      }
      const density = game.settings?.siteDensity ?? 1;
      const baseTotal = Math.max(6, aiCount + 4) + ({ small: 1, medium: 4, large: 8, huge: 12, giant: 18, colossal: 26 }[sizeKey] || 0);
      const neutralCount = Math.min(cells.length - owners.length, Math.max(0, Math.round((baseTotal - owners.length) * density)));
      const usedKeys = new Set(ownerCells.map((cell) => cellKey(cell.x, cell.y)));
      const neutralPool = cells.filter((cell) => !usedKeys.has(cellKey(cell.x, cell.y)));
      const neutralCells = distributeCells(neutralPool, neutralCount, spread);
      const entries = [
        ...ownerCells.map((cell, index) => ({ cell, owner: owners[index] })),
        ...neutralCells.map((cell) => ({ cell, owner: "neutral" }))
      ];
      return entries.map((entry, index) => {
        const tier = Math.random() < 0.62 ? 1 : Math.random() < 0.84 ? 2 : 3;
        return site("city", entry.owner, entry.cell.x, entry.cell.y, CITY_NAMES[index % CITY_NAMES.length], tier, CITY_INCOME_BY_TIER[tier]);
      });
    }
    function makeSpecialSites() {
      const used = new Set(game.sites.map((entry) => cellKey(entry.x, entry.y)));
      const land = collectLandCells().filter((cell) => !used.has(cellKey(cell.x, cell.y)));
      const density = game.settings?.siteDensity ?? 1;
      const spread = game.settings?.spread ?? 50;
      const oilKinds = ["oilSmall", "oilMedium", "oilLarge"];
      const oilCount = clamp(Math.round(land.length / 120 * density), 2, 10);
      const oilCells = distributeCells(land, oilCount, spread);
      const specials = [];
      oilCells.forEach((cell, index) => {
        const kind = oilKinds[index % oilKinds.length];
        used.add(cellKey(cell.x, cell.y));
        specials.push(site(kind, "neutral", cell.x, cell.y, OIL_NAMES[index % OIL_NAMES.length], 1, siteMeta(kind).income));
      });
      const barracksPool = land.filter((cell) => !used.has(cellKey(cell.x, cell.y)));
      const barracksCount = clamp(Math.round(land.length / 150 * density), 2, 8);
      distributeCells(barracksPool, barracksCount, spread).forEach((cell, index) => {
        const kind = index % 2 === 0 ? "barracksLarge" : "barracksSmall";
        used.add(cellKey(cell.x, cell.y));
        specials.push(site(kind, "neutral", cell.x, cell.y, BARRACK_NAMES[index % BARRACK_NAMES.length], 1, 0));
      });
      return specials;
    }
    function nearestCoastalWater(homes, used) {
      const candidates = [];
      for (const home of homes) {
        for (let y = Math.max(0, home.y - 8); y <= Math.min(H - 1, home.y + 8); y++) {
          for (let x = Math.max(0, home.x - 8); x <= Math.min(W - 1, home.x + 8); x++) {
            if (!used.has(cellKey(x, y)) && isCoastalWater(x, y)) {
              candidates.push({ x, y, score: dist(home, { x, y }) });
            }
          }
        }
      }
      candidates.sort((a, b) => a.score - b.score);
      return candidates[0] || null;
    }
    function makeNavalSites() {
      const used = new Set(game.sites.map((entry) => cellKey(entry.x, entry.y)));
      const sites = [];
      for (const owner of ownerOrder()) {
        const homes = game.sites.filter((entry) => entry.owner === owner && entry.kind === "city");
        const cell = nearestCoastalWater(homes, used);
        if (!cell) {
          continue;
        }
        used.add(cellKey(cell.x, cell.y));
        sites.push(site("shipyard", owner, cell.x, cell.y, PORT_NAMES[sites.length % PORT_NAMES.length], Math.random() < 0.25 ? 2 : 1, 8 + rnd(3)));
      }
      const coastal = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!used.has(cellKey(x, y)) && isCoastalWater(x, y)) {
            coastal.push({ x, y });
          }
        }
      }
      const spread = game.settings?.spread ?? 50;
      const density = game.settings?.siteDensity ?? 1;
      for (const cell of distributeCells(coastal, clamp(Math.round(coastal.length / 60 * density), 1, 8), spread)) {
        used.add(cellKey(cell.x, cell.y));
        sites.push(site("shipyard", "neutral", cell.x, cell.y, PORT_NAMES[sites.length % PORT_NAMES.length], 1, 7 + rnd(3)));
      }
      const deep = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!used.has(cellKey(x, y)) && isDeepWater(x, y)) {
            deep.push({ x, y });
          }
        }
      }
      for (const cell of distributeCells(deep, clamp(Math.round(deep.length / 90 * density), 0, 6), spread)) {
        sites.push(site("fortress", "neutral", cell.x, cell.y, FORT_NAMES[sites.length % FORT_NAMES.length], 1, 5 + rnd(2)));
      }
      return sites;
    }
    function spawnLand(owner, homes, count, used, deploy) {
      const bag = ["militia", "scout", "spearman", "swordsman", "archer", "crossbow", "cavalry", "guard"];
      const centerX = homes.reduce((sum, entry) => sum + entry.x, 0) / homes.length;
      const centerY = homes.reduce((sum, entry) => sum + entry.y, 0) / homes.length;
      const radius = deploy === "tight" ? 3 : deploy === "loose" ? 6 : deploy === "veryLoose" ? 10 : Math.max(W, H);
      for (let i = 0; i < count; i++) {
        const cells = [];
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (isLandTile(x, y) && !used.has(cellKey(x, y)) && Math.hypot(x - centerX, y - centerY) <= radius) {
              cells.push({ x, y });
            }
          }
        }
        if (!cells.length) {
          continue;
        }
        cells.sort((a, b) => Math.hypot(a.x - centerX, a.y - centerY) - Math.hypot(b.x - centerX, b.y - centerY));
        const pick = deploy === "random" ? cells[rnd(cells.length)] : cells[rnd(Math.max(1, Math.min(cells.length, Math.ceil(cells.length * 0.5))))];
        used.add(cellKey(pick.x, pick.y));
        game.units.push(unit(bag[rnd(bag.length)], owner, pick.x, pick.y));
      }
    }
    function spawnSea(owner, count) {
      const ports = game.sites.filter((entry) => entry.owner === owner && entry.kind === "shipyard");
      let spawned = 0;
      for (const port of ports) {
        if (spawned >= count || getUnit2(port.x, port.y)) {
          continue;
        }
        game.units.push(unit(spawned === 0 ? "warship" : "transport", owner, port.x, port.y));
        spawned += 1;
      }
      return spawned;
    }
    function bestSupport(owner, unitEntry) {
      const supports = supportSites(unitEntry);
      supports.sort((a, b) => dist(a, unitEntry) - dist(b, unitEntry));
      return supports[0] || null;
    }
    function futureReach(unitEntry, lookahead) {
      return typeMeta(unitEntry.type).range + unitEntry.move + Math.max(0, lookahead - 1) * Math.max(1, Math.floor(unitEntry.maxMove * 0.85));
    }
    function isBridgeheadSite(siteEntry) {
      if (!siteEntry) {
        return false;
      }
      const passableNeighbors = adjacent4(siteEntry.x, siteEntry.y).filter((cell) => {
        if (game.terrain[siteEntry.y][siteEntry.x] === "water") {
          return isWaterTile(cell.x, cell.y);
        }
        return isLandTile(cell.x, cell.y);
      });
      return passableNeighbors.length <= 2;
    }
    function frontlineCount(owner, target, radius = 3) {
      if (!target) {
        return 0;
      }
      return game.units.filter((unitEntry) => unitEntry.owner === owner && dist(unitEntry, target) <= radius).length;
    }
    function logAiDecision(owner, text) {
      log(`${ownerName(owner)}部署：${text}`, "system");
    }
    function bestRetreatCell(owner, unitEntry, blockedSite) {
      const supports = supportSites(unitEntry);
      const home = supports.sort((a, b) => dist(a, unitEntry) - dist(b, unitEntry))[0] || null;
      const cells = [...reachable(game, unitEntry).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      if (!cells.length) {
        return null;
      }
      cells.push({ x: unitEntry.x, y: unitEntry.y });
      let best = null;
      let bestScore = -Infinity;
      for (const cell of cells) {
        const threat = enemyThreat(owner, cell.x, cell.y);
        const support = friendSupport(owner, cell.x, cell.y);
        const forest = game.terrain[cell.y][cell.x] === "forest" ? 8 : 0;
        const pullback = blockedSite ? dist(cell, blockedSite) * 1.6 : 0;
        const homeBias = home ? Math.max(0, 8 - dist(cell, home)) : 0;
        const score = support + forest + pullback + homeBias - threat * 1.2;
        if (score > bestScore) {
          bestScore = score;
          best = cell;
        }
      }
      return best;
    }
    function projectedPressure(owner, target, lookahead, excludeId = null) {
      let total = 0;
      for (const ally of game.units.filter((unitEntry) => unitEntry.owner === owner)) {
        if (ally.id === excludeId) {
          continue;
        }
        const reach = futureReach(ally, lookahead);
        const distance = dist(ally, target);
        if (distance > reach + 2) {
          continue;
        }
        total += Math.max(0, (typeMeta(ally.type).atk + typeMeta(ally.type).level * 2 - Math.max(0, distance - reach) * 2) * (ally.hp / ally.maxHp));
      }
      return total;
    }
    function siteProjectionValue(owner, siteEntry, lookahead) {
      const relevantUnits = game.units.filter((unitEntry) => unitEntry.owner === owner && (siteEntry.kind === "city" ? typeMeta(unitEntry.type).domain === "land" : true));
      const nearest = relevantUnits.length ? Math.min(...relevantUnits.map((unitEntry) => dist(unitEntry, siteEntry))) : Math.max(W, H);
      return strategicSiteValue(siteEntry, owner) + Math.max(0, lookahead * 8 - nearest);
    }
    function buildStrategicIntent(owner, profile) {
      const diffCfg = DIFF[profile.diff];
      const memory = frontMemory(owner);
      const enemies = game.units.filter((unitEntry) => areEnemies2(unitEntry.owner, owner));
      const focusTarget = enemies.map((unitEntry) => {
        const pressure = projectedPressure(owner, unitEntry, diffCfg.lookahead);
        return {
          unitEntry,
          score: targetValue(unitEntry) + pressure * 1.5 + (pressure >= unitEntry.hp ? 16 : 0) + (isTransportUnit(unitEntry) ? 8 : 0)
        };
      }).sort((a, b) => b.score - a.score)[0]?.unitEntry || null;
      const assaultRanked = game.sites.filter((siteEntry) => strategicSiteValue(siteEntry, owner) > 0).sort((a, b) => siteProjectionValue(owner, b, diffCfg.lookahead) - siteProjectionValue(owner, a, diffCfg.lookahead));
      const notCooled = (siteEntry) => !(memory[`site:${cellKey(siteEntry.x, siteEntry.y)}`]?.cooldown > 0);
      const assaultSite = assaultRanked.find(notCooled) || assaultRanked[0] || null;
      const expansionRanked = game.sites.filter((siteEntry) => cityEconomyValue(siteEntry, owner) > 0).sort((a, b) => cityEconomyValue(b, owner) - cityEconomyValue(a, owner));
      const expansionSite = expansionRanked.find(notCooled) || expansionRanked[0] || assaultSite;
      const alternateSites = game.sites.filter((siteEntry) => strategicSiteValue(siteEntry, owner) > 0).sort((a, b) => siteProjectionValue(owner, b, diffCfg.lookahead) - siteProjectionValue(owner, a, diffCfg.lookahead)).slice(0, 4);
      const navalSite = game.sites.filter((siteEntry) => siteEntry.kind !== "city" && strategicSiteValue(siteEntry, owner) > 0).sort((a, b) => siteProjectionValue(owner, b, diffCfg.lookahead) - siteProjectionValue(owner, a, diffCfg.lookahead))[0] || assaultSite;
      const cooledTargets = alternateSites.filter((siteEntry) => memory[`site:${cellKey(siteEntry.x, siteEntry.y)}`]?.cooldown > 0).map((siteEntry) => siteEntry.name);
      return { focusTarget, assaultSite, expansionSite, navalSite, alternateSites, cooledTargets };
    }
    function summarizeIntent(intent) {
      const assault = intent.assaultSite ? intent.assaultSite.name : "无";
      const expansion = intent.expansionSite ? intent.expansionSite.name : "无";
      const focus = intent.focusTarget ? typeMeta(intent.focusTarget.type).name : "无";
      return `主攻 ${assault}；扩张 ${expansion}；重点目标 ${focus}`;
    }
    function unitPriority(unitEntry, intent) {
      let priority = typeMeta(unitEntry.type).level * 5 + unitEntry.hp / unitEntry.maxHp * 4;
      if (intent.focusTarget) {
        priority += Math.max(0, 12 - dist(unitEntry, intent.focusTarget));
      }
      if (intent.assaultSite) {
        priority += Math.max(0, 8 - dist(unitEntry, intent.assaultSite));
      }
      if (intent.expansionSite) {
        priority += Math.max(0, 6 - dist(unitEntry, intent.expansionSite));
      }
      if (isTransportUnit(unitEntry) && intent.assaultSite?.kind === "city") {
        priority += 6;
      }
      if (intent.assaultSite && isBridgeheadSite(intent.assaultSite) && dist(unitEntry, intent.assaultSite) <= 3) {
        priority += 2;
      }
      return priority;
    }
    function bestObjective(owner, unitEntry, intent = null) {
      const defaultAgg = AGG[game.aiProfiles?.[owner]?.agg || "balanced"] || AGG.balanced;
      const state11 = unitEntry.aiState || { stalledTurns: 0, rerouteTurns: 0, failedObjectiveKey: null };
      const memory = frontMemory(owner);
      const isSea = typeMeta(unitEntry.type).domain === "sea";
      const pool = isSea ? [intent?.navalSite, intent?.assaultSite, intent?.expansionSite, ...intent?.alternateSites || []] : [intent?.expansionSite, intent?.assaultSite, ...intent?.alternateSites || []];
      const seen = /* @__PURE__ */ new Set();
      const candidates = [];
      const consider = (siteEntry) => {
        if (!siteEntry) {
          return;
        }
        const key = cellKey(siteEntry.x, siteEntry.y);
        if (seen.has(key)) {
          return;
        }
        if (strategicSiteValue(siteEntry, owner, unitEntry) <= 0) {
          return;
        }
        if (state11.rerouteTurns > 0 && state11.failedObjectiveKey === `site:${key}`) {
          return;
        }
        if (memory[`site:${key}`]?.cooldown > 0) {
          return;
        }
        seen.add(key);
        candidates.push(siteEntry);
      };
      pool.forEach(consider);
      if (candidates.length < 2) {
        game.sites.forEach(consider);
      }
      if (!candidates.length) {
        return unitEntry.hp <= unitEntry.maxHp * defaultAgg.retreatHp ? bestSupport(owner, unitEntry) : null;
      }
      let best = null;
      let bestScore = -Infinity;
      for (const siteEntry of candidates) {
        const value = strategicSiteValue(siteEntry, owner, unitEntry) + cityEconomyValue(siteEntry, owner);
        const distance = dist(unitEntry, siteEntry);
        const crowd = game.units.filter((entry) => entry.owner === owner && entry.id !== unitEntry.id && dist(entry, siteEntry) <= 3).length;
        const score = value / (1 + distance) - crowd * 1.1;
        if (score > bestScore) {
          bestScore = score;
          best = siteEntry;
        }
      }
      if (best && unitEntry.hp <= unitEntry.maxHp * defaultAgg.retreatHp && dist(unitEntry, best) > 2) {
        return bestSupport(owner, unitEntry);
      }
      return best;
    }
    function enemyThreat(owner, x, y) {
      let score = 0;
      for (const enemy of game.units.filter((entry) => areEnemies2(entry.owner, owner))) {
        const reach = enemy.move + typeMeta(enemy.type).range;
        const d = dist(enemy, { x, y });
        if (d <= reach + 1) {
          score += typeMeta(enemy.type).atk * (enemy.hp / enemy.maxHp) * (d <= typeMeta(enemy.type).range ? 1.2 : 0.55);
        }
      }
      const siteEntry = getSite2(x, y);
      if (siteEntry && areAllies2(siteEntry.owner, owner)) {
        score *= 0.82;
      }
      return score;
    }
    function friendSupport(owner, x, y) {
      return game.units.filter((entry) => areAllies2(entry.owner, owner) && dist(entry, { x, y }) <= 3).length * 1.4;
    }
    function allyCongestion(owner, cell, excludeId = null) {
      let total = 0;
      for (const ally of game.units) {
        if (ally.owner !== owner || ally.id === excludeId) {
          continue;
        }
        if (diagonalDist(ally, cell) <= 1) {
          total += diagonalDist(ally, cell) === 0 ? 1.6 : 0.65;
        }
      }
      return total;
    }
    function cityEconomyValue(siteEntry, owner) {
      if (areAllies2(siteEntry.owner, owner)) {
        return 0;
      }
      const earlyTurnBonus = Math.max(0, 10 - game.turn) * 1.8;
      const neutralBonus = siteEntry.owner === "neutral" ? 12 : 8;
      if (siteEntry.kind === "city") {
        return 18 + siteEntry.income * 2.2 + siteEntry.tier * 4 + earlyTurnBonus + neutralBonus;
      }
      if (siteEntry.kind.startsWith("oil")) {
        return 24 + siteEntry.income * 2.8 + earlyTurnBonus * 0.8 + neutralBonus;
      }
      if (siteEntry.kind === "shipyard") {
        return 16 + siteEntry.income * 1.8 + earlyTurnBonus * 0.5 + neutralBonus * 0.7;
      }
      return 0;
    }
    function computeUnitState(unitEntry) {
      const previous = unitEntry.aiState || { stalledTurns: 0, rerouteTurns: 0, failedObjectiveKey: null };
      return {
        ...previous,
        lastPosition: previous.lastPosition || { x: unitEntry.x, y: unitEntry.y }
      };
    }
    function strategicPassable(unitEntry, x, y) {
      if (!inBounds3(x, y)) {
        return false;
      }
      const domain = typeMeta(unitEntry.type).domain;
      if (domain === "sea") {
        return game.terrain[y][x] === "water";
      }
      return game.terrain[y][x] !== "water" && game.terrain[y][x] !== "mountain";
    }
    function buildDistanceField(unitEntry, target) {
      if (!target) {
        return null;
      }
      if (!strategicPassable(unitEntry, target.x, target.y)) {
        return null;
      }
      const domain = typeMeta(unitEntry.type).domain;
      const cacheKey = `${domain}:${target.x},${target.y}`;
      const useCache = typeof globalThis === "undefined" || !globalThis.__NO_DIST_CACHE;
      const cached = useCache ? distFieldCache.get(cacheKey) : void 0;
      if (cached) {
        return cached;
      }
      const distances = /* @__PURE__ */ new Map([[cellKey(target.x, target.y), 0]]);
      const queue = [{ x: target.x, y: target.y, cost: 0 }];
      let head = 0;
      while (head < queue.length) {
        const current = queue[head++];
        const nextCost = current.cost + 1;
        for (const next of adjacent82(current.x, current.y)) {
          if (!strategicPassable(unitEntry, next.x, next.y)) {
            continue;
          }
          const key = cellKey(next.x, next.y);
          if (!distances.has(key)) {
            distances.set(key, nextCost);
            queue.push({ x: next.x, y: next.y, cost: nextCost });
          }
        }
      }
      if (useCache) {
        distFieldCache.set(cacheKey, distances);
      }
      return distances;
    }
    function finalizeUnitState(unitEntry, state11, objectiveKey, movedThisTurn) {
      const stalledTurns = movedThisTurn ? 0 : state11.stalledTurns + 1;
      const rerouteTurns = movedThisTurn ? Math.max(0, state11.rerouteTurns - 1) : stalledTurns >= 2 ? 2 : Math.max(0, state11.rerouteTurns - 1);
      rememberFrontOutcome(unitEntry.owner, objectiveKey, movedThisTurn);
      if (!movedThisTurn && stalledTurns >= 2 && objectiveKey.startsWith("site:")) {
        const siteId = objectiveKey.slice(5);
        incrementStrat(unitEntry.owner, "stalls");
        logAiDecision(unitEntry.owner, `前线在 ${siteId} 方向受阻，准备改道或暂避。`);
      }
      unitEntry.aiState = {
        lastPosition: { x: unitEntry.x, y: unitEntry.y },
        stalledTurns,
        rerouteTurns,
        failedObjectiveKey: stalledTurns >= 2 ? objectiveKey : state11.failedObjectiveKey
      };
    }
    function targetValue(unitEntry) {
      return typeMeta(unitEntry.type).level * 8 + unitEntry.hp * 0.4 + (unitEntry.type === "engineer" ? 14 : 0);
    }
    function nearbyEnemies(cell, owner, radius = 1) {
      return game.units.filter((unitEntry) => areEnemies2(unitEntry.owner, owner) && dist(unitEntry, cell) <= radius).length;
    }
    function unitRoleCellBonus(owner, unitEntry, cell, intent) {
      const type = unitEntry.type;
      const siteEntry = getSite2(cell.x, cell.y);
      const coastal = adjacent82(cell.x, cell.y).some((next) => isWaterTile(next.x, next.y));
      let score = 0;
      if (type === "scout") {
        score += cityEconomyValue(siteEntry || { kind: "none", owner }, owner) * 0.35;
        score += coastal ? 1 : 0;
      }
      if (type === "spearman") {
        score += intent?.focusTarget?.type === "cavalry" ? 6 : 0;
        score += intent?.assaultSite && isBridgeheadSite(intent.assaultSite) && dist(cell, intent.assaultSite) <= 1 ? 5 : 0;
      }
      if (type === "archer" || type === "crossbow") {
        score += game.terrain[cell.y][cell.x] === "forest" ? 6 : 0;
        score -= nearbyEnemies(cell, owner, 1) * 8;
        score += friendSupport(owner, cell.x, cell.y) * 0.3;
      }
      if (type === "cavalry") {
        score += intent?.focusTarget ? Math.max(0, 5 - diagonalDist(cell, intent.focusTarget)) * 1.2 : 0;
        score -= game.terrain[cell.y][cell.x] === "forest" ? 3 : 0;
      }
      if (type === "guard") {
        score += siteEntry && areAllies2(siteEntry.owner, owner) && (siteEntry.kind === "city" || siteEntry.kind.startsWith("barracks")) ? 8 : 0;
      }
      if (type === "warship") {
        score += siteEntry?.kind === "shipyard" && !areAllies2(siteEntry.owner, owner) ? 10 : 0;
        const escort = game.units.find((entry) => entry.owner === owner && isTransportUnit(entry) && entry.cargo?.length && dist(entry, cell) <= 3);
        if (escort) {
          score += 4;
          if (diagonalDist(cell, escort) === 1) {
            score -= 3;
          }
        }
        score += nearbyEnemies(cell, owner, 2) * 1.2;
      }
      if (isTransportType(type)) {
        score -= nearbyEnemies(cell, owner, 2) * 4;
        score += coastal ? 2 : 0;
      }
      if (type === "engineer") {
        score += coastal ? 5 : 0;
        score -= nearbyEnemies(cell, owner, 1) * 6;
      }
      return score;
    }
    function unitRoleTargetBonus(unitEntry, enemy, intent) {
      let score = 0;
      if (unitEntry.type === "spearman" && enemy.type === "cavalry") {
        score += 10;
      }
      if ((unitEntry.type === "archer" || unitEntry.type === "crossbow") && enemy.type === "engineer") {
        score += 8;
      }
      if (unitEntry.type === "cavalry" && enemy.hp <= enemy.maxHp * 0.5) {
        score += 8;
      }
      if (unitEntry.type === "warship" && typeMeta(enemy.type).domain === "sea") {
        score += 7;
      }
      if (unitEntry.type === "warship") {
        const guardingTransport = game.units.some((entry) => entry.owner === unitEntry.owner && isTransportUnit(entry) && entry.cargo?.length && dist(entry, enemy) <= 3);
        if (guardingTransport) {
          score += 9;
        }
      }
      if (unitEntry.type === "guard" && intent?.assaultSite && dist(enemy, intent.assaultSite) <= 2) {
        score += 4;
      }
      return score;
    }
    function chooseAction(owner, unitEntry, profile, intent = null) {
      const diffCfg = DIFF[profile.diff];
      const aggCfg = AGG[profile.agg];
      const state11 = unitEntry.aiState || { stalledTurns: 0, rerouteTurns: 0 };
      const cells = [...reachable(game, unitEntry).entries()].map(([key, cost]) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y, cost };
      });
      cells.push({ x: unitEntry.x, y: unitEntry.y, cost: 0 });
      const objective = bestObjective(owner, unitEntry, intent);
      const distanceField = buildDistanceField(unitEntry, objective);
      const enemies = game.units.filter((entry) => areEnemies2(entry.owner, owner));
      const assaultSaturated = intent?.assaultSite && isBridgeheadSite(intent.assaultSite) ? frontlineCount(owner, intent.assaultSite, 2) >= 5 : false;
      const assaultMag = assaultSaturated ? 0.4 : 1;
      const expansionMag = assaultSaturated ? 1.5 : 1;
      let best = { score: -Infinity, move: null, target: null };
      for (const cell of cells) {
        const currentPath = objective && distanceField ? distanceField.get(cellKey(unitEntry.x, unitEntry.y)) ?? dist(unitEntry, objective) : 0;
        const nextPath = objective && distanceField ? distanceField.get(cellKey(cell.x, cell.y)) ?? dist(cell, objective) : 0;
        const moveScore = objective ? (currentPath - nextPath) * 2.9 * diffCfg.lookahead * aggCfg.push : 0;
        const supportScore = friendSupport(owner, cell.x, cell.y);
        const riskPenalty = enemyThreat(owner, cell.x, cell.y) * diffCfg.risk * aggCfg.preserve * 0.9;
        const congestionPenalty = allyCongestion(owner, cell, unitEntry.id) * (1.8 + state11.stalledTurns * 0.7);
        const siteEntry = getSite2(cell.x, cell.y);
        const captureScore = siteEntry ? strategicSiteValue(siteEntry, owner, unitEntry) + cityEconomyValue(siteEntry, owner) : 0;
        const intentBonus = intent?.assaultSite ? Math.max(0, dist(unitEntry, intent.assaultSite) - dist(cell, intent.assaultSite)) * 1.4 * assaultMag : 0;
        const expansionBonus = intent?.expansionSite ? Math.max(0, dist(unitEntry, intent.expansionSite) - dist(cell, intent.expansionSite)) * 1.9 * aggCfg.expansion * expansionMag : 0;
        const futureCityPressure = objective ? Math.max(0, futureReach(unitEntry, diffCfg.lookahead) - dist(cell, objective)) * 0.35 : 0;
        const rerouteBonus = state11.rerouteTurns > 0 && objective ? Math.max(0, dist(unitEntry, objective) - dist(cell, objective)) * 0.4 : 0;
        const terrainBonus = game.terrain[cell.y][cell.x] === "forest" ? 3 * aggCfg.forestBias : 0;
        const roleBonus = unitRoleCellBonus(owner, unitEntry, cell, intent);
        const base = moveScore + supportScore + captureScore + intentBonus + expansionBonus + futureCityPressure + rerouteBonus + terrainBonus + roleBonus - riskPenalty - congestionPenalty;
        if (base > best.score) {
          best = { score: base, move: cell, target: null };
        }
        for (const enemy of enemies) {
          if (dist(cell, enemy) > typeMeta(unitEntry.type).range) {
            continue;
          }
          const preview = previewCombat(game, unitEntry, enemy, cell, true);
          const focusBonus = intent?.focusTarget?.id === enemy.id ? 18 + projectedPressure(owner, enemy, diffCfg.lookahead, unitEntry.id) * 0.22 : 0;
          const followUpBonus = projectedPressure(owner, enemy, diffCfg.lookahead, unitEntry.id) * 0.18;
          const chaseBonus = enemy.hp <= enemy.maxHp * 0.45 ? 8 * aggCfg.chase : 0;
          const roleTargetBonus = unitRoleTargetBonus(unitEntry, enemy, intent);
          const score = base + preview.damage * 3.1 - preview.counter * 2.1 + (preview.kill ? 24 : 0) + targetValue(enemy) + focusBonus + followUpBonus + chaseBonus + roleTargetBonus;
          if (score > best.score) {
            best = { score, move: cell, target: enemy };
          }
        }
      }
      return best;
    }
    function buildScore(owner, siteEntry, type, cargoTypes = []) {
      const meta = typeMeta(type);
      const ownUnits = game.units.filter((entry) => entry.owner === owner);
      const enemySea = game.units.filter((entry) => areEnemies2(entry.owner, owner) && typeMeta(entry.type).domain === "sea").length;
      const enemyCavalry = game.units.filter((entry) => areEnemies2(entry.owner, owner) && entry.type === "cavalry").length;
      const ownSea = ownUnits.filter((entry) => typeMeta(entry.type).domain === "sea").length;
      const ownLand = ownUnits.filter((entry) => typeMeta(entry.type).domain === "land").length;
      const ownWarships = ownUnits.filter((entry) => entry.type === "warship").length;
      const ownTransports = ownUnits.filter((entry) => isTransportUnit(entry)).length;
      const ownEngineers = ownUnits.filter((entry) => entry.type === "engineer").length;
      const loadedTransports = ownUnits.filter((entry) => isTransportUnit(entry) && entry.cargo?.length).length;
      const enemyHasCities = game.sites.some((entry) => entry.kind === "city" && areEnemies2(entry.owner, owner));
      const landStranded = enemyHasCities && !hasLandReachToEnemyCity(owner) && ownLand > ownTransports * FERRY_THROUGHPUT + 6;
      let score = meta.level * 6 + meta.atk + meta.def * 0.5 + meta.move * 0.4;
      if (landStranded && meta.domain === "land") {
        score -= 60;
      }
      if (siteEntry.kind === "city") {
        if (type === "spearman") score += enemyCavalry * 2;
        if (type === "archer" || type === "crossbow") score += ownLand > 4 ? 4 : 1;
        if (type === "cavalry") score += W > 30 ? 5 : 1;
        if (type === "guard") score += 2;
        if (type === "crossbow") score += ownLand >= 3 ? 6 : 3;
        if (type === "archer") score += game.goldByOwner[owner] < 50 ? 5 : 2;
        if (type === "engineer") score += ownEngineers >= 4 ? -20 : teamNeedsEngineer(owner) && ownEngineers < 2 ? 26 : 4;
      }
      if (siteEntry.kind === "shipyard") {
        if (type === "warship") score += enemySea * 3 + (MAPS[game.settings.map].sea ? 8 : 2) + Math.max(0, loadedTransports - ownWarships) * 4;
        if (isTransportType(type)) score += (ownLand > ownSea * 2 ? 7 : 2) + (landStranded ? 22 : 0) + normalizeCargoTypes(cargoTypes).reduce((sum, cargoType) => sum + (cargoType === "engineer" ? 6 : typeMeta(cargoType).level * 2), 0);
      }
      return score;
    }
    function aiSpendGold(owner, profile) {
      const diffCfg = DIFF[profile.diff];
      const aggCfg = AGG[profile.agg];
      const upgrades = game.sites.filter((entry) => entry.owner === owner && entry.tier < siteMeta(entry.kind).maxTier).sort((a, b) => strategicSiteValue(b, owner) - strategicSiteValue(a, owner));
      for (const siteEntry of upgrades) {
        if (game.goldByOwner[owner] >= siteUpgradeCost(siteEntry) && Math.random() < diffCfg.economy) {
          upgradeSite(owner, siteEntry);
        }
      }
      if (game.goldByOwner[owner] <= aggCfg.lowGoldReserve && profile.agg === "cautious") {
        return;
      }
      const crowd = capacityPressure(owner);
      let productionBudget = diffCfg.production;
      if (crowd >= 0.95) {
        productionBudget = 0;
      } else if (crowd >= 0.75) {
        productionBudget = Math.max(1, productionBudget - 1);
      }
      let produced = 0;
      while (produced < productionBudget) {
        const options = [];
        for (const siteEntry of game.sites.filter((entry) => entry.owner === owner && !getUnit2(entry.x, entry.y))) {
          for (const type of buildableTypes(siteEntry)) {
            if (atUnitCap(owner, typeMeta(type).domain)) {
              continue;
            }
            const cargoTypes = isTransportType(type) ? chooseTransportCargo(owner, game.goldByOwner[owner], true) : [];
            const totalCost = factionAdjustedCost(owner, type, cargoTypes);
            if (game.goldByOwner[owner] >= totalCost) {
              options.push({ siteEntry, type, cargoTypes, score: buildScore(owner, siteEntry, type, cargoTypes) });
            }
          }
        }
        options.sort((a, b) => b.score - a.score);
        if (!options.length || !buildAtSite(owner, options[0].siteEntry, options[0].type, { cargoTypes: options[0].cargoTypes })) {
          break;
        }
        produced += 1;
      }
    }
    function aiManageForces(owner) {
      const landCap = unitCapFor("land");
      const landCount = ownedUnitCount(owner, "land");
      const crowd = forceCrowding(owner);
      if (landCount <= landCap && crowd < 0.6) {
        return;
      }
      const candidates = game.units.filter((entry) => entry.owner === owner && typeMeta(entry.type).domain === "land" && entry.type !== "engineer" && (entry.aiState?.stalledTurns || 0) >= 3);
      candidates.sort((a, b) => typeMeta(a.type).level - typeMeta(b.type).level || (b.aiState?.stalledTurns || 0) - (a.aiState?.stalledTurns || 0));
      let quota = Math.max(landCount - landCap, crowd > 0.6 ? 1 : 0);
      quota = Math.min(quota, 3);
      for (const unitEntry of candidates.slice(0, quota)) {
        sellUnit(owner, unitEntry);
      }
    }
    function moveToward(unitEntry, target) {
      const distanceField = buildDistanceField(unitEntry, target);
      const cells = [...reachable(game, unitEntry).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      }).filter((cell) => cell.x !== unitEntry.x || cell.y !== unitEntry.y);
      if (!cells.length) {
        return false;
      }
      cells.sort((a, b) => {
        const da = distanceField?.get(cellKey(a.x, a.y)) ?? dist(a, target);
        const db = distanceField?.get(cellKey(b.x, b.y)) ?? dist(b, target);
        return da - db;
      });
      return moveUnit(unitEntry, cells[0].x, cells[0].y);
    }
    function moveTransportToward(transport, target) {
      const owner = transport.owner;
      const distanceField = buildDistanceField(transport, target);
      const current = { x: transport.x, y: transport.y };
      const currentDist = distanceField?.get(cellKey(current.x, current.y)) ?? dist(current, target);
      const cells = [...reachable(game, transport).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      cells.push(current);
      let best = current;
      let bestScore = -Infinity;
      for (const cell of cells) {
        const cellDist = distanceField?.get(cellKey(cell.x, cell.y)) ?? dist(cell, target);
        const progress = currentDist - cellDist;
        const threat = enemyThreat(owner, cell.x, cell.y);
        const escorted = game.units.some((entry) => entry.owner === owner && entry.type === "warship" && diagonalDist(entry, cell) <= 1);
        const score = progress * 3 - threat * (escorted ? 0.4 : 2.4);
        if (score > bestScore) {
          bestScore = score;
          best = cell;
        }
      }
      if (best.x !== transport.x || best.y !== transport.y) {
        return moveUnit(transport, best.x, best.y);
      }
      return false;
    }
    function bestLanding(owner, transport) {
      const cells = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (isLandTile(x, y) && adjacent82(x, y).some((cell) => isWaterTile(cell.x, cell.y))) {
            cells.push({ x, y, score: strategicLandingScore(owner, { x, y }) });
          }
        }
      }
      cells.sort((a, b) => b.score - a.score || dist(transport, a) - dist(transport, b));
      return cells[0] || null;
    }
    function teamNeedsEngineer(owner) {
      const enemyCities = game.sites.filter((siteEntry) => siteEntry.kind === "city" && areEnemies2(siteEntry.owner, owner));
      const ownedEngineers = game.units.filter((unitEntry) => unitEntry.owner === owner && unitEntry.type === "engineer").length;
      return !ownedEngineers || !!enemyCities.length && !hasLandReachToEnemyCity(owner);
    }
    function hasLandReachToEnemyCity(owner) {
      const cached = landReachCache.get(owner);
      if (cached !== void 0) {
        return cached;
      }
      const result = game.units.some((unitEntry) => unitEntry.owner === owner && typeMeta(unitEntry.type).domain === "land" && landUnitCanReachForeignCity2(unitEntry));
      landReachCache.set(owner, result);
      return result;
    }
    function chooseTransportCargo(owner, budget, preferEngineer = false) {
      const idleLand = game.units.filter((entry) => entry.owner === owner && typeMeta(entry.type).domain === "land").length;
      const transportSlots = game.units.filter((entry) => entry.owner === owner && isTransportUnit(entry)).length * FERRY_THROUGHPUT;
      if (transportSlots >= 2 && idleLand > transportSlots + 4) {
        return [];
      }
      const plans = preferEngineer ? [["engineer", "swordsman"], ["engineer", "crossbow"], ["engineer"], ["swordsman", "crossbow"], ["swordsman"]] : [["guard", "engineer"], ["swordsman", "crossbow"], ["engineer", "swordsman"], ["swordsman", "spearman"], ["engineer"], ["militia"]];
      return plans.find((plan) => transportCost(plan) <= budget) || [];
    }
    function engineerBuildChoice(owner, engineer, intent) {
      const waterCells = engineerBuildCells(engineer);
      const enemyCities = game.sites.filter((siteEntry) => siteEntry.kind === "city" && areEnemies2(siteEntry.owner, owner));
      const nearestEnemyCity = enemyCities.length ? enemyCities.sort((a, b) => dist(a, engineer) - dist(b, engineer))[0] : null;
      const hasTransport = game.units.some((unitEntry) => unitEntry.owner === owner && isTransportUnit(unitEntry));
      const landFrontExists = hasLandReachToEnemyCity(owner);
      const nearFront = nearestEnemyCity && dist(engineer, nearestEnemyCity) <= 6 || game.units.some((unitEntry) => areEnemies2(unitEntry.owner, owner) && dist(unitEntry, engineer) <= 5);
      const safeEnough = enemyThreat(owner, engineer.x, engineer.y) < typeMeta("engineer").hp * 0.6;
      const canAffordForwardBase = game.goldByOwner[owner] >= CAMP_COST + typeMeta("swordsman").cost;
      const needsCamp = landFrontExists && !getSite2(engineer.x, engineer.y) && campCount2(owner) < MAX_CAMPS_PER_SIDE && canAffordForwardBase && nearFront && safeEnough && !atUnitCap(owner, "land");
      if (needsCamp && canBuildCamp(engineer)) {
        return { kind: "camp" };
      }
      if (!waterCells.length) {
        return null;
      }
      const ownedTransports = game.units.filter((unitEntry) => unitEntry.owner === owner && isTransportUnit(unitEntry)).length;
      const landWaiting = game.units.some((unitEntry) => unitEntry.owner === owner && typeMeta(unitEntry.type).domain === "land" && unitEntry.type !== "engineer" && !landUnitCanReachForeignCity2(unitEntry));
      const needFerry = !landFrontExists && enemyCities.length > 0 && landWaiting;
      if (needFerry && ownedTransports < 2 && game.goldByOwner[owner] >= transportCost(["engineer"]) && !atUnitCap(owner, "sea")) {
        const cargoTypes = chooseTransportCargo(owner, game.goldByOwner[owner], true);
        const cell = waterCells.sort((a, b) => intent?.assaultSite ? dist(a, intent.assaultSite) - dist(b, intent.assaultSite) : 0)[0];
        if (cell) {
          return { kind: "transport", cell, cargoTypes };
        }
      }
      const enemySea = game.units.some((unitEntry) => areEnemies2(unitEntry.owner, owner) && typeMeta(unitEntry.type).domain === "sea");
      if (enemySea && game.goldByOwner[owner] >= typeMeta("warship").cost) {
        return { kind: "warship", cell: waterCells[0], cargoTypes: [] };
      }
      if ((teamNeedsEngineer(owner) || !hasTransport || intent?.assaultSite) && game.goldByOwner[owner] >= transportCost(["engineer"])) {
        const cargoTypes = chooseTransportCargo(owner, game.goldByOwner[owner], true);
        const cell = waterCells.sort((a, b) => intent?.assaultSite ? dist(a, intent.assaultSite) - dist(b, intent.assaultSite) : 0)[0];
        if (cell) {
          return { kind: "transport", cell, cargoTypes };
        }
      }
      return null;
    }
    function bridgeheadTryAttack(owner, unitEntry) {
      if (unitEntry.hasAttacked) {
        return false;
      }
      const targets = game.units.filter((entry) => canAttack(game, unitEntry, entry));
      if (!targets.length) {
        return false;
      }
      targets.sort((a, b) => a.hp - b.hp || typeMeta(b.type).level - typeMeta(a.type).level);
      attack(unitEntry, targets[0]);
      return true;
    }
    function bridgeheadDefendCell(owner, unitEntry) {
      const midY = Math.floor(H * BRIDGEHEAD_DEFEND_FRACTION);
      const enemies = game.units.filter((entry) => areEnemies2(entry.owner, owner));
      const upperEnemies = enemies.filter((entry) => entry.y < midY);
      const focus = (upperEnemies.length ? upperEnemies : enemies).sort((a, b) => dist(a, unitEntry) - dist(b, unitEntry))[0];
      const cells = [...reachable(game, unitEntry).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      cells.push({ x: unitEntry.x, y: unitEntry.y });
      const zoneCells = cells.filter((cell) => cell.y < midY);
      const pool = zoneCells.length ? zoneCells : cells;
      if (!focus) {
        const anchorX = Math.floor(W / 2);
        pool.sort((a, b) => Math.abs(a.x - anchorX) - Math.abs(b.x - anchorX) || a.y - b.y);
        return pool[0];
      }
      pool.sort((a, b) => dist(a, focus) - dist(b, focus) || a.y - b.y);
      return pool[0];
    }
    function bridgeheadProduce(owner) {
      const prefer = ["guard", "spearman", "crossbow", "archer", "swordsman", "militia"];
      let built = 0;
      for (const siteEntry of game.sites.filter((entry) => entry.owner === owner && !getUnit2(entry.x, entry.y))) {
        if (built >= 2) {
          break;
        }
        const types = buildableTypes(siteEntry);
        const landChoice = prefer.find((type) => types.includes(type) && game.goldByOwner[owner] >= typeMeta(type).cost);
        const choice = landChoice || (types.includes("warship") && game.goldByOwner[owner] >= typeMeta("warship").cost ? "warship" : null);
        if (choice && buildAtSite(owner, siteEntry, choice)) {
          built += 1;
        }
      }
    }
    async function bridgeheadTurn(owner) {
      logAiDecision(owner, "桥头测试AI：死守上方 3/4，仅留最下 1/4 不设防。");
      bridgeheadProduce(owner);
      refresh();
      await pause(aiStepDelay());
      const units = game.units.filter((entry) => entry.owner === owner);
      for (const unitEntry of [...units]) {
        if (!game.units.includes(unitEntry)) {
          continue;
        }
        if (!bridgeheadTryAttack(owner, unitEntry)) {
          const dest = bridgeheadDefendCell(owner, unitEntry);
          if (dest && (dest.x !== unitEntry.x || dest.y !== unitEntry.y)) {
            moveUnit(unitEntry, dest.x, dest.y);
          }
          bridgeheadTryAttack(owner, unitEntry);
        }
        refresh();
        await pause(aiStepDelay());
      }
      if (!game.over) {
        advanceTurn();
      }
    }
    function navalTryAttack(owner, unitEntry) {
      if (unitEntry.hasAttacked) {
        return false;
      }
      const targets = game.units.filter((entry) => canAttack(game, unitEntry, entry));
      if (!targets.length) {
        return false;
      }
      const priority = (entry) => isTransportUnit(entry) ? 2 : entry.type === "warship" ? 1 : 0;
      targets.sort((a, b) => priority(b) - priority(a) || a.hp - b.hp);
      attack(unitEntry, targets[0]);
      return true;
    }
    function navalPatrolCell(owner, warship) {
      const line = Math.floor(H * BRIDGEHEAD_DEFEND_FRACTION);
      const enemies = game.units.filter((entry) => areEnemies2(entry.owner, owner));
      const seaFocus = enemies.filter((entry) => (typeMeta(entry.type).domain === "sea" || isTransportUnit(entry)) && entry.y < line);
      const focus = (seaFocus.length ? seaFocus : enemies).sort((a, b) => dist(a, warship) - dist(b, warship))[0];
      const cells = [...reachable(game, warship).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      cells.push({ x: warship.x, y: warship.y });
      const zone = cells.filter((cell) => cell.y < line);
      const pool = zone.length ? zone : cells;
      if (!focus) {
        const anchorX = Math.floor(W / 2);
        pool.sort((a, b) => Math.abs(a.x - anchorX) - Math.abs(b.x - anchorX) || a.y - b.y);
        return pool[0];
      }
      pool.sort((a, b) => dist(a, focus) - dist(b, focus) || a.y - b.y);
      return pool[0];
    }
    function navalLandHoldCell(owner, unitEntry) {
      const homes = game.sites.filter((entry) => entry.owner === owner && (entry.kind === "city" || entry.kind.startsWith("barracks")));
      const cells = [...reachable(game, unitEntry).keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      cells.push({ x: unitEntry.x, y: unitEntry.y });
      const nearEnemy = game.units.filter((entry) => areEnemies2(entry.owner, owner) && typeMeta(entry.type).domain === "land").sort((a, b) => dist(a, unitEntry) - dist(b, unitEntry))[0];
      if (nearEnemy && dist(nearEnemy, unitEntry) <= 6) {
        cells.sort((a, b) => dist(a, nearEnemy) - dist(b, nearEnemy));
        return cells[0];
      }
      const home = homes.sort((a, b) => dist(a, unitEntry) - dist(b, unitEntry))[0];
      if (home) {
        cells.sort((a, b) => dist(a, home) - dist(b, home));
        return cells[0];
      }
      return { x: unitEntry.x, y: unitEntry.y };
    }
    function navalProduce(owner) {
      let built = 0;
      for (const siteEntry of game.sites.filter((entry) => entry.owner === owner && entry.kind === "shipyard" && !getUnit2(entry.x, entry.y))) {
        if (built >= 2) {
          break;
        }
        if (buildableTypes(siteEntry).includes("warship") && game.goldByOwner[owner] >= typeMeta("warship").cost && buildAtSite(owner, siteEntry, "warship")) {
          built += 1;
        }
      }
      const prefer = ["guard", "spearman", "crossbow", "archer"];
      for (const siteEntry of game.sites.filter((entry) => entry.owner === owner && entry.kind === "city" && !getUnit2(entry.x, entry.y))) {
        if (built >= 3) {
          break;
        }
        const type = prefer.find((entry) => buildableTypes(siteEntry).includes(entry) && game.goldByOwner[owner] >= typeMeta(entry).cost);
        if (type && buildAtSite(owner, siteEntry, type)) {
          built += 1;
        }
      }
    }
    async function navalTurn(owner) {
      logAiDecision(owner, "海防测试AI：制海守上方水道、专打运兵船，下方海道留口。");
      navalProduce(owner);
      refresh();
      await pause(aiStepDelay());
      const units = game.units.filter((entry) => entry.owner === owner);
      for (const unitEntry of [...units]) {
        if (!game.units.includes(unitEntry)) {
          continue;
        }
        const dest = typeMeta(unitEntry.type).domain === "sea" ? navalPatrolCell(owner, unitEntry) : navalLandHoldCell(owner, unitEntry);
        if (!navalTryAttack(owner, unitEntry)) {
          if (dest && (dest.x !== unitEntry.x || dest.y !== unitEntry.y)) {
            moveUnit(unitEntry, dest.x, dest.y);
          }
          navalTryAttack(owner, unitEntry);
        }
        refresh();
        await pause(aiStepDelay());
      }
      if (!game.over) {
        advanceTurn();
      }
    }
    async function aiTurn(owner) {
      const profile = game.aiProfiles[owner] || { diff: "medium", agg: "balanced" };
      landReachCache.clear();
      if (DIFF[profile.diff]?.scripted) {
        if (DIFF[profile.diff].script === "naval") {
          await navalTurn(owner);
        } else {
          await bridgeheadTurn(owner);
        }
        return;
      }
      const intent = buildStrategicIntent(owner, profile);
      const memory = frontMemory(owner);
      logAiDecision(owner, summarizeIntent(intent));
      if (intent.cooledTargets?.length) {
        incrementStrat(owner, "reroutes");
        logAiDecision(owner, `暂时避开受阻方向：${intent.cooledTargets.join("、")}。`);
      }
      aiManageForces(owner);
      aiSpendGold(owner, profile);
      refresh();
      await pause(aiStepDelay());
      const units = game.units.filter((entry) => entry.owner === owner).sort((a, b) => unitPriority(b, intent) - unitPriority(a, intent));
      for (const unitEntry of [...units]) {
        if (game.over) {
          break;
        }
        if (!game.units.includes(unitEntry)) {
          continue;
        }
        const state11 = computeUnitState(unitEntry);
        const startCell = { x: unitEntry.x, y: unitEntry.y };
        const assaultKey = intent.assaultSite ? `site:${cellKey(intent.assaultSite.x, intent.assaultSite.y)}` : null;
        const bridgeheadCooldown = assaultKey ? memory[assaultKey]?.cooldown > 0 : false;
        const bridgeheadBlocked = intent.assaultSite && isBridgeheadSite(intent.assaultSite) && (bridgeheadCooldown || state11.rerouteTurns > 0 && state11.failedObjectiveKey === assaultKey) && dist(unitEntry, intent.assaultSite) <= 4;
        if (bridgeheadBlocked && typeMeta(unitEntry.type).domain === "land" && profile.agg !== "reckless") {
          const retreatCell = bestRetreatCell(owner, unitEntry, intent.assaultSite);
          if (retreatCell && (retreatCell.x !== unitEntry.x || retreatCell.y !== unitEntry.y)) {
            incrementStrat(owner, "retreats");
            logAiDecision(owner, `${typeMeta(unitEntry.type).name}从桥头暂退，在 ${intent.assaultSite.name} 方向重整。`);
            moveUnit(unitEntry, retreatCell.x, retreatCell.y);
            finalizeUnitState(unitEntry, state11, assaultKey || "idle", true);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
        }
        if (profile.agg === "cautious" && intent.assaultSite && isBridgeheadSite(intent.assaultSite)) {
          const currentFrontline = frontlineCount(owner, intent.assaultSite, 3);
          const isReserveCandidate = typeMeta(unitEntry.type).domain === "land" && unitEntry.type !== "engineer" && (dist(unitEntry, intent.assaultSite) > 4 || typeMeta(unitEntry.type).range >= 2);
          if (currentFrontline >= 4 && isReserveCandidate && unitEntry.hp > unitEntry.maxHp * 0.65) {
            incrementStrat(owner, "reserves");
            logAiDecision(owner, `${typeMeta(unitEntry.type).name}作为桥头预备队待机。`);
            finalizeUnitState(unitEntry, state11, `reserve:${cellKey(intent.assaultSite.x, intent.assaultSite.y)}`, false);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
        }
        if (isTransportUnit(unitEntry)) {
          if (!unitEntry.cargo.length && autoLoadAdjacent(unitEntry)) {
            finalizeUnitState(unitEntry, state11, "transport-load", false);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
          if (unitEntry.cargo.length && autoUnloadAdjacent(unitEntry)) {
            finalizeUnitState(unitEntry, state11, "transport-unload", false);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
          const landing = bestLanding(owner, unitEntry);
          if (landing) {
            const moved = moveTransportToward(unitEntry, landing);
            const nearThreat = nearbyEnemies({ x: unitEntry.x, y: unitEntry.y }, owner, 2);
            const escortAdjacent = game.units.some((entry) => entry.owner === owner && entry.type === "warship" && dist(entry, unitEntry) <= 2);
            if (unitEntry.cargo.length && (nearThreat === 0 || escortAdjacent)) {
              autoUnloadAdjacent(unitEntry);
            }
            finalizeUnitState(unitEntry, state11, `landing:${cellKey(landing.x, landing.y)}`, moved);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
        }
        if (unitEntry.type === "engineer") {
          const engineerChoice = engineerBuildChoice(owner, unitEntry, intent);
          if (engineerChoice?.kind === "camp" && buildCamp(unitEntry)) {
            finalizeUnitState(unitEntry, state11, "camp", false);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
          if (engineerChoice?.cell && engineerLaunch(unitEntry, engineerChoice.kind, engineerChoice.cell, engineerChoice.cargoTypes || [])) {
            finalizeUnitState(unitEntry, state11, `${engineerChoice.kind}:${cellKey(engineerChoice.cell.x, engineerChoice.cell.y)}`, false);
            refresh();
            await pause(aiStepDelay());
            continue;
          }
        }
        const choice = chooseAction(owner, unitEntry, profile, intent);
        const objectiveSite = choice.target ? null : bestObjective(owner, unitEntry, intent);
        const objectiveKey = objectiveSite ? `site:${cellKey(objectiveSite.x, objectiveSite.y)}` : choice.target ? `attack:${choice.target.id}` : "idle";
        if (choice.move && (choice.move.x !== unitEntry.x || choice.move.y !== unitEntry.y)) {
          moveUnit(unitEntry, choice.move.x, choice.move.y);
        }
        if (choice.target && game.units.includes(unitEntry) && game.units.includes(choice.target) && canAttack(game, unitEntry, choice.target)) {
          attack(unitEntry, choice.target);
        }
        finalizeUnitState(unitEntry, state11, objectiveKey, !sameCell(startCell, unitEntry));
        refresh();
        await pause(aiStepDelay());
      }
      if (!game.over) {
        advanceTurn();
      }
    }
    function newGame() {
      facilitySystem.clear();
      statusSystem.clear();
      decisionSystem.clear();
      initFactionSystems();
      const aiCount = Number($("aiSelect").value);
      const spectator = $("spectatorSelect")?.value === "on";
      const owners = spectator ? Array.from({ length: aiCount }, (_, index) => `ai${index}`) : ["player", ...Array.from({ length: aiCount }, (_, index) => `ai${index}`)];
      const teams = { player: $("playerTeamSelect").value };
      const aiProfiles = {};
      const ownerColors = { player: COLOR_PRESETS[$("playerColorSelect").value || "azure"]?.value || "#55a3ff" };
      for (let i = 0; i < aiCount; i++) {
        teams[`ai${i}`] = $(`ai${i}Team`)?.value || TEAMS[(i + 1) % TEAMS.length];
        aiProfiles[`ai${i}`] = { diff: $(`ai${i}Diff`)?.value || "medium", agg: $(`ai${i}Agg`)?.value || "balanced", faction: $(`ai${i}Faction`)?.value || "hre", nation: $(`ai${i}Nation`)?.value || "austria" };
        ownerColors[`ai${i}`] = COLOR_PRESETS[$(`ai${i}Color`)?.value || "crimson"]?.value || OWNER_COLORS[i % OWNER_COLORS.length];
      }
      const dimensions = computeDimensions($("sizeSelect").value, $("aspectSelect").value);
      W = dimensions.w;
      H = dimensions.h;
      S = W <= 22 ? 52 : 44;
      canvas.width = Math.min(W * S, VIEW_MAX_W);
      canvas.height = Math.min(H * S, VIEW_MAX_H);
      cam.x = 0;
      cam.y = 0;
      zoom = 1;
      currentSaveKey = null;
      distFieldCache.clear();
      game = {
        w: W,
        h: H,
        terrain: terrainFor($("mapSelect").value, $("complexitySelect").value, W, H),
        units: [],
        sites: [],
        ownerOrder: owners,
        currentIndex: 0,
        side: "player",
        turn: 1,
        selected: null,
        over: false,
        logs: [],
        teams,
        ownerColors,
        aiProfiles,
        aiFrontMemory: {},
        freeplay: false,
        pendingOrder: null,
        goldByOwner: Object.fromEntries(owners.map((owner) => [owner, 45])),
        stats: {
          startTime: null,
          endTime: null,
          chartIndex: 0,
          produced: Object.fromEntries(owners.map((owner) => [owner, 0])),
          kills: Object.fromEntries(owners.map((owner) => [owner, 0])),
          losses: Object.fromEntries(owners.map((owner) => [owner, 0])),
          captures: Object.fromEntries(owners.map((owner) => [owner, 0])),
          lostSites: Object.fromEntries(owners.map((owner) => [owner, 0])),
          strat: Object.fromEntries(owners.map((owner) => [owner, { stalls: 0, reserves: 0, reroutes: 0, retreats: 0, cityCaptures: 0, oilCaptures: 0, shipyardCaptures: 0, engineerLandings: 0, transportLaunches: 0, campsBuilt: 0, sells: 0 }])),
          history: []
        },
        settings: {
          map: $("mapSelect").value,
          mode: $("modeSelect").value,
          spectator,
          ai: aiCount,
          start: Number($("startUnitsSelect").value),
          size: $("sizeSelect").value,
          aspect: $("aspectSelect").value,
          aiSpeed: Number($("aiSpeed").value),
          complexity: $("complexitySelect").value,
          spread: Number($("citySpread").value),
          deploy: $("deploymentSelect").value,
          buildCap: Number($("buildCap").value),
          incomeMult: Number($("incomeMult").value),
          siteDensity: Number($("siteDensity").value),
          faction: $("factionSelect").value,
          nation: $("nationSelect").value
        }
      };
      game.sites = makeCities(aiCount, game.settings.size, game.settings.spread);
      game.sites.push(...makeNavalSites());
      game.sites.push(...makeSpecialSites());
      const used = new Set(game.sites.filter((entry) => entry.kind === "city").map((entry) => cellKey(entry.x, entry.y)));
      for (const owner of owners) {
        const homes = game.sites.filter((entry) => entry.owner === owner && entry.kind === "city");
        if (!homes.length) {
          continue;
        }
        const seaSpawn = game.settings.start >= 4 ? spawnSea(owner, game.settings.start >= 6 ? 2 : 1) : 0;
        spawnLand(owner, homes, Math.max(0, game.settings.start - seaSpawn), used, game.settings.deploy);
      }
      $("statsPanel").classList.add("hidden");
      $("statsSummary").innerHTML = "";
      recordStatSnapshot("deploy");
      log(`版本 0.1.2 战局开始：${MAPS[game.settings.map].name} · ${SIZES[game.settings.size].name} · ${ASPECTS[game.settings.aspect].name} ${W}×${H} · ${game.sites.filter((entry) => entry.kind === "city").length} 座城市 · ${game.sites.filter((entry) => entry.kind === "shipyard").length} 座船坞。`, "system");
      log(`玩家联盟：${FACTIONS[game.settings.faction]?.name || game.settings.faction} · ${NATIONS[game.settings.nation]?.name || game.settings.nation}（特色兵种：${NATIONS[game.settings.nation]?.unique || "待定"}）`, "system");
      const focusCity = game.sites.find((entry) => entry.kind === "city" && entry.owner === (spectator ? owners[0] : "player"));
      if (focusCity) {
        centerCamOn(focusCity.x, focusCity.y);
      }
      const startFirstTurn = () => beginTurn(owners[0], true);
      if (fastSim) {
        startFirstTurn();
      } else {
        runLoadingScreen(owners, startFirstTurn);
      }
    }
    const LOADING_TIPS = [
      "战术：长枪兵对骑兵有克制加成，把它们摆在骑兵冲锋的正面。",
      "战术：战船克制运兵船，护航或拦截时优先让战船贴身。",
      "技巧：运兵船现在最多可搭载 5 个陆军单位，登陆后立即释放。",
      "技巧：运兵船卸下的单位可在同一格堆叠（每格最多 3 个），点击堆叠格可循环选择操控。",
      "技巧：大地图下长按右键并拖动鼠标即可平移视野，右下角小地图显示当前视口。",
      "战术：工程师能在海边直接造舰，也能原地建立可维持 3 回合的临时营地。",
      "经济：占领油田和军营能显著增强产能，冷酷 AI 会优先争夺它们。",
      "战术：骑兵满机动接战时获得冲锋加成，保留移动力再发起冲锋。",
      "技巧：驻军可花金币修整，残血精锐撤回城市回血再战更划算。",
      "历史：两栖登陆的关键从来不是抢滩，而是能否持续把后续兵力运上岸。",
      "战术：弩手爆发高但脆弱，用剑士与近卫在前排为其挡刀。",
      "技巧：单位击杀累积可晋升老兵，提升机动与续航，注意保护高阶单位。",
      "提示：设置里可调收入倍率与每回合造兵上限，用来打造快节奏或持久战。",
      "战术：把富余陆军用空运兵船循环转运到敌军薄弱的海岸，是破解岛屿僵局的钥匙。",
      "历史：制海权决定制陆权——失去海上补给线的滩头阵地终将枯萎。"
    ];
    function drawPreview() {
      const pv = $("previewCanvas");
      if (!pv) {
        return;
      }
      const pctx = pv.getContext("2d");
      pctx.clearRect(0, 0, pv.width, pv.height);
      const sx = pv.width / W;
      const sy = pv.height / H;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          pctx.fillStyle = TERRAIN[game.terrain[y][x]].color || "#26333f";
          pctx.fillRect(x * sx, y * sy, Math.ceil(sx), Math.ceil(sy));
        }
      }
      for (const siteEntry of game.sites) {
        pctx.fillStyle = siteEntry.owner === "neutral" ? "#9fb0bd" : ownerColor(siteEntry.owner);
        const size = siteEntry.kind === "city" ? Math.max(3, sx) : Math.max(2, sx * 0.7);
        pctx.fillRect(siteEntry.x * sx - size / 2 + sx / 2, siteEntry.y * sy - size / 2 + sy / 2, size, size);
      }
    }
    function runLoadingScreen(owners, done) {
      const screen = $("loadingScreen");
      if (!screen) {
        done();
        return;
      }
      drawPreview();
      $("loadingMapName").textContent = `${MAPS[game.settings.map].name} · 部署中`;
      $("loadingMapMeta").textContent = `${SIZES[game.settings.size].name} · ${W}×${H} · ${game.sites.filter((e) => e.kind === "city").length} 城 / ${game.sites.filter((e) => e.kind === "shipyard").length} 船坞`;
      const blockCount = 44;
      $("loadingBlocks").innerHTML = Array.from({ length: blockCount }, () => '<i class="lblock"></i>').join("");
      const blocks = [...$("loadingBlocks").querySelectorAll(".lblock")];
      const sides = owners.map((owner) => ({ owner, target: 70 + Math.random() * 30, value: 0 }));
      $("loadingSides").innerHTML = sides.map((side) => `<div class="lside"><span class="ldot" style="background:${ownerColor(side.owner)}"></span><span class="lname">${ownerName(side.owner)}</span><span class="lbar"><i data-owner="${side.owner}"></i></span><span class="lpct" data-pct="${side.owner}">0%</span></div>`).join("");
      let tipIndex = Math.floor(Math.random() * LOADING_TIPS.length);
      $("loadingTip").textContent = LOADING_TIPS[tipIndex];
      screen.classList.remove("hidden");
      let progress = 0;
      let tipTick = 0;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 2 + Math.random() * 4);
        const lit = Math.round(blockCount * progress / 100);
        blocks.forEach((block, index) => block.classList.toggle("on", index < lit));
        $("loadingPercent").textContent = Math.round(progress);
        for (const side of sides) {
          side.value = Math.min(100, side.value + (progress >= side.target ? 6 + Math.random() * 8 : 2 + Math.random() * 5));
          const bar = $("loadingSides").querySelector(`i[data-owner="${side.owner}"]`);
          const pct = $("loadingSides").querySelector(`span[data-pct="${side.owner}"]`);
          if (bar) {
            bar.style.width = `${side.value}%`;
          }
          if (pct) {
            pct.textContent = `${Math.round(side.value)}%`;
          }
        }
        if (++tipTick % 14 === 0) {
          tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
          $("loadingTip").textContent = LOADING_TIPS[tipIndex];
        }
        if (progress >= 100 && sides.every((side) => side.value >= 100)) {
          clearInterval(timer);
          setTimeout(() => {
            screen.classList.add("hidden");
            done();
          }, 350);
        }
      }, 90);
    }
    function renderCodex() {
      $("codex").innerHTML = Object.values(TYPES).map((meta) => `<div class="codex-item"><div class="icon">${meta.icon}</div><div><div class="title">${meta.name} · ${meta.cost}🪙 · ${domainName(meta.domain)} ${tierName(meta.level)}</div><div class="desc">攻${meta.atk} 防${meta.def} 移${meta.move} 射${meta.range} · ${meta.text}</div></div></div>`).join("");
    }
    function showScreen(name) {
      const setupEl = $("setupScreen");
      const gameEl = $("gameScreen");
      const infoEl = $("infoScreen");
      if (setupEl) {
        setupEl.classList.toggle("hidden", name !== "setup");
      }
      if (gameEl) {
        gameEl.classList.toggle("hidden", name !== "game");
      }
      if (infoEl) {
        infoEl.classList.toggle("hidden", name !== "info");
      }
      $("loadScreen")?.classList.toggle("hidden", name !== "load");
      if (name === "setup") {
        $("overlay")?.classList.add("hidden");
        $("loadingScreen")?.classList.add("hidden");
        renderLobbyPreview();
      }
      if (name === "load") {
        renderSaveList();
      }
    }
    function startGameFlow() {
      showScreen("game");
      newGame();
    }
    const SAVE_PREFIX = "frontier_save_";
    function listSaves() {
      const saves = [];
      for (const key of saveStore.keys()) {
        if (!key || !key.startsWith(SAVE_PREFIX)) {
          continue;
        }
        try {
          const data = JSON.parse(saveStore.getItem(key));
          saves.push({ key, name: data.name || "未命名", savedAt: data.savedAt || 0, map: data.map || "", turn: data.turn || 1 });
        } catch (err) {
        }
      }
      return saves.sort((a, b) => b.savedAt - a.savedAt);
    }
    function buildSavePayload(name) {
      const { selected, pendingOrder, ...rest } = game;
      return {
        name: name || `存档 ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN")}`,
        savedAt: Date.now(),
        map: MAPS[game.settings.map]?.name || game.settings.map,
        turn: game.turn,
        W,
        H,
        S,
        state: rest
      };
    }
    function saveAsNewSave(name) {
      if (!game) {
        return false;
      }
      const key = SAVE_PREFIX + Date.now();
      try {
        saveStore.setItem(key, JSON.stringify(buildSavePayload(name)));
        currentSaveKey = key;
        return true;
      } catch (err) {
        return false;
      }
    }
    function overwriteCurrentSave(name) {
      if (!game || !currentSaveKey) {
        return false;
      }
      try {
        saveStore.setItem(currentSaveKey, JSON.stringify(buildSavePayload(name)));
        return true;
      } catch (err) {
        return false;
      }
    }
    function importSaveToList(payload) {
      if (!payload?.state) {
        return false;
      }
      try {
        saveStore.setItem(SAVE_PREFIX + Date.now(), JSON.stringify({
          name: payload.name || "导入的存档",
          savedAt: payload.savedAt || Date.now(),
          map: payload.map || "",
          turn: payload.turn || 1,
          W: payload.W,
          H: payload.H,
          S: payload.S,
          state: payload.state
        }));
        return true;
      } catch (err) {
        return false;
      }
    }
    function currentSaveName() {
      if (!currentSaveKey) {
        return "";
      }
      try {
        return JSON.parse(saveStore.getItem(currentSaveKey))?.name || "";
      } catch (err) {
        return "";
      }
    }
    function downloadSaveFile(payload) {
      if (!payload) {
        return;
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = String(payload.name || "save").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 60);
      link.href = url;
      link.download = `${safeName}.frontiersave.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }
    function loadPayload(payload) {
      if (!payload?.state) {
        return false;
      }
      W = payload.W;
      H = payload.H;
      S = payload.S;
      canvas.width = Math.min(W * S, VIEW_MAX_W);
      canvas.height = Math.min(H * S, VIEW_MAX_H);
      cam.x = 0;
      cam.y = 0;
      zoom = 1;
      distFieldCache.clear();
      landReachCache.clear();
      game = payload.state;
      game.selected = null;
      game.pendingOrder = null;
      showScreen("game");
      const focusOwner = game.settings?.spectator ? game.ownerOrder[0] : "player";
      const focusCity = game.sites.find((entry) => entry.kind === "city" && entry.owner === focusOwner);
      if (focusCity) {
        centerCamOn(focusCity.x, focusCity.y);
      }
      const finishLoad = () => {
        refresh();
        if (!game.over && game.side !== "player" && !fastSim) {
          setTimeout(() => {
            if (!game.over && game.side !== "player") {
              void aiTurn(game.side);
            }
          }, 300);
        }
      };
      if (fastSim) {
        finishLoad();
      } else {
        runLoadProgress(finishLoad);
      }
      return true;
    }
    function runLoadProgress(done) {
      const screen = $("loadingScreen");
      if (!screen) {
        done();
        return;
      }
      drawPreview();
      $("loadingMapName").textContent = `读取存档 · ${MAPS[game.settings.map]?.name || "战局"}`;
      $("loadingMapMeta").textContent = `第 ${game.turn} 回合 · ${SIZES[game.settings.size]?.name || `${W}×${H}`}`;
      $("loadingSides").innerHTML = "";
      $("loadingTip").textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
      const blockCount = 44;
      $("loadingBlocks").innerHTML = Array.from({ length: blockCount }, () => '<i class="lblock"></i>').join("");
      const blocks = [...$("loadingBlocks").querySelectorAll(".lblock")];
      screen.classList.remove("hidden");
      const started = performance.now();
      const minMs = 1e3;
      let progress = 0;
      const timer = setInterval(() => {
        const elapsed = performance.now() - started;
        progress = Math.min(100, Math.max(progress + 3 + Math.random() * 6, elapsed / minMs * 100));
        const lit = Math.round(blockCount * progress / 100);
        blocks.forEach((block, index) => block.classList.toggle("on", index < lit));
        $("loadingPercent").textContent = Math.round(progress);
        if (progress >= 100 && elapsed >= minMs) {
          clearInterval(timer);
          setTimeout(() => {
            screen.classList.add("hidden");
            done();
          }, 200);
        }
      }, 60);
    }
    function loadSave(key) {
      let payload;
      try {
        payload = JSON.parse(saveStore.getItem(key));
      } catch (err) {
        return false;
      }
      if (loadPayload(payload)) {
        currentSaveKey = key;
        return true;
      }
      return false;
    }
    function deleteSave(key) {
      saveStore.removeItem(key);
    }
    function renderSaveList() {
      const saves = listSaves();
      const body = $("saveListBody");
      if (!saves.length) {
        body.innerHTML = '<div class="save-empty">暂无存档。在游戏中点击「暂停 → 存储游戏」即可保存。</div>';
        return;
      }
      body.innerHTML = saves.map((save) => `<button class="save-row" data-key="${save.key}"><span class="save-name">${save.name}</span><span class="save-meta">${save.map} · 第 ${save.turn} 回合</span><span class="save-date">${new Date(save.savedAt).toLocaleString("zh-CN")}</span></button>`).join("");
    }
    function renderLobbyPreview() {
      const pv = $("lobbyPreview");
      if (!pv || !pv.getContext) {
        return;
      }
      const dims = computeDimensions($("sizeSelect").value, $("aspectSelect").value);
      W = dims.w;
      H = dims.h;
      const terrain = terrainFor($("mapSelect").value, $("complexitySelect").value, W, H);
      const pctx = pv.getContext("2d");
      pctx.clearRect(0, 0, pv.width, pv.height);
      const sx = pv.width / W;
      const sy = pv.height / H;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          pctx.fillStyle = TERRAIN[terrain[y][x]].color || "#26333f";
          pctx.fillRect(x * sx, y * sy, Math.ceil(sx), Math.ceil(sy));
        }
      }
      const aiCount = Number($("aiSelect").value);
      $("lobbyPreviewMeta").textContent = `${MAPS[$("mapSelect").value].name} · ${SIZES[$("sizeSelect").value].name} · ${ASPECTS[$("aspectSelect").value].name} ${W}×${H} · ${aiCount} 名 AI`;
    }
    function renderAISettings() {
      const count = Number($("aiSelect").value);
      const defaults = ["crimson", "violet", "amber", "jade", "steel", "sand", "teal"];
      $("aiRows").innerHTML = Array.from({ length: count }, (_, i) => {
        const colorOptionsMarkup = colorOptions().map(([key, meta]) => `<option value="${key}" ${key === defaults[i % defaults.length] ? "selected" : ""}>${meta.name}</option>`).join("");
        const defaultTeam = TEAMS[(i + 1) % TEAMS.length];
        const teamOptionsMarkup = TEAMS.map((team) => `<option value="${team}" ${team === defaultTeam ? "selected" : ""}>${TEAM_NAMES[team] || team + "组"}</option>`).join("");
        const aiFactionIds = Object.keys(FACTIONS);
        const aiDefaultFaction = aiFactionIds[i % aiFactionIds.length];
        const aiFactionMarkup = aiFactionIds.map((fid) => `<option value="${fid}" ${fid === aiDefaultFaction ? "selected" : ""}>${FACTIONS[fid].name}</option>`).join("");
        return `<tr>
        <td class="pt-name">🤖 AI ${i + 1}</td>
        <td><select id="ai${i}Diff" title="AI 难度"><option value="easy">简单</option><option value="medium" selected>中等</option><option value="brutal">冷酷</option><option value="bridgehead">桥头(测试)</option><option value="naval">海防(测试)</option></select></td>
        <td><select id="ai${i}Color" title="AI 颜色">${colorOptionsMarkup}</select></td>
        <td><select id="ai${i}Team" title="AI 队伍">${teamOptionsMarkup}</select></td>
        <td><select id="ai${i}Agg" title="AI 进攻欲"><option value="cautious">谨慎</option><option value="balanced" selected>均衡</option><option value="reckless">冲动</option></select></td>
        <td><select id="ai${i}Faction" class="ai-faction-select" data-ai="${i}" title="AI 联盟">${aiFactionMarkup}</select></td>
        <td><select id="ai${i}Nation" title="AI 国家"></select></td>
      </tr>`;
      }).join("");
      for (let i = 0; i < count; i++) {
        refreshAINation(i);
        const el = $("ai" + i + "Faction");
        if (el) el.addEventListener("change", () => refreshAINation(i));
      }
    }
    function refreshAINation(aiIndex) {
      const factionId = $("ai" + aiIndex + "Faction")?.value;
      const select = $("ai" + aiIndex + "Nation");
      if (!factionId || !select) return;
      select.innerHTML = "";
      for (const [id, meta] of Object.entries(NATIONS)) {
        if (meta.faction === factionId) {
          select.insertAdjacentHTML("beforeend", '<option value="' + id + '">' + meta.name + "</option>");
        }
      }
    }
    function renderRules() {
      $("rulesContent").innerHTML = `
      <div class="rule-version">
        <h3 class="info-section-title">基础玩法</h3>
        <div class="rule-grid">
          <section class="rule-block"><h3>回合流程</h3><ul><li>每个联盟依次行动；回合开始时统一重置移动、结算收入、回血与维修。</li><li>单位可先机动再攻击，但每回合只能攻击一次；攻击后本回合不能再机动。</li><li>玩家和 AI 完全共用同一套伤害、生产、升级、维修和运输规则。</li></ul></section>
          <section class="rule-block"><h3>三种模式</h3><ul><li>征服：占领全部城市，并消灭全部敌对工程师后获胜。</li><li>遭遇战：敌对组全部野战部队被消灭时获胜。</li><li>守城：坚持到第12回合且仍保有己方关键城市时获胜。</li></ul></section>
          <section class="rule-block"><h3>移动与地形</h3><ul><li>陆军只能在陆地移动，不能进入海域与山脉。</li><li>海军只能在海域行动，船坞与海上堡垒也属于海上据点。</li><li>森林提供额外防御但增加移动消耗，道路降低机动成本。</li></ul></section>
          <section class="rule-block"><h3>战斗与反击</h3><ul><li>伤害由兵种攻防、当前生命、地形、驻防和克制共同决定。</li><li>只要射程覆盖，防守方就能反击；先手不再拥有单方面碾压优势。</li><li>长枪兵克制骑兵，战船克制运兵船，骑兵满机动接战时获得冲锋加成。</li></ul></section>
          <section class="rule-block"><h3>据点与经济</h3><ul><li>城市生产陆军，港口/造船厂生产海军与预载运兵船，海上堡垒不能生产但可提供海上防御。</li><li>临时营地视为中级城市，不产金币，只能维持 3 回合，且不能被占领。</li><li>驻军可花费金币修整，AI 也会按局势使用同一功能。</li></ul></section>
          <section class="rule-block"><h3>海军与运输</h3><ul><li>战船负责制海、拦截和海上火力压制。</li><li>运兵船可直接预载 0 到 5 个陆军单位下水，登陆后立即释放兵力。</li><li>港口/造船厂位于水中且紧贴陆地；海上堡垒位于深海，不与陆地相邻。</li></ul></section>
          <section class="rule-block"><h3>工程师与胜利</h3><ul><li>工程师可在靠海陆格的相邻海格造出战船或运兵船，也可原地建立临时营地。</li><li>征服模式中，占领全部城市后还必须清除敌对组全部工程师，才能真正锁定胜利。</li><li>敌方单位进入临时营地所在格时，可将其直接摧毁。</li></ul></section>
          <section class="rule-block"><h3>AI 规则</h3><ul><li>AI 会升级据点、花钱造兵、集火残血、评估反击风险并争夺高价值目标。</li><li>冷酷 AI 额外进行团队级目标规划，优先组织围攻、连续压制、载员登陆和工程师扩张。</li><li>进攻欲改变前压程度与冒险意愿，不会修改基础战斗数值。</li></ul></section>
        </div>
        <h3 class="info-section-title">单位图鉴</h3>
        <div class="codex" id="codex"></div>
        <h3 class="info-section-title">新增海图</h3>
        <ul><li>海岸丘陵：长海岸线，重视沿海登陆与抢港口。</li><li>群岛与海峡：多岛链和狭航道，适合争夺制海权。</li><li>内海争夺：中央内海切割大陆，船坞控制非常关键。</li><li>海湾登陆：大型海湾切入内陆，利于多方向两栖包抄。</li><li>裂海海峡：大陆被宽海峡分割，海军和运兵船决定节奏。</li><li>断链群岛：岛屿极多，海上堡垒和前沿船坞价值极高。</li></ul>
        <h3 class="info-section-title">版本 0.1.2 变更</h3>
        <ul><li>港口/造船厂现在可以直接生产预载 0 到 5 个陆军单位的运兵船。</li><li>新增工程师兵种，可在海边造舰，或建立持续 3 回合的临时营地。</li><li>征服模式改为“占领全部城市并清除全部敌方工程师”才算获胜。</li><li>冷酷 AI 新增工程师扩张、载员登陆和反登陆应对逻辑。</li><li>新增战场纵横比设置，可选宽幅、标准、方阵、纵深。</li><li>预增加：地势高低区分、更多海军、更多海上建筑、更有策略的 AI、更大地图、更多 AI 玩家数、更多组别、战役关卡。</li></ul>
      </div>`;
    }
    function setup() {
      for (const [id, meta] of Object.entries(MAPS)) {
        $("mapSelect").insertAdjacentHTML("beforeend", `<option value="${id}">${meta.name}</option>`);
      }
      for (const [id, name] of Object.entries(MODES)) {
        $("modeSelect").insertAdjacentHTML("beforeend", `<option value="${id}">${name}</option>`);
      }
      for (const [id, meta] of Object.entries(FACTIONS)) {
        $("factionSelect").insertAdjacentHTML("beforeend", `<option value="${id}">${meta.name}</option>`);
      }
      $("factionSelect").value = "hre";
      function refreshNationSelect() {
        const factionId = $("factionSelect").value;
        const select = $("nationSelect");
        select.innerHTML = "";
        for (const [id, meta] of Object.entries(NATIONS)) {
          if (meta.faction === factionId) {
            select.insertAdjacentHTML("beforeend", `<option value="${id}">${meta.name}（特色：${meta.unique}）</option>`);
          }
        }
      }
      refreshNationSelect();
      $("factionSelect").addEventListener("change", refreshNationSelect);
      for (let count = 1; count <= 7; count++) {
        $("aiSelect").insertAdjacentHTML("beforeend", `<option value="${count}">${count} 名</option>`);
      }
      $("spectatorSelect").insertAdjacentHTML("beforeend", `<option value="off" selected>关闭</option><option value="on">开启</option>`);
      for (const team of TEAMS) {
        $("playerTeamSelect").insertAdjacentHTML("beforeend", `<option value="${team}" ${team === "A" ? "selected" : ""}>${TEAM_NAMES[team] || team + "组"}</option>`);
      }
      for (const [id, meta] of colorOptions()) {
        $("playerColorSelect").insertAdjacentHTML("beforeend", `<option value="${id}" ${id === "azure" ? "selected" : ""}>${meta.name}</option>`);
      }
      for (let count = 0; count <= 6; count++) {
        $("startUnitsSelect").insertAdjacentHTML("beforeend", `<option value="${count}" ${count === 4 ? "selected" : ""}>${count} 个 / 联盟</option>`);
      }
      for (const [id, meta] of Object.entries(SIZES)) {
        $("sizeSelect").insertAdjacentHTML("beforeend", `<option value="${id}" ${id === "medium" ? "selected" : ""}>${meta.name}</option>`);
      }
      for (const [id, meta] of Object.entries(ASPECTS)) {
        $("aspectSelect").insertAdjacentHTML("beforeend", `<option value="${id}" ${id === "standard" ? "selected" : ""}>${meta.name}</option>`);
      }
      for (const [id, meta] of Object.entries(COMPLEX)) {
        $("complexitySelect").insertAdjacentHTML("beforeend", `<option value="${id}" ${id === "medium" ? "selected" : ""}>${meta.name}</option>`);
      }
      $("mapSelect").value = "coast";
      $("spreadValue").textContent = `${$("citySpread").value}%`;
      $("aiSpeedValue").textContent = `${$("aiSpeed").value}s`;
      $("buildCapValue").textContent = `${$("buildCap").value}`;
      renderAISettings();
      renderRules();
      renderCodex();
      $("aiSelect").addEventListener("change", renderAISettings);
      $("citySpread").addEventListener("input", () => {
        $("spreadValue").textContent = `${$("citySpread").value}%`;
      });
      $("aiSpeed").addEventListener("input", () => {
        $("aiSpeedValue").textContent = `${$("aiSpeed").value}s`;
      });
      $("buildCap").addEventListener("input", () => {
        $("buildCapValue").textContent = `${$("buildCap").value}`;
      });
      $("buildGrid").addEventListener("click", (event) => {
        const button2 = event.target.closest("[data-type]");
        const siteEntry = selectedSite();
        if (!button2 || !siteEntry) {
          return;
        }
        const cargoTypes = button2.isTransportUnit(dataset) ? normalizeCargoTypes(uiState.shipyardCargo) : [];
        if (!buildAtSite("player", siteEntry, button2.dataset.type, { cargoTypes })) {
          toast(buildBudgetLeft("player") <= 0 ? "本回合造兵已达上限。" : "无法在该据点生产该单位。");
        }
        refresh();
      });
      $("buildBody").addEventListener("change", (event) => {
        const input = event.target.closest("[data-cargo-preset]");
        if (!input) {
          return;
        }
        setCargoPreset(input.dataset.cargoPreset, Number(input.dataset.cargoSlot), input.value);
        refresh();
      });
      $("selActions").addEventListener("click", (event) => {
        const pick = event.target.closest("[data-select-unit]");
        if (pick) {
          const chosen = game?.units.find((entry) => entry.id === pick.dataset.selectUnit);
          if (chosen) {
            selectRef("unit", chosen);
            refresh();
          }
          return;
        }
        const button2 = event.target.closest("[data-unit-action]");
        if (!button2 || !game?.selected || game.selected.kind !== "unit") {
          return;
        }
        const unitEntry = game.selected.ref;
        if (button2.dataset.unitAction === "load" && !autoLoadAdjacent(unitEntry)) {
          toast("附近没有可装载的己方陆军。");
        }
        if (button2.dataset.unitAction === "unload" && !autoUnloadAdjacent(unitEntry)) {
          toast("附近没有可登陆的空地。");
        }
        if (button2.dataset.unitAction === "sell" && !sellUnit("player", unitEntry)) {
          toast("当前无法变卖该单位。");
        }
        refresh();
      });
      $("engineerCard").addEventListener("change", (event) => {
        const input = event.target.closest("[data-cargo-preset]");
        if (!input) {
          return;
        }
        setCargoPreset(input.dataset.cargoPreset, Number(input.dataset.cargoSlot), input.value);
        refresh();
      });
      $("engineerCard").addEventListener("click", (event) => {
        const button2 = event.target.closest("[data-engineer-build]");
        const engineer = engineerSelected();
        if (!button2 || !engineer || game.side !== "player") {
          return;
        }
        if (button2.dataset.engineerBuild === "camp") {
          if (!buildCamp(engineer)) {
            toast("当前无法建立临时营地。");
          }
          refresh();
          return;
        }
        game.pendingOrder = {
          kind: "engineer-launch",
          builderId: engineer.id,
          product: button2.dataset.engineerBuild,
          cargoTypes: isTransportType(button2.dataset.engineerBuild) ? normalizeCargoTypes(uiState.engineerCargo, button2.dataset.engineerBuild) : []
        };
        refresh();
      });
      canvas.addEventListener("click", onBoard);
      canvas.addEventListener("mousedown", (event) => {
        if (event.button === 2 && mapIsPanned()) {
          panState = { x: event.clientX, y: event.clientY, moved: false };
        }
      });
      canvas.addEventListener("wheel", (event) => {
        if (!game || game.over) {
          return;
        }
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = (event.clientX - rect.left) * canvas.width / rect.width;
        const sy = (event.clientY - rect.top) * canvas.height / rect.height;
        const worldX = cam.x + sx / zoom;
        const worldY = cam.y + sy / zoom;
        zoom = clamp(zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15), minZoom(), 3);
        cam.x = worldX - sx / zoom;
        cam.y = worldY - sy / zoom;
        clampCam();
        draw();
      }, { passive: false });
      window.addEventListener("mousemove", (event) => {
        if (!panState) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width;
        const dx = event.clientX - panState.x;
        const dy = event.clientY - panState.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          panState.moved = true;
        }
        cam.x -= dx * scale / zoom;
        cam.y -= dy * scale / zoom;
        panState.x = event.clientX;
        panState.y = event.clientY;
        clampCam();
        draw();
      });
      window.addEventListener("mouseup", (event) => {
        if (event.button === 2 && panState) {
          panSuppressContext = panState.moved;
          panState = null;
        }
      });
      canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (panSuppressContext) {
          panSuppressContext = false;
          return;
        }
        clearPendingOrder();
        game.selected = null;
        refresh();
      });
      $("btnEndTurn").onclick = endTurn;
      $("btnNewGame").onclick = () => showScreen("setup");
      $("btnStartGame").onclick = startGameFlow;
      $("btnUpgrade").onclick = () => {
        const siteEntry = selectedSite();
        if (!siteEntry || !upgradeSite("player", siteEntry)) {
          toast("无法升级该据点。");
        }
        refresh();
      };
      $("btnFullHeal").onclick = () => {
        const siteEntry = selectedSite();
        if (!siteEntry || !fullHealSite("player", siteEntry)) {
          toast("当前条件下无法修整驻军。");
        }
        refresh();
      };
      $("btnModalContinue").onclick = () => {
        game.over = false;
        game.freeplay = true;
        game.side = "player";
        for (const unitEntry of game.units.filter((entry) => areAllies2(entry.owner, "player"))) {
          unitEntry.maxMove = effectiveMove(unitEntry);
          unitEntry.move = unitEntry.maxMove;
          unitEntry.acted = false;
          unitEntry.hasAttacked = false;
        }
        $("overlay").classList.add("hidden");
        refresh();
      };
      $("btnModalOk").onclick = () => {
        $("overlay").classList.add("hidden");
        showScreen("setup");
      };
      $("btnHelp").onclick = () => $("helpModal").classList.remove("hidden");
      $("btnHelpLobby").onclick = () => $("helpModal").classList.remove("hidden");
      $("btnHelpClose").onclick = () => $("helpModal").classList.add("hidden");
      $("btnInfoPage").onclick = () => showScreen("info");
      $("btnInfoClose").onclick = () => showScreen("setup");
      $("btnPause").onclick = () => {
        if (game && !game.over) {
          $("pauseModal").classList.remove("hidden");
        }
      };
      $("btnResume").onclick = () => $("pauseModal").classList.add("hidden");
      $("btnEndGame").onclick = () => endGameNeutral();
      $("btnSaveGame").onclick = () => {
        $("pauseModal").classList.add("hidden");
        const hasCurrent = !!currentSaveKey;
        $("btnSaveOverwrite").classList.toggle("hidden", !hasCurrent);
        $("saveNameInput").value = hasCurrent ? currentSaveName() : `${MAPS[game.settings.map]?.name || "战局"} · 第 ${game.turn} 回合`;
        $("saveModal").classList.remove("hidden");
        $("saveNameInput").focus();
      };
      $("btnSaveOverwrite").onclick = () => {
        toast(overwriteCurrentSave($("saveNameInput").value.trim()) ? "已覆盖当前存档。" : "覆盖失败。");
        $("saveModal").classList.add("hidden");
      };
      $("btnSaveConfirm").onclick = () => {
        toast(saveAsNewSave($("saveNameInput").value.trim()) ? "已另存为新存档。" : "保存失败，存储空间可能已满。");
        $("saveModal").classList.add("hidden");
      };
      $("btnSaveExport").onclick = () => {
        downloadSaveFile(buildSavePayload($("saveNameInput").value.trim()));
        $("saveModal").classList.add("hidden");
        toast("已导出存档文件，可放入游戏的 saves 文件夹长期保存。");
      };
      $("btnSaveCancel").onclick = () => $("saveModal").classList.add("hidden");
      $("btnLoadPage").onclick = () => {
        selectedSaveKey = null;
        showScreen("load");
      };
      $("btnLoadBack").onclick = () => showScreen("setup");
      $("saveListBody").addEventListener("click", (event) => {
        const row = event.target.closest(".save-row");
        if (!row) {
          return;
        }
        selectedSaveKey = row.dataset.key;
        [...$("saveListBody").querySelectorAll(".save-row")].forEach((el) => el.classList.toggle("selected", el === row));
      });
      $("btnLoadConfirm").onclick = () => {
        if (!selectedSaveKey) {
          toast("请先选择一个存档。");
          return;
        }
        if (!loadSave(selectedSaveKey)) {
          toast("该存档已损坏，无法读取。");
        }
      };
      $("btnLoadDelete").onclick = () => {
        if (!selectedSaveKey) {
          toast("请先选择一个存档。");
          return;
        }
        deleteSave(selectedSaveKey);
        selectedSaveKey = null;
        renderSaveList();
        toast("已删除该存档。");
      };
      $("btnExportSave").onclick = () => {
        if (!selectedSaveKey) {
          toast("请先选择一个存档再导出。");
          return;
        }
        try {
          downloadSaveFile(JSON.parse(saveStore.getItem(selectedSaveKey)));
          toast("已导出存档文件，可放入游戏的 saves 文件夹长期保存。");
        } catch (err) {
          toast("导出失败：该存档已损坏。");
        }
      };
      $("btnImportSave").onclick = () => $("importFile").click();
      $("importFile").addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            if (importSaveToList(JSON.parse(reader.result))) {
              renderSaveList();
              toast("已导入存档并加入列表，点击它即可继续。");
            } else {
              toast("导入失败：文件格式不正确。");
            }
          } catch (err) {
            toast("导入失败：文件无法解析。");
          }
        };
        reader.readAsText(file);
        event.target.value = "";
      });
      $("btnChartPrev").onclick = () => {
        if (!game?.stats) {
          return;
        }
        game.stats.chartIndex = (game.stats.chartIndex + chartMetrics().length - 1) % chartMetrics().length;
        drawStatsChart();
      };
      $("btnChartNext").onclick = () => {
        if (!game?.stats) {
          return;
        }
        game.stats.chartIndex = (game.stats.chartIndex + 1) % chartMetrics().length;
        drawStatsChart();
      };
      window.__frontierDebug = {
        summary: () => debugSummary(),
        run: (cap = 150) => fastRun(cap),
        batch: (cap = 150, rounds = 10, seed = 20260804) => fastBatch(cap, rounds, seed),
        stop: () => {
          if (game && !game.over) {
            resolveStalemate2();
          }
          return debugSummary();
        },
        newGame: () => newGame()
      };
      document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
          event.preventDefault();
          endTurn();
        }
        if (event.key === "n" || event.key === "N") {
          showScreen("setup");
        }
        if (event.key === "Escape" && game) {
          game.selected = null;
          refresh();
        }
      });
      for (const id of ["mapSelect", "sizeSelect", "aspectSelect", "complexitySelect", "aiSelect"]) {
        $(id)?.addEventListener("change", renderLobbyPreview);
      }
      showScreen("setup");
    }
    document.addEventListener("DOMContentLoaded", setup);
  })();
})();
