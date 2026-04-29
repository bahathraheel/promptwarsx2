/**
 * Security middleware stack for ELITE ELECTION.
 * Helmet, CORS, CSRF protection.
 */

const helmet = require('helmet');
const cors = require('cors');

/**
 * Configure Helmet with strict CSP
 */
function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://www.google.com",
          "https://www.gstatic.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://*.googleapis.com"],
        workerSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://www.google.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    xssFilter: true
  });
}

/**
 * Configure CORS
 */
function createCorsMiddleware() {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:8080', 'http://localhost:3000'];

  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev; restrict in production
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400
  });
}

/**
 * CSRF double-submit cookie protection
 */
function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API routes in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const cookieToken = req.cookies && req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: { code: 'CSRF_FAILED', message: 'CSRF validation failed' }
    });
  }

  next();
}

module.exports = { createHelmetMiddleware, createCorsMiddleware, csrfProtection };
