const multer = require('multer');
const { ALLOWED_TYPES, MAX_FILE_SIZE } = require('../services/s3Service');

/**
 * Multer configuration for memory storage.
 * Files are stored in memory as Buffer, then uploaded to S3 by the controller.
 */
const storage = multer.memoryStorage();

/**
 * File filter for image uploads only.
 */
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
  }
};

/**
 * Multer instance for single image uploads.
 */
const uploadSingle = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');

/**
 * Express middleware wrapper with error handling.
 */
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          errorCode: 'FILE_TOO_LARGE',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
        errorCode: 'UPLOAD_ERROR',
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        errorCode: 'UPLOAD_ERROR',
      });
    }
    next();
  });
};

module.exports = { handleUpload };
