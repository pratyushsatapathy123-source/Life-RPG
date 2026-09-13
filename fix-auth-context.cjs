const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

code = code.replace(
  /\/\/ Initialize user via secure backend[\s\S]*?console\.error\("Failed to init user via server", e\);\n        \}/,
  `// Initialize user locally
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || 'New User',
              avatarUrl: currentUser.photoURL || '',
              level: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            await setDoc(doc(db, 'users', currentUser.uid, 'stats', 'current'), {
              xp: 0,
              coins: 0,
              strength: 1,
              intelligence: 1,
              discipline: 1,
              creativity: 1,
              health: 1,
              updatedAt: new Date().toISOString()
            });
            await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'preferences'), {
              preferredDifficulty: 'Medium',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              dailyAvailableMinutes: 60,
              onboardingCompleted: false
            });
          }
        } catch (e) {
          console.error("Failed to init user", e);
        }`
);

if (!code.includes('setDoc')) {
  code = code.replace(/import \{ doc, getDoc \} from 'firebase\/firestore';/,
    "import { doc, getDoc, setDoc } from 'firebase/firestore';");
}

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
