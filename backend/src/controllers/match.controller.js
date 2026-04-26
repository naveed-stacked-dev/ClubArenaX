const matchService = require('../services/match.service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const getAll = async (req, res, next) => {
  try {
    const filter = {};
    // Tenant-scoped: ClubManagers auto-filter by their leagueId
    if (req.leagueId) {
      filter.leagueId = req.leagueId;
    } else if (req.query.leagueId) {
      filter.leagueId = req.query.leagueId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tournamentId) filter.tournamentId = req.query.tournamentId;

    const { matches, total } = await matchService.getMatches(filter, req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(matches, pagination));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    res.json(ApiResponse.ok(match));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const match = await matchService.updateMatch(req.params.id, req.body);
    res.json(ApiResponse.ok(match, 'Match updated'));
  } catch (error) {
    next(error);
  }
};

const getLive = async (req, res, next) => {
  try {
    const matches = await matchService.getLiveMatches(req.params.leagueId);
    res.json(ApiResponse.ok(matches));
  } catch (error) {
    next(error);
  }
};

const getByTournament = async (req, res, next) => {
  try {
    const { matches, total } = await matchService.getMatchesByTournament(
      req.params.tournamentId,
      req.pagination
    );
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(matches, pagination));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const match = await matchService.createMatch(req.body);
    res.status(201).json(ApiResponse.created(match));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await matchService.deleteMatch(req.params.id);
    res.json(ApiResponse.ok(null, 'Match deleted'));
  } catch (error) {
    next(error);
  }
};

const schedule = async (req, res, next) => {
  try {
    const match = await matchService.scheduleMatch(req.params.id, req.body);
    res.json(ApiResponse.ok(match, 'Match scheduled'));
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const match = await matchService.assignManager(req.params.id, req.body.managerId);
    res.json(ApiResponse.ok(match, 'Manager assigned to match'));
  } catch (error) {
    next(error);
  }
};

const generateToken = async (req, res, next) => {
  try {
    const data = await matchService.generateScorerToken(req.params.id);
    res.json(ApiResponse.ok(data, 'New token generated'));
  } catch (error) {
    next(error);
  }
};

const getScorerLink = async (req, res, next) => {
  try {
    const data = await matchService.getScorerLink(req.params.id);
    res.json(ApiResponse.ok(data));
  } catch (error) {
    next(error);
  }
};

const updateStreamUrl = async (req, res, next) => {
  try {
    const match = await matchService.updateStreamUrl(req.params.id, req.body.youtubeStreamUrl);
    res.json(ApiResponse.ok(match, 'Stream URL updated'));
  } catch (error) {
    next(error);
  }
};

const getStreamUrl = async (req, res, next) => {
  try {
    const data = await matchService.getStreamUrl(req.params.id);
    res.json(ApiResponse.ok(data));
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAll, getById, update, getLive, getByTournament,
  create, remove, schedule, assignManager, generateToken, getScorerLink,
  updateStreamUrl, getStreamUrl
};
