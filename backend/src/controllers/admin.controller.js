const adminService = require('../services/admin.service');
const authService = require('../services/auth.service'); // for reset password
const leagueService = require('../services/league.service'); // for create league
const ApiResponse = require('../utils/ApiResponse');
const { buildPaginationResponse } = require('../middlewares/pagination.middleware');

const getAllLeagues = async (req, res, next) => {
  try {
    const { leagues, total } = await adminService.getAllLeaguesAdmin(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination);
    res.json(ApiResponse.paginated(leagues, pagination));
  } catch (error) {
    next(error);
  }
};

const createLeague = async (req, res, next) => {
  try {
    const league = await leagueService.createLeague(req.body, req.user._id);
    res.status(201).json(ApiResponse.created(league));
  } catch (error) {
    next(error);
  }
};

const resetLeaguePassword = async (req, res, next) => {
  try {
    // req.params.id is the league ID, but we usually reset for a specific manager
    // assuming body contains managerId and newPassword
    const { managerId, newPassword } = req.body;
    await authService.resetClubManagerPassword(managerId, newPassword);
    res.json(ApiResponse.ok(null, 'Manager password reset successfully'));
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const { managerId } = req.body;
    const result = await adminService.assignManagerToLeague(req.params.id, managerId);
    res.json(ApiResponse.ok(result, 'Manager assigned to league'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLeagues,
  createLeague,
  resetLeaguePassword,
  assignManager,
};
