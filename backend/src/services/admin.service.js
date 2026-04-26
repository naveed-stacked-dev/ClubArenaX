const League = require('../models/League');
const ClubManager = require('../models/ClubManager');
const ApiError = require('../utils/ApiError');

const getAllLeaguesAdmin = async ({ skip, limit }) => {
  const [leagues, total] = await Promise.all([
    League.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    League.countDocuments(),
  ]);

  const leagueIds = leagues.map((l) => l._id);
  const managers = await ClubManager.find({ leagueId: { $in: leagueIds } }).lean();

  const leaguesWithManagers = leagues.map((league) => {
    const manager = managers.find(
      (m) => m.leagueId.toString() === league._id.toString()
    );
    return {
      ...league,
      manager: manager
        ? { _id: manager._id, name: manager.name, email: manager.email }
        : null,
    };
  });

  return { leagues: leaguesWithManagers, total };
};

const createLeagueManager = async (leagueId, managerData) => {
  const league = await League.findById(leagueId);
  if (!league) throw ApiError.notFound('League not found');

  const existingManager = await ClubManager.findOne({ leagueId });
  if (existingManager) throw ApiError.conflict('League already has a manager');

  const emailExists = await ClubManager.findOne({ email: managerData.email });
  if (emailExists) throw ApiError.conflict('Email already in use by another manager');

  const manager = await ClubManager.create({
    ...managerData,
    leagueId,
  });

  return manager;
};

const updateLeagueManager = async (managerId, managerData) => {
  const manager = await ClubManager.findById(managerId);
  if (!manager) throw ApiError.notFound('Club Manager not found');

  if (managerData.email && managerData.email !== manager.email) {
    const emailExists = await ClubManager.findOne({ email: managerData.email });
    if (emailExists) throw ApiError.conflict('Email already in use by another manager');
  }

  if (managerData.name) manager.name = managerData.name;
  if (managerData.email) manager.email = managerData.email;
  if (managerData.password) manager.password = managerData.password; // pre-save hook will hash it

  await manager.save();

  return {
    _id: manager._id,
    name: manager.name,
    email: manager.email,
    leagueId: manager.leagueId,
  };
};

module.exports = {
  getAllLeaguesAdmin,
  createLeagueManager,
  updateLeagueManager,
};
