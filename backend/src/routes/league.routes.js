const router = require('express').Router();
const leagueController = require('../controllers/league.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');

const { validate } = require('../middlewares/validation.middleware');
const leagueValidators = require('../validators/league.validator');

router.post('/', authenticate, superAdminOnly, validate(leagueValidators.createLeagueSchema), leagueController.create);
router.get('/', paginate, leagueController.getAll);
router.get('/slug/:slug', leagueController.getBySlug);
router.get('/:id', leagueController.getById);
router.put('/:id', authenticate, superAdminOnly, validate(leagueValidators.updateLeagueSchema), leagueController.update);
router.put('/:id/theme', authenticate, superAdminOnly, validate(leagueValidators.updateThemeSchema), leagueController.updateTheme);
router.put('/:id/settings', authenticate, superAdminOnly, validate(leagueValidators.updateSettingsSchema), leagueController.updateSettings);
router.put('/:id/logo', authenticate, superAdminOnly, validate(leagueValidators.updateLogoSchema), leagueController.updateLogo);
router.delete('/:id', authenticate, superAdminOnly, leagueController.remove);

module.exports = router;
