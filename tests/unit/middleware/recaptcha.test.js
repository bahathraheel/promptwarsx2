/**
 * reCAPTCHA Middleware — Unit Tests
 */

describe('reCAPTCHA Middleware', () => {
  let recaptcha;

  beforeEach(() => {
    jest.resetModules();
    process.env.ENABLE_RECAPTCHA = 'false';
    recaptcha = require('../../../src/middleware/recaptcha');
  });

  test('exports verifyRecaptcha function', () => {
    expect(typeof recaptcha.verifyRecaptcha).toBe('function');
  });

  test('skips verification when ENABLE_RECAPTCHA is false', (done) => {
    const req = { body: {} };
    const res = {};
    const next = () => {
      done(); // next() was called, meaning it was skipped
    };
    recaptcha.verifyRecaptcha(req, res, next);
  });

  test('skips verification when ENABLE_RECAPTCHA is not set', (done) => {
    delete process.env.ENABLE_RECAPTCHA;
    const req = { body: {} };
    const res = {};
    const next = () => { done(); };
    recaptcha.verifyRecaptcha(req, res, next);
  });
});
