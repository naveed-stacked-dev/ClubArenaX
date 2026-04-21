const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 *
 * Usage in routes:
 *   const { validate } = require('../middlewares/validation.middleware');
 *   const { createLeagueSchema } = require('../validators/league.validator');
 *   router.post('/', validate(createLeagueSchema), controller.create);
 *
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against.
 * @param {'body'|'query'|'params'} source - Where to find the data (default: 'body').
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,       // collect ALL errors, not just the first
      allowUnknown: false,     // reject unknown fields
      stripUnknown: true,      // silently strip unknown fields from result
    });

    if (error) {
      const fieldErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        type: detail.type,
      }));

      return next(
        ApiError.validationError(
          'Please fix the highlighted errors and try again',
          fieldErrors
        )
      );
    }

    // Replace source data with sanitized/casted values
    req[source] = value;
    next();
  };
};

/**
 * Validate query params.
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL params.
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = { validate, validateQuery, validateParams };
