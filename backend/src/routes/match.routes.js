const router = require('express').Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

const { validate } = require('../middlewares/validation.middleware');
const matchValidators = require('../validators/match.validator');

// Basic match CRUD
router.post('/', authenticate, clubManagerOnly, validate(matchValidators.createMatchSchema), matchController.create);
router.get('/', paginate, matchController.getAll);
router.get('/live/:leagueId', matchController.getLive);
router.get('/tournament/:tournamentId', paginate, matchController.getByTournament);
router.get('/:id', matchController.getById);
router.put('/:id', authenticate, clubManagerOnly, validate(matchValidators.updateMatchSchema), matchController.update);
router.delete('/:id', authenticate, clubManagerOnly, matchController.remove);

// Match management
router.put('/:id/schedule', authenticate, clubManagerOnly, validate(matchValidators.scheduleMatchSchema), matchController.schedule);
router.post('/:id/assign-manager', authenticate, clubManagerOnly, validate(matchValidators.assignManagerSchema), matchController.assignManager);
router.post('/:id/generate-token', authenticate, clubManagerOnly, matchController.generateToken);
router.get('/:id/scorer-link', authenticate, clubManagerOnly, matchController.getScorerLink);

// Streaming
router.put('/:id/stream-url', authenticate, clubManagerOnly, validate(matchValidators.streamUrlSchema), matchController.updateStreamUrl);
router.get('/:id/stream-url', matchController.getStreamUrl);

module.exports = router;
