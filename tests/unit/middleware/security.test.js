/**
 * Security Middleware — Unit Tests
 */

describe('Security Middleware', () => {
  let security;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'development';
    security = require('../../../src/middleware/security');
  });

  test('exports createHelmetMiddleware, createCorsMiddleware, csrfProtection', () => {
    expect(typeof security.createHelmetMiddleware).toBe('function');
    expect(typeof security.createCorsMiddleware).toBe('function');
    expect(typeof security.csrfProtection).toBe('function');
  });

  test('createHelmetMiddleware returns a middleware function', () => {
    const middleware = security.createHelmetMiddleware();
    expect(typeof middleware).toBe('function');
  });

  test('createCorsMiddleware returns a middleware function', () => {
    const middleware = security.createCorsMiddleware();
    expect(typeof middleware).toBe('function');
  });

  test('csrfProtection skips for GET requests', (done) => {
    const req = { method: 'GET' };
    const res = {};
    security.csrfProtection(req, res, () => { done(); });
  });

  test('csrfProtection skips for HEAD requests', (done) => {
    const req = { method: 'HEAD' };
    const res = {};
    security.csrfProtection(req, res, () => { done(); });
  });

  test('csrfProtection skips for OPTIONS requests', (done) => {
    const req = { method: 'OPTIONS' };
    const res = {};
    security.csrfProtection(req, res, () => { done(); });
  });

  test('csrfProtection skips POST in development mode', (done) => {
    process.env.NODE_ENV = 'development';
    const req = { method: 'POST' };
    const res = {};
    security.csrfProtection(req, res, () => { done(); });
  });

  test('csrfProtection rejects POST without token in production', (done) => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const prodSecurity = require('../../../src/middleware/security');
    const req = { method: 'POST', cookies: {}, headers: {} };
    const res = {
      status: function(code) {
        expect(code).toBe(403);
        return this;
      },
      json: function(body) {
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('CSRF_FAILED');
        done();
      }
    };
    prodSecurity.csrfProtection(req, res, () => {});
  });
});
