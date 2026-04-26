const League = require('../models/League');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

const checkLeagueAccess = (league, user, role) => {
  if (role === ROLES.SUPER_ADMIN) return;
  if (role === ROLES.CLUB_MANAGER && league._id.toString() === user.leagueId?.toString()) return;
  throw ApiError.forbidden('You can only update your own league');
};

/**
 * Create a new league.
 */
const createLeague = async (data, superAdminId) => {
  // Generate slug from name if not provided
  if (!data.slug) {
    data.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const existingLeague = await League.findOne({ slug: data.slug });
  if (existingLeague) {
    throw ApiError.conflict('A league with this slug already exists');
  }

  const league = await League.create({
    ...data,
    createdBy: superAdminId,
  });

  return league;
};

/**
 * Get all leagues with pagination.
 */
const getAllLeagues = async ({ skip, limit }) => {
  const [leagues, total] = await Promise.all([
    League.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email'),
    League.countDocuments({ isActive: true }),
  ]);

  return { leagues, total };
};

/**
 * Get a single league by slug.
 */
const getLeagueBySlug = async (slug) => {
  const league = await League.findOne({ slug, isActive: true }).populate(
    'createdBy',
    'name email'
  );
  if (!league) {
    throw ApiError.notFound('League not found');
  }
  return league;
};

/**
 * Get a single league by ID.
 */
const getLeagueById = async (id) => {
  const league = await League.findById(id).populate('createdBy', 'name email');
  if (!league) {
    throw ApiError.notFound('League not found');
  }
  return league;
};

/**
 * Update a league.
 */
const updateLeague = async (id, data, user, role) => {
  const league = await League.findById(id);
  if (!league) throw ApiError.notFound('League not found');
  checkLeagueAccess(league, user, role);

  // If slug is changed, check uniqueness
  if (data.slug && data.slug !== league.slug) {
    const existing = await League.findOne({ slug: data.slug });
    if (existing) throw ApiError.conflict('Slug already taken');
  }

  Object.assign(league, data);
  await league.save();
  return league;
};

/**
 * Soft-delete (deactivate) a league.
 */
const deleteLeague = async (id, user, role) => {
  const league = await League.findById(id);
  if (!league) throw ApiError.notFound('League not found');
  checkLeagueAccess(league, user, role);

  league.isActive = false;
  await league.save();
  return league;
};

/**
 * Update league theme.
 */
const updateTheme = async (id, themeData, user, role) => {
  const league = await League.findById(id);
  if (!league) throw ApiError.notFound('League not found');
  checkLeagueAccess(league, user, role);

  league.theme = { ...league.theme, ...themeData };
  await league.save();
  return league;
};

/**
 * Update league settings.
 */
const updateSettings = async (id, settingsData, user, role) => {
  const league = await League.findById(id);
  if (!league) throw ApiError.notFound('League not found');
  checkLeagueAccess(league, user, role);

  league.settings = { ...league.settings, ...settingsData };
  await league.save();
  return league;
};

/**
 * Update league logo.
 */
const updateLogo = async (id, logo, user, role) => {
  const league = await League.findById(id);
  if (!league) throw ApiError.notFound('League not found');
  checkLeagueAccess(league, user, role);

  league.logo = logo;
  await league.save();
  return league;
};

module.exports = {
  createLeague,
  getAllLeagues,
  getLeagueBySlug,
  getLeagueById,
  updateLeague,
  deleteLeague,
  updateTheme,
  updateSettings,
  updateLogo,
};
