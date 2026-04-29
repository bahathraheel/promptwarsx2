/**
 * NLP Service — Extended Unit Tests
 */

describe('NLP Service - Extended', () => {
  let nlp;

  beforeEach(() => {
    jest.resetModules();
    process.env.ENABLE_NLP = 'false';
    nlp = require('../../../src/services/nlp');
  });

  test('exports analyzeSentiment and analyzeEntities', () => {
    expect(typeof nlp.analyzeSentiment).toBe('function');
    expect(typeof nlp.analyzeEntities).toBe('function');
  });

  test('analyzeEntities returns empty array with fallback flag when disabled', async () => {
    const result = await nlp.analyzeEntities('The election is on November 3rd.');
    expect(result.entities).toEqual([]);
    expect(result.fallback).toBe(true);
  });

  test('analyzeSentiment returns neutral sentiment when disabled', async () => {
    const result = await nlp.analyzeSentiment('I am very happy about voting.');
    expect(result.score).toBe(0);
    expect(result.magnitude).toBe(0);
    expect(result.fallback).toBe(true);
  });

  test('analyzeSentiment handles empty text', async () => {
    const result = await nlp.analyzeSentiment('');
    expect(result).toBeDefined();
    expect(result.fallback).toBe(true);
  });
});
