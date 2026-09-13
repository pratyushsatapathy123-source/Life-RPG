const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp({ projectId: config.projectId });
const db = getFirestore(app, config.firestoreDatabaseId);

db.collection('users').limit(1).get().then(snap => {
  console.log('Docs:', snap.size);
}).catch(console.error);
