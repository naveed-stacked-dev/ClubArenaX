/**
 * Pagination middleware.
 * Reads `page` and `limit` from query params, attaches parsed values to req.pagination.
 */
const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Enhanced search and sort from query
  const search = req.query.search ? req.query.search.trim() : '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  req.pagination = { page, limit, skip, search, sortBy, sortOrder };
  next();
};

/**
 * Helper to build a pagination response object.
 * @param {number} total - Total documents matching the query.
 * @param {object} pagination - The req.pagination object.
 * @returns {{ currentPage, totalPages, totalItems, limit, hasNextPage, hasPrevPage }}
 */
const buildPaginationResponse = (total, { page, limit }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { paginate, buildPaginationResponse };
