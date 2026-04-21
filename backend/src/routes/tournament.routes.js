const router = require('express').Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

router.post('/', authenticate, clubManagerOnly, tournamentController.create);
router.get('/league/:leagueId', paginate, tournamentController.getByLeague);
router.get('/:id', tournamentController.getById);
router.put('/:id', authenticate, clubManagerOnly, tournamentController.update);
router.post('/:id/generate-fixtures', authenticate, clubManagerOnly, tournamentController.generateFixtures);
router.get('/:id/points-table', tournamentController.getPointsTable);

module.exports = router;
