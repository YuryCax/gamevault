const request = require('supertest');
const app = require('../server');

describe('POST /tournaments', () => {
  it('should create a new tournament', async () => {
    const res = await request(app)
      .post('/tournaments')
      .set('Authorization', 'Bearer YOUR_TOKEN')
      .send({
        name: 'Test Tournament',
        gameType: 'poker',
        entryFee: 50,
        maxPlayers: 100,
        prizes: [50, 30, 20],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.tournament).toHaveProperty('name', 'Test Tournament');
  });
});