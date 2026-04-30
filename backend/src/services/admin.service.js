const Club = require('../models/Club');
const ClubManager = require('../models/ClubManager');
const ApiError = require('../utils/ApiError');

const getAllClubsAdmin = async ({ skip, limit }) => {
  const [clubs, total] = await Promise.all([
    Club.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    Club.countDocuments(),
  ]);

  const clubIds = clubs.map((c) => c._id);
  const managers = await ClubManager.find({ clubId: { $in: clubIds } }).lean();

  const clubsWithManagers = clubs.map((club) => {
    const manager = managers.find(
      (m) => m.clubId.toString() === club._id.toString()
    );
    return {
      ...club,
      manager: manager
        ? { _id: manager._id, name: manager.name, email: manager.email }
        : null,
    };
  });

  return { clubs: clubsWithManagers, total };
};

const createClubManager = async (clubId, managerData) => {
  const club = await Club.findById(clubId);
  if (!club) throw ApiError.notFound('Club not found');

  const existingManager = await ClubManager.findOne({ clubId });
  if (existingManager) throw ApiError.conflict('Club already has a manager');

  const emailExists = await ClubManager.findOne({ email: managerData.email });
  if (emailExists) throw ApiError.conflict('Email already in use by another manager');

  const manager = await ClubManager.create({
    ...managerData,
    clubId,
  });

  return manager;
};

const updateClubManager = async (managerId, managerData) => {
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
    clubId: manager.clubId,
  };
};

module.exports = {
  getAllClubsAdmin,
  createClubManager,
  updateClubManager,
};
