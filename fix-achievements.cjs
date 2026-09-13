const fs = require('fs');

let playerCtx = fs.readFileSync('src/contexts/PlayerContext.tsx', 'utf-8');

if (!playerCtx.includes('achievements')) {
  playerCtx = playerCtx.replace(
    /stats:\s*any;\s*loading:\s*boolean;/,
    "stats: any;\n  achievements: any;\n  loading: boolean;"
  );
  
  playerCtx = playerCtx.replace(
    /const \[stats, setStats\] = useState<any>\(null\);/,
    "const [stats, setStats] = useState<any>(null);\n  const [achievements, setAchievements] = useState<any>({});"
  );
  
  playerCtx = playerCtx.replace(
    "setStats(null);",
    "setStats(null);\n      setAchievements({});"
  );
  
  playerCtx = playerCtx.replace(
    /const unsubStats = onSnapshot\(doc\(db, 'users', user\.uid, 'stats', 'current'\), \(docSnap\) => \{[\s\S]*?\}\);/,
    `const unsubStats = onSnapshot(doc(db, 'users', user.uid, 'stats', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setStats({ id: docSnap.id, ...docSnap.data() });
      }
    });
    
    const unsubAchievements = onSnapshot(doc(db, 'users', user.uid, 'achievements', 'unlocked'), (docSnap) => {
      if (docSnap.exists()) {
        setAchievements(docSnap.data());
      }
      setLoading(false);
    });`
  );
  
  playerCtx = playerCtx.replace(
    /unsubStats\(\);\s*\}\);/,
    "unsubStats();\n      unsubAchievements();\n    };\n  }, [user]);"
  );
  
  playerCtx = playerCtx.replace(
    /value=\{\{ profile, stats, loading \}\}/,
    "value={{ profile, stats, achievements, loading }}"
  );

  fs.writeFileSync('src/contexts/PlayerContext.tsx', playerCtx);
}

// 2. Now let's update Quests.tsx to add achievement logic inside the transaction.
let quests = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const achievementLogic = `
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
        
        // Check Achievements
        const achievementsRef = doc(db, 'users', user.uid, 'achievements', 'unlocked');
        const achievementsDoc = await transaction.get(achievementsRef);
        const achievementsData = achievementsDoc.exists() ? achievementsDoc.data() : {};
        
        let unlockedNew = false;
        if (!achievementsData['first_quest']) {
          achievementsData['first_quest'] = { unlockedAt: now.toISOString(), title: 'First Quest' };
          unlockedNew = true;
        }
        if (currentStreak >= 7 && !achievementsData['7_day_warrior']) {
          achievementsData['7_day_warrior'] = { unlockedAt: now.toISOString(), title: '7 Day Warrior' };
          unlockedNew = true;
        }
        if (level >= 10 && !achievementsData['level_10']) {
          achievementsData['level_10'] = { unlockedAt: now.toISOString(), title: 'Level 10' };
          unlockedNew = true;
        }
        if (totalQuestsCompleted >= 50 && !achievementsData['master_strategist']) {
          achievementsData['master_strategist'] = { unlockedAt: now.toISOString(), title: 'Master Strategist' };
          unlockedNew = true;
        }
        
        if (unlockedNew) {
           transaction.set(achievementsRef, achievementsData, { merge: true });
        }
`;

quests = quests.replace(
  /\/\/ Stats increase[\s\S]*?else discipline \+= 1;/,
  achievementLogic
);

fs.writeFileSync('src/pages/Quests.tsx', quests);

// 3. Let's update Achievements.tsx to use this unlocked map.
let achievementsPage = fs.readFileSync('src/pages/Achievements.tsx', 'utf-8');

const dynamicAchievements = `
export function Achievements() {
  const { profile, achievements } = useUser() as any;
  const questsCount = profile?.totalQuestsCompleted || 0;
  const currentStreak = profile?.currentStreak || 0;
  const level = profile?.level || 1;
  
  const ACHIEVEMENTS_DYNAMIC = [
    { id: 'first_quest', title: 'First Quest', description: 'Complete your first quest.', icon: Zap, tier: 'bronze', unlocked: !!achievements?.['first_quest'], date: achievements?.['first_quest']?.unlockedAt, progress: questsCount >= 1 ? 100 : 0 },
    { id: '7_day_warrior', title: '7 Day Warrior', description: 'Maintain a 7-day streak.', icon: Clock, tier: 'silver', unlocked: !!achievements?.['7_day_warrior'], date: achievements?.['7_day_warrior']?.unlockedAt, progress: Math.min(100, (currentStreak / 7) * 100) },
    { id: 'level_10', title: 'Level 10', description: 'Reach Level 10.', icon: Star, tier: 'gold', unlocked: !!achievements?.['level_10'], date: achievements?.['level_10']?.unlockedAt, progress: Math.min(100, (level / 10) * 100) },
    { id: 'master_strategist', title: 'Master Strategist', description: 'Complete 50 quests.', icon: Brain, tier: 'platinum', unlocked: !!achievements?.['master_strategist'], date: achievements?.['master_strategist']?.unlockedAt, progress: Math.min(100, (questsCount / 50) * 100) },
  ];
  
  const unlockedCount = ACHIEVEMENTS_DYNAMIC.filter(a => a.unlocked).length;
  const totalCount = ACHIEVEMENTS_DYNAMIC.length;
`;

achievementsPage = achievementsPage.replace(
  /export function Achievements\(\) \{[\s\S]*?const totalCount = ACHIEVEMENTS_DYNAMIC\.length;/,
  dynamicAchievements
);

// fix formatting of date
achievementsPage = achievementsPage.replace(
  /Unlocked \{achievement\.date\}/,
  "Unlocked {new Date(achievement.date).toLocaleDateString()}"
);

fs.writeFileSync('src/pages/Achievements.tsx', achievementsPage);

