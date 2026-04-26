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
 * Global multer instance for parsing any multipart/form-data request that might contain files.
 */
const uploadMiddleware = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).any(); // Accept any fields. We will access req.files as an array

/**
 * Express middleware wrapper with error handling for multer.
 */
const handleMultipart = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
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

/**
 * Middleware to parse stringified JSON fields from FormData.
 * FormData sends all fields as strings. If a field looks like JSON (e.g. object or array), parse it.
 */
const parseFormDataJson = (req, res, next) => {
  if (!req.body) return next();

  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      try {
        // Only try to parse if it looks like a JSON object or array
        const value = req.body[key].trim();
        if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
          req.body[key] = JSON.parse(value);
        }
      } catch (e) {
        // If it fails to parse, leave it as a string
      }
    }
  }
  next();
};

module.exports = {
  handleMultipart,
  parseFormDataJson,
};
