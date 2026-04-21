const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { validate } = require('../middlewares/validation.middleware');
const leagueValidators = require('../validators/league.validator');

// All admin routes require SuperAdmin role
router.use(authenticate, superAdminOnly);

router.get('/leagues', paginate, adminController.getAllLeagues);
router.post('/create-league', validate(leagueValidators.createLeagueSchema), adminController.createLeague);

// Specific admin assignments and resets
router.put('/league/:id/assign-manager', adminController.assignManager);
router.put('/league/:id/reset-password', adminController.resetLeaguePassword);

module.exports = router;
