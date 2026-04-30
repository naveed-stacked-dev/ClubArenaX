const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly } = require('../middlewares/role.middleware');
const { paginate } = require('../middlewares/pagination.middleware');
const { validate } = require('../middlewares/validation.middleware');
const clubValidators = require('../validators/club.validator');

// All admin routes require SuperAdmin role
router.use(authenticate, superAdminOnly);

router.get('/clubs', paginate, adminController.getAllClubs);
router.post('/create-club', validate(clubValidators.createClubSchema), adminController.createClub);

// Specific admin assignments and resets
router.post('/club/:id/manager', adminController.createClubManager);
router.put('/club/:id/manager/:managerId', adminController.updateClubManager);
router.put('/club/:id/reset-password', adminController.resetClubPassword);

module.exports = router;
