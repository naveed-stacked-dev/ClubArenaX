const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const SuperAdmin = require('../models/SuperAdmin');
const ClubManager = require('../models/ClubManager');
const MatchManager = require('../models/MatchManager');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');
const { v4: uuidv4 } = require('uuid');

const MODEL_MAP = {
  [ROLES.SUPER_ADMIN]: SuperAdmin,
  [ROLES.CLUB_MANAGER]: ClubManager,
  [ROLES.USER]: User,
};

/**
 * Generate access + refresh token pair.
 */
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ id: userId, role }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

/**
 * Register a new user of a given role.
 */
const register = async (role, data) => {
  const Model = MODEL_MAP[role];
  if (!Model) throw ApiError.badRequest('Invalid role for registration');

  const existingUser = await Model.findOne({ email: data.email });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const user = await Model.create(data);
  const tokens = generateTokens(user._id, role);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  userObj.role = role;

  return { user: userObj, ...tokens };
};

/**
 * Login a user of a given role.
 */
const login = async (role, email, password) => {
  const Model = MODEL_MAP[role];
  if (!Model) throw ApiError.badRequest('Invalid role for login');

  const user = await Model.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = generateTokens(user._id, role);

  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  userObj.role = role;

  return { user: userObj, ...tokens };
};

/**
 * Refresh an expired access token using the refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token is required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const Model = MODEL_MAP[decoded.role];
  if (!Model) throw ApiError.unauthorized('Invalid token role');

  const user = await Model.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokens = generateTokens(user._id, decoded.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

/**
 * Login a match manager via token-based access (no password).
 */
const loginMatchManagerByToken = async (token) => {
  const manager = await MatchManager.findOne({ token });
  if (!manager) {
    throw ApiError.unauthorized('Invalid match access token');
  }

  const tokens = generateTokens(manager._id, ROLES.MATCH_MANAGER);
  const userObj = manager.toObject();
  userObj.role = ROLES.MATCH_MANAGER;
  return { user: userObj, ...tokens };
};

/**
 * Create a match manager with a unique access token.
 */
const createMatchManager = async (data) => {
  const token = uuidv4();

  const manager = await MatchManager.create({
    ...data,
    token,
    accessType: data.accessType || 'token',
  });

  return manager;
};

/**
 * Login a match manager via email/password.
 */
const loginMatchManager = async (email, password) => {
  const manager = await MatchManager.findOne({ email }).select('+password');
  if (!manager || !manager.password) {
    throw ApiError.unauthorized('Invalid credentials or token-only access');
  }

  const isMatch = await bcrypt.compare(password, manager.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = generateTokens(manager._id, ROLES.MATCH_MANAGER);

  const managerObj = manager.toObject();
  delete managerObj.password;
  managerObj.role = ROLES.MATCH_MANAGER;

  return { user: managerObj, ...tokens };
};

/**
 * Reset a ClubManager's password (by SuperAdmin)
 */
const resetClubManagerPassword = async (managerId, newPassword) => {
  const manager = await ClubManager.findById(managerId);
  if (!manager) {
    throw ApiError.notFound('Club Manager');
  }

  manager.password = newPassword;
  await manager.save();
};

/**
 * Change own password (authenticated user)
 */
const changePassword = async (role, userId, currentPassword, newPassword) => {
  const Model = MODEL_MAP[role];
  if (!Model) throw ApiError.badRequest('Invalid role for password change');

  const user = await Model.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  loginMatchManagerByToken,
  createMatchManager,
  loginMatchManager,
  generateTokens,
  resetClubManagerPassword,
  changePassword,
};
