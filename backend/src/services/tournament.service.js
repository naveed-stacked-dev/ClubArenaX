const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const ApiError = require('../utils/ApiError');

/**
 * Create a new tournament.
 */
const createTournament = async (data) => {
  const tournament = await Tournament.create(data);
  return tournament;
};

/**
 * Get tournaments in a league with pagination.
 */
const getTournamentsByLeague = async (leagueId, { skip, limit }) => {
  const [tournaments, total] = await Promise.all([
    Tournament.find({ leagueId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('teams', 'name logo'),
    Tournament.countDocuments({ leagueId }),
  ]);
  return { tournaments, total };
};

/**
 * Get tournament by ID.
 */
const getTournamentById = async (id) => {
  const tournament = await Tournament.findById(id)
    .populate('teams', 'name logo')
    .populate({
      path: 'matches',
      populate: [
        { path: 'teamA', select: 'name logo' },
        { path: 'teamB', select: 'name logo' },
      ],
    });
  if (!tournament) throw ApiError.notFound('Tournament not found');
  return tournament;
};

/**
 * Generate round-robin fixtures for a league-format tournament.
 * Uses the standard round-robin algorithm: fix one team, rotate the rest.
 * Only creates team pairings with status "unscheduled".
 */
const generateLeagueFixtures = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId).populate('teams');
  if (!tournament) throw ApiError.notFound('Tournament not found');
  if (tournament.matches.length > 0) {
    throw ApiError.conflict('Fixtures have already been generated');
  }

  const teams = [...tournament.teams];
  const numTeams = teams.length;

  if (numTeams < 2) {
    throw ApiError.badRequest('Need at least 2 teams to generate fixtures');
  }

  // If odd number of teams, add a "bye" placeholder
  const hasBye = numTeams % 2 !== 0;
  if (hasBye) teams.push(null);

  const totalTeams = teams.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  const fixtures = [];
  let matchNumber = 1;

  // Round-robin scheduling algorithm
  const teamIndices = teams.map((_, i) => i);

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = teamIndices[match];
      const away = teamIndices[totalTeams - 1 - match];

      // Skip matches involving the bye
      if (teams[home] && teams[away]) {
        fixtures.push({
          teamA: teams[home]._id,
          teamB: teams[away]._id,
          tournamentId: tournament._id,
          leagueId: tournament.leagueId,
          status: 'unscheduled',
          matchNumber: matchNumber++,
          round: round + 1,
          oversPerInning: tournament.oversPerInning,
        });
      }
    }

    // Rotate: fix first element, rotate rest
    const last = teamIndices.pop();
    teamIndices.splice(1, 0, last);
  }

  const createdMatches = await Match.insertMany(fixtures);
  const matchIds = createdMatches.map((m) => m._id);

  // Initialize points table
  const pointsTable = tournament.teams.map((team) => ({
    teamId: team._id,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    nrr: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
  }));

  tournament.matches = matchIds;
  tournament.pointsTable = pointsTable;
  tournament.status = 'active';
  await tournament.save();

  return { tournament, matches: createdMatches };
};

/**
 * Generate knockout fixtures.
 * Pairs teams sequentially: 1v2, 3v4, etc.
 */
const generateKnockoutFixtures = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId).populate('teams');
  if (!tournament) throw ApiError.notFound('Tournament not found');
  if (tournament.matches.length > 0) {
    throw ApiError.conflict('Fixtures have already been generated');
  }

  const teams = tournament.teams;
  if (teams.length < 2) {
    throw ApiError.badRequest('Need at least 2 teams for knockout');
  }

  // Only generate first round; subsequent rounds generated after results
  const fixtures = [];
  let matchNumber = 1;

  for (let i = 0; i < teams.length - 1; i += 2) {
    fixtures.push({
      teamA: teams[i]._id,
      teamB: teams[i + 1]._id,
      tournamentId: tournament._id,
      leagueId: tournament.leagueId,
      status: 'unscheduled',
      matchNumber: matchNumber++,
      round: 1,
      oversPerInning: tournament.oversPerInning,
    });
  }

  // If odd number, last team gets a bye (auto-advance)
  const createdMatches = await Match.insertMany(fixtures);
  const matchIds = createdMatches.map((m) => m._id);

  tournament.matches = matchIds;
  tournament.status = 'active';
  await tournament.save();

  return { tournament, matches: createdMatches };
};

/**
 * Generate fixtures based on tournament type.
 */
const generateFixtures = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw ApiError.notFound('Tournament not found');

  if (tournament.type === 'league') {
    return generateLeagueFixtures(tournamentId);
  } else if (tournament.type === 'knockout') {
    return generateKnockoutFixtures(tournamentId);
  } else {
    throw ApiError.badRequest('Invalid tournament type');
  }
};

/**
 * Get points table for a tournament.
 */
const getPointsTable = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId).populate(
    'pointsTable.teamId',
    'name logo'
  );
  if (!tournament) throw ApiError.notFound('Tournament not found');

  // Sort by points (desc), then NRR (desc)
  const sortedTable = [...tournament.pointsTable].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  return sortedTable;
};

/**
 * Update points table after a match is completed.
 */
const updatePointsTable = async (tournamentId, matchResult) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || tournament.type !== 'league') return;

  const { teamA, teamB, winner, teamAOvers, teamBOvers, teamARuns, teamBRuns } =
    matchResult;

  const updateTeamEntry = (entry, isWinner, isTied, runsFor, oversFor, runsAgainst, oversAgainst) => {
    entry.played += 1;
    if (isTied) {
      entry.tied += 1;
      entry.points += 1;
    } else if (isWinner) {
      entry.won += 1;
      entry.points += 2;
    } else {
      entry.lost += 1;
    }
    entry.runsScored += runsFor;
    entry.oversFaced += oversFor;
    entry.runsConceded += runsAgainst;
    entry.oversBowled += oversAgainst;

    // Calculate NRR
    if (entry.oversFaced > 0 && entry.oversBowled > 0) {
      entry.nrr = parseFloat(
        (entry.runsScored / entry.oversFaced - entry.runsConceded / entry.oversBowled).toFixed(3)
      );
    }
  };

  const isTied = !winner;
  const teamAEntry = tournament.pointsTable.find(
    (e) => e.teamId.toString() === teamA.toString()
  );
  const teamBEntry = tournament.pointsTable.find(
    (e) => e.teamId.toString() === teamB.toString()
  );

  if (teamAEntry) {
    updateTeamEntry(
      teamAEntry,
      winner && winner.toString() === teamA.toString(),
      isTied,
      teamARuns,
      teamAOvers,
      teamBRuns,
      teamBOvers
    );
  }

  if (teamBEntry) {
    updateTeamEntry(
      teamBEntry,
      winner && winner.toString() === teamB.toString(),
      isTied,
      teamBRuns,
      teamBOvers,
      teamARuns,
      teamAOvers
    );
  }

  await tournament.save();
};

/**
 * Update a tournament.
 */
const updateTournament = async (id, data) => {
  const tournament = await Tournament.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!tournament) throw ApiError.notFound('Tournament not found');
  return tournament;
};

module.exports = {
  createTournament,
  getTournamentsByLeague,
  getTournamentById,
  generateFixtures,
  getPointsTable,
  updatePointsTable,
  updateTournament,
};
