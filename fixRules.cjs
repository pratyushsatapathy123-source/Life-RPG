const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const target = `      match /profile/preferences {
        allow get: if isSignedIn() && request.auth.uid == userId && isValidId(userId);
        allow create, update: if isSignedIn() && request.auth.uid == userId && isValidId(userId)
                              && isValidUserPreferences(incoming());
      }`;

const replacement = `      match /profile/preferences {
        allow get: if isSignedIn() && request.auth.uid == userId && isValidId(userId);
        allow create, update: if isSignedIn() && request.auth.uid == userId && isValidId(userId)
                              && isValidUserPreferences(incoming());
      }
      match /settings/{settingId} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }`;

rules = rules.replace(target, replacement);
fs.writeFileSync('firestore.rules', rules);
