const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config/env');
const crypto = require('crypto');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const BUCKET = config.aws.s3Bucket;

/**
 * Generate a unique file key for S3.
 * @param {string} folder - The folder path, e.g. 'clubs/123/logo'
 * @param {string} originalName - Original filename
 * @returns {string} S3 key
 */
const generateKey = (folder, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${folder}/${timestamp}-${hash}${ext}`;
};

/**
 * Upload a file buffer to S3.
 * @param {Buffer} fileBuffer - File data
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `https://${BUCKET}.s3.${config.aws.region}.amazonaws.com/${key}`;
};

/**
 * Delete an object from S3 by key.
 * @param {string} key - S3 object key
 */
const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
};

/**
 * Extract the S3 key from a full S3 URL.
 * @param {string} url - Full S3 URL
 * @returns {string|null} S3 key
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading '/'
  } catch {
    return null;
  }
};

/**
 * Generate a signed URL for temporary access to a private object.
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL validity in seconds (default 3600)
 * @returns {Promise<string>} Signed URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Allowed image MIME types and file extensions.
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate an image file.
 * @param {object} file - Multer file object
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No file provided' };
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }
  return { valid: true, error: null };
};

module.exports = {
  s3Client,
  uploadToS3,
  deleteFromS3,
  extractKeyFromUrl,
  getPresignedUrl,
  generateKey,
  validateImageFile,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
};
