/**
 * Error Utilities — Unit Tests
 */

const {
  AppError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler
} = require('../../../src/utils/errors');

describe('Custom Error Classes', () => {
  test('AppError has correct properties', () => {
    const error = new AppError('Test error', 500, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
    expect(error instanceof Error).toBe(true);
  });

  test('ValidationError defaults to 400 status', () => {
    const error = new ValidationError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual([]);
  });

  test('NotFoundError uses resource name', () => {
    const error = new NotFoundError('User');
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  test('RateLimitError returns 429', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  test('ServiceUnavailableError returns 503', () => {
    const error = new ServiceUnavailableError('Gemini');
    expect(error.message).toBe('Gemini is temporarily unavailable');
    expect(error.statusCode).toBe(503);
  });

  test('UnauthorizedError returns 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
  });

  test('ForbiddenError returns 403', () => {
    const error = new ForbiddenError('Admin only');
    expect(error.message).toBe('Admin only');
    expect(error.statusCode).toBe(403);
  });
});

describe('Error Handler Middleware', () => {
  test('returns structured error response', () => {
    const error = new AppError('Bad request', 400, 'BAD_REQUEST');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Bad request'
      })
    }));
  });

  test('includes details when present', () => {
    const error = new ValidationError('Invalid', [{ field: 'name' }]);
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(error, req, res, jest.fn());

    const response = res.json.mock.calls[0][0];
    expect(response.error.details).toEqual([{ field: 'name' }]);
  });

  test('hides stack trace in production for 500 errors', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Something broke');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(error, req, res, jest.fn());

    const response = res.json.mock.calls[0][0];
    expect(response.error.message).toBe('An unexpected error occurred');
    expect(response.error.stack).toBeUndefined();

    process.env.NODE_ENV = origEnv;
  });
});
