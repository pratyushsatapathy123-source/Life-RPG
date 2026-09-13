import { Coins, ShoppingBag, Plus, Gift, Coffee, Gamepad2, Ticket, Heart, Lock } from 'lucide-react';

const REWARDS = [
  { id: '1', title: 'Guilt-free Gaming', description: '2 hours of gaming without feeling bad about it.', cost: 300, icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: '2', title: 'Special Dinner', description: 'Order food from your favorite restaurant.', cost: 800, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  { id: '3', title: 'Movie Night', description: 'Watch a movie with some popcorn.', cost: 500, icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: '4', title: 'Fancy Coffee', description: 'Buy a nice coffee from that expensive cafe.', cost: 150, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: '5', title: 'Buy New Book', description: 'Purchase that book sitting in your wishlist.', cost: 1200, icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

import { useState } from 'react';
import toast from 'react-hot-toast';
import { db, doc, collection, writeBatch, getDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useUser';
export function Rewards() {
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
          title: `Purchased: ${reward.title}`,
          cost: reward.cost,
          timestamp: new Date().toISOString()
        });
      });
      
      toast.success(`Enjoy your ${reward.title}!`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to purchase reward");
    }
    setPurchasing(null);
  };

  const { profile } = useUser();
  const currentGold = profile?.coins || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Rewards & Shop</h1>
          <p className="text-sm text-zinc-500 mt-1">Spend your hard-earned gold on real-life rewards.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-yellow-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Coins className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Available Gold</div>
              <div className="text-lg font-bold text-zinc-900 leading-tight">{currentGold}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Reward
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REWARDS.map((reward) => {
          const Icon = reward.icon;
          const canAfford = currentGold >= reward.cost;
          
          return (
            <div 
              key={reward.id} 
              className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col hover:border-amber-200 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reward.bg} ${reward.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200 text-yellow-700 font-bold text-sm">
                  <Coins className="w-4 h-4" />
                  {reward.cost}
                </div>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{reward.title}</h3>
                <p className="text-sm text-zinc-500 mb-6">{reward.description}</p>
                
                <div className="mt-auto">
                  <button 
                    disabled={!canAfford || purchasing === reward.id}
                    onClick={() => handlePurchase(reward)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all shadow-sm
                      ${canAfford 
                        ? "bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white" 
                        : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"}`}
                  >
                    {canAfford ? (
                      <>
                        {purchasing === reward.id ? 'Purchasing...' : <><ShoppingBag className="w-4 h-4" /> Purchase Reward</>}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Need {reward.cost - currentGold} more gold
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
