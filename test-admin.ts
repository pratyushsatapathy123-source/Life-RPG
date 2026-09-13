import { db } from './src/backend/firebaseAdmin';

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
