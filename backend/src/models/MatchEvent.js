const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    inning: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    over: {
      type: Number,
      required: true,
    },
    ball: {
      type: Number,
      required: true,
    },
    batsmanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    bowlerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    runs: {
      type: Number,
      default: 0,
    },
    extras: {
      type: {
        type: String,
        enum: ['wide', 'noball', 'bye', 'legbye', 'penalty', null],
        default: null,
      },
      runs: { type: Number, default: 0 },
    },
    isWicket: {
      type: Boolean,
      default: false,
    },
    wicket: {
      type: {
        type: String,
        enum: ['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket', 'retired', null],
        default: null,
      },
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null,
      },
      fielderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null,
      },
    },
    eventType: {
      type: String,
      enum: ['normal', 'wide', 'noball', 'bye', 'legbye', 'wicket', 'penalty'],
      default: 'normal',
    },
    isBoundary: {
      type: Boolean,
      default: false,
    },
    isSix: {
      type: Boolean,
      default: false,
    },
    isLegalDelivery: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

matchEventSchema.index({ matchId: 1, inning: 1, over: 1, ball: 1 });
matchEventSchema.index({ matchId: 1, timestamp: 1 });
matchEventSchema.index({ batsmanId: 1 });
matchEventSchema.index({ bowlerId: 1 });

module.exports = mongoose.model('MatchEvent', matchEventSchema);
