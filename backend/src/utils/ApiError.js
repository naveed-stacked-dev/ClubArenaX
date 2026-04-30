/**
 * Custom API Error class with UI-friendly error codes.
 *
 * Every error carries:
 *   - statusCode   (HTTP status)
 *   - message      (human-readable description for the UI)
 *   - errorCode    (machine-readable code the frontend can switch on)
 *   - errors       (optional array of field-level validation errors)
 *   - field        (optional — the single field that caused the error)
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'UNKNOWN_ERROR', errors = [], field = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.errors = errors;
    this.field = field;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  // ─── 400 Bad Request ───────────────────────────────────────────────
  static badRequest(message = 'Bad request', errorCode = 'BAD_REQUEST', errors = []) {
    return new ApiError(400, message, errorCode, errors);
  }

  static validationError(message = 'Validation failed', errors = []) {
    return new ApiError(400, message, 'VALIDATION_ERROR', errors);
  }

  static invalidField(field, message) {
    return new ApiError(400, message, 'INVALID_FIELD', [], field);
  }

  static missingField(field) {
    return new ApiError(400, `${field} is required`, 'MISSING_FIELD', [], field);
  }

  static invalidId(resource = 'Resource') {
    return new ApiError(400, `Invalid ${resource} ID format`, 'INVALID_ID');
  }

  static invalidQueryParam(param, message) {
    return new ApiError(400, message || `Invalid query parameter: ${param}`, 'INVALID_QUERY_PARAM', [], param);
  }

  // ─── 401 Unauthorized ─────────────────────────────────────────────
  static unauthorized(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, errorCode);
  }

  static invalidCredentials() {
    return new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  static tokenExpired() {
    return new ApiError(401, 'Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
  }

  static tokenInvalid() {
    return new ApiError(401, 'Invalid authentication token', 'TOKEN_INVALID');
  }

  static tokenRequired() {
    return new ApiError(401, 'Access token is required', 'TOKEN_REQUIRED');
  }

  static refreshTokenInvalid() {
    return new ApiError(401, 'Invalid or expired refresh token. Please log in again.', 'REFRESH_TOKEN_INVALID');
  }

  // ─── 403 Forbidden ────────────────────────────────────────────────
  static forbidden(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, errorCode);
  }

  static insufficientRole(requiredRoles = []) {
    const roles = requiredRoles.join(' or ');
    return new ApiError(
      403,
      `Access denied. This action requires ${roles} privileges.`,
      'INSUFFICIENT_ROLE'
    );
  }

  static clubAccessDenied() {
    return new ApiError(403, 'You do not have access to this club', 'CLUB_ACCESS_DENIED');
  }

  static matchAccessDenied() {
    return new ApiError(403, 'You do not have permission to score this match', 'MATCH_ACCESS_DENIED');
  }

  // ─── 404 Not Found ────────────────────────────────────────────────
  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static clubNotFound() {
    return new ApiError(404, 'Club not found', 'CLUB_NOT_FOUND');
  }

  static teamNotFound() {
    return new ApiError(404, 'Team not found', 'TEAM_NOT_FOUND');
  }

  static playerNotFound() {
    return new ApiError(404, 'Player not found', 'PLAYER_NOT_FOUND');
  }

  static matchNotFound() {
    return new ApiError(404, 'Match not found', 'MATCH_NOT_FOUND');
  }

  static tournamentNotFound() {
    return new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  static userNotFound() {
    return new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
  }

  static summaryNotFound() {
    return new ApiError(404, 'Match summary not found', 'SUMMARY_NOT_FOUND');
  }

  // ─── 409 Conflict ─────────────────────────────────────────────────
  static conflict(message = 'Resource already exists', errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }

  static duplicateEmail() {
    return new ApiError(409, 'An account with this email already exists', 'DUPLICATE_EMAIL');
  }

  static duplicateSlug() {
    return new ApiError(409, 'A club with this URL slug already exists', 'DUPLICATE_SLUG');
  }

  static duplicateTeamName() {
    return new ApiError(409, 'A team with this name already exists in the club', 'DUPLICATE_TEAM_NAME');
  }

  static matchAlreadyLive() {
    return new ApiError(409, 'This match is already in progress', 'MATCH_ALREADY_LIVE');
  }

  static matchAlreadyCompleted() {
    return new ApiError(409, 'This match has already been completed', 'MATCH_ALREADY_COMPLETED');
  }

  static matchNotLive() {
    return new ApiError(409, 'This match is not currently live', 'MATCH_NOT_LIVE');
  }

  static fixturesAlreadyGenerated() {
    return new ApiError(409, 'Fixtures have already been generated for this tournament', 'FIXTURES_ALREADY_GENERATED');
  }

  static alreadyInSecondInnings() {
    return new ApiError(409, 'The match is already in the second innings', 'ALREADY_SECOND_INNINGS');
  }

  static playerAlreadyInTeam() {
    return new ApiError(409, 'This player is already in the team', 'PLAYER_ALREADY_IN_TEAM');
  }

  // ─── 422 Unprocessable ────────────────────────────────────────────
  static unprocessable(message = 'Unable to process the request', errorCode = 'UNPROCESSABLE') {
    return new ApiError(422, message, errorCode);
  }

  static insufficientTeams(minTeams = 2) {
    return new ApiError(422, `At least ${minTeams} teams are required`, 'INSUFFICIENT_TEAMS');
  }

  static noEventsToUndo() {
    return new ApiError(422, 'There are no scoring events to undo', 'NO_EVENTS_TO_UNDO');
  }

  static invalidYoutubeUrl() {
    return new ApiError(422, 'Please provide a valid YouTube URL', 'INVALID_YOUTUBE_URL');
  }

  static teamsFull(max) {
    return new ApiError(422, `This club already has the maximum number of teams (${max})`, 'TEAMS_FULL');
  }

  static rosterFull(max) {
    return new ApiError(422, `This team already has the maximum number of players (${max})`, 'ROSTER_FULL');
  }

  // ─── 429 Too Many Requests ────────────────────────────────────────
  static tooManyRequests() {
    return new ApiError(429, 'Too many requests. Please try again later.', 'RATE_LIMIT_EXCEEDED');
  }

  // ─── 500 Internal ─────────────────────────────────────────────────
  static internal(message = 'An unexpected error occurred. Please try again later.') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;
