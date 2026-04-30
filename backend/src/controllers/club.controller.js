const clubService = require('../services/club.service');
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

    const club = await clubService.createClub(req.body, req.user._id);
    res.status(201).json(ApiResponse.created(club));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { clubs, total } = await clubService.getAllClubs(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(clubs, pagination));
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const club = await clubService.getClubBySlug(req.params.slug);
    res.json(ApiResponse.ok(club));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const club = await clubService.getClubById(req.params.id);
    res.json(ApiResponse.ok(club));
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

    const club = await clubService.updateClub(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(club, 'Club updated'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await clubService.deleteClub(req.params.id, req.user, req.userRole);
    res.json(ApiResponse.ok(null, 'Club deactivated'));
  } catch (error) {
    next(error);
  }
};

const updateTheme = async (req, res, next) => {
  try {
    const club = await clubService.updateTheme(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(club, 'Theme updated successfully'));
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const club = await clubService.updateSettings(req.params.id, req.body, req.user, req.userRole);
    res.json(ApiResponse.ok(club, 'Settings updated successfully'));
  } catch (error) {
    next(error);
  }
};

const updateLogo = async (req, res, next) => {
  try {
    const club = await clubService.updateLogo(req.params.id, req.body.logo, req.user, req.userRole);
    res.json(ApiResponse.ok(club, 'Logo updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getBySlug, getById, update, remove, updateTheme, updateSettings, updateLogo };
