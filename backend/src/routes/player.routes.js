const router = require('express').Router();
const playerController = require('../controllers/player.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { attachTenant, requireClubAccess, injectClubId } = require('../middlewares/tenant.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { handleMultipart, parseFormDataJson } = require('../middlewares/multipart.middleware');

const { validate } = require('../middlewares/validation.middleware');
const playerValidators = require('../validators/player.validator');

router.post('/', authenticate, clubManagerOnly, attachTenant, injectClubId, handleMultipart, parseFormDataJson, validate(playerValidators.createPlayerSchema), playerController.create);
router.get('/club/:clubId', authenticate, attachTenant, requireClubAccess, paginate, playerController.getByClub);
router.get('/team/:teamId', playerController.getByTeam);
router.get('/:id', playerController.getById);
router.put('/:id', authenticate, clubManagerOnly, attachTenant, handleMultipart, parseFormDataJson, validate(playerValidators.updatePlayerSchema), playerController.update);
router.delete('/:id', authenticate, clubManagerOnly, attachTenant, playerController.remove);

// Player stats & recent form
router.get('/:id/stats', playerController.getStats);
router.get('/:id/recent-matches', playerController.getRecentMatches);

module.exports = router;

