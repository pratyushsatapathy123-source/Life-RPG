const fs = require('fs');

let code = fs.readFileSync('src/pages/Rewards.tsx', 'utf-8');

const imports = `import { useState } from 'react';
import toast from 'react-hot-toast';
import { db, doc, collection, writeBatch, getDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';`;

code = code.replace("import { useUser }", imports + "\nimport { useUser }");

const compStart = "export function Rewards() {";
const handler = `
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (reward: any) => {
    if (!user) return;
    setPurchasing(reward.id);
    try {
      const { runTransaction } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error("User not found");
        const userData = userSnap.data();
        const currentCoins = userData.coins || 0;
        
        if (currentCoins < reward.cost) {
          throw new Error("Not enough gold!");
        }
        
        // Deduct coins
        transaction.update(userRef, {
          coins: currentCoins - reward.cost,
          updatedAt: new Date().toISOString()
        });
        
        // Create purchase record
        const purchaseRef = doc(collection(db, 'users', user.uid, 'purchases'));
        transaction.set(purchaseRef, {
          title: reward.title,
          cost: reward.cost,
          timestamp: new Date().toISOString()
        });
        
        // Activity record
        const activityRef = doc(collection(db, 'users', user.uid, 'activity'));
        transaction.set(activityRef, {
          type: 'reward_purchase',
          title: \`Purchased: \${reward.title}\`,
          cost: reward.cost,
          timestamp: new Date().toISOString()
        });
      });
      
      toast.success(\`Enjoy your \${reward.title}!\`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to purchase reward");
    }
    setPurchasing(null);
  };
`;

code = code.replace(compStart, compStart + handler);

code = code.replace(
  /<button\s+disabled=\{!canAfford\}/,
  `<button 
                    disabled={!canAfford || purchasing === reward.id}
                    onClick={() => handlePurchase(reward)}`
);

code = code.replace(
  /<ShoppingBag className="w-4 h-4" \/>\s*Purchase Reward/,
  `{purchasing === reward.id ? 'Purchasing...' : <><ShoppingBag className="w-4 h-4" /> Purchase Reward</>}`
);

fs.writeFileSync('src/pages/Rewards.tsx', code);
