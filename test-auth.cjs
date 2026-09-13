const { getAuth } = require('firebase-admin/auth');
const { initializeApp, applicationDefault } = require('firebase-admin/app');

const app = initializeApp({ projectId: 'silver-audio-26shk', credential: applicationDefault() });
console.log("App initialized");
// We can't easily get a valid client token here without a frontend, but we can verify if the method exists and can be called.
