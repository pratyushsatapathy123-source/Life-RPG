const fs = require('fs');
let code = fs.readFileSync('src/pages/Analytics.tsx', 'utf-8');

const target = `export function Analytics() {
  return (`;

const replacement = `import { useUser } from '../hooks/useUser';
export function Analytics() {
  const { profile } = useUser();
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const quests = profile?.totalQuestsCompleted || 0;

  return (`;

code = code.replace(target, replacement);

const statMapTarget = `{[
          { label: 'Total XP Gained', value: '24,500', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Quests Completed', value: '142', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Focus Hours', value: '184h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Current Level', value: '8', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map`;

const statMapReplacement = `{[
          { label: 'Total XP Gained', value: xp.toString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Quests Completed', value: quests.toString(), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Focus Hours', value: '0h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Current Level', value: level.toString(), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map`;

code = code.replace(statMapTarget, statMapReplacement);
fs.writeFileSync('src/pages/Analytics.tsx', code);
