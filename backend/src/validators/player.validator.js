const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('{{#label}} must be a valid ID');

const createPlayerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'Player name is required' }),
  role: Joi.string().valid('batsman', 'bowler', 'allrounder', 'wicketkeeper').required()
    .messages({ 'any.required': 'Player role is required', 'any.only': 'Role must be batsman, bowler, allrounder, or wicketkeeper' }),
  teamId: objectId.required()
    .messages({ 'any.required': 'Team ID is required' }),
  leagueId: objectId.required()
    .messages({ 'any.required': 'League ID is required' }),
  avatar: Joi.string().uri().allow(null, '').optional(),
  battingStyle: Joi.string().valid('right-hand', 'left-hand').default('right-hand'),
  bowlingStyle: Joi.string().allow(null, '').optional(),
});

const updatePlayerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  role: Joi.string().valid('batsman', 'bowler', 'allrounder', 'wicketkeeper').optional(),
  avatar: Joi.string().uri().allow(null, '').optional(),
  battingStyle: Joi.string().valid('right-hand', 'left-hand').optional(),
  bowlingStyle: Joi.string().allow(null, '').optional(),
  teamId: objectId.optional(),
}).min(1).messages({ 'object.min': 'At least one field must be provided to update' });

module.exports = {
  createPlayerSchema,
  updatePlayerSchema,
};
