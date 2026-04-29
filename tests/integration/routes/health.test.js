/**
 * Health Routes — Integration Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('GET /api/health', () => {
  test('returns 200 with health data', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('version');
    expect(res.body.data).toHaveProperty('uptime');
  });

  test('returns Google services status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.data).toHaveProperty('googleServices');
    expect(res.body.data.googleServices).toHaveProperty('gemini');
  });

  test('GET /api/health/ready returns ready status', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
  });
});
