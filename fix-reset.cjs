const fs = require('fs');

let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const resetLogic = `
      // Reset User Profile
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        level: 1,
        xpToNextLevel: 100,
        xp: 0,
        coins: 0,
        totalQuestsCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Delete stats and recreate
      const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
      await setDoc(statsRef, {
`;

settings = settings.replace(
  /\/\/ Delete stats and recreate[\s\S]*?const statsRef = doc\(db, 'users', user\.uid, 'stats', 'current'\);\n\s*await setDoc\(statsRef, \{/,
  resetLogic
);

fs.writeFileSync('src/pages/Settings.tsx', settings);
