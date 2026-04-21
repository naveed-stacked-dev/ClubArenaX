const router = require('express').Router();
const leagueController = require('../controllers/league.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const leagueValidators = require('../validators/league.validator');

// These hit the same functions that exist in the league controller
router.put('/league/:id', authenticate, superAdminOnly, validate(leagueValidators.updateSettingsSchema), leagueController.updateSettings);

// And we can have a basic GET /settings/league/:id
router.get('/league/:id', leagueController.getById); // Assuming frontend extracts .settings

module.exports = router;
