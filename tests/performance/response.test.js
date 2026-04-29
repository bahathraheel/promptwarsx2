/**
 * Performance — Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Performance', () => {
  test('health endpoint responds within 500ms', async () => {
    const start = Date.now();
    await request(app).get('/api/health');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  test('zones endpoint responds within 500ms', async () => {
    const start = Date.now();
    await request(app).get('/api/zones');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
