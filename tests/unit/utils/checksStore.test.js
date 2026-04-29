/**
 * checksStore Utility — Unit Tests (3 tests)
 */
const fs = require('fs');
const path = require('path');
const { readChecks, addCheck, clearChecks, CHECKS_FILE } = require('../../../src/utils/checksStore');

describe('checksStore', () => {
  const backupPath = CHECKS_FILE + '.backup';

  beforeAll(() => {
    if (fs.existsSync(CHECKS_FILE)) {
      fs.copyFileSync(CHECKS_FILE, backupPath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, CHECKS_FILE);
      fs.unlinkSync(backupPath);
    }
  });

  test('readChecks returns an object with checks array', () => {
    const data = readChecks();
    expect(data).toHaveProperty('checks');
    expect(Array.isArray(data.checks)).toBe(true);
  });

  test('addCheck adds an entry and returns it with timestamp', () => {
    clearChecks();
    const entry = addCheck({ service: 'test', status: 'ok', success: true });
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('timestamp');
    expect(entry.service).toBe('test');
    expect(entry.status).toBe('ok');
  });

  test('addCheck keeps only last 10 entries', () => {
    clearChecks();
    for (let i = 0; i < 15; i++) {
      addCheck({ service: `test-${i}`, status: 'ok', success: true });
    }
    const data = readChecks();
    expect(data.checks.length).toBeLessThanOrEqual(10);
  });
});
