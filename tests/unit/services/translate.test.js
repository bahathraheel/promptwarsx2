/**
 * Translation Service — Unit Tests (2 tests)
 */
const { translateText, detectLanguage } = require('../../../src/services/translate');

describe('Translation Service', () => {
  beforeAll(() => { process.env.ENABLE_TRANSLATION = 'false'; });

  test('returns original text when translation is disabled', async () => {
    const result = await translateText('Hello', 'es');
    expect(result.translatedText).toBe('Hello');
    expect(result.fallback).toBe(true);
  });

  test('returns english as detected language in fallback', async () => {
    const result = await translateText('Test text', 'fr');
    expect(result.detectedLanguage).toBe('en');
  });
});
