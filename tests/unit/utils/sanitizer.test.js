/**
 * Sanitizer Utility — Unit Tests (3 tests)
 */
const { stripHtml, escapeHtml, sanitizeInput, sanitizeQuestion, hasSqlInjection } = require('../../../src/utils/sanitizer');

describe('Sanitizer', () => {
  test('stripHtml removes all HTML tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
    expect(stripHtml('<b>Bold</b>')).toBe('Bold');
    expect(stripHtml('No tags here')).toBe('No tags here');
  });

  test('sanitizeInput removes script tags and event handlers', () => {
    const malicious = '<script>alert("xss")</script><img onerror="hack()" src=x>';
    const cleaned = sanitizeInput(malicious);
    expect(cleaned).not.toContain('<script');
    expect(cleaned).not.toContain('onerror');
  });

  test('hasSqlInjection detects SQL injection patterns', () => {
    expect(hasSqlInjection("SELECT * FROM users")).toBe(true);
    expect(hasSqlInjection("DROP TABLE votes")).toBe(true);
    expect(hasSqlInjection("1 OR 1=1")).toBe(true);
    expect(hasSqlInjection("How do I register to vote?")).toBe(false);
  });
});
