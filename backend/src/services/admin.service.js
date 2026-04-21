const League = require('../models/League');
const ClubManager = require('../models/ClubManager');
const ApiError = require('../utils/ApiError');

const getAllLeaguesAdmin = async ({ skip, limit }) => {
  const [leagues, total] = await Promise.all([
    League.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email'),
    League.countDocuments(),
  ]);

  return { leagues, total };
};

// Reset password for club manager is already in auth.service, but can be managed by super admin
// Let's bring it all together for admin actions
const assignManagerToLeague = async (leagueId, managerId) => {
  const league = await League.findById(leagueId);
  if (!league) throw ApiError.notFound('League not found');

  const manager = await ClubManager.findById(managerId);
  if (!manager) throw ApiError.notFound('Club Manager not found');

  manager.leagueId = leagueId;
  await manager.save();

  return manager;
};

module.exports = {
  getAllLeaguesAdmin,
  assignManagerToLeague,
};
