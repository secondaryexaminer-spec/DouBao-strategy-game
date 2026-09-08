'use strict';
// src/core/turn.js —— 回合/胜负判定模块（从 main.js 闭包渐进抽取，行为零变化）。
// 抽取原则：本模块不依赖 DOM；所有闭包辅助函数经 deps 注入，main.js 传原函数，
// 保证与抽取前逐字节一致。抽取记录见 .vibecoding/MEMORY.md（阶段3后·拆分窗口第一刀）。

// 阵营战绩汇总：按队伍统计 城市/据点/单位 数量
export function teamStandings(game, deps) {
  const { teamOf } = deps;
  const standings = {};
  const ensure = team => (standings[team] = standings[team] || { cities: 0, sites: 0, units: 0 });
  for (const siteEntry of game.sites) {
    if (siteEntry.owner === 'neutral') {
      continue;
    }
    const bucket = ensure(teamOf(siteEntry.owner));
    bucket.sites += 1;
    if (siteEntry.kind === 'city') {
      bucket.cities += 1;
    }
  }
  for (const unitEntry of game.units) {
    ensure(teamOf(unitEntry.owner)).units += 1;
  }
  return standings;
}

// 回合上限僵局判定：按 城市→据点→单位 排序决出领先队伍
export function resolveStalemate(game, deps) {
  const { teamOf, teamName, finish } = deps;
  const standings = teamStandings(game, deps);
  const ranked = Object.entries(standings).sort((a, b) => b[1].cities - a[1].cities || b[1].sites - a[1].sites || b[1].units - a[1].units);
  if (!ranked.length) {
    finish(false, `战局在第 ${game.turn} 回合陷入僵局，双方均无立足点。`);
    return;
  }
  const [leadTeam, lead] = ranked[0];
  const playerWin = !game.settings?.spectator && teamOf('player') === leadTeam;
  finish(playerWin, `战局在第 ${game.turn} 回合达到回合上限，判定 ${teamName(leadTeam)} 以 ${lead.cities} 城 / ${lead.sites} 据点领先胜出。`);
}

// 陆战单位能否走陆路到达非己方城市（BFS，仅陆地形可达）
export function landUnitCanReachForeignCity(game, deps, unitEntry) {
  const { typeMeta, cellKey, getSite, areAllies, adjacent8, isLandTile } = deps;
  if (typeMeta(unitEntry.type).domain !== 'land') {
    return false;
  }
  const seen = new Set([cellKey(unitEntry.x, unitEntry.y)]);
  const queue = [{ x: unitEntry.x, y: unitEntry.y }];
  while (queue.length) {
    const current = queue.shift();
    const siteEntry = getSite(current.x, current.y);
    if (siteEntry?.kind === 'city' && !areAllies(siteEntry.owner, unitEntry.owner)) {
      return true;
    }
    for (const next of adjacent8(current.x, current.y)) {
      if (!isLandTile(next.x, next.y)) {
        continue;
      }
      const nextKey = cellKey(next.x, next.y);
      if (seen.has(nextKey)) {
        continue;
      }
      seen.add(nextKey);
      queue.push(next);
    }
  }
  return false;
}

// 队伍是否仍具备争夺陆地的能力（占城 / 载员运输 / 陆战可及 / 运输+船坞组合）
export function teamCanContestLand(game, deps, team) {
  const { teamOf, isTransportUnit, typeMeta } = deps;
  if (game.sites.some(siteEntry => siteEntry.kind === 'city' && siteEntry.owner !== 'neutral' && teamOf(siteEntry.owner) === team)) {
    return true;
  }
  if (game.units.some(unitEntry => teamOf(unitEntry.owner) === team && isTransportUnit(unitEntry) && unitEntry.cargo?.length)) {
    return true;
  }
  const landUnits = game.units.filter(unitEntry => teamOf(unitEntry.owner) === team && typeMeta(unitEntry.type).domain === 'land');
  if (landUnits.some(u => landUnitCanReachForeignCity(game, deps, u))) {
    return true;
  }
  const hasTransport = game.units.some(unitEntry => teamOf(unitEntry.owner) === team && isTransportUnit(unitEntry));
  const hasShipyard = game.sites.some(siteEntry => siteEntry.kind === 'shipyard' && teamOf(siteEntry.owner) === team);
  return !!landUnits.length && (hasTransport || hasShipyard);
}

// 唯一控制全部城市的队伍（否则返回 null）
export function dominantCityTeam(game, deps) {
  const { teamOf } = deps;
  const cityTeams = [...new Set(game.sites.filter(siteEntry => siteEntry.kind === 'city' && siteEntry.owner !== 'neutral').map(siteEntry => teamOf(siteEntry.owner)))];
  return cityTeams.length === 1 ? cityTeams[0] : null;
}

// 胜负判定主入口：观战 / survival / skirmish / 征服 各模式终局条件
export function checkEnd(game, deps) {
  const { teamOf, areAllies, teamName, finish } = deps;
  if (game.over || game.freeplay) {
    return;
  }
  if (game.settings?.spectator) {
    const activeTeams = new Set();
    for (const unitEntry of game.units) {
      activeTeams.add(teamOf(unitEntry.owner));
    }
    for (const siteEntry of game.sites) {
      if (siteEntry.owner !== 'neutral') {
        activeTeams.add(teamOf(siteEntry.owner));
      }
    }
    if (game.settings.mode === 'skirmish') {
      const combatTeams = new Set(game.units.map(unitEntry => teamOf(unitEntry.owner)));
      if (combatTeams.size === 1 && combatTeams.size > 0) {
        finish(true, `${teamName([...combatTeams][0])} 赢得了观战遭遇战。`);
      }
      return;
    }
    if (game.settings.mode === 'survival' && game.turn >= 12) {
      const ranked = [...activeTeams].sort((a, b) => game.sites.filter(siteEntry => siteEntry.kind === 'city' && teamOf(siteEntry.owner) === b).length - game.sites.filter(siteEntry => siteEntry.kind === 'city' && teamOf(siteEntry.owner) === a).length);
      if (ranked[0]) {
        finish(true, `${teamName(ranked[0])} 在观战守城模式中存活到第12回合。`);
      }
      return;
    }
    const hostileTeams = new Set(game.sites.filter(siteEntry => (siteEntry.kind === 'city' || siteEntry.kind === 'shipyard' || siteEntry.kind === 'fortress') && siteEntry.owner !== 'neutral').map(siteEntry => teamOf(siteEntry.owner)));
    if (hostileTeams.size === 1) {
      const winnerTeam = [...hostileTeams][0];
      const enemyEngineers = game.units.some(unitEntry => (unitEntry.type === 'engineer' && teamOf(unitEntry.owner) !== winnerTeam) || unitEntry.cargo?.some(payload => payload.type === 'engineer' && teamOf(payload.owner) !== winnerTeam));
      if (!enemyEngineers) {
        finish(true, `${teamName(winnerTeam)} 完成了全部敌对城市与海上据点占领，并清除了敌方工程师。`);
        return;
      }
    }
    if (activeTeams.size === 1 && activeTeams.size > 0) {
      finish(true, `${teamName([...activeTeams][0])} 成为战场最后赢家。`);
    }
    return;
  }
  const playerTeam = teamOf('player');
  const activeTeams = new Set();
  for (const unitEntry of game.units) {
    activeTeams.add(teamOf(unitEntry.owner));
  }
  for (const siteEntry of game.sites) {
    if (siteEntry.owner !== 'neutral') {
      activeTeams.add(teamOf(siteEntry.owner));
    }
  }
  const playerAlive = [...activeTeams].includes(playerTeam);
  if (game.settings.mode === 'survival') {
    const alliedCity = game.sites.some(siteEntry => siteEntry.kind === 'city' && areAllies(siteEntry.owner, 'player'));
    if (!alliedCity && !game.units.some(unitEntry => areAllies(unitEntry.owner, 'player'))) {
      finish(false, '你的组已经失去全部立足点。');
      return;
    }
    if (game.turn >= 12 && alliedCity) {
      finish(true, '你成功守住了关键城市直到第12回合。');
    }
    return;
  }
  if (game.settings.mode === 'skirmish') {
    const combatTeams = new Set(game.units.map(unitEntry => teamOf(unitEntry.owner)));
    if (!combatTeams.has(playerTeam)) {
      finish(false, '你的组全部野战部队已被消灭。');
      return;
    }
    if (combatTeams.size === 1 && combatTeams.has(playerTeam)) {
      finish(true, '敌对组野战部队已全部被消灭。');
    }
    return;
  }
  const enemyControlledCities = game.sites.filter(siteEntry => siteEntry.kind === 'city' && siteEntry.owner !== 'neutral' && teamOf(siteEntry.owner) !== playerTeam);
  const enemyControlledSeaSites = game.sites.filter(siteEntry => (siteEntry.kind === 'shipyard' || siteEntry.kind === 'fortress') && siteEntry.owner !== 'neutral' && teamOf(siteEntry.owner) !== playerTeam);
  if (!enemyControlledCities.length && !enemyControlledSeaSites.length) {
    const enemyEngineers = game.units.some(unitEntry => (unitEntry.type === 'engineer' && teamOf(unitEntry.owner) !== playerTeam) || unitEntry.cargo?.some(payload => payload.type === 'engineer' && teamOf(payload.owner) !== playerTeam));
    if (!enemyEngineers) {
      finish(true, '你已占领全部敌对城市与海上据点，并清除了全部敌方工程师。');
      return;
    }
  }
  const hostileTeams = new Set(game.sites.filter(siteEntry => (siteEntry.kind === 'city' || siteEntry.kind === 'shipyard' || siteEntry.kind === 'fortress') && siteEntry.owner !== 'neutral').map(siteEntry => teamOf(siteEntry.owner)));
  if (hostileTeams.size === 1 && !hostileTeams.has(playerTeam)) {
    const winnerTeam = [...hostileTeams][0];
    const enemyEngineers = game.units.some(unitEntry => (unitEntry.type === 'engineer' && teamOf(unitEntry.owner) !== winnerTeam) || unitEntry.cargo?.some(payload => payload.type === 'engineer' && teamOf(payload.owner) !== winnerTeam));
    if (!enemyEngineers) {
      finish(false, '敌方已占领全部城市与海上据点，并清除了你方全部工程师。');
      return;
    }
  }
  if (!playerAlive) {
    finish(false, '你的组已经失去全部据点与部队。');
    return;
  }
  if (activeTeams.size === 1 && activeTeams.has(playerTeam)) {
    finish(true, '战场上只剩下你的组仍具战争能力。');
  }
}
