const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const SuperAdmin = require('../models/SuperAdmin');
const ClubManager = require('../models/ClubManager');
const MatchManager = require('../models/MatchManager');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const MODEL_MAP = {
  [ROLES.SUPER_ADMIN]: SuperAdmin,
  [ROLES.CLUB_MANAGER]: ClubManager,
  [ROLES.MATCH_MANAGER]: MatchManager,
  [ROLES.USER]: User,
};

/**
 * General JWT authentication middleware.
 * Extracts token from Authorization header, verifies it, 
 * and attaches the user document + role to req.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const Model = MODEL_MAP[decoded.role];
    if (!Model) {
      throw ApiError.unauthorized('Invalid token role');
    }

    const user = await Model.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User not found or token expired');
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired'));
    }
    next(error);
  }
};

/**
 * Token-based auth for match managers who use a direct access link.
 * Falls through to JWT auth if no match token is provided.
 */
const authenticateMatchToken = async (req, res, next) => {
  try {
    const matchToken = req.headers['x-match-token'] || req.query.matchToken;

    if (matchToken) {
      const manager = await MatchManager.findOne({ token: matchToken });
      if (!manager) {
        throw ApiError.unauthorized('Invalid match access token');
      }
      req.user = manager;
      req.userRole = ROLES.MATCH_MANAGER;
      return next();
    }

    // Fall through to JWT auth
    return authenticate(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth — doesn't fail if no token provided.
 * Used for public endpoints that behave differently for logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const Model = MODEL_MAP[decoded.role];
    if (Model) {
      const user = await Model.findById(decoded.id);
      if (user) {
        req.user = user;
        req.userRole = decoded.role;
      }
    }
    next();
  } catch {
    // Silently ignore invalid tokens for optional auth
    next();
  }
};

module.exports = { authenticate, authenticateMatchToken, optionalAuth };
