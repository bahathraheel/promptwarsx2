/**
 * Secret Manager Service — Unit Tests
 */

describe('Secret Manager Service', () => {
  let secretManager;

  beforeEach(() => {
    jest.resetModules();
    secretManager = require('../../../src/services/secretManager');
  });

  test('exports getSecret and clearCache functions', () => {
    expect(typeof secretManager.getSecret).toBe('function');
    expect(typeof secretManager.clearCache).toBe('function');
  });

  test('getSecret falls back to env variable when service unavailable', async () => {
    process.env.MY_TEST_SECRET = 'test-value';
    const result = await secretManager.getSecret('MY_TEST_SECRET');
    expect(result).toBe('test-value');
    delete process.env.MY_TEST_SECRET;
  }, 30000);

  test('getSecret returns null for unknown secret without env fallback', async () => {
    const result = await secretManager.getSecret('NONEXISTENT_SECRET_12345');
    expect(result).toBeNull();
  }, 30000);

  test('clearCache clears the internal cache', () => {
    expect(() => secretManager.clearCache()).not.toThrow();
  });
});
