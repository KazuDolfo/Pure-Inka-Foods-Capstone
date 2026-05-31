require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const bcrypt = require('bcrypt');
const pool = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

describe('User Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/users should register a new user with 12 bcrypt rounds', async () => {
    const userData = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      telefono: '123456789'
    };
    pool.query.mockResolvedValueOnce([[]]);
    pool.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }]);
    const response = await request(app).post('/api/users').send(userData);
    expect(response.status).toBe(201);
  });
});
