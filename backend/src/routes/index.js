const router = require('express').Router();

const authRoutes = require('./auth.routes');
const leagueRoutes = require('./league.routes');
const teamRoutes = require('./team.routes');
const playerRoutes = require('./player.routes');
const tournamentRoutes = require('./tournament.routes');
const matchRoutes = require('./match.routes');
const scoringRoutes = require('./scoring.routes');
const analyticsRoutes = require('./analytics.routes');

// New Routes
const adminRoutes = require('./admin.routes');
const publicRoutes = require('./public.routes');
const settingsRoutes = require('./settings.routes');
const pointsTableRoutes = require('./pointsTable.routes');

router.use('/auth', authRoutes);
router.use('/leagues', leagueRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/matches', matchRoutes);
router.use('/scoring', scoringRoutes);
router.use('/analytics', analyticsRoutes);

// Mount new routes
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/settings', settingsRoutes);
router.use('/points-table', pointsTableRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cricket League API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
