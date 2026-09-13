const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const newCompleteFn = `
  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const { runTransaction } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const questRef = doc(db, 'users', user.uid, 'quests', questId);
        const userRef = doc(db, 'users', user.uid);
        const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
        
        const [questDoc, userDoc, statsDoc] = await Promise.all([
          transaction.get(questRef),
          transaction.get(userRef),
          transaction.get(statsRef)
        ]);
        
        if (!questDoc.exists()) throw new Error("Quest not found");
        const questData = questDoc.data();
        if (questData.status === 'completed') {
          throw new Error("Quest already completed"); // prevents double click
        }
        
        // Backend logic calculate progression securely based on stored quest
        const diff = questData.difficulty || 'Easy';
        let xpReward = 25, coinReward = 5;
        if (diff === 'Medium') { xpReward = 50; coinReward = 10; }
        if (diff === 'Hard') { xpReward = 100; coinReward = 25; }
        if (diff === 'Epic') { xpReward = 250; coinReward = 50; }
        
        const userData = userDoc.data() || {};
        const statsData = statsDoc.data() || {};
        
        let currentXp = (userData.xp || 0) + xpReward;
        let coins = (userData.coins || 0) + coinReward;
        let level = userData.level || 1;
        let xpToNextLevel = userData.xpToNextLevel || 100;
        let totalQuestsCompleted = (userData.totalQuestsCompleted || 0) + 1;
        
        // Level up securely without resetting XP incorrectly
        let leveledUp = false;
        while (currentXp >= xpToNextLevel) {
          currentXp -= xpToNextLevel;
          level += 1;
          xpToNextLevel = Math.floor(xpToNextLevel * 1.2);
          leveledUp = true;
        }
        
        // Calculate Streak based on actual dates
        let currentStreak = userData.currentStreak || 0;
        let bestStreak = userData.bestStreak || 0;
        const now = new Date();
        const todayString = now.toISOString().split('T')[0];
        const lastActivityDate = userData.lastActivityDate || '';
        
        if (lastActivityDate !== todayString) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          if (lastActivityDate === yesterdayString) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
          if (currentStreak > bestStreak) bestStreak = currentStreak;
        }
        
        // Stats increase
        const cat = questData.category || 'General';
        let intelligence = statsData.intelligence || 1;
        let strength = statsData.strength || 1;
        let discipline = statsData.discipline || 1;
        let wisdom = statsData.wisdom || 1;
        let charisma = statsData.charisma || 1;
        
        if (cat === 'Study') intelligence += 2;
        else if (cat === 'Fitness') strength += 2;
        else if (cat === 'Habit' || cat === 'Productivity') discipline += 1;
        else if (cat === 'Meditation' || cat === 'Wellness') wisdom += 1;
        else if (cat === 'Social' || cat === 'Communication') charisma += 1;
        else discipline += 1;
        
        // Create activity record
        const newActivityRef = doc(collection(db, 'users', user.uid, 'activity'));
        transaction.set(newActivityRef, {
          type: leveledUp ? 'level_up' : 'quest_completed',
          title: leveledUp ? \`Reached Level \${level}!\` : \`Completed: \${questData.title}\`,
          xpEarned: xpReward,
          coinsEarned: coinReward,
          timestamp: now.toISOString()
        });
        
        // Commit writes
        transaction.update(questRef, {
          status: 'completed',
          updatedAt: now.toISOString(),
          completedAt: now.toISOString()
        });
        
        transaction.update(userRef, {
          xp: currentXp,
          coins,
          level,
          xpToNextLevel,
          totalQuestsCompleted,
          currentStreak,
          bestStreak,
          lastActivityDate: todayString,
          updatedAt: now.toISOString()
        });
        
        transaction.update(statsRef, {
          intelligence,
          strength,
          discipline,
          wisdom,
          charisma,
          updatedAt: now.toISOString()
        });
      });
      
      setSelectedQuest(null);
      toast.success('Quest completed! Progression securely updated.');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to complete quest.');
    }
    setCompleting(false);
  };
`;

code = code.replace(
  /const handleCompleteQuest = async \(questId: string\) => \{[\s\S]*?setCompleting\(false\);\n  \};/,
  newCompleteFn
);

fs.writeFileSync('src/pages/Quests.tsx', code);
