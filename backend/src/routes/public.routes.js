const router = require('express').Router();
const publicController = require('../controllers/public.controller');
const { paginate } = require('../middlewares/pagination.middleware');

// Public endpoints that don't require authentication, allowing the frontend visitor view
router.get('/leagues', paginate, publicController.getLeagues);
router.get('/league/slug/:slug', publicController.getLeagueBySlug);
router.get('/live-matches/:leagueId', publicController.getLiveMatches);
router.get('/match/:matchId/summary', publicController.getMatchSummary);
router.get('/match/:matchId/scorecard', publicController.getMatchScorecard);
router.get('/leaderboard/:leagueId', paginate, publicController.getLeagueLeaderboard);
router.get('/points-table/:tournamentId', publicController.getPointsTable);

module.exports = router;
