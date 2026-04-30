/**
 * Rate limiting middleware for ELITE ELECTION.
 */

const rateLimit = require("express-rate-limit");

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
    },
  },
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

/** Stricter limiter for AI assistant */
const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "AI assistant rate limit reached. Please wait a moment.",
    },
  },
});

/** Strictest limiter for TTS */
const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Text-to-speech rate limit reached.",
    },
  },
});

module.exports = { apiLimiter, assistantLimiter, ttsLimiter };
