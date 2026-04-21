const leagueService = require('../services/league.service');
const matchService = require('../services/match.service');
const tournamentService = require('../services/tournament.service');
const scoringService = require('../services/scoring.service');
const playerService = require('../services/player.service');
const teamService = require('../services/team.service');
const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

// We re-export only the reads that are publicly accessible without authentication.
const getLeagues = async (req, res, next) => {
  try {
    const { leagues, total } = await leagueService.getAllLeagues(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(leagues, pagination));
  } catch (error) {
    next(error);
  }
};

const getLeagueBySlug = async (req, res, next) => {
  try {
    const league = await leagueService.getLeagueBySlug(req.params.slug);
    res.json(ApiResponse.ok(league));
  } catch (error) {
    next(error);
  }
};

const getLiveMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getLiveMatches(req.params.leagueId);
    res.json(ApiResponse.ok(matches));
  } catch (error) {
    next(error);
  }
};

const getMatchSummary = async (req, res, next) => {
  try {
    const summary = await scoringService.getMatchSummary(req.params.matchId);
    res.json(ApiResponse.ok(summary));
  } catch (error) {
    next(error);
  }
};

const getMatchScorecard = async (req, res, next) => {
  try {
    const scorecard = await scoringService.getScorecard(req.params.matchId);
    res.json(ApiResponse.ok(scorecard));
  } catch (error) {
    next(error);
  }
};

const getLeagueLeaderboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getLeaderboard(req.params.leagueId, req.pagination);
    res.json(ApiResponse.ok(data));
  } catch (error) {
    next(error);
  }
};

// Tournament points table is public
const getPointsTable = async (req, res, next) => {
  try {
    const table = await tournamentService.getPointsTable(req.params.tournamentId);
    res.json(ApiResponse.ok(table));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeagues,
  getLeagueBySlug,
  getLiveMatches,
  getMatchSummary,
  getMatchScorecard,
  getLeagueLeaderboard,
  getPointsTable,
};
