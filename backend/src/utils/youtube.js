/**
 * YouTube URL validator and normalizer.
 * Accepts standard YouTube formats (watch, short, embed),
 * extracts the videoId, and normalizes to an embeddable URL.
 */

const YOUTUBE_PATTERNS = [
  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  // Short URL: https://youtu.be/VIDEO_ID
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  // Live URL: https://www.youtube.com/live/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

/**
 * Extract YouTube video ID from a URL string.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} The video ID, or null if not a valid YouTube URL.
 */
const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Validate and normalize a YouTube URL to embeddable format.
 * @param {string} url - The YouTube URL.
 * @returns {{ isValid: boolean, embedUrl: string|null, videoId: string|null }}
 */
const validateAndNormalizeYoutubeUrl = (url) => {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return { isValid: false, embedUrl: null, videoId: null };
  }

  return {
    isValid: true,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    videoId,
  };
};

module.exports = {
  extractVideoId,
  validateAndNormalizeYoutubeUrl,
};
