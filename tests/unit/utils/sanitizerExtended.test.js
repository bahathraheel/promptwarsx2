/**
 * Sanitizer — Extended Unit Tests
 */

const { escapeHtml, sanitizeZoneId, sanitizeInput, sanitizeQuestion } = require('../../../src/utils/sanitizer');

describe('Sanitizer - Extended', () => {
  test('escapeHtml escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('<');
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('>');
  });

  test('escapeHtml escapes quotes and ampersand', () => {
    const result = escapeHtml('a & b "c" \'d\'');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#x27;');
  });

  test('escapeHtml returns empty string for non-string input', () => {
    expect(escapeHtml(123)).toBe('');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  test('sanitizeZoneId allows alphanumeric with hyphens and underscores', () => {
    expect(sanitizeZoneId('welcome')).toBe('welcome');
    expect(sanitizeZoneId('zone-1')).toBe('zone-1');
    expect(sanitizeZoneId('zone_2')).toBe('zone_2');
  });

  test('sanitizeZoneId removes special characters', () => {
    expect(sanitizeZoneId('zone<script>')).toBe('zonescript');
    expect(sanitizeZoneId('zone; DROP')).toBe('zoneDROP');
  });

  test('sanitizeZoneId limits length to 50', () => {
    const longId = 'a'.repeat(100);
    expect(sanitizeZoneId(longId).length).toBeLessThanOrEqual(50);
  });

  test('sanitizeZoneId returns empty for non-string', () => {
    expect(sanitizeZoneId(123)).toBe('');
    expect(sanitizeZoneId(null)).toBe('');
  });

  test('sanitizeInput removes null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld');
  });

  test('sanitizeInput removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:');
  });

  test('sanitizeQuestion truncates to maxLength', () => {
    const longQuestion = 'a'.repeat(600);
    expect(sanitizeQuestion(longQuestion, 500).length).toBeLessThanOrEqual(500);
  });

  test('sanitizeQuestion strips HTML from question', () => {
    expect(sanitizeQuestion('<b>How do I vote?</b>')).toBe('How do I vote?');
  });

  test('sanitizeQuestion returns empty for non-string', () => {
    expect(sanitizeQuestion(null)).toBe('');
    expect(sanitizeQuestion(42)).toBe('');
  });
});
