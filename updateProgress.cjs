const fs = require('fs');
let code = fs.readFileSync('src/pages/Progress.tsx', 'utf-8');

// Replace top logic
const topTarget = `export function Progress() {
  return (`;
const topReplacement = `import { useUser } from '../hooks/useUser';
export function Progress() {
  const { profile, stats } = useUser();
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Player';
  const currentXp = profile?.xp || 0;
  const xpToNextLevel = profile?.xpToNextLevel || 100;
  const level = profile?.level || 1;
  const streak = profile?.currentStreak || 0;
  const questsCompleted = profile?.totalQuestsCompleted || 0;

  const realStatsData = [
    { subject: 'Intelligence', A: stats?.intelligence || 5, fullMark: 100 },
    { subject: 'Vitality', A: stats?.vitality || 5, fullMark: 100 },
    { subject: 'Wisdom', A: stats?.wisdom || 5, fullMark: 100 },
    { subject: 'Discipline', A: stats?.discipline || 5, fullMark: 100 },
    { subject: 'Charisma', A: stats?.charisma || 5, fullMark: 100 },
    { subject: 'Strength', A: stats?.strength || 5, fullMark: 100 },
  ];

  return (`

code = code.replace(topTarget, topReplacement);

// Replace hardcoded "Pratyush"
code = code.replace('<h2 className="text-3xl font-black text-zinc-900 tracking-tight">Pratyush</h2>', '<h2 className="text-3xl font-black text-zinc-900 tracking-tight">{displayName}</h2>');
code = code.replace('<span className="text-6xl font-black text-amber-500 tracking-tighter">P</span>', '<span className="text-6xl font-black text-amber-500 tracking-tighter">{displayName[0].toUpperCase()}</span>');

code = code.replace('<span className="text-2xl font-bold text-zinc-900">12</span>', '<span className="text-2xl font-bold text-zinc-900">{streak}</span>');
code = code.replace('<span className="text-2xl font-bold text-zinc-900">42</span>', '<span className="text-2xl font-bold text-zinc-900">{questsCompleted}</span>');

code = code.replace('<p className="text-zinc-500 font-medium">Software Engineer • Level 8</p>', '<p className="text-zinc-500 font-medium">Software Engineer • Level {level}</p>');
code = code.replace('<span className="font-bold text-zinc-700">Level 8</span>', '<span className="font-bold text-zinc-700">Level {level}</span>');
code = code.replace('<span className="font-bold text-amber-600">Level 9</span>', '<span className="font-bold text-amber-600">Level {level + 1}</span>');
code = code.replace(/<div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full w-\[81%\] relative">/, '<div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative" style={{ width: `${Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100))}%` }}>');
code = code.replace('<span>2,450 XP</span>', '<span>{currentXp} XP</span>');
code = code.replace('<span>3,000 XP Total</span>', '<span>{xpToNextLevel} XP Total</span>');

code = code.replace('data={statsData}', 'data={realStatsData}');

// Replace detailed stats mapping
const statsMapTarget = `{[
              { label: 'Intelligence', val: 78, color: 'from-blue-500 to-blue-400', bg: 'bg-blue-100', icon: Brain },
              { label: 'Discipline', val: 90, color: 'from-amber-500 to-amber-400', bg: 'bg-amber-100', icon: Shield },
              { label: 'Creativity', val: 82, color: 'from-purple-500 to-purple-400', bg: 'bg-purple-100', icon: Sparkles },
              { label: 'Endurance', val: 65, color: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-100', icon: Zap },
              { label: 'Charisma', val: 60, color: 'from-rose-500 to-rose-400', bg: 'bg-rose-100', icon: Heart },
              { label: 'Agility', val: 45, color: 'from-cyan-500 to-cyan-400', bg: 'bg-cyan-100', icon: Star },
            ].map`;
const statsMapReplacement = `{[
              { label: 'Intelligence', val: stats?.intelligence || 5, color: 'from-blue-500 to-blue-400', bg: 'bg-blue-100', icon: Brain },
              { label: 'Discipline', val: stats?.discipline || 5, color: 'from-amber-500 to-amber-400', bg: 'bg-amber-100', icon: Shield },
              { label: 'Wisdom', val: stats?.wisdom || 5, color: 'from-purple-500 to-purple-400', bg: 'bg-purple-100', icon: Sparkles },
              { label: 'Vitality', val: stats?.vitality || 5, color: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-100', icon: Zap },
              { label: 'Charisma', val: stats?.charisma || 5, color: 'from-rose-500 to-rose-400', bg: 'bg-rose-100', icon: Heart },
              { label: 'Strength', val: stats?.strength || 5, color: 'from-cyan-500 to-cyan-400', bg: 'bg-cyan-100', icon: Star },
            ].map`;
code = code.replace(statsMapTarget, statsMapReplacement);

fs.writeFileSync('src/pages/Progress.tsx', code);
