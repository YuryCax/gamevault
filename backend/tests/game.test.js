const request = require('supertest');
     const app = require('../server');

     describe('POST /games/play', () => {
       it('should play a game', async () => {
         const res = await request(app)
           .post('/api/games/play')
           .set('Authorization', 'Bearer YOUR_TOKEN')
           .send({ gameType: 'slots', betAmount: 100', txHash: 'unique123' });
         expect(res.statusCode).toBe(200);
         expect(res.body).toHaveProperty('result');
       });
     });