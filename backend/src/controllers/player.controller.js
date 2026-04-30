const playerService = require('../services/player.service');
const analyticsService = require('../services/analytics.service');
const s3Service = require('../services/s3Service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const create = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'avatar') {
          const key = s3Service.generateKey('players', file.originalname);
          req.body.avatar = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const player = await playerService.createPlayer(req.body);
    res.status(201).json(ApiResponse.created(player));
  } catch (error) {
    next(error);
  }
};

const getByClub = async (req, res, next) => {
  try {
    const { players, total } = await playerService.getPlayersByClub(
      req.params.clubId,
      req.pagination,
      req.query.teamId || null
    );
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(players, pagination));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await playerService.getPlayerById(req.params.id);
    res.json(ApiResponse.ok(data));
  } catch (error) {
    next(error);
  }
};

const getByTeam = async (req, res, next) => {
  try {
    const players = await playerService.getPlayersByTeam(req.params.teamId);
    res.json(ApiResponse.ok(players));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'avatar') {
          const key = s3Service.generateKey(`players/${req.params.id}`, file.originalname);
          req.body.avatar = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const player = await playerService.updatePlayer(req.params.id, req.body);
    res.json(ApiResponse.ok(player, 'Player updated'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await playerService.deletePlayer(req.params.id);
    res.json(ApiResponse.ok(null, 'Player deleted'));
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getPlayerAnalytics(req.params.id);
    res.json(ApiResponse.ok(stats));
  } catch (error) {
    next(error);
  }
};

const getRecentMatches = async (req, res, next) => {
  try {
    const matches = await playerService.getPlayerRecentMatches(req.params.id);
    res.json(ApiResponse.ok(matches));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getByClub, getById, getByTeam, update, remove, getStats, getRecentMatches };
