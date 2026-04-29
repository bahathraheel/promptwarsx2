/**
 * ARIA Accessibility — Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../server');
const fs = require('fs');
const path = require('path');

describe('ARIA Accessibility', () => {
  let indexHtml;

  beforeAll(() => {
    indexHtml = fs.readFileSync(path.join(__dirname, '../../public/index.html'), 'utf8');
  });

  test('index.html contains skip navigation link', () => {
    expect(indexHtml).toContain('skip-link');
    expect(indexHtml).toContain('Skip to main content');
  });

  test('index.html has proper ARIA attributes on interactive elements', () => {
    expect(indexHtml).toContain('aria-label');
    expect(indexHtml).toContain('aria-live');
    expect(indexHtml).toContain('aria-expanded');
    expect(indexHtml).toContain('role="navigation"');
    expect(indexHtml).toContain('role="dialog"');
    expect(indexHtml).toContain('role="log"');
  });
});
