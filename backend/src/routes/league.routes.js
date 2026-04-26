const router = require('express').Router();
const leagueController = require('../controllers/league.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly, clubManagerOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { handleMultipart, parseFormDataJson } = require('../middlewares/multipart.middleware');

const { validate } = require('../middlewares/validation.middleware');
const leagueValidators = require('../validators/league.validator');

router.post('/', authenticate, superAdminOnly, handleMultipart, parseFormDataJson, validate(leagueValidators.createLeagueSchema), leagueController.create);
router.get('/', paginate, leagueController.getAll);
router.get('/slug/:slug', leagueController.getBySlug);
router.get('/:id', leagueController.getById);
router.put('/:id', authenticate, clubManagerOnly, handleMultipart, parseFormDataJson, validate(leagueValidators.updateLeagueSchema), leagueController.update);
router.put('/:id/theme', authenticate, clubManagerOnly, validate(leagueValidators.updateThemeSchema), leagueController.updateTheme);
router.put('/:id/settings', authenticate, clubManagerOnly, validate(leagueValidators.updateSettingsSchema), leagueController.updateSettings);
router.put('/:id/logo', authenticate, clubManagerOnly, validate(leagueValidators.updateLogoSchema), leagueController.updateLogo);
router.delete('/:id', authenticate, superAdminOnly, leagueController.remove);

module.exports = router;
