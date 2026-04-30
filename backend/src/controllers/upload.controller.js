const { uploadToS3, generateKey, validateImageFile, extractKeyFromUrl, deleteFromS3 } = require('../services/s3Service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Upload a club logo image.
 * Expects: req.file (from multer), req.body.clubId or req.params.clubId
 */
const uploadClubLogo = async (req, res, next) => {
  try {
    const file = req.file;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.error, 'INVALID_FILE');
    }

    const clubId = req.params.clubId || req.body.clubId;
    if (!clubId) throw ApiError.badRequest('Club ID is required');

    const key = generateKey(`clubs/${clubId}/logo`, file.originalname);
    const imageUrl = await uploadToS3(file.buffer, key, file.mimetype);

    res.json(ApiResponse.ok({ imageUrl }, 'Logo uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a club banner image.
 */
const uploadClubBanner = async (req, res, next) => {
  try {
    const file = req.file;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.error, 'INVALID_FILE');
    }

    const clubId = req.params.clubId || req.body.clubId;
    if (!clubId) throw ApiError.badRequest('Club ID is required');

    const key = generateKey(`clubs/${clubId}/banner`, file.originalname);
    const imageUrl = await uploadToS3(file.buffer, key, file.mimetype);

    res.json(ApiResponse.ok({ imageUrl }, 'Banner uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a player avatar image.
 */
const uploadPlayerAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.error, 'INVALID_FILE');
    }

    const playerId = req.params.playerId || req.body.playerId;
    if (!playerId) throw ApiError.badRequest('Player ID is required');

    const key = generateKey(`players/${playerId}/avatar`, file.originalname);
    const imageUrl = await uploadToS3(file.buffer, key, file.mimetype);

    res.json(ApiResponse.ok({ imageUrl }, 'Avatar uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a team logo image.
 */
const uploadTeamLogo = async (req, res, next) => {
  try {
    const file = req.file;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.error, 'INVALID_FILE');
    }

    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) throw ApiError.badRequest('Team ID is required');

    const key = generateKey(`teams/${teamId}/logo`, file.originalname);
    const imageUrl = await uploadToS3(file.buffer, key, file.mimetype);

    res.json(ApiResponse.ok({ imageUrl }, 'Team logo uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * General-purpose image upload.
 * Body can include a `folder` field to specify the S3 subfolder.
 */
const uploadGeneral = async (req, res, next) => {
  try {
    const file = req.file;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.error, 'INVALID_FILE');
    }

    const folder = req.body.folder || 'general';
    const key = generateKey(folder, file.originalname);
    const imageUrl = await uploadToS3(file.buffer, key, file.mimetype);

    res.json(ApiResponse.ok({ imageUrl }, 'Image uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an image from S3 by its URL.
 */
const deleteImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) throw ApiError.badRequest('Image URL is required');

    const key = extractKeyFromUrl(imageUrl);
    if (!key) throw ApiError.badRequest('Invalid image URL');

    await deleteFromS3(key);
    res.json(ApiResponse.ok(null, 'Image deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadClubLogo,
  uploadClubBanner,
  uploadPlayerAvatar,
  uploadTeamLogo,
  uploadGeneral,
  deleteImage,
};
