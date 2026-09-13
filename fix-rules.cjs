const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

// For /users/{userId}
code = code.replace(
  /allow update: if isSignedIn\(\) && request\.auth\.uid == userId && isValidId\(userId\)\s*&&\s*isValidUser\(incoming\(\)\)\s*&&\s*incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly\(\['name', 'avatarUrl'\]\);/,
  `allow create, update: if isSignedIn() && request.auth.uid == userId && isValidId(userId) && isValidUser(incoming());`
);

// For /stats/current
code = code.replace(
  /match \/stats\/current \{\s*allow get: if isSignedIn\(\) && request\.auth\.uid == userId && isValidId\(userId\);\s*allow write: if false; \/\/ Server-only\s*\}/,
  `match /stats/current {\n        allow read, write: if isSignedIn() && request.auth.uid == userId && isValidId(userId);\n      }`
);

// For /quests/{questId}
code = code.replace(
  /allow update: if isSignedIn\(\) && request\.auth\.uid == userId && isValidId\(userId\) && isValidId\(questId\)\s*&&\s*isValidQuest\(incoming\(\)\)\s*&&\s*existing\(\)\.status != 'completed'\s*&&\s*!incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasAny\(\['xpReward', 'coinReward', 'status', 'completedAt'\]\);/,
  `allow update: if isSignedIn() && request.auth.uid == userId && isValidId(userId) && isValidId(questId) && isValidQuest(incoming());`
);

fs.writeFileSync('firestore.rules', code);
