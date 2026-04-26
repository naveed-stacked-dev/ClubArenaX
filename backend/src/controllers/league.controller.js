const leagueService = require('../services/league.service');
const s3Service = require('../services/s3Service');
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const create = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'logo') {
          const key = s3Service.generateKey('clubs', file.originalname);
          req.body.logo = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
        if (file.fieldname === 'bannerUrl') {
          const key = s3Service.generateKey('clubs/banners', file.originalname);
          req.body.bannerUrl = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const league = await leagueService.createLeague(req.body, req.user._id);
    res.status(201).json(ApiResponse.created(league));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { leagues, total } = await leagueService.getAllLeagues(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(leagues, pagination));
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const league = await leagueService.getLeagueBySlug(req.params.slug);
    res.json(ApiResponse.ok(league));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const league = await leagueService.getLeagueById(req.params.id);
    res.json(ApiResponse.ok(league));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === 'logo') {
          const key = s3Service.generateKey(`clubs/${req.params.id}`, file.originalname);
          req.body.logo = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
        if (file.fieldname === 'bannerUrl') {
          const key = s3Service.generateKey(`clubs/${req.params.id}/banners`, file.originalname);
          req.body.bannerUrl = await s3Service.uploadToS3(file.buffer, key, file.mimetype);
        }
      }
    }

    const league = await leagueService.updateLeague(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(league, 'League updated'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await leagueService.deleteLeague(req.params.id, req.user, req.userRole);
    res.json(ApiResponse.ok(null, 'League deactivated'));
  } catch (error) {
    next(error);
  }
};

const updateTheme = async (req, res, next) => {
  try {
    const league = await leagueService.updateTheme(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(league, 'Theme updated successfully'));
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const league = await leagueService.updateSettings(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(league, 'Settings updated successfully'));
  } catch (error) {
    next(error);
  }
};

const updateLogo = async (req, res, next) => {
  try {
    const league = await leagueService.updateLogo(req.params.id, req.body.logo, req.user, req.userRole);
    res.json(ApiResponse.ok(league, 'Logo updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getBySlug, getById, update, remove, updateTheme, updateSettings, updateLogo };
