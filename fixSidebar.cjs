const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');

const target = `<div className="p-4 border-t border-zinc-200 bg-white">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 leading-tight">Pratyush</span>
              <span className="text-xs text-zinc-500">Level 8</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <span className="text-[10px] font-mono text-amber-800 font-semibold flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
              12d
            </span>
          </div>
        </div>
      </div>`;

if(code.includes(target)) {
    const importReplacement = `import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';`;
    code = code.replace(`import { Link, useLocation } from 'react-router-dom';`, importReplacement);

    const funcReplacement = `export function Sidebar() {
  const location = useLocation();
  const { profile } = useUser();
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Player';
  const initial = displayName.charAt(0).toUpperCase();
  const level = profile?.level || 1;
  const streak = profile?.currentStreak || 0;`;
    
    code = code.replace(`export function Sidebar() {\n  const location = useLocation();`, funcReplacement);

    const newUI = `<div className="p-4 border-t border-zinc-200 bg-white">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 leading-tight">{displayName}</span>
              <span className="text-xs text-zinc-500">Level {level}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <span className="text-[10px] font-mono text-amber-800 font-semibold flex items-center gap-1" title="Current Streak">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
              {streak}d
            </span>
          </div>
        </div>
      </div>`;
      
      code = code.replace(target, newUI);
      fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
}
