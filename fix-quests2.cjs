const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const calculateRewardsFn = `
const calculateRewards = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return { xp: 25, coins: 5 };
    case 'Medium': return { xp: 50, coins: 10 };
    case 'Hard': return { xp: 100, coins: 25 };
    case 'Epic': return { xp: 250, coins: 50 };
    default: return { xp: 25, coins: 5 };
  }
};
`;

code = code.replace(
  /const handleManualCreate = async \(e: React\.FormEvent\) => \{[\s\S]*?setGenerating\(false\);\n  \};/,
  calculateRewardsFn + `
  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuest.title) return;
    
    setGenerating(true);
    try {
      const { xp, coins } = calculateRewards(newQuest.difficulty || 'Easy');
      const newQuestRef = doc(collection(db, 'users', user.uid, 'quests'));
      
      await setDoc(newQuestRef, {
        id: newQuestRef.id,
        title: newQuest.title,
        description: newQuest.description || '',
        category: newQuest.category || 'General',
        difficulty: newQuest.difficulty || 'Easy',
        xpReward: xp,
        coinReward: coins,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setShowCreateModal(false);
      setNewQuest({ title: '', description: '', difficulty: 'Easy', category: 'General' });
      toast.success('Quest created!');
    } catch (e) {
      console.error(e);
      toast.error('Error creating quest. Please try again.');
    }
    setGenerating(false);
  };`
);

code = code.replace(
  /const res = await fetch\('\/api\/ai\/generate-quests'[\s\S]*?toast\.success\('Quests generated successfully!'\);/,
  `const res = await fetch('/api/ai/generate-quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ 
          goals: aiGoals,
          level,
          stats
        })
      });
      if (!res.ok) {
        throw new Error('Server error when generating quests');
      }
      
      const data = await res.json();
      const generatedQuests = data.quests || [];
      
      const batch = writeBatch(db);
      for (const q of generatedQuests) {
        let diff = q.difficulty || 'Easy';
        if (typeof diff === 'string') {
          diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
        }
        if (!['Easy', 'Medium', 'Hard', 'Epic'].includes(diff)) diff = 'Medium';
        
        const { xp, coins } = calculateRewards(diff);
        const newQuestRef = doc(collection(db, 'users', user.uid, 'quests'));
        batch.set(newQuestRef, {
          id: newQuestRef.id,
          title: q.title || 'Unknown Quest',
          description: q.description || '',
          category: q.category || 'General',
          difficulty: diff,
          estimatedMinutes: q.estimatedMinutes || 30,
          xpReward: xp,
          coinReward: coins,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();

      setShowAiModal(false);
      setAiGoals('Improve my general productivity and health');
      toast.success('Quests generated successfully!');`
);

code = code.replace(
  /const handleCompleteQuest = async \(questId: string\) => \{[\s\S]*?setCompleting\(false\);\n  \};/,
  `const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const quest = quests.find(q => q.id === questId);
      if (!quest) throw new Error("Quest not found");

      const batch = writeBatch(db);
      
      const questRef = doc(db, 'users', user.uid, 'quests', questId);
      batch.update(questRef, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });

      const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
      const statsDoc = await getDoc(statsRef);
      
      let newXp = (statsDoc.data()?.xp || 0) + (quest.xpReward || 0);
      let newCoins = (statsDoc.data()?.coins || 0) + (quest.coinReward || 0);
      
      batch.set(statsRef, {
        xp: newXp,
        coins: newCoins,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      await batch.commit();

      setSelectedQuest(null);
      toast.success('Quest completed! XP and Coins awarded.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to complete quest.');
    }
    setCompleting(false);
  };`
);

fs.writeFileSync('src/pages/Quests.tsx', code);
