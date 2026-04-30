/**
 * Custom error classes for ELITE ELECTION application.
 * Provides structured error handling with HTTP status codes.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

class RateLimitError extends AppError {
  constructor() {
    super("Too many requests. Please try again later.", 429, "RATE_LIMITED");
  }
}

class ServiceUnavailableError extends AppError {
  constructor(service = "Service") {
    super(`${service} is temporarily unavailable`, 503, "SERVICE_UNAVAILABLE");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message:
        isProduction && statusCode === 500
          ? "An unexpected error occurred"
          : err.message,
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  if (!isProduction && err.stack) {
    response.error.stack = err.stack;
  }

  if (statusCode >= 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
};
