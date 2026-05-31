const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

describe('Estadísticas y Dashboard', () => {
  test('Acceso denegado a estadísticas para usuarios no autenticados', async () => {
    const response = await request(app).get('/api/stats/dashboard');
    expect(response.status).toBe(401);
  });
});
