const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Attach tenant (clubId) context to the request based on the user's role.
 * 
 * - SuperAdmin:  req.clubId = null (unrestricted access to all clubs)
 * - ClubManager: req.clubId = user.clubId (enforced single-club access)
 * - MatchManager: req.clubId = user.clubId (scoped to their club)
 *
 * Must be used AFTER authenticate middleware.
 */
const attachTenant = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  switch (req.userRole) {
    case ROLES.SUPER_ADMIN:
      // SuperAdmin has global access — clubId stays null unless explicitly set
      req.clubId = req.query.clubId || req.body.clubId || null;
      break;

    case ROLES.CLUB_MANAGER:
      // ClubManager is always scoped to their assigned club
      req.clubId = req.user.clubId?.toString() || null;
      if (!req.clubId) {
        return next(ApiError.forbidden('Your account is not assigned to any club'));
      }
      break;

    case ROLES.MATCH_MANAGER:
      // MatchManager is scoped to their assigned club
      req.clubId = req.user.clubId?.toString() || null;
      break;

    default:
      req.clubId = null;
  }

  next();
};

/**
 * Enforce that the requested clubId (from URL params or body) matches
 * the tenant's scoped clubId.
 *
 * SuperAdmins pass through freely.
 * ClubManagers/MatchManagers get 403 if they try to access a different club.
 *
 * Checks: req.params.clubId, req.body.clubId
 */
const requireClubAccess = (req, res, next) => {
  // SuperAdmin can access any club
  if (req.userRole === ROLES.SUPER_ADMIN) {
    return next();
  }

  // For scoped roles, verify the requested club matches their tenant
  const requestedClubId =
    req.params.clubId || req.body.clubId || req.query.clubId || req.params.id;

  if (requestedClubId && req.clubId && requestedClubId !== req.clubId) {
    return next(ApiError.clubAccessDenied());
  }

  next();
};

/**
 * Force-inject the tenant's clubId into the request body.
 * Ensures ClubManagers can't spoof a different clubId in POST/PUT.
 *
 * SuperAdmins keep whatever clubId they send.
 */
const injectClubId = (req, res, next) => {
  if (req.userRole !== ROLES.SUPER_ADMIN && req.clubId) {
    req.body.clubId = req.clubId;
  }
  next();
};

module.exports = {
  attachTenant,
  requireClubAccess,
  injectClubId,
};
