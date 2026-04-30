/**
 * Input sanitization utilities for ELITE ELECTION.
 * Prevents XSS, injection attacks, and malformed input.
 */

/**
 * Strip HTML tags from a string
 */
function stripHtml(input) {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(input) {
  if (typeof input !== "string") return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char]);
}

/**
 * Sanitize user input — strip dangerous patterns
 */
function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  let cleaned = input;

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, "");

  // Remove script tags and event handlers
  cleaned = cleaned.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  cleaned = cleaned.replace(/on\w+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript\s*:/gi, "");

  // Remove data: protocol (except images)
  cleaned = cleaned.replace(/data\s*:[^image/][^;]*/gi, "");

  // Trim and limit length
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Validate and sanitize a question for the AI assistant
 */
function sanitizeQuestion(question, maxLength = 500) {
  if (typeof question !== "string") return "";
  let cleaned = sanitizeInput(question);
  cleaned = stripHtml(cleaned);
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  return cleaned;
}

/**
 * Sanitize a zone ID parameter
 */
function sanitizeZoneId(id) {
  if (typeof id !== "string") return "";
  return id.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 50);
}

/**
 * Check for SQL injection patterns
 */
function hasSqlInjection(input) {
  if (typeof input !== "string") return false;
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
  ];
  return patterns.some((p) => p.test(input));
}

module.exports = {
  stripHtml,
  escapeHtml,
  sanitizeInput,
  sanitizeQuestion,
  sanitizeZoneId,
  hasSqlInjection,
};
