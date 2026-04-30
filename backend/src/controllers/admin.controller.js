const adminService = require('../services/admin.service');
const authService = require('../services/auth.service'); // for reset password
const clubService = require('../services/club.service'); // for create club
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const getAllClubs = async (req, res, next) => {
  try {
    const { clubs, total } = await adminService.getAllClubsAdmin(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(clubs, pagination));
  } catch (error) {
    next(error);
  }
};

const createClub = async (req, res, next) => {
  try {
    const club = await clubService.createClub(req.body, req.user._id);
    res.status(201).json(ApiResponse.created(club));
  } catch (error) {
    next(error);
  }
};

const resetClubPassword = async (req, res, next) => {
  try {
    // req.params.id is the club ID, but we usually reset for a specific manager
    // assuming body contains managerId and newPassword
    const { managerId, newPassword } = req.body;
    await authService.resetClubManagerPassword(managerId, newPassword);
    res.json(ApiResponse.ok(null, 'Manager password reset successfully'));
  } catch (error) {
    next(error);
  }
};

const createClubManager = async (req, res, next) => {
  try {
    const result = await adminService.createClubManager(req.params.id, req.body);
    res.json(ApiResponse.ok(result, 'Manager created and assigned to club successfully'));
  } catch (error) {
    next(error);
  }
};

const updateClubManager = async (req, res, next) => {
  try {
    const result = await adminService.updateClubManager(req.params.managerId, req.body);
    res.json(ApiResponse.ok(result, 'Manager details updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClubs,
  createClub,
  resetClubPassword,
  createClubManager,
  updateClubManager,
};
