/**
 * Rate Limiting — Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Rate Limiting', () => {
  test('returns rate limit headers on API responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });

  test('rate limit headers contain numeric values', async () => {
    const res = await request(app).get('/api/health');
    const limit = parseInt(res.headers['ratelimit-limit']);
    const remaining = parseInt(res.headers['ratelimit-remaining']);
    expect(limit).toBeGreaterThan(0);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });
});
