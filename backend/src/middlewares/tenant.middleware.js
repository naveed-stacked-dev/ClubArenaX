const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Attach tenant (leagueId) context to the request based on the user's role.
 * 
 * - SuperAdmin:  req.leagueId = null (unrestricted access to all leagues)
 * - ClubManager: req.leagueId = user.leagueId (enforced single-league access)
 * - MatchManager: req.leagueId = user.leagueId (scoped to their league)
 *
 * Must be used AFTER authenticate middleware.
 */
const attachTenant = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  switch (req.userRole) {
    case ROLES.SUPER_ADMIN:
      // SuperAdmin has global access — leagueId stays null unless explicitly set
      req.leagueId = req.query.leagueId || req.body.leagueId || null;
      break;

    case ROLES.CLUB_MANAGER:
      // ClubManager is always scoped to their assigned league
      req.leagueId = req.user.leagueId?.toString() || null;
      if (!req.leagueId) {
        return next(ApiError.forbidden('Your account is not assigned to any league'));
      }
      break;

    case ROLES.MATCH_MANAGER:
      // MatchManager is scoped to their assigned league
      req.leagueId = req.user.leagueId?.toString() || null;
      break;

    default:
      req.leagueId = null;
  }

  next();
};

/**
 * Enforce that the requested leagueId (from URL params or body) matches
 * the tenant's scoped leagueId.
 *
 * SuperAdmins pass through freely.
 * ClubManagers/MatchManagers get 403 if they try to access a different league.
 *
 * Checks: req.params.leagueId, req.body.leagueId
 */
const requireLeagueAccess = (req, res, next) => {
  // SuperAdmin can access any league
  if (req.userRole === ROLES.SUPER_ADMIN) {
    return next();
  }

  // For scoped roles, verify the requested league matches their tenant
  const requestedLeagueId =
    req.params.leagueId || req.body.leagueId || req.query.leagueId;

  if (requestedLeagueId && req.leagueId && requestedLeagueId !== req.leagueId) {
    return next(ApiError.leagueAccessDenied());
  }

  next();
};

/**
 * Force-inject the tenant's leagueId into the request body.
 * Ensures ClubManagers can't spoof a different leagueId in POST/PUT.
 *
 * SuperAdmins keep whatever leagueId they send.
 */
const injectLeagueId = (req, res, next) => {
  if (req.userRole !== ROLES.SUPER_ADMIN && req.leagueId) {
    req.body.leagueId = req.leagueId;
  }
  next();
};

module.exports = {
  attachTenant,
  requireLeagueAccess,
  injectLeagueId,
};
