const teamService = require('../services/team.service');
const playerService = require('../services/player.service');
const s3Service = require('../services/s3Service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const create = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'logo') {
          const key = s3Service.generateKey('teams', file.originalname);
          req.body.logoUrl = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const team = await teamService.createTeam(req.body);
    res.status(201).json(ApiResponse.created(team));
  } catch (error) {
    next(error);
  }
};

const getByClub = async (req, res, next) => {
  try {
    const { teams, total } = await teamService.getTeamsByClub(
      req.params.clubId,
      req.pagination
    );
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(teams, pagination));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json(ApiResponse.ok(team));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'logo') {
          const key = s3Service.generateKey(`teams/${req.params.id}`, file.originalname);
          req.body.logoUrl = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const team = await teamService.updateTeam(req.params.id, req.body);
    res.json(ApiResponse.ok(team, 'Team updated'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.json(ApiResponse.ok(null, 'Team deleted'));
  } catch (error) {
    next(error);
  }
};

const addPlayer = async (req, res, next) => {
  try {
    const player = await teamService.addPlayerToTeam(req.params.id, req.body.playerId);
    res.json(ApiResponse.ok(player, 'Player added to team successfully'));
  } catch (error) {
    next(error);
  }
};

const getPlayers = async (req, res, next) => {
  try {
    const players = await playerService.getPlayersByTeam(req.params.id);
    res.json(ApiResponse.ok(players));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getByClub, getById, update, remove, addPlayer, getPlayers };
