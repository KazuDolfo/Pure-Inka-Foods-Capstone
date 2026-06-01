const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

describe('Gestión de Pedidos', () => {
  test('Creación de pedido requiere autenticación', async () => {
    const response = await request(app).post('/api/orders').send({});
    expect(response.status).toBe(401);
  });

  test('Error al crear pedido sin productos', async () => {
    
  });
});

