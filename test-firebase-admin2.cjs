const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();
db.collection('users').limit(1).get().then(snap => {
  console.log('Docs:', snap.size);
}).catch(console.error);
