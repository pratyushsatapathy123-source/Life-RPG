const fs = require('fs');

const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    
    function isSignedIn() {
      return request.auth != null && request.auth.uid != null;
    }

    match /users/{userId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }
    }
    
    match /rewards/{rewardId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /achievements/{achievementId} {
      allow read: if isSignedIn();
      allow write: if false;
    }
  }
}
`;

fs.writeFileSync('firestore.rules', rules);
