import { Search, ChevronRight, LogOut, Coins, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Header({ isCollapsed, setIsMobileOpen }: any) {
  const location = useLocation();
  const { profile } = useUser();
  const { logout } = useAuth();
  
  const xp = profile?.xp || 0;
  const xpToNextLevel = profile?.xpToNextLevel || 100;
  const progressPercent = Math.min(100, Math.max(0, (xp / xpToNextLevel) * 100));
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Workspace';
      case '/quests': return 'Quests';
      case '/progress': return 'Your Progress';
      case '/achievements': return 'Achievements';
      case '/rewards': return 'Rewards';
      case '/analytics': return 'Analytics';
      case '/settings': return 'Settings';
      default: return 'Workspace';
    }
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-30 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ease-in-out",
      isCollapsed ? "md:left-20 left-0" : "md:left-64 left-0"
    )}>
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <button 
          onClick={() => setIsMobileOpen?.(true)}
          className="md:hidden p-1.5 -ml-1.5 mr-1 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline hover:text-zinc-900 cursor-pointer transition-colors">Overview</span>
        <ChevronRight className="hidden sm:inline w-4 h-4" />
        <span className="text-zinc-900 font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-500 text-sm border border-zinc-200/50">
          <Search className="w-4 h-4" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-zinc-200 shadow-sm ml-2 text-zinc-600">⌘K</kbd>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 rounded-full text-yellow-700 mr-2 border border-yellow-200">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono">{profile?.coins || 0}</span>
            </div>
            <div className="flex flex-col items-end leading-none">
              <span className="font-mono text-sm font-semibold text-zinc-900">{xp} / {xpToNextLevel} XP</span>
              <span className="text-[10px] text-zinc-500">Level {profile?.level || 1}</span>
            </div>
            <div className="w-16 h-2 bg-zinc-200 rounded-full overflow-hidden hidden sm:block">
              <div className="bg-amber-700 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          <button onClick={logout} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform hover:bg-zinc-200" title="Log out">
            <LogOut className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
