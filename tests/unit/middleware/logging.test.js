/**
 * Logging Middleware — Unit Tests
 */

describe('Logging Middleware', () => {
  let logging;

  beforeEach(() => {
    jest.resetModules();
    logging = require('../../../src/middleware/logging');
  });

  test('exports httpLogger and logger', () => {
    expect(logging.httpLogger).toBeDefined();
    expect(logging.logger).toBeDefined();
  });

  test('logger has standard levels', () => {
    expect(typeof logging.logger.info).toBe('function');
    expect(typeof logging.logger.error).toBe('function');
    expect(typeof logging.logger.warn).toBe('function');
  });

  test('httpLogger is a function (middleware)', () => {
    // morgan returns a middleware function
    expect(typeof logging.httpLogger).toBe('function');
  });
});
