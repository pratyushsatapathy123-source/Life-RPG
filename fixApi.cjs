const fs = require('fs');
let code = fs.readFileSync('src/backend/routes/api.ts', 'utf-8');

const aiGenRegex = /router\.post\('\/ai\/generate-quests', async \(req: AuthenticatedRequest, res\) => \{[\s\S]*?\}\);/;

const newEndpoints = `const calculateRewards = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return { xp: 25, coins: 5 };
    case 'Medium': return { xp: 50, coins: 10 };
    case 'Hard': return { xp: 100, coins: 25 };
    case 'Epic': return { xp: 250, coins: 50 };
    default: return { xp: 25, coins: 5 }; // default to easy
  }
};

router.post('/quests/create', async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  try {
    const { title, description, difficulty, category } = req.body;
    
    if (!title || typeof title !== 'string') throw new Error('Invalid title');
    
    const { xp, coins } = calculateRewards(difficulty || 'Easy');
    
    const newQuestRef = db.collection('users').doc(uid).collection('quests').doc();
    
    const questData = {
      id: newQuestRef.id,
      title,
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'Easy',
      xpReward: xp,
      coinReward: coins,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      relatedStat: 'discipline'
    };
    
    await newQuestRef.set(questData);
    
    res.json({ success: true, quest: questData });
  } catch (error: any) {
    console.error("Create Quest Error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/ai/generate-quests', async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  try {
    const { goals, level, stats } = req.body;
    const generatedQuests = await generateQuests(goals || "Improve my life", level || 1, stats || {});
    
    const batch = db.batch();
    const savedQuests: any[] = [];
    
    for (const q of generatedQuests) {
      // Clean difficulty (ensure capitalization matches)
      let diff = q.difficulty || 'Easy';
      if (typeof diff === 'string') {
        diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      }
      if (!['Easy', 'Medium', 'Hard', 'Epic'].includes(diff)) {
        diff = 'Medium';
      }
      
      const { xp, coins } = calculateRewards(diff);
      
      const newQuestRef = db.collection('users').doc(uid).collection('quests').doc();
      const questData = {
        id: newQuestRef.id,
        title: q.title || 'Unknown Quest',
        description: q.description || '',
        category: q.category || 'General',
        difficulty: diff,
        estimatedMinutes: q.estimatedMinutes || 30,
        xpReward: xp,
        coinReward: coins,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        relatedStat: q.relatedStat || 'intelligence'
      };
      
      batch.set(newQuestRef, questData);
      savedQuests.push(questData);
    }
    
    await batch.commit();
    
    res.json({ success: true, quests: savedQuests });
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});`;

code = code.replace(aiGenRegex, newEndpoints);
fs.writeFileSync('src/backend/routes/api.ts', code);
