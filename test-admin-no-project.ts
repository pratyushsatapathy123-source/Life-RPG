import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = getApps().length === 0 ? initializeApp({ credential: applicationDefault() }) : getApps()[0];
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    console.log('Testing Firestore Admin...');
    const ref = db.collection('test_admin_auth').doc('test');
    await ref.set({ success: true, timestamp: new Date() });
    console.log('Successfully wrote to Firestore using Admin SDK!');
  } catch (error) {
    console.error('Firestore Admin Error:', error);
  }
}
run();
