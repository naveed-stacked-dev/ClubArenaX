const router = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { clubManagerOnly } = require('../middlewares/role.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');

// All upload routes require authentication
router.use(authenticate);

// Club images (clubManager or superAdmin)
router.post('/club-logo/:clubId', clubManagerOnly, handleUpload, uploadController.uploadClubLogo);
router.post('/club-banner/:clubId', clubManagerOnly, handleUpload, uploadController.uploadClubBanner);

// Team images
router.post('/team-logo/:teamId', clubManagerOnly, handleUpload, uploadController.uploadTeamLogo);

// Player images
router.post('/player-avatar/:playerId', clubManagerOnly, handleUpload, uploadController.uploadPlayerAvatar);

// General purpose upload
router.post('/general', clubManagerOnly, handleUpload, uploadController.uploadGeneral);

// Delete image
router.delete('/', clubManagerOnly, uploadController.deleteImage);

module.exports = router;
