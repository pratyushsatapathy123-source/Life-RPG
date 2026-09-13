const fs = require('fs');

let firebaseLib = fs.readFileSync('src/lib/firebase.ts', 'utf-8');
firebaseLib = firebaseLib.replace(
  /query,\s*where\s*};/,
  'query, where, writeBatch, getDocs };'
);
// Also remove the duplicate writeBatch, getDocs in the import statement
firebaseLib = firebaseLib.replace(
  /, writeBatch, getDocs, writeBatch, getDocs/g,
  ', writeBatch, getDocs'
);
fs.writeFileSync('src/lib/firebase.ts', firebaseLib);
