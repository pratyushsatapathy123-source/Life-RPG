const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

code = code.replace(
  /\/\/ Initialize user locally[\s\S]*?console\.error\("Failed to init user", e\);\n        \}/,
  `// Initialize user locally
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            try {
              await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || 'New User',
                avatarUrl: currentUser.photoURL || '',
                level: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            } catch (e) { console.error("Failed to set userDoc", e); }
            
            try {
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
            } catch (e) { console.error("Failed to set stats", e); }
            
            try {
              await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'preferences'), {
                preferredDifficulty: 'Medium',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dailyAvailableMinutes: 60,
                onboardingCompleted: false
              });
            } catch (e) { console.error("Failed to set preferences", e); }
          }
        } catch (e) {
          console.error("Failed to get userDoc", e);
        }`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
