/**
 * Local checks.json file operations for ELITE ELECTION.
 * Stores the history of the last 10 health checks.
 */

const fs = require('fs');
const path = require('path');

const CHECKS_FILE = path.join(__dirname, '..', '..', 'data', 'checks.json');
const MAX_ENTRIES = 10;

/**
 * Read all checks from checks.json
 */
function readChecks() {
  try {
    if (!fs.existsSync(CHECKS_FILE)) {
      const initial = { checks: [], maxEntries: MAX_ENTRIES };
      fs.writeFileSync(CHECKS_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(CHECKS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return {
      checks: Array.isArray(data.checks) ? data.checks : [],
      maxEntries: data.maxEntries || MAX_ENTRIES
    };
  } catch (error) {
    console.error('[checksStore] Failed to read checks.json:', error.message);
    return { checks: [], maxEntries: MAX_ENTRIES };
  }
}

/**
 * Add a new check entry, keeping only the last 10
 */
function addCheck(check) {
  const data = readChecks();

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    status: check.status || 'unknown',
    service: check.service || 'health',
    responseTime: check.responseTime || null,
    details: check.details || null,
    success: check.success !== undefined ? check.success : true
  };

  data.checks.unshift(entry);

  // Keep only last MAX_ENTRIES
  if (data.checks.length > MAX_ENTRIES) {
    data.checks = data.checks.slice(0, MAX_ENTRIES);
  }

  try {
    fs.writeFileSync(CHECKS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('[checksStore] Failed to write checks.json:', error.message);
  }

  return entry;
}

/**
 * Clear all checks
 */
function clearChecks() {
  const data = { checks: [], maxEntries: MAX_ENTRIES };
  try {
    fs.writeFileSync(CHECKS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('[checksStore] Failed to clear checks.json:', error.message);
  }
  return data;
}

module.exports = { readChecks, addCheck, clearChecks, CHECKS_FILE, MAX_ENTRIES };
