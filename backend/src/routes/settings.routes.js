const router = require('express').Router();
const clubController = require('../controllers/club.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const clubValidators = require('../validators/club.validator');

// These hit the same functions that exist in the club controller
router.put('/club/:id', authenticate, superAdminOnly, validate(clubValidators.updateSettingsSchema), clubController.updateSettings);

// And we can have a basic GET /settings/club/:id
router.get('/club/:id', clubController.getById); // Assuming frontend extracts .settings

module.exports = router;
