const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team A is required'],
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team B is required'],
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament ID is required'],
      index: true,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: [true, 'League ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['unscheduled', 'upcoming', 'live', 'completed', 'abandoned'],
      default: 'unscheduled',
    },
    toss: {
      wonBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      decision: { type: String, enum: ['bat', 'bowl'] },
    },
    currentInning: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    battingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    bowlingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    venue: {
      type: String,
      default: null,
    },
    youtubeStreamUrl: {
      type: String,
      default: null,
    },
    result: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      margin: { type: String },
      summary: { type: String },
    },
    oversPerInning: {
      type: Number,
      default: 20,
    },
    matchNumber: {
      type: Number,
      default: null,
    },
    round: {
      type: Number,
      default: null,
    },
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatchManager',
      default: null,
    },
    scorerToken: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

matchSchema.index({ leagueId: 1, status: 1 });
matchSchema.index({ tournamentId: 1, status: 1 });
matchSchema.index({ venue: 'text' });

module.exports = mongoose.model('Match', matchSchema);
