/**
 * Firestore Service — Extended Unit Tests
 */

describe('Firestore Service', () => {
  let firestore;

  beforeEach(() => {
    jest.resetModules();
    process.env.ENABLE_FIRESTORE = 'false';
    firestore = require('../../../src/services/firestore');
  });

  test('exports all functions', () => {
    expect(typeof firestore.getFirestore).toBe('function');
    expect(typeof firestore.getDocument).toBe('function');
    expect(typeof firestore.setDocument).toBe('function');
    expect(typeof firestore.queryCollection).toBe('function');
    expect(typeof firestore.logAnalytics).toBe('function');
  });

  test('getFirestore returns null when disabled', () => {
    expect(firestore.getFirestore()).toBeNull();
  });

  test('getDocument returns null when Firestore is disabled', async () => {
    const result = await firestore.getDocument('users', 'user1');
    expect(result).toBeNull();
  });

  test('setDocument returns false when Firestore is disabled', async () => {
    const result = await firestore.setDocument('users', 'user1', { name: 'test' });
    expect(result).toBe(false);
  });

  test('queryCollection returns empty array when Firestore is disabled', async () => {
    const result = await firestore.queryCollection('users', 'name', '==', 'test');
    expect(result).toEqual([]);
  });

  test('logAnalytics returns false when Firestore is disabled', async () => {
    const result = await firestore.logAnalytics('page_view', { page: '/home' });
    expect(result).toBe(false);
  });
});
