const MatchEvent = require('../models/MatchEvent');
const Match = require('../models/Match');
const PlayerStatsCache = require('../models/PlayerStatsCache');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');

/**
 * ──────────────────────────────────────────
 *  PLAYER ANALYTICS
 * ──────────────────────────────────────────
 */
const getPlayerAnalytics = async (playerId) => {
  const stats = await PlayerStatsCache.findOne({ playerId })
    .populate('playerId', 'name role teamId avatar');
  if (!stats) throw ApiError.notFound('Player stats not found');

  return {
    player: stats.playerId,
    batting: {
      totalRuns: stats.totalRuns,
      totalInnings: stats.totalInnings,
      notOuts: stats.notOuts,
      highestScore: stats.highestScore,
      battingAverage: stats.battingAverage,
      strikeRate: stats.strikeRate,
      fours: stats.fours,
      sixes: stats.sixes,
      fifties: stats.fifties,
      hundreds: stats.hundreds,
      boundaryPercentage: stats.boundaryPercentage,
      dotBallPercentage: stats.dotBallPercentage,
    },
    bowling: {
      totalWickets: stats.totalWickets,
      totalOversBowled: stats.totalOversBowled,
      totalRunsConceded: stats.totalRunsConceded,
      economy: stats.economy,
      bowlingAverage: stats.bowlingAverage,
      bowlingStrikeRate: stats.bowlingStrikeRate,
      bestBowling: stats.bestBowling,
      dotBallsBowled: stats.dotBallsBowled,
      maidens: stats.maidens,
    },
    fielding: {
      catches: stats.catches,
      stumpings: stats.stumpings,
      runOuts: stats.runOuts,
    },
    recentForm: {
      lastFiveScores: stats.recentScores || [],
      lastFiveWickets: stats.recentWickets || [],
    },
    totalMatches: stats.totalMatches,
  };
};

/**
 * ──────────────────────────────────────────
 *  MATCH ANALYTICS (charts / graphs)
 * ──────────────────────────────────────────
 */
const getMatchAnalytics = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('teamA', 'name')
    .populate('teamB', 'name');
  if (!match) throw ApiError.notFound('Match not found');

  const events = await MatchEvent.find({ matchId }).sort({ timestamp: 1 });
  if (events.length === 0) {
    return { runRateGraph: [], manhattanChart: [], wormChart: [] };
  }

  // ── Run Rate Graph (runs per over for each inning) ──
  const runRateGraph = { first: [], second: [] };
  const manhattanChart = { first: [], second: [] };
  const wormChart = { first: [], second: [] };

  const inningEvents = { 1: [], 2: [] };
  for (const event of events) {
    inningEvents[event.inning].push(event);
  }

  for (const inning of [1, 2]) {
    const evts = inningEvents[inning];
    if (evts.length === 0) continue;

    const overRuns = {}; // { overNumber: totalRuns }
    let cumulativeRuns = 0;
    let cumulativeBalls = 0;

    for (const event of evts) {
      const overNum = event.over;
      const totalRuns = event.runs + (event.extras?.runs || 0);

      if (!overRuns[overNum]) overRuns[overNum] = 0;
      overRuns[overNum] += totalRuns;
      cumulativeRuns += totalRuns;
      if (event.isLegalDelivery) cumulativeBalls += 1;

      // Worm chart: cumulative runs after each legal ball
      if (event.isLegalDelivery) {
        const inningKey = inning === 1 ? 'first' : 'second';
        wormChart[inningKey].push({
          ball: cumulativeBalls,
          over: Math.floor((cumulativeBalls - 1) / 6),
          ballInOver: ((cumulativeBalls - 1) % 6) + 1,
          totalRuns: cumulativeRuns,
        });
      }
    }

    const inningKey = inning === 1 ? 'first' : 'second';

    // Manhattan chart: runs per over
    const sortedOvers = Object.keys(overRuns)
      .map(Number)
      .sort((a, b) => a - b);
    for (const overNum of sortedOvers) {
      manhattanChart[inningKey].push({
        over: overNum + 1, // 1-indexed for display
        runs: overRuns[overNum],
      });
    }

    // Run rate graph: cumulative run rate after each over
    let cumRuns = 0;
    for (const overNum of sortedOvers) {
      cumRuns += overRuns[overNum];
      const oversCompleted = overNum + 1;
      runRateGraph[inningKey].push({
        over: oversCompleted,
        runRate: parseFloat((cumRuns / oversCompleted).toFixed(2)),
      });
    }
  }

  return {
    match: {
      teamA: match.teamA,
      teamB: match.teamB,
      status: match.status,
    },
    runRateGraph,
    manhattanChart,
    wormChart,
  };
};

/**
 * ──────────────────────────────────────────
 *  TEAM ANALYTICS
 * ──────────────────────────────────────────
 */
const getTeamAnalytics = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) throw ApiError.notFound('Team not found');

  // Win/loss ratio
  const completedMatches = await Match.find({
    $or: [{ teamA: teamId }, { teamB: teamId }],
    status: 'completed',
  });

  let wins = 0;
  let losses = 0;
  let ties = 0;
  let totalRunsScored = 0;
  let totalOversFaced = 0;
  let totalRunsConceded = 0;
  let totalOversBowled = 0;

  for (const m of completedMatches) {
    if (m.result?.winner) {
      if (m.result.winner.toString() === teamId.toString()) wins += 1;
      else losses += 1;
    } else {
      ties += 1;
    }
  }

  // Head-to-head stats
  const headToHead = {};
  for (const m of completedMatches) {
    const opponentId =
      m.teamA.toString() === teamId.toString()
        ? m.teamB.toString()
        : m.teamA.toString();

    if (!headToHead[opponentId]) {
      headToHead[opponentId] = { wins: 0, losses: 0, ties: 0, total: 0 };
    }
    headToHead[opponentId].total += 1;

    if (m.result?.winner) {
      if (m.result.winner.toString() === teamId.toString()) {
        headToHead[opponentId].wins += 1;
      } else {
        headToHead[opponentId].losses += 1;
      }
    } else {
      headToHead[opponentId].ties += 1;
    }
  }

  // Populate opponent names
  const opponentIds = Object.keys(headToHead);
  const opponents = await Team.find({ _id: { $in: opponentIds } }).select('name logo');
  const headToHeadWithNames = opponents.map((opp) => ({
    team: { id: opp._id, name: opp.name, logo: opp.logo },
    ...headToHead[opp._id.toString()],
  }));

  // Recent form: last 5 matches
  const recentMatches = await Match.find({
    $or: [{ teamA: teamId }, { teamB: teamId }],
    status: 'completed',
  })
    .sort({ endTime: -1 })
    .limit(5)
    .populate('teamA', 'name')
    .populate('teamB', 'name')
    .populate('result.winner', 'name');

  const recentForm = recentMatches.map((m) => {
    let result = 'tie';
    if (m.result?.winner) {
      result = m.result.winner._id.toString() === teamId.toString() ? 'W' : 'L';
    } else {
      result = 'T';
    }
    const opponent =
      m.teamA._id.toString() === teamId.toString() ? m.teamB : m.teamA;
    return {
      matchId: m._id,
      opponent: opponent.name,
      result,
      summary: m.result?.summary || '',
    };
  });

  return {
    team: { id: team._id, name: team.name, logo: team.logo },
    overall: {
      played: completedMatches.length,
      wins,
      losses,
      ties,
      winPercentage: completedMatches.length > 0
        ? parseFloat(((wins / completedMatches.length) * 100).toFixed(1))
        : 0,
    },
    headToHead: headToHeadWithNames,
    recentForm,
  };
};

/**
 * ──────────────────────────────────────────
 *  HEAD-TO-HEAD (Specific)
 * ──────────────────────────────────────────
 */
const getHeadToHead = async (teamId, opponentId) => {
  const completedMatches = await Match.find({
    $or: [
      { teamA: teamId, teamB: opponentId },
      { teamA: opponentId, teamB: teamId }
    ],
    status: 'completed',
  })
    .sort({ endTime: -1 })
    .limit(10)
    .populate('teamA', 'name logo')
    .populate('teamB', 'name logo')
    .populate('result.winner', 'name');

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const m of completedMatches) {
    if (m.result?.winner) {
      if (m.result.winner._id.toString() === teamId.toString()) wins += 1;
      else losses += 1;
    } else {
      ties += 1;
    }
  }

  return {
    teamId,
    opponentId,
    stats: {
      total: completedMatches.length,
      wins,
      losses,
      ties,
    },
    recentMatches: completedMatches,
  };
};

/**
 * ──────────────────────────────────────────
 *  LEADERBOARDS
 * ──────────────────────────────────────────
 */
const getLeaderboard = async (leagueId, { skip, limit }) => {
  const [topScorers, topWicketTakers] = await Promise.all([
    PlayerStatsCache.find({ leagueId, totalRuns: { $gt: 0 } })
      .sort({ totalRuns: -1 })
      .skip(skip)
      .limit(limit)
      .populate('playerId', 'name role teamId')
      .lean(),
    PlayerStatsCache.find({ leagueId, totalWickets: { $gt: 0 } })
      .sort({ totalWickets: -1 })
      .skip(skip)
      .limit(limit)
      .populate('playerId', 'name role teamId')
      .lean(),
  ]);

  // Enrich with team names
  const teamIds = new Set();
  [...topScorers, ...topWicketTakers].forEach((s) => {
    if (s.playerId?.teamId) teamIds.add(s.playerId.teamId.toString());
  });
  const teams = await Team.find({ _id: { $in: [...teamIds] } }).select('name logo');
  const teamMap = {};
  teams.forEach((t) => { teamMap[t._id.toString()] = t; });

  const enrichPlayer = (entry) => ({
    player: {
      id: entry.playerId?._id,
      name: entry.playerId?.name,
      role: entry.playerId?.role,
      team: teamMap[entry.playerId?.teamId?.toString()] || null,
    },
    totalRuns: entry.totalRuns,
    totalWickets: entry.totalWickets,
    battingAverage: entry.battingAverage,
    strikeRate: entry.strikeRate,
    economy: entry.economy,
    totalMatches: entry.totalMatches,
  });

  return {
    topScorers: topScorers.map(enrichPlayer),
    topWicketTakers: topWicketTakers.map(enrichPlayer),
  };
};

/**
 * ──────────────────────────────────────────
 *  MOST VALUABLE PLAYER (MVP aggregation)
 * ──────────────────────────────────────────
 */
const getMVP = async (leagueId) => {
  const result = await PlayerStatsCache.aggregate([
    { $match: { leagueId: require('mongoose').Types.ObjectId(leagueId) } },
    {
      $addFields: {
        mvpScore: {
          $add: [
            { $multiply: ['$totalRuns', 1] },
            { $multiply: ['$totalWickets', 25] },
            { $multiply: ['$catches', 10] },
          ],
        },
      },
    },
    { $sort: { mvpScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'players',
        localField: 'playerId',
        foreignField: '_id',
        as: 'playerInfo',
      },
    },
    { $unwind: '$playerInfo' },
    {
      $project: {
        playerId: 1,
        playerName: '$playerInfo.name',
        playerRole: '$playerInfo.role',
        totalRuns: 1,
        totalWickets: 1,
        catches: 1,
        mvpScore: 1,
      },
    },
  ]);

  return result;
};

module.exports = {
  getPlayerAnalytics,
  getMatchAnalytics,
  getTeamAnalytics,
  getLeaderboard,
  getMVP,
  getHeadToHead,
};
