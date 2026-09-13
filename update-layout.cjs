const fs = require('fs');

const appLayout = `import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 flex relative">
      
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <Header isCollapsed={isCollapsed} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 w-full pt-16 px-4 sm:px-8 py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`;

const sidebar = `import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { Menu, Home, CheckCircle, TrendingUp, Award, Gift, BarChart2, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: any) {
  const location = useLocation();
  const { profile } = useUser();
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Player';
  const initial = displayName.charAt(0).toUpperCase();
  const level = profile?.level || 1;
  const streak = profile?.currentStreak || 0;

  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/quests', label: 'Quests', icon: CheckCircle },
    { to: '/progress', label: 'Progress & Character', icon: TrendingUp },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/rewards', label: 'Rewards & Shop', icon: Gift },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/activity', label: 'Activity', icon: Clock },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-zinc-200 z-50 flex flex-col justify-between select-none transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64",
      isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className={cn(
          "h-16 flex items-center border-b border-zinc-200 transition-all duration-300 shrink-0",
          isCollapsed ? "px-3 justify-center gap-2" : "px-4 gap-3"
        )}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0 p-1.5 -ml-1 rounded-md hover:bg-zinc-100 text-zinc-500 hidden md:flex transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-8 h-8 shrink-0 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-500 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.12 6.4-6.05-4.06a2.49 2.49 0 0 0-2.14 0L6.88 6.4A2.5 2.5 0 0 0 5.5 8.5v7a2.5 2.5 0 0 0 1.38 2.1l6.05 4.06c.65.44 1.49.44 2.14 0l6.05-4.06A2.5 2.5 0 0 0 22.5 15.5v-7a2.5 2.5 0 0 0-1.38-2.1z"></path>
              <path d="M12 22V12"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 12 7.5 9.5"></path>
              <path d="m12 12 4.5-2.5"></path>
            </svg>
          </div>
          
          <span className={cn(
            "font-bold text-lg text-zinc-900 tracking-tight whitespace-nowrap transition-all duration-300",
            isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
          )}>
            Life RPG
          </span>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileOpen?.(false)}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm transition-colors relative group",
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2 gap-3",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900")} />
                
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                )}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn(
         "border-t border-zinc-200 bg-white shrink-0 transition-all duration-300",
         isCollapsed ? "p-3" : "p-4"
      )}>
        <Link 
          to="/settings#account" 
          onClick={() => setIsMobileOpen?.(false)}
          className={cn(
            "flex items-center rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200/60 overflow-hidden",
            isCollapsed ? "p-2 justify-center" : "p-2 justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 rounded-full bg-amber-700 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
              {initial}
            </div>
            
            <div className={cn(
              "flex flex-col whitespace-nowrap transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
            )}>
              <span className="text-sm font-semibold text-zinc-900 leading-tight truncate max-w-[100px]">{displayName}</span>
              <span className="text-xs text-zinc-500">Level {level}</span>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 transition-all duration-300",
            isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
          )}>
            <span className="text-[10px] font-mono text-amber-800 font-semibold flex items-center gap-1" title="Current Streak">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
              {streak}d
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
`;

const header = `import { Search, ChevronRight, LogOut, Coins, Menu } from 'lucide-react';
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
              <div className="bg-amber-700 h-full rounded-full transition-all duration-1000" style={{ width: \`\${progressPercent}%\` }}></div>
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
`;

fs.writeFileSync('src/components/layout/AppLayout.tsx', appLayout);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);
fs.writeFileSync('src/components/layout/Header.tsx', header);

