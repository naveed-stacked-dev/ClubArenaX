const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 5,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: [true, 'League ID is required'],
      index: true,
    },
  },
  { timestamps: true }
);

teamSchema.index({ leagueId: 1, name: 1 }, { unique: true });
teamSchema.index({ name: 'text' });

module.exports = mongoose.model('Team', teamSchema);
