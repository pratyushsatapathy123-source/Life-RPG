const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

const target = `        // Initialize user in firestore locally
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const uDoc = await getDoc(userRef);
          if (!uDoc.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              level: 1,
              xp: 0,
              xpToNextLevel: 100,
              coins: 0,
              currentStreak: 0,
              totalQuestsCompleted: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            const statsRef = doc(db, 'users', currentUser.uid, 'stats', 'current');
            await setDoc(statsRef, {
              strength: 5,
              intelligence: 5,
              discipline: 5,
              vitality: 5,
              wisdom: 5,
              charisma: 5
            });
            
            // Create a couple of default quests
            const q1Ref = doc(db, 'users', currentUser.uid, 'quests', 'default-1');
            await setDoc(q1Ref, {
              id: 'default-1',
              title: 'Complete your first quest',
              description: 'Get started by completing this introductory quest to earn your first XP and Coins!',
              category: 'General',
              difficulty: 'Easy',
              status: 'pending',
              xpReward: 25,
              coinReward: 5,
              estimatedMinutes: 5,
              relatedStat: 'discipline',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            const q2Ref = doc(db, 'users', currentUser.uid, 'quests', 'default-2');
            await setDoc(q2Ref, {
              id: 'default-2',
              title: 'Drink a glass of water',
              description: 'Hydration is key to maintaining high vitality and focus.',
              category: 'Health',
              difficulty: 'Easy',
              status: 'pending',
              xpReward: 25,
              coinReward: 5,
              estimatedMinutes: 2,
              relatedStat: 'vitality',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        } catch (e) {
          console.error("Failed to init user", e);
        }`;

const replacement = `        // Initialize user via secure backend
        try {
          const token = await currentUser.getIdToken();
          await fetch('/api/users/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify({ 
              name: currentUser.displayName, 
              email: currentUser.email 
            })
          });
        } catch (e) {
          console.error("Failed to init user via server", e);
        }`;

if (code.includes('const q2Ref = doc(db, \'users\', currentUser.uid, \'quests\', \'default-2\');')) {
  // It has q2 as well
  let targetRegex = /\/\/ Initialize user in firestore locally[\s\S]*?Failed to init user", e\);\s*\}/;
  code = code.replace(targetRegex, replacement);
}

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
