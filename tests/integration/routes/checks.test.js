/**
 * Checks Routes — Integration Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('Checks API', () => {
  test('GET /api/checks returns checks data', async () => {
    const res = await request(app).get('/api/checks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('checks');
  });

  test('POST /api/checks creates a new check', async () => {
    const res = await request(app)
      .post('/api/checks')
      .send({ service: 'integration-test', status: 'ok' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.service).toBe('integration-test');
  });

  test('POST /api/checks rejects invalid status', async () => {
    const res = await request(app)
      .post('/api/checks')
      .send({ service: 'test', status: 'invalid-status' });
    expect(res.status).toBe(400);
  });
});
