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

const getAll = async (req, res, next) => {
  try {
    const { tournaments, total } = await tournamentService.getAllTournaments(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(tournaments, pagination));
  } catch (error) {
    next(error);
  }
};

const getByClub = async (req, res, next) => {
  try {
    const { tournaments, total } = await tournamentService.getTournamentsByClub(
      req.params.clubId,
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

/**
 * Get the full bracket tree for a knockout tournament.
 */
const getBracket = async (req, res, next) => {
  try {
    const bracket = await tournamentService.getBracket(req.params.id);
    res.json(ApiResponse.ok(bracket));
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a match result and propagate winner through the bracket.
 */
const submitResult = async (req, res, next) => {
  try {
    const match = await tournamentService.submitMatchResult(req.params.matchId, req.body);
    res.json(ApiResponse.ok(match, 'Result submitted and bracket updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get the bracket graph for the visual builder.
 */
const getBracketGraph = async (req, res, next) => {
  try {
    const graph = await tournamentService.getBracketGraph(req.params.id);
    res.json(ApiResponse.ok(graph));
  } catch (error) {
    next(error);
  }
};

/**
 * Save the bracket graph from the visual builder.
 */
const saveBracketGraph = async (req, res, next) => {
  try {
    const graph = await tournamentService.saveBracketGraph(req.params.id, req.body);
    res.json(ApiResponse.ok(graph, 'Bracket structure saved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getByClub, getById, generateFixtures, getPointsTable, update, getBracket, submitResult, getBracketGraph, saveBracketGraph };
