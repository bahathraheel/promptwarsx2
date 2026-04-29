/**
 * NLP Service — Unit Tests (2 tests)
 */
const { analyzeSentiment, analyzeEntities } = require('../../../src/services/nlp');

describe('NLP Service', () => {
  beforeAll(() => { process.env.ENABLE_NLP = 'false'; });

  test('returns neutral sentiment when NLP is disabled', async () => {
    const result = await analyzeSentiment('How do I vote?');
    expect(result.score).toBe(0);
    expect(result.magnitude).toBe(0);
    expect(result.fallback).toBe(true);
  });

  test('analyzeEntities returns empty array in fallback', async () => {
    const result = await analyzeEntities('Election in California');
    expect(result.entities).toEqual([]);
    expect(result.fallback).toBe(true);
  });
});
