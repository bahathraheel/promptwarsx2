/**
 * Cloud Monitoring Service — Unit Tests
 */

describe('Cloud Monitoring Service', () => {
  let monitoring;

  beforeEach(() => {
    jest.resetModules();
    monitoring = require('../../../src/services/monitoring');
  });

  test('exports writeMetric function', () => {
    expect(typeof monitoring.writeMetric).toBe('function');
  });

  test('writeMetric returns result when service unavailable', async () => {
    const result = await monitoring.writeMetric('test_metric', 42, { env: 'test' });
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  }, 30000);

  test('writeMetric handles missing labels', async () => {
    const result = await monitoring.writeMetric('latency', 100);
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  }, 30000);
});
