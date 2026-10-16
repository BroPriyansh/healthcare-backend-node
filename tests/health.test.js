jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }], rowCount: 1 }), end: jest.fn() },
  query: jest.fn()
}));

const request = require('supertest');
const app = require('../src/app');

describe('Healthcare API', () => {
  test('GET /api/health returns service status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'healthcare-api' });
  });

  test('unknown endpoint returns structured 404', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  test.each([
    ['GET', '/api/patients'],
    ['POST', '/api/patients'],
    ['GET', '/api/doctors'],
    ['GET', '/api/mappings']
  ])('%s %s rejects requests without a JWT', async (method, url) => {
    const response = await request(app)[method.toLowerCase()](url);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('registration rejects malformed data before reaching the database', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A', email: 'not-an-email', password: 'weak'
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  test('patient creation requires a valid access token', async () => {
    const response = await request(app).post('/api/patients').send({
      name: 'Meera Sharma', age: 34, gender: 'female', address: 'Agra'
    });
    expect(response.status).toBe(401);
  });
});
