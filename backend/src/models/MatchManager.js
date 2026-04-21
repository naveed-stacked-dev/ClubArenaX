const mongoose = require('mongoose');

const matchManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    accessType: {
      type: String,
      enum: ['login', 'token'],
      default: 'token',
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      index: true,
    },
    token: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchManager', matchManagerSchema);
