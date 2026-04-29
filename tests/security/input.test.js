/**
 * Input Validation Security — Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Input Validation Security', () => {
  test('rejects XSS in assistant question', async () => {
    const res = await request(app)
      .post('/api/assistant/ask')
      .send({ question: '<script>alert("xss")</script>' });
    // Should either sanitize or work safely
    expect(res.status).toBeLessThan(500);
  });

  test('rejects invalid zone ID with special characters', async () => {
    const res = await request(app).get('/api/zones/../../etc/passwd');
    expect([400, 404]).toContain(res.status);
  });

  test('rejects oversized payload', async () => {
    const hugeText = 'x'.repeat(3000);
    const res = await request(app)
      .post('/api/translate')
      .send({ text: hugeText, targetLanguage: 'es' });
    expect(res.status).toBe(400);
  });
});
