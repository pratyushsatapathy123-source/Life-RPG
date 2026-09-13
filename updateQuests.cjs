const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const target = `  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const questRef = doc(db, 'users', user.uid, 'quests', questId);
      const userRef = doc(db, 'users', user.uid);
      const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
      
      const qDoc = await getDoc(questRef);
      if(!qDoc.exists()) throw new Error('Quest not found');
      const qData = qDoc.data();

      const xpReward = qData.xpReward || 50;
      const coinReward = qData.coinReward || 10;
      const stat = qData.relatedStat || 'discipline';

      const uDoc = await getDoc(userRef);
      const sDoc = await getDoc(statsRef);
      
      const currentXp = uDoc.data()?.xp || 0;
      const currentLevel = uDoc.data()?.level || 1;
      const currentCoins = uDoc.data()?.coins || 0;
      const currentQuestsCompleted = uDoc.data()?.totalQuestsCompleted || 0;
      
      let newXp = currentXp + xpReward;
      let newLevel = currentLevel;
      let xpToNextLevel = currentLevel * 100;
      
      if (newXp >= xpToNextLevel) { 
         newLevel += 1; 
         newXp -= xpToNextLevel; 
         xpToNextLevel = newLevel * 100;
      }
      
      const currentStat = sDoc.data()?.[stat] || 5;

      await setDoc(questRef, { status: 'completed', completedAt: new Date() }, { merge: true });
      await setDoc(userRef, { 
        xp: newXp, 
        level: newLevel, 
        xpToNextLevel, 
        coins: currentCoins + coinReward,
        totalQuestsCompleted: currentQuestsCompleted + 1
      }, { merge: true });
      
      await setDoc(statsRef, {
        [stat]: currentStat + 1
      }, { merge: true });
      
      setSelectedQuest(null);
    } catch (e) {
      console.error(e);
    }
    setCompleting(false);
  };`;

const replacement = `  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const token = await getToken();
      const res = await fetch(\`/api/quests/\${questId}/complete\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!res.ok) throw new Error('Server error when completing quest');
      setSelectedQuest(null);
    } catch (e) {
      console.error(e);
    }
    setCompleting(false);
  };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Quests.tsx', code);
