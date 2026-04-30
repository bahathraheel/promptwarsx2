/**
 * Security Headers — Integration Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Security Headers', () => {
  test('Response includes strict Content-Security-Policy', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('Response includes X-XSS-Protection and X-Content-Type-Options', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-xss-protection']).toBe('0'); // Helmet sets it to 0 by default in newer versions but enabled logic
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
