const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Factory function that returns a middleware restricting access to specified roles.
 * @param  {...string} allowedRoles - One or more ROLES constants.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }
    next();
  };
};

// Convenience middlewares
const superAdminOnly = authorize(ROLES.SUPER_ADMIN);
const clubManagerOnly = authorize(ROLES.CLUB_MANAGER, ROLES.SUPER_ADMIN);
const matchManagerOnly = authorize(ROLES.MATCH_MANAGER, ROLES.SUPER_ADMIN);
const anyManager = authorize(ROLES.SUPER_ADMIN, ROLES.CLUB_MANAGER, ROLES.MATCH_MANAGER);

module.exports = {
  authorize,
  superAdminOnly,
  clubManagerOnly,
  matchManagerOnly,
  anyManager,
};
