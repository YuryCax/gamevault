const request = require('supertest');
const app = require('../server');

describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });
});