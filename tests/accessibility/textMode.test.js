/**
 * Text-Only Mode Accessibility — Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../server');

describe('Text-Only Mode', () => {
  test('text-mode content has all 5 zones', async () => {
    const res = await request(app).get('/api/accessibility/text-mode');
    expect(res.body.data.zones.length).toBe(5);
    const names = res.body.data.zones.map(z => z.name);
    expect(names).toContain('Welcome Hub');
    expect(names).toContain('Voter Registration');
    expect(names).toContain('Polling Day');
  });

  test('text-mode includes accessibility note', async () => {
    const res = await request(app).get('/api/accessibility/text-mode');
    expect(res.body.data.accessibilityNote).toContain('screen readers');
  });
});
