const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  domainId: {
    type: Number,
    required: true,
    index: true
  },
  gameId: {
    type: Number,
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxPossible: {
    type: Number,
    default: 20
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Optional metadata for future use
  sessionData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
gameScoreSchema.index({ userId: 1, domainId: 1, gameId: 1, playedAt: -1 });
gameScoreSchema.index({ userId: 1, domainId: 1, playedAt: -1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);
