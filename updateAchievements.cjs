const fs = require('fs');
let code = fs.readFileSync('src/pages/Achievements.tsx', 'utf-8');

const target = `export function Achievements() {
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;`;

const replacement = `import { useUser } from '../hooks/useUser';
export function Achievements() {
  const { profile } = useUser();
  const questsCount = profile?.totalQuestsCompleted || 0;
  
  const ACHIEVEMENTS_DYNAMIC = ACHIEVEMENTS.map(a => {
     if (a.id === '3') return { ...a, unlocked: questsCount >= 50, progress: Math.min(100, (questsCount / 50) * 100) };
     if (a.id === '1') return { ...a, unlocked: questsCount >= 20, progress: Math.min(100, (questsCount / 20) * 100) };
     return a;
  });

  const unlockedCount = ACHIEVEMENTS_DYNAMIC.filter(a => a.unlocked).length;`;

code = code.replace(target, replacement);
code = code.replace(/ACHIEVEMENTS\.length/g, 'ACHIEVEMENTS_DYNAMIC.length');
code = code.replace(/ACHIEVEMENTS\.map/g, 'ACHIEVEMENTS_DYNAMIC.map');

fs.writeFileSync('src/pages/Achievements.tsx', code);
