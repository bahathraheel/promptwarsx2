/**
 * Timeline Routes — Integration Tests (2 tests)
 */
const request = require('supertest');
const app = require('../../../server');

describe('Timeline API', () => {
  test('GET /api/timeline returns timeline events', async () => {
    const res = await request(app).get('/api/timeline');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('events');
    expect(Array.isArray(res.body.data.events)).toBe(true);
    expect(res.body.data.events.length).toBeGreaterThan(0);
  });

  test('timeline events have status computed', async () => {
    const res = await request(app).get('/api/timeline');
    const event = res.body.data.events[0];
    expect(event).toHaveProperty('date');
    expect(event).toHaveProperty('status');
    expect(event).toHaveProperty('daysUntil');
    expect(['past', 'today', 'upcoming', 'future']).toContain(event.status);
  });
});
