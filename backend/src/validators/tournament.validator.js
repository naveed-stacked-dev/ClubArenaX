const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('{{#label}} must be a valid ID');

const createTournamentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'Tournament name is required' }),
  type: Joi.string().valid('league', 'knockout').required()
    .messages({ 'any.required': 'Tournament type is required', 'any.only': 'Type must be league or knockout' }),
  teams: Joi.array().items(objectId).min(2).required()
    .messages({ 'any.required': 'Teams are required', 'array.min': 'At least 2 teams are required' }),
  leagueId: objectId.required()
    .messages({ 'any.required': 'League ID is required' }),
  season: Joi.string().trim().max(50).allow(null, '').optional(),
  oversPerInning: Joi.number().integer().min(1).max(50).default(20)
    .messages({ 'number.min': 'Overs per inning must be at least 1' }),
});

const updateTournamentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  season: Joi.string().trim().max(50).allow(null, '').optional(),
  oversPerInning: Joi.number().integer().min(1).max(50).optional(),
  status: Joi.string().valid('draft', 'active', 'completed').optional(),
}).min(1).messages({ 'object.min': 'At least one field must be provided to update' });

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,
};
