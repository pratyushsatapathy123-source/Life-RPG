import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, Plus, ChevronDown, CheckCircle, Clock, Award, Shield, AlertTriangle, Play, MoreHorizontal, Coins, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuests } from '../hooks/useQuests';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useUser';
import { db, collection, doc, setDoc, getDoc, writeBatch } from '../lib/firebase';

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-blue-600 bg-blue-50 border-blue-200',
  Hard: 'text-purple-600 bg-purple-50 border-purple-200',
  Epic: 'text-amber-600 bg-amber-50 border-amber-200',
};

const difficultyIcons: Record<string, any> = {
  Easy: Shield,
  Medium: Clock,
  Hard: AlertTriangle,
  Epic: Award,
};

export function Quests() {
  const { quests, loading: questsLoading } = useQuests();
  const { user, getToken } = useAuth();
  const { settings: globalSettings } = useUser() as any;
  
  const [activeTab, setActiveTab] = useState('Active');
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', difficulty: 'Easy', category: 'General' });

  const filteredQuests = quests.filter(q => 
    activeTab === 'Active' ? q.status !== 'completed' : q.status === 'completed'
  );

  
const calculateRewards = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return { xp: 25, coins: 5 };
    case 'Medium': return { xp: 50, coins: 10 };
    case 'Hard': return { xp: 100, coins: 25 };
    case 'Epic': return { xp: 250, coins: 50 };
    default: return { xp: 25, coins: 5 };
  }
};

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuest.title) return;
    
    setGenerating(true);
    try {
      const { xp, coins } = calculateRewards(newQuest.difficulty || 'Easy');
      const newQuestRef = doc(collection(db, 'users', user.uid, 'quests'));
      
      await setDoc(newQuestRef, {
        id: newQuestRef.id,
        title: newQuest.title,
        description: newQuest.description || '',
        category: newQuest.category || 'General',
        difficulty: newQuest.difficulty || 'Easy',
        xpReward: xp,
        coinReward: coins,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setShowCreateModal(false);
      setNewQuest({ title: '', description: '', difficulty: 'Easy', category: 'General' });
      toast.success('Quest created!');
    } catch (e) {
      console.error(e);
      toast.error('Error creating quest. Please try again.');
    }
    setGenerating(false);
  };

  const [aiGoals, setAiGoals] = useState('Improve my general productivity and health');
  const [showAiModal, setShowAiModal] = useState(false);

  
  const handleGenerateAI = async () => {
    if (!user || !aiGoals) return;
    
    // Check if AI is disabled
    const aiEnabled = globalSettings?.ai?.enabled ?? true;
    if (!aiEnabled) {
      toast.error('AI Game Master is disabled in Settings.');
      return;
    }

    setGenerating(true);
    try {
      const token = await getToken();
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const statsDoc = await getDoc(doc(db, 'users', user.uid, 'stats', 'current'));
      
      const level = userDoc.data()?.level || 1;
      const stats = statsDoc.data() || {};
      
      const res = await fetch('/api/ai/generate-quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          goals: aiGoals,
          level,
          stats,
          settings: globalSettings || {}
        })
      });

      if (!res.ok) {
        throw new Error('Server error when generating quests');
      }
      
      const data = await res.json();
      const generatedQuests = data.quests || [];
      
      const batch = writeBatch(db);
      for (const q of generatedQuests) {
        let diff = q.difficulty || 'Easy';
        if (typeof diff === 'string') {
          diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
        }
        if (!['Easy', 'Medium', 'Hard', 'Epic'].includes(diff)) diff = 'Medium';
        
        const { xp, coins } = calculateRewards(diff);
        const newQuestRef = doc(collection(db, 'users', user.uid, 'quests'));
        batch.set(newQuestRef, {
          id: newQuestRef.id,
          title: q.title || 'Unknown Quest',
          description: q.description || '',
          category: q.category || 'General',
          difficulty: diff,
          estimatedMinutes: q.estimatedMinutes || 30,
          xpReward: xp,
          coinReward: coins,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();

      setShowAiModal(false);
      setAiGoals('Improve my general productivity and health');
      toast.success('Quests generated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate quests. Please try again.');
    }
    setGenerating(false);
  };

  
  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const { runTransaction } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const questRef = doc(db, 'users', user.uid, 'quests', questId);
        const userRef = doc(db, 'users', user.uid);
        const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
        
        const [questDoc, userDoc, statsDoc] = await Promise.all([
          transaction.get(questRef),
          transaction.get(userRef),
          transaction.get(statsRef)
        ]);
        
        if (!questDoc.exists()) throw new Error("Quest not found");
        const questData = questDoc.data();
        if (questData.status === 'completed') {
          throw new Error("Quest already completed"); // prevents double click
        }
        
        // Backend logic calculate progression securely based on stored quest
        const diff = questData.difficulty || 'Easy';
        let xpReward = 25, coinReward = 5;
        if (diff === 'Medium') { xpReward = 50; coinReward = 10; }
        if (diff === 'Hard') { xpReward = 100; coinReward = 25; }
        if (diff === 'Epic') { xpReward = 250; coinReward = 50; }
        
        const userData = userDoc.data() || {};
        const statsData = statsDoc.data() || {};
        
        let currentXp = (userData.xp || 0) + xpReward;
        let coins = (userData.coins || 0) + coinReward;
        let level = userData.level || 1;
        let xpToNextLevel = userData.xpToNextLevel || 100;
        let totalQuestsCompleted = (userData.totalQuestsCompleted || 0) + 1;
        
        // Level up securely without resetting XP incorrectly
        let leveledUp = false;
        while (currentXp >= xpToNextLevel) {
          currentXp -= xpToNextLevel;
          level += 1;
          xpToNextLevel = Math.floor(xpToNextLevel * 1.2);
          leveledUp = true;
        }
        
        // Calculate Streak based on actual dates
        let currentStreak = userData.currentStreak || 0;
        let bestStreak = userData.bestStreak || 0;
        const now = new Date();
        const todayString = now.toISOString().split('T')[0];
        const lastActivityDate = userData.lastActivityDate || '';
        
        if (lastActivityDate !== todayString) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          if (lastActivityDate === yesterdayString) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
          if (currentStreak > bestStreak) bestStreak = currentStreak;
        }
        
        
        // Stats increase
        const cat = questData.category || 'General';
        let intelligence = statsData.intelligence || 1;
        let strength = statsData.strength || 1;
        let discipline = statsData.discipline || 1;
        let wisdom = statsData.wisdom || 1;
        let charisma = statsData.charisma || 1;
        
        if (cat === 'Study') intelligence += 2;
        else if (cat === 'Fitness') strength += 2;
        else if (cat === 'Habit' || cat === 'Productivity') discipline += 1;
        else if (cat === 'Meditation' || cat === 'Wellness') wisdom += 1;
        else if (cat === 'Social' || cat === 'Communication') charisma += 1;
        else discipline += 1;
        
        // Check Achievements
        const achievementsRef = doc(db, 'users', user.uid, 'achievements', 'unlocked');
        const achievementsDoc = await transaction.get(achievementsRef);
        const achievementsData = achievementsDoc.exists() ? achievementsDoc.data() : {};
        
        let unlockedNew = false;
        if (!achievementsData['first_quest']) {
          achievementsData['first_quest'] = { unlockedAt: now.toISOString(), title: 'First Quest' };
          unlockedNew = true;
        }
        if (currentStreak >= 7 && !achievementsData['7_day_warrior']) {
          achievementsData['7_day_warrior'] = { unlockedAt: now.toISOString(), title: '7 Day Warrior' };
          unlockedNew = true;
        }
        if (level >= 10 && !achievementsData['level_10']) {
          achievementsData['level_10'] = { unlockedAt: now.toISOString(), title: 'Level 10' };
          unlockedNew = true;
        }
        if (totalQuestsCompleted >= 50 && !achievementsData['master_strategist']) {
          achievementsData['master_strategist'] = { unlockedAt: now.toISOString(), title: 'Master Strategist' };
          unlockedNew = true;
        }
        
        if (unlockedNew) {
           transaction.set(achievementsRef, achievementsData, { merge: true });
        }

        
        // Create activity record
        const newActivityRef = doc(collection(db, 'users', user.uid, 'activity'));
        transaction.set(newActivityRef, {
          type: leveledUp ? 'level_up' : 'quest_completed',
          title: leveledUp ? `Reached Level ${level}!` : `Completed: ${questData.title}`,
          xpEarned: xpReward,
          coinsEarned: coinReward,
          timestamp: now.toISOString()
        });
        
        // Commit writes
        transaction.update(questRef, {
          status: 'completed',
          updatedAt: now.toISOString(),
          completedAt: now.toISOString()
        });
        
        transaction.update(userRef, {
          xp: currentXp,
          coins,
          level,
          xpToNextLevel,
          totalQuestsCompleted,
          currentStreak,
          bestStreak,
          lastActivityDate: todayString,
          updatedAt: now.toISOString()
        });
        
        transaction.update(statsRef, {
          intelligence,
          strength,
          discipline,
          wisdom,
          charisma,
          updatedAt: now.toISOString()
        });
      });
      
      setSelectedQuest(null);
      toast.success('Quest completed! Progression securely updated.');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to complete quest.');
    }
    setCompleting(false);
  };


  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Quest Log</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your tasks, missions, and epic goals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateAI}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Generate
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Quest
          </button>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Generate Quests with AI</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">What are your goals today?</label>
                  <textarea value={aiGoals} onChange={e => setAiGoals(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-indigo-500 resize-none h-20" placeholder="E.g., I want to study DSA for 2 hours today." />
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 mt-6">
                  <button type="button" onClick={() => setShowAiModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors" disabled={generating}>Cancel</button>
                  <button onClick={handleGenerateAI} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? 'Generating...' : 'Generate Quests'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Create Custom Quest</h2>
              <form onSubmit={handleManualCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
                  <input required type="text" value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-amber-500" placeholder="E.g., Read 20 pages" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <textarea value={newQuest.description} onChange={e => setNewQuest({...newQuest, description: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-amber-500 resize-none h-20" placeholder="Optional details..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Difficulty</label>
                    <select value={newQuest.difficulty} onChange={e => setNewQuest({...newQuest, difficulty: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-amber-500">
                      <option value="Easy">Easy (25 XP)</option>
                      <option value="Medium">Medium (50 XP)</option>
                      <option value="Hard">Hard (100 XP)</option>
                      <option value="Epic">Epic (250 XP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                    <input type="text" value={newQuest.category} onChange={e => setNewQuest({...newQuest, category: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 mt-6">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Cancel</button>
                  <button type="submit" disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
  {generating ? 'Creating...' : 'Create Quest'}
</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 bg-zinc-100/80 rounded-lg border border-zinc-200/50">
          {['Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedQuest(null); }}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Quest List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-10">
          {questsLoading ? (
            <div className="text-center py-10 text-zinc-500">Loading quests...</div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">No quests found. Generate some with AI!</div>
          ) : (
            filteredQuests.map((quest) => {
              const DiffIcon = difficultyIcons[quest.difficulty] || Shield;
              const isSelected = selectedQuest?.id === quest.id;
              const isCompleted = quest.status === 'completed';
              
              return (
                <div 
                  key={quest.id} 
                  onClick={() => setSelectedQuest(quest)}
                  className={cn(
                    "p-5 rounded-xl border transition-all cursor-pointer group",
                    isSelected 
                      ? "bg-amber-50/30 border-amber-300 shadow-sm" 
                      : "bg-white border-zinc-200/60 shadow-sm hover:border-amber-200 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <button className={cn(
                        "mt-1 w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0",
                        isCompleted
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "border-zinc-300 text-transparent hover:border-amber-400"
                      )}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <div>
                        <h3 className={cn(
                          "font-bold text-lg mb-1 transition-colors",
                          isCompleted ? "text-zinc-400 line-through" : "text-zinc-900"
                        )}>{quest.title}</h3>
                        <p className="text-sm text-zinc-500 line-clamp-1">{quest.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0",
                      difficultyColors[quest.difficulty] || difficultyColors.Medium
                    )}>
                      <DiffIcon className="w-3.5 h-3.5" />
                      {quest.difficulty || 'Medium'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pl-10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-zinc-500">
                        {quest.category || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50 text-xs">
                        <Award className="w-3 h-3" />
                        {quest.xpReward || 50} XP
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quest Details Sidebar */}
        {selectedQuest && (
          <div className="w-[400px] shrink-0 bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-zinc-100 relative">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    difficultyColors[selectedQuest.difficulty] || difficultyColors.Medium
                  )}>
                    {selectedQuest.difficulty || 'Medium'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider">
                  {selectedQuest.category || 'General'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 leading-tight pr-8">{selectedQuest.title}</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">{selectedQuest.description}</p>
              
              <div className="flex items-center gap-4 mt-6 p-3 bg-zinc-50 rounded-lg border border-zinc-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">XP Reward</div>
                    <div className="text-sm font-bold text-zinc-900">+{selectedQuest.xpReward || 50}</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-zinc-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-200">
                    <Coins className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Gold</div>
                    <div className="text-sm font-bold text-zinc-900">+{selectedQuest.coinReward || 10}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Optional subtasks can go here */}
            </div>

            {selectedQuest.status !== 'completed' && (
              <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-2">
                <button 
                  disabled={completing}
                  onClick={() => handleCompleteQuest(selectedQuest.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Complete Quest
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
