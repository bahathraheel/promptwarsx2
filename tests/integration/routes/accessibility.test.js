/**
 * Accessibility Routes — Integration Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('Accessibility API', () => {
  test('GET /api/accessibility/text-mode returns full text content', async () => {
    const res = await request(app).get('/api/accessibility/text-mode');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('zones');
    expect(res.body.data).toHaveProperty('accessibilityNote');
    expect(res.body.data.zones.length).toBe(5);
  });

  test('GET /api/accessibility/high-contrast returns color config', async () => {
    const res = await request(app).get('/api/accessibility/high-contrast');
    expect(res.status).toBe(200);
    expect(res.body.data.colors).toHaveProperty('background');
    expect(res.body.data.colors).toHaveProperty('text');
    expect(res.body.data.colors).toHaveProperty('primary');
  });
});
