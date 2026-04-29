/**
 * Cloud Tasks Service — Unit Tests
 */

describe('Cloud Tasks Service', () => {
  let cloudTasks;

  beforeEach(() => {
    jest.resetModules();
    cloudTasks = require('../../../src/services/cloudTasks');
  });

  test('createTask is a function', () => {
    expect(typeof cloudTasks.createTask).toBe('function');
  });

  test('createTask returns result with fallback when service unavailable', async () => {
    // Cloud Tasks will fail because we have no GCP project configured
    const result = await cloudTasks.createTask('test-queue', { action: 'test' });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    // Without GCP credentials, it should return a fallback
    expect(result.fallback).toBe(true);
    expect(result.success).toBe(false);
  });

  test('createTask handles delay parameter', async () => {
    const result = await cloudTasks.createTask('test-queue', { action: 'delayed' }, 30);
    expect(result).toBeDefined();
    expect(result.fallback).toBe(true);
  });
});
