const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  /allow create, update: if isSignedIn\(\) && request\.auth\.uid == userId && isValidId\(userId\)\s*&&\s*isValidUserPreferences\(incoming\(\)\);/,
  `allow create, update: if isSignedIn() && request.auth.uid == userId;`
);

fs.writeFileSync('firestore.rules', code);
