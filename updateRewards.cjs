const fs = require('fs');
let code = fs.readFileSync('src/pages/Rewards.tsx', 'utf-8');

const target = `export function Rewards() {
  const currentGold = 1240;`;

const replacement = `import { useUser } from '../hooks/useUser';
export function Rewards() {
  const { profile } = useUser();
  const currentGold = profile?.coins || 0;`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Rewards.tsx', code);
