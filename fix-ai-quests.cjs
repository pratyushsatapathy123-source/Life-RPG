const fs = require('fs');

let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const aiLogic = `
  const handleGenerateAI = async () => {
    if (!user || !aiGoals) return;
    
    // Check if AI is disabled
    const aiEnabled = globalSettings?.ai?.enabled ?? true;
    if (!aiEnabled) {
      toast.error('AI Game Master is disabled in Settings.');
      return;
    }

    setGenerating(true);
    try {
      const token = await getToken();
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const statsDoc = await getDoc(doc(db, 'users', user.uid, 'stats', 'current'));
      
      const level = userDoc.data()?.level || 1;
      const stats = statsDoc.data() || {};
      
      const res = await fetch('/api/ai/generate-quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ 
          goals: aiGoals,
          level,
          stats,
          settings: globalSettings || {}
        })
      });
`;

if(!code.includes('globalSettings')) {
  code = code.replace(
    "const { user, getToken } = useAuth();",
    "const { user, getToken } = useAuth();\n  const { settings: globalSettings } = useQuests() as any; // Not right"
  );
  
  // Actually let's just use `useUser`
  code = code.replace(
    "import { useAuth } from '../contexts/AuthContext';",
    "import { useAuth } from '../contexts/AuthContext';\nimport { useUser } from '../hooks/useUser';"
  );
  
  code = code.replace(
    "const { user, getToken } = useAuth();",
    "const { user, getToken } = useAuth();\n  const { settings: globalSettings } = useUser() as any;"
  );
}

code = code.replace(
  /const handleGenerateAI = async \(\) => \{[\s\S]*?body: JSON\.stringify\(\{ \n\s*goals: aiGoals,\n\s*level,\n\s*stats\n\s*\}\)\n\s*\}\);/,
  aiLogic
);

fs.writeFileSync('src/pages/Quests.tsx', code);
