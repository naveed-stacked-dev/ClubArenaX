const router = require('express').Router();
const clubController = require('../controllers/club.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly, clubManagerOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { handleMultipart, parseFormDataJson } = require('../middlewares/multipart.middleware');

const { validate } = require('../middlewares/validation.middleware');
const clubValidators = require('../validators/club.validator');

router.post('/', authenticate, superAdminOnly, handleMultipart, parseFormDataJson, validate(clubValidators.createClubSchema), clubController.create);
router.get('/', paginate, clubController.getAll);
router.get('/slug/:slug', clubController.getBySlug);
router.get('/:id', clubController.getById);
router.put('/:id', authenticate, clubManagerOnly, handleMultipart, parseFormDataJson, validate(clubValidators.updateClubSchema), clubController.update);
router.put('/:id/theme', authenticate, clubManagerOnly, validate(clubValidators.updateThemeSchema), clubController.updateTheme);
router.put('/:id/settings', authenticate, clubManagerOnly, validate(clubValidators.updateSettingsSchema), clubController.updateSettings);
router.put('/:id/logo', authenticate, clubManagerOnly, validate(clubValidators.updateLogoSchema), clubController.updateLogo);
router.delete('/:id', authenticate, superAdminOnly, clubController.remove);

module.exports = router;
