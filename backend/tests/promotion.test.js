const request = require('supertest');
   const app = require('../server');

   describe('POST /promotions/lottery/buy', () => {
     it('should buy lottery tickets', async () => {
       const res = await request(app)
         .post('/promotions/lottery/buy')
         .set('Authorization', 'Bearer YOUR_TOKEN')
         .send({ count: 1 });
       expect(res.statusCode).toBe(200);
       expect(res.body.message).toBe('Purchased 1 tickets');
     });
   });