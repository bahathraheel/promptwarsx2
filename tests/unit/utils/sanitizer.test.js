/**
 * Sanitizer Utility — Unit Tests (2 tests)
 */
const { sanitizeQuestion, cleanText } = require('../../../src/utils/sanitizer');

describe('Sanitizer Utility', () => {
  test('sanitizeQuestion removes HTML tags and trims whitespace', () => {
    const input = '   <script>alert("xss")</script>How do I vote?   ';
    const output = sanitizeQuestion(input);
    expect(output).toBe('How do I vote?');
    expect(output).not.toContain('<script>');
  });

  test('cleanText removes excessive emojis and special characters', () => {
    const input = 'Vote now! 🗳️🗳️🗳️ !!! ???';
    const output = cleanText(input);
    expect(output).toContain('Vote now');
    // Ensure it doesn't just strip everything, but cleans up
    expect(output.length).toBeLessThan(input.length);
  });
});
