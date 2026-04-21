const router = require('express').Router();
const teamController = require('../controllers/team.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

const { validate } = require('../middlewares/validation.middleware');
const teamValidators = require('../validators/team.validator');

router.post('/', authenticate, clubManagerOnly, validate(teamValidators.createTeamSchema), teamController.create);
router.get('/league/:leagueId', paginate, teamController.getByLeague);
router.get('/:id', teamController.getById);
router.put('/:id', authenticate, clubManagerOnly, validate(teamValidators.updateTeamSchema), teamController.update);
router.delete('/:id', authenticate, clubManagerOnly, teamController.remove);

// Team roster routes
router.post('/:id/add-player', authenticate, clubManagerOnly, validate(teamValidators.addPlayerSchema), teamController.addPlayer);
router.get('/:id/players', teamController.getPlayers);

module.exports = router;
