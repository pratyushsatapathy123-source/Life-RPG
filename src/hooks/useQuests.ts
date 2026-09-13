import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, onSnapshot } from '../lib/firebase';

export function useQuests() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'quests'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const qList: any[] = [];
      snapshot.forEach(doc => {
        qList.push({ id: doc.id, ...doc.data() });
      });
      setQuests(qList);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { quests, loading };
}
