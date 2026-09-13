import { Outlet, Navigate, useLocation } from 'react-router-dom';
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
