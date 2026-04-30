/**
 * Google Cloud Firestore service for ELITE ELECTION.
 * Stores election data, user preferences, and analytics.
 */

let db = null;

function getFirestore() {
  if (process.env.ENABLE_FIRESTORE !== "true") return null;
  if (db) return db;

  try {
    const { Firestore } = require("@google-cloud/firestore");
    db = new Firestore({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
    return db;
  } catch (error) {
    console.warn("[Firestore] Service unavailable:", error.message);
    return null;
  }
}

async function getDocument(collection, docId) {
  const firestore = getFirestore();
  if (!firestore) return null;

  try {
    const doc = await firestore.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.warn("[Firestore] Read error:", error.message);
    return null;
  }
}

async function setDocument(collection, docId, data) {
  const firestore = getFirestore();
  if (!firestore) return false;

  try {
    await firestore
      .collection(collection)
      .doc(docId)
      .set(data, { merge: true });
    return true;
  } catch (error) {
    console.warn("[Firestore] Write error:", error.message);
    return false;
  }
}

async function queryCollection(collection, field, operator, value) {
  const firestore = getFirestore();
  if (!firestore) return [];

  try {
    const snapshot = await firestore
      .collection(collection)
      .where(field, operator, value)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("[Firestore] Query error:", error.message);
    return [];
  }
}

async function logAnalytics(event, data) {
  return setDocument("analytics", `${event}_${Date.now()}`, {
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getFirestore,
  getDocument,
  setDocument,
  queryCollection,
  logAnalytics,
};
