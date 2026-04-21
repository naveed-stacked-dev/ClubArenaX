const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { superAdminOnly, clubManagerOnly } = require('../middlewares/role.middleware');

const { validate } = require('../middlewares/validation.middleware');
const authValidators = require('../validators/auth.validator');

// ─── SuperAdmin ───
router.post('/superadmin/register', validate(authValidators.registerSuperAdminSchema), authController.registerSuperAdmin);
router.post('/superadmin/login', validate(authValidators.loginSchema), authController.loginSuperAdmin);

// ─── ClubManager ───
router.post('/club-manager/register', authenticate, superAdminOnly, validate(authValidators.registerClubManagerSchema), authController.registerClubManager);
router.post('/club-manager/login', validate(authValidators.loginSchema), authController.loginClubManager);
router.post('/club-manager/reset-password', authenticate, superAdminOnly, validate(authValidators.resetPasswordSchema), authController.resetClubManagerPassword);

// ─── MatchManager ───
router.post('/match-manager/create', authenticate, clubManagerOnly, validate(authValidators.createMatchManagerSchema), authController.createMatchManager);
router.post('/match-manager/login', validate(authValidators.loginSchema), authController.loginMatchManager);
router.post('/match-manager/token-login', validate(authValidators.tokenLoginSchema), authController.loginMatchManagerByToken);

// ─── User (Public) ───
router.post('/user/register', validate(authValidators.registerUserSchema), authController.registerUser);
router.post('/user/login', validate(authValidators.loginSchema), authController.loginUser);

// ─── Common ───
router.post('/refresh-token', validate(authValidators.refreshTokenSchema), authController.refreshToken);
router.post('/change-password', authenticate, validate(authValidators.changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
