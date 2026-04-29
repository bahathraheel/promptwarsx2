/**
 * Assistant Routes — Integration Tests (3 tests)
 */
const request = require('supertest');
const app = require('../../../server');

// Mock Gemini to avoid real API calls
jest.mock('../../../src/services/gemini', () => ({
  askAssistant: jest.fn().mockResolvedValue({
    answer: 'You can register at vote.gov!',
    zone: 'registration',
    model: 'gemini-2.0-flash'
  }),
  getFallbackResponse: jest.fn(),
  SYSTEM_PROMPT: 'test prompt',
  loadElectionData: jest.fn()
}));

describe('Assistant API', () => {
  test('POST /api/assistant/ask returns AI response', async () => {
    const res = await request(app)
      .post('/api/assistant/ask')
      .send({ question: 'How do I register to vote?', zoneId: 'registration' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('answer');
    expect(res.body.data).toHaveProperty('model');
  });

  test('POST /api/assistant/ask rejects empty question', async () => {
    const res = await request(app)
      .post('/api/assistant/ask')
      .send({ question: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/assistant/ask rejects overly long question', async () => {
    const longQ = 'a'.repeat(600);
    const res = await request(app)
      .post('/api/assistant/ask')
      .send({ question: longQ });
    expect(res.status).toBe(400);
  });
});
