const router = require('express').Router();
const tournamentController = require('../controllers/tournament.controller');

// Since points-table logic is in tournamentService, we just need the route map
router.get('/:tournamentId', async (req, res, next) => {
  // Let's create a quick wrapper or just use a generic call. It might be better to point it directly
  // to tournamentController if we add getPointsTable there.
  // Wait, I saw getPointsTable in public.controller.js. 
  // We can just use the public controller or create a specific points table wrapper here.
  const publicController = require('../controllers/public.controller');
  return publicController.getPointsTable(req, res, next);
});

module.exports = router;
