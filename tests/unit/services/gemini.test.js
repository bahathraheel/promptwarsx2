/**
 * Gemini AI Service — Unit Tests (3 tests)
 */
const path = require('path');

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Test AI response about elections.' }
      })
    })
  }))
}));

const { askAssistant, getFallbackResponse, SYSTEM_PROMPT } = require('../../../src/services/gemini');

describe('Gemini AI Service', () => {
  test('SYSTEM_PROMPT contains non-partisan directive', () => {
    expect(SYSTEM_PROMPT).toContain('neutral');
    expect(SYSTEM_PROMPT).toContain('NEVER express political opinions');
  });

  test('getFallbackResponse returns registration info for registration questions', () => {
    const data = { zones: [], timeline: { registration_deadline: '2026-10-05' }, resources: {} };
    const result = getFallbackResponse('How do I register to vote?', 'registration', data);
    expect(result.answer).toContain('voters.eci.gov.in');
    expect(result.model).toBe('fallback');
  });

  test('getFallbackResponse returns generic response for unknown questions', () => {
    const data = { zones: [], timeline: {}, resources: {} };
    const result = getFallbackResponse('Tell me something random', null, data);
    expect(result.answer).toContain('Election Guide');
    expect(result.model).toBe('fallback');
  });

  test('SYSTEM_PROMPT includes structure and neatness rules', () => {
    expect(SYSTEM_PROMPT).toContain('NEATNESS & STRUCTURE');
    expect(SYSTEM_PROMPT).toContain('bullet points');
  });

  test('SYSTEM_PROMPT specifically mentions Indian languages', () => {
    expect(SYSTEM_PROMPT).toContain('multilingual responses');
    expect(SYSTEM_PROMPT).toContain('Hindi, Tamil, Telugu');
  });
});
