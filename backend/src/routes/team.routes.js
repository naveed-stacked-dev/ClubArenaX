const router = require('express').Router();
const teamController = require('../controllers/team.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { attachTenant, requireLeagueAccess, injectLeagueId } = require('../middlewares/tenant.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { handleMultipart, parseFormDataJson } = require('../middlewares/multipart.middleware');

const { validate } = require('../middlewares/validation.middleware');
const teamValidators = require('../validators/team.validator');

router.post('/', authenticate, clubManagerOnly, attachTenant, injectLeagueId, handleMultipart, parseFormDataJson, validate(teamValidators.createTeamSchema), teamController.create);
router.get('/league/:leagueId', authenticate, attachTenant, requireLeagueAccess, paginate, teamController.getByLeague);
router.get('/:id', teamController.getById);
router.put('/:id', authenticate, clubManagerOnly, attachTenant, handleMultipart, parseFormDataJson, validate(teamValidators.updateTeamSchema), teamController.update);
router.delete('/:id', authenticate, clubManagerOnly, attachTenant, teamController.remove);

// Team roster routes
router.post('/:id/add-player', authenticate, clubManagerOnly, attachTenant, validate(teamValidators.addPlayerSchema), teamController.addPlayer);
router.get('/:id/players', teamController.getPlayers);

module.exports = router;

