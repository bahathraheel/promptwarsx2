/**
 * Cloud Logging Service — Unit Tests
 */

describe('Cloud Logging Service', () => {
  let loggingService;

  beforeEach(() => {
    jest.resetModules();
    process.env.ENABLE_CLOUD_LOGGING = 'false';
    loggingService = require('../../../src/services/logging');
  });

  test('exports writeStructuredLog function', () => {
    expect(typeof loggingService.writeStructuredLog).toBe('function');
  });

  test('writeStructuredLog falls back to console when disabled', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await loggingService.writeStructuredLog('INFO', 'Test message', { key: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test message', { key: 'value' });
    consoleSpy.mockRestore();
  });

  test('writeStructuredLog handles different severity levels', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await loggingService.writeStructuredLog('ERROR', 'Error occurred');
    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Error occurred', {});
    consoleSpy.mockRestore();
  });
});
