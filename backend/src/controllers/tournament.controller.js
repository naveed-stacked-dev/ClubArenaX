const tournamentService = require('../services/tournament.service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const create = async (req, res, next) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    res.status(201).json(ApiResponse.created(tournament));
  } catch (error) {
    next(error);
  }
};

const getByLeague = async (req, res, next) => {
  try {
    const { tournaments, total } = await tournamentService.getTournamentsByLeague(
      req.params.leagueId,
      req.pagination
    );
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(tournaments, pagination));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const tournament = await tournamentService.getTournamentById(req.params.id);
    res.json(ApiResponse.ok(tournament));
  } catch (error) {
    next(error);
  }
};

const generateFixtures = async (req, res, next) => {
  try {
    const result = await tournamentService.generateFixtures(req.params.id);
    res.status(201).json(ApiResponse.created(result, 'Fixtures generated'));
  } catch (error) {
    next(error);
  }
};

const getPointsTable = async (req, res, next) => {
  try {
    const table = await tournamentService.getPointsTable(req.params.id);
    res.json(ApiResponse.ok(table));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const tournament = await tournamentService.updateTournament(req.params.id, req.body);
    res.json(ApiResponse.ok(tournament, 'Tournament updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getByLeague, getById, generateFixtures, getPointsTable, update };
