/**
 * Zones Routes — Integration Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('Zones API', () => {
  test('GET /api/zones returns list of zones', async () => {
    const res = await request(app).get('/api/zones');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  test('GET /api/zones/welcome returns welcome zone', async () => {
    const res = await request(app).get('/api/zones/welcome');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('welcome');
    expect(res.body.data).toHaveProperty('key_facts');
    expect(res.body.data).toHaveProperty('faq');
  });

  test('GET /api/zones/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/zones/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
