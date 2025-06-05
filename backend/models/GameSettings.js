const mongoose = require('mongoose');

const gameSettingsSchema = new mongoose.Schema({
  gameType: { type: String, enum: ['slots', 'poker', 'roulette', 'dice'], required: true, unique: true },
  rtp: { type: Number, required: true, min: 0, max: 100 },
  volatility: { type: String, enum: ['low', 'medium', 'high'], required: true },
  casinoWinProbability: { type: Number, required: true, min: 0, max: 100 },
  maxPayoutMultiplier: { type: Number, required: true, min: 1 },
  features: {
    chatEnabled: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: false },
    tournamentsEnabled: { type: Boolean, default: false },
  },
  specificSettings: {
    slots: {
      reels: { type: Number, default: 5 },
      symbols: { type: [String], default: ['cherry', 'lemon', 'orange', 'plum', 'bar', 'seven', 'wild'] },
      paylines: { type: Number, default: 20 },
      bonusGamesEnabled: { type: Boolean, default: false },
      freeSpinsEnabled: { type: Boolean, default: false },
      progressiveJackpotEnabled: { type: Boolean, default: false },
    },
    poker: {
      commission: { type: Number, required: true, min: 5, max: 15 },
      maxPlayers: { type: Number, default: 5 },
      botCount: { type: Number, default: 0, min: 0, max: 2 },
      botWinProbability: { type: Number, default: 50, min: 0, max: 100 },
      botBalance: { type: Number, default: 1000 },
      tableCount: { type: Number, default: 10 },
      betTimeNormal: { type: Number, default: 45 },
      betTimeTournament: { type: Number, default: 30 },
      blindsEnabled: { type: Boolean, default: true },
      botStrategy: { type: String, enum: ['tight', 'aggressive', 'random'], default: 'random' },
    },
    roulette: {
      wheelType: { type: String, enum: ['european'], default: 'european' },
      betTypes: {
        number: { type: Number, default: 35 },
        color: { type: Number, default: 1 },
        evenOdd: { type: Number, default: 1 },
        dozen: { type: Number, default: 2 },
        column: { type: Number, default: 2 },
        split: { type: Number, default: 17 },
      },
      realisticWheelEnabled: { type: Boolean, default: false },
    },
    dice: {
      betModes: {
        exact: { type: Number, default: 5 },
        overUnder: { type: Number, default: 1 },
        pair: { type: Number, default: 3 },
        sum7or11: { type: Number, default: 2 },
      },
      bonusRoundsEnabled: { type: Boolean, default: false },
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GameSettings', gameSettingsSchema);