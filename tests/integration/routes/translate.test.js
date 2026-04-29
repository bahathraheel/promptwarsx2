/**
 * Translate Routes — Integration Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('Translate API', () => {
  test('POST /api/translate returns translated text (fallback)', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({ text: 'Hello', targetLanguage: 'es' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('translatedText');
  });

  test('POST /api/translate rejects missing targetLanguage', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({ text: 'Hello' });
    expect(res.status).toBe(400);
  });
});
