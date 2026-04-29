/**
 * Security Headers — Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Security Headers', () => {
  test('sets X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('sets Strict-Transport-Security header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toContain('max-age');
  });

  test('sets X-Frame-Options or CSP frame-ancestors', async () => {
    const res = await request(app).get('/api/health');
    const hasFrameOptions = res.headers['x-frame-options'] !== undefined;
    const csp = res.headers['content-security-policy'] || '';
    const hasFrameAncestors = csp.includes('frame-ancestors');
    expect(hasFrameOptions || hasFrameAncestors).toBe(true);
  });
});
