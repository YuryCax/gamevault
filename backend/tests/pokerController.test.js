const { startPokerGame } = require('../controllers/pokerController');
const PokerTable = require('../models/PokerTable');
const GameSettings = require('../models/GameSettings');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

jest.mock('../models/PokerTable');
jest.mock('../models/GameSettings');
jest.mock('../models/User');
jest.mock('../models/Transaction');

describe('Poker Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user1' },
      body: { tableId: 'table1', betAmount: 100, action: 'call' },
      t: jest.fn().mockImplementation(key => key),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return error if game settings not found', async () => {
    GameSettings.findOne.mockResolvedValue(null);
    await startPokerGame(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'invalid_game_settings' });
  });

  it('should handle insufficient funds', async () => {
    GameSettings.findOne.mockResolvedValue({ specificSettings: { poker: { blindsEnabled: false } } });
    PokerTable.findById.mockResolvedValue({ status: 'active', players: [{ user: 'user1', status: 'active' }], pot: 0, lastBet: 0 });
    User.findById.mockResolvedValue({ balance: 50 });
    await startPokerGame(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'insufficient_funds', amount: 50 });
  });

  it('should process a valid call action', async () => {
    GameSettings.findOne.mockResolvedValue({
      specificSettings: { poker: { blindsEnabled: false, commission: 10 } },
    });
    PokerTable.findById.mockResolvedValue({
      status: 'active',
      players: [{ user: 'user1', status: 'active', currentBet: 0, lastActionTime: Date.now() }],
      pot: 0,
      lastBet: 100,
      save: jest.fn(),
    });
    User.findById.mockResolvedValue({ balance: 1000, save: jest.fn() });
    Transaction.prototype.save = jest.fn();
    await startPokerGame(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});