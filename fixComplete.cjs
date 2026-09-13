const fs = require('fs');
let code = fs.readFileSync('src/backend/routes/api.ts', 'utf-8');

const completeRegex = /router\.post\('\/quests\/:questId\/complete', async \(req: AuthenticatedRequest, res\) => \{[\s\S]*?\}\);/;

const replacement = `router.post('/quests/:questId/complete', async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const { questId } = req.params;
  
  try {
    const questRef = db.collection('users').doc(uid).collection('quests').doc(questId);
    const userRef = db.collection('users').doc(uid);
    const statsRef = db.collection('users').doc(uid).collection('stats').doc('current');
    
    await db.runTransaction(async (t) => {
      const qDoc = await t.get(questRef);
      if (!qDoc.exists) throw new Error('Quest not found');
      const qData = qDoc.data();
      if (qData?.status === 'completed') throw new Error('Quest already completed');
      
      const xpReward = qData?.xpReward || 50;
      const coinReward = qData?.coinReward || 10;
      const stat = qData?.relatedStat || 'discipline';
      
      const uDoc = await t.get(userRef);
      const sDoc = await t.get(statsRef);
      
      const uData = uDoc.data() || {};
      const sData = sDoc.data() || {};
      
      const currentXp = uData.xp || 0;
      const currentLevel = uData.level || 1;
      const currentCoins = uData.coins || 0;
      const currentQuestsCompleted = uData.totalQuestsCompleted || 0;
      const currentStreak = uData.currentStreak || 0;
      
      let newXp = currentXp + xpReward;
      let newLevel = currentLevel;
      let xpToNextLevel = currentLevel * 100;
      
      if (newXp >= xpToNextLevel) {
        newLevel += 1;
        newXp -= xpToNextLevel;
        xpToNextLevel = newLevel * 100;
      }
      
      const currentStat = sData[stat] || 5;
      
      t.set(questRef, { status: 'completed', completedAt: new Date() }, { merge: true });
      t.set(userRef, {
        xp: newXp,
        level: newLevel,
        xpToNextLevel,
        coins: currentCoins + coinReward,
        totalQuestsCompleted: currentQuestsCompleted + 1,
        // Simple streak logic for now: increment streak by 1 for this demonstration
        currentStreak: currentStreak + 1
      }, { merge: true });
      
      t.set(statsRef, {
        [stat]: currentStat + 1
      }, { merge: true });

      // Create activity record
      const activityRef = db.collection('users').doc(uid).collection('activity').doc();
      t.set(activityRef, {
        id: activityRef.id,
        type: 'quest_completed',
        questId: questId,
        questTitle: qData?.title || 'Unknown Quest',
        xpGained: xpReward,
        coinsGained: coinReward,
        createdAt: new Date()
      });
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});`;

code = code.replace(completeRegex, replacement);
fs.writeFileSync('src/backend/routes/api.ts', code);
