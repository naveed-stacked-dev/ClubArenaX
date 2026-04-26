const router = require('express').Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { attachTenant, injectLeagueId } = require('../middlewares/tenant.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

const { validate } = require('../middlewares/validation.middleware');
const matchValidators = require('../validators/match.validator');

// Basic match CRUD
router.post('/', authenticate, clubManagerOnly, attachTenant, injectLeagueId, validate(matchValidators.createMatchSchema), matchController.create);
router.get('/', authenticate, attachTenant, paginate, matchController.getAll);
router.get('/live/:leagueId', matchController.getLive);
router.get('/tournament/:tournamentId', paginate, matchController.getByTournament);
router.get('/:id', matchController.getById);
router.put('/:id', authenticate, clubManagerOnly, attachTenant, validate(matchValidators.updateMatchSchema), matchController.update);
router.delete('/:id', authenticate, clubManagerOnly, attachTenant, matchController.remove);

// Match management
router.put('/:id/schedule', authenticate, clubManagerOnly, attachTenant, validate(matchValidators.scheduleMatchSchema), matchController.schedule);
router.post('/:id/assign-manager', authenticate, clubManagerOnly, attachTenant, validate(matchValidators.assignManagerSchema), matchController.assignManager);
router.post('/:id/generate-token', authenticate, clubManagerOnly, attachTenant, matchController.generateToken);
router.get('/:id/scorer-link', authenticate, clubManagerOnly, attachTenant, matchController.getScorerLink);

// Streaming
router.put('/:id/stream-url', authenticate, clubManagerOnly, attachTenant, validate(matchValidators.streamUrlSchema), matchController.updateStreamUrl);
router.get('/:id/stream-url', matchController.getStreamUrl);

module.exports = router;

