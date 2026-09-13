import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, onSnapshot } from '../lib/firebase';

interface PlayerContextType {
  profile: any;
  stats: any;
  achievements: any;
  settings: any;
  loading: boolean;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setStats(null);
      setAchievements({});
      setSettings({});
      setLoading(false);
      return;
    }

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      }
    });

    const unsubStats = onSnapshot(doc(db, 'users', user.uid, 'stats', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setStats({ id: docSnap.id, ...docSnap.data() });
      }
    });
    
    const unsubAchievements = onSnapshot(doc(db, 'users', user.uid, 'achievements', 'unlocked'), (docSnap) => {
      if (docSnap.exists()) {
        setAchievements(docSnap.data());
      }
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, 'users', user.uid, 'settings', 'preferences'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setSettings({});
      }
    });

    return () => {
      unsubProfile();
      unsubStats();
      unsubAchievements();
      unsubSettings();
    };
  }, [user]);

  useEffect(() => {
    if (settings?.appearance) {
      const { theme, reduceAnimations } = settings.appearance;
      if (theme === 'Dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'Light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           document.documentElement.classList.add('dark');
        } else {
           document.documentElement.classList.remove('dark');
        }
      }
      
      if (reduceAnimations) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, [settings?.appearance]);

  return (
    <PlayerContext.Provider value={{ profile, stats, achievements, settings, loading }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
