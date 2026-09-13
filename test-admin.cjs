const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp({ projectId: config.projectId, credential: applicationDefault() });
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const snap = await db.collection('users').limit(1).get();
    console.log("Success, found docs:", snap.size);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
