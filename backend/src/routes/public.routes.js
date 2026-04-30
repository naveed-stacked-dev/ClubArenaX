const router = require('express').Router();
const publicController = require('../controllers/public.controller');
const { paginate } = require('../middlewares/pagination.middleware');

// Public endpoints that don't require authentication, allowing the frontend visitor view
router.get('/clubs', paginate, publicController.getClubs);
router.get('/club/slug/:slug', publicController.getClubBySlug);
router.get('/live-matches/:clubId', publicController.getLiveMatches);
router.get('/match/:matchId/summary', publicController.getMatchSummary);
router.get('/match/:matchId/scorecard', publicController.getMatchScorecard);
router.get('/leaderboard/:clubId', paginate, publicController.getClubLeaderboard);
router.get('/points-table/:tournamentId', publicController.getPointsTable);

module.exports = router;
