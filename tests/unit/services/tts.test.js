/**
 * TTS Service — Unit Tests (2 tests)
 */
const { synthesizeSpeech } = require('../../../src/services/tts');

describe('TTS Service', () => {
  beforeAll(() => { process.env.ENABLE_TTS = 'false'; });

  test('returns fallback when TTS is disabled', async () => {
    const result = await synthesizeSpeech('Hello world');
    expect(result.fallback).toBe(true);
    expect(result.message).toContain('SpeechSynthesis');
  });

  test('fallback message is a string', async () => {
    const result = await synthesizeSpeech('Test');
    expect(typeof result.message).toBe('string');
  });
});
