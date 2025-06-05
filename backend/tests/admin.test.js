const request = require('supertest');
   const app = require('../server');

   describe('PUT /admin/game-settings/:gameType', () => {
     it('should update game settings', async () => {
       const res = await request(app)
         .put('/api/admin/game-settings/slots')
         .set('Authorization', 'Bearer ADMIN_TOKEN')
         .send({
           rtp: 95,
           winProbability: 0.3,
           volatility: 'medium',
           maxPayoutMultiplier: 100,
         });
       expect(res.statusCode).toBe(200);
       expect(res.body).toHaveProperty('winProbability', 0.3);
     });
   });