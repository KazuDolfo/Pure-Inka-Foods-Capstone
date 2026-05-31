const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

describe('Recuperación de Contraseña', () => {
  test('Solicitud de código para usuario inexistente devuelve 404', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const response = await request(app).post('/api/users/forgot-password').send({ identifier: 'noexiste@test.com' });
    expect(response.status).toBe(404);
  });
});
