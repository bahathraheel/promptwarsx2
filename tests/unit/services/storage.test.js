/**
 * Cloud Storage Service — Unit Tests
 */

describe('Cloud Storage Service', () => {
  let storage;

  beforeEach(() => {
    jest.resetModules();
    storage = require('../../../src/services/storage');
  });

  test('exports uploadBuffer and downloadFile functions', () => {
    expect(typeof storage.uploadBuffer).toBe('function');
    expect(typeof storage.downloadFile).toBe('function');
  });

  test('uploadBuffer returns fallback when storage is unavailable', async () => {
    const result = await storage.uploadBuffer('test-bucket', 'test.txt', Buffer.from('hello'));
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
    expect(result.url).toBeNull();
  }, 30000);

  test('downloadFile returns null data when storage is unavailable', async () => {
    const result = await storage.downloadFile('test-bucket', 'test.txt');
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
  }, 30000);
});
