import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  signOut,
  db,
  doc,
  getDoc,
  setDoc
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
                // Initialize user locally
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            try {
              await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || 'New User',
                avatarUrl: currentUser.photoURL || '',
                level: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            } catch (e) { console.error("Failed to set userDoc", e); }
            
            try {
              await setDoc(doc(db, 'users', currentUser.uid, 'stats', 'current'), {
                xp: 0,
                coins: 0,
                strength: 1,
                intelligence: 1,
                discipline: 1,
                creativity: 1,
                health: 1,
                updatedAt: new Date().toISOString()
              });
            } catch (e) { console.error("Failed to set stats", e); }
            
            try {
              await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'preferences'), {
                preferredDifficulty: 'Medium',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dailyAvailableMinutes: 60,
                onboardingCompleted: false
              });
            } catch (e) { console.error("Failed to set preferences", e); }
          }
        } catch (e) {
          console.error("Failed to get userDoc", e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
