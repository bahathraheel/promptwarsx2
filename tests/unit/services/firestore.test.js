/**
 * Firestore Service — Unit Tests (2 tests)
 */
const { getFirestore, getDocument, setDocument } = require('../../../src/services/firestore');

describe('Firestore Service', () => {
  beforeAll(() => { process.env.ENABLE_FIRESTORE = 'false'; });

  test('getFirestore returns null when disabled', () => {
    const db = getFirestore();
    expect(db).toBeNull();
  });

  test('getDocument returns null when Firestore is disabled', async () => {
    const doc = await getDocument('zones', 'welcome');
    expect(doc).toBeNull();
  });
});
