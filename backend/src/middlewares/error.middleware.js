const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Global error handling middleware.
 * Catches all errors and sends a consistent, UI-friendly JSON response.
 *
 * Response shape:
 * {
 *   success: false,
 *   message: "Human-readable error message for UI",
 *   errorCode: "MACHINE_READABLE_CODE",
 *   errors: [...],     // field-level validation errors (if any)
 *   field: "fieldName", // single field that caused the error (if applicable)
 *   stack: "..."       // only in development
 * }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ─── Mongoose Validation Error ─────────────────────────────────
  if (err.name === 'ValidationError') {
    const fieldErrors = Object.entries(err.errors).map(([field, val]) => ({
      field,
      message: val.message,
      value: val.value,
    }));
    error = ApiError.validationError(
      'Please fix the following errors and try again',
      fieldErrors
    );
  }

  // ─── Mongoose Duplicate Key Error ──────────────────────────────
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);
    const field = fields[0];
    const friendlyNames = {
      email: 'email address',
      slug: 'URL slug',
      name: 'name',
      token: 'token',
    };
    const fieldName = friendlyNames[field] || field;
    error = new ApiError(
      409,
      `This ${fieldName} is already in use. Please choose a different one.`,
      'DUPLICATE_VALUE',
      [],
      field
    );
  }

  // ─── Mongoose Cast Error (bad ObjectId) ────────────────────────
  if (err.name === 'CastError') {
    const friendlyPaths = {
      _id: 'ID',
      clubId: 'club ID',
      teamId: 'team ID',
      playerId: 'player ID',
      matchId: 'match ID',
      tournamentId: 'tournament ID',
    };
    const pathName = friendlyPaths[err.path] || err.path;
    error = new ApiError(
      400,
      `Invalid ${pathName} format. Please check and try again.`,
      'INVALID_ID',
      [],
      err.path
    );
  }

  // ─── JWT Errors ────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.tokenInvalid();
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.tokenExpired();
  }

  // ─── Joi Validation Passthrough ────────────────────────────────
  // (already an ApiError from the validation middleware)

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 && config.nodeEnv === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : error.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    errorCode: error.errorCode || 'INTERNAL_ERROR',
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(error.field && { field: error.field }),
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  };

  // Log server-side
  if (statusCode >= 500) {
    console.error(`[CRITICAL] ${statusCode} - ${message}`);
    console.error(error.stack);
  } else if (config.nodeEnv === 'development') {
    console.error(`[ERROR] ${statusCode} ${error.errorCode} - ${message}`);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
