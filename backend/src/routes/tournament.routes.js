const router = require('express').Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly, superAdminOnly } = require('../middlewares/role.middleware');
const { attachTenant, requireClubAccess, injectClubId } = require('../middlewares/tenant.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

router.get('/', authenticate, superAdminOnly, paginate, tournamentController.getAll);
router.post('/', authenticate, clubManagerOnly, attachTenant, injectClubId, tournamentController.create);
router.get('/club/:clubId', authenticate, attachTenant, requireClubAccess, paginate, tournamentController.getByClub);
router.get('/:id', tournamentController.getById);
router.put('/:id', authenticate, clubManagerOnly, attachTenant, tournamentController.update);
router.post('/:id/generate-fixtures', authenticate, clubManagerOnly, attachTenant, tournamentController.generateFixtures);
router.get('/:id/points-table', tournamentController.getPointsTable);

// Bracket endpoints
router.get('/:id/bracket', authenticate, attachTenant, tournamentController.getBracket);
router.put('/:id/matches/:matchId/result', authenticate, clubManagerOnly, attachTenant, tournamentController.submitResult);

module.exports = router;
