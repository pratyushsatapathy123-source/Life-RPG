const fs = require('fs');

let apiCode = fs.readFileSync('src/backend/routes/api.ts', 'utf-8');
apiCode = apiCode.replace(
  "const { goals, level, stats } = req.body;",
  "const { goals, level, stats, settings } = req.body;"
);
apiCode = apiCode.replace(
  "await generateQuests(goals || \"Improve my life\", level || 1, stats || {});",
  "await generateQuests(goals || \"Improve my life\", level || 1, stats || {}, settings || {});"
);
fs.writeFileSync('src/backend/routes/api.ts', apiCode);

let geminiCode = fs.readFileSync('src/backend/services/geminiService.ts', 'utf-8');
geminiCode = geminiCode.replace(
  "export const generateQuests = async (goals: string, currentLevel: number, userStats: any) => {",
  "export const generateQuests = async (goals: string, currentLevel: number, userStats: any, settings: any) => {"
);

const newPromptLogic = `
  const diffPref = settings?.preferences?.difficultyPreference || 'Balanced';
  const dailyLimit = parseInt(settings?.preferences?.dailyQuestLimit || '5');
  const amountToGen = Math.min(dailyLimit, 3); // Let's just generate a few, or use limit
  
  const prompt = \`As an AI Game Master for an RPG productivity app, generate \${amountToGen} quests for a level \${currentLevel} player whose goal is: "\${goals}". 
Their current stats are: \${JSON.stringify(userStats)}. 
Provide realistic, actionable quests. Difficulty preference: \${diffPref} (Scale: Easy, Medium, Hard, Epic).
Return exactly \${amountToGen} quests.\`;
`;

geminiCode = geminiCode.replace(
  /const prompt = `As an AI Game Master[\s\S]*?Epic\)\.`;/,
  newPromptLogic
);

fs.writeFileSync('src/backend/services/geminiService.ts', geminiCode);
