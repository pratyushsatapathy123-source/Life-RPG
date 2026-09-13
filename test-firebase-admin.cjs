const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
db.collection('users').limit(1).get().then(snap => {
  console.log('Docs:', snap.size);
}).catch(console.error);
