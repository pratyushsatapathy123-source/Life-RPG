import { Lock, Unlock, Zap, Brain, Shield, Star, Clock, Heart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACHIEVEMENTS = [
  { id: '1', title: 'Deep Worker', description: 'Complete 100 hours of focused work.', icon: Zap, tier: 'gold', unlocked: true, date: 'Oct 12, 2023', progress: 100 },
  { id: '2', title: 'Consistency King', description: 'Maintain a 30-day streak.', icon: Clock, tier: 'platinum', unlocked: false, progress: 40 },
  { id: '3', title: 'Master Strategist', description: 'Complete 50 Epic quests.', icon: Brain, tier: 'silver', unlocked: true, date: 'Nov 5, 2023', progress: 100 },
  { id: '4', title: 'Early Bird', description: 'Complete a quest before 6 AM 10 times.', icon: Star, tier: 'bronze', unlocked: true, date: 'Sep 28, 2023', progress: 100 },
  { id: '5', title: 'Iron Will', description: 'Never miss a daily quest for a week.', icon: Shield, tier: 'silver', unlocked: false, progress: 85 },
  { id: '6', title: 'Balanced Life', description: 'Complete quests in 5 different categories in one day.', icon: Heart, tier: 'gold', unlocked: false, progress: 20 },
];

const tierStyles = {
  bronze: 'from-orange-400 to-orange-600 shadow-orange-500/20 text-orange-900 border-orange-300',
  silver: 'from-slate-300 to-slate-400 shadow-slate-500/20 text-slate-900 border-slate-300',
  gold: 'from-yellow-400 to-yellow-500 shadow-yellow-500/30 text-yellow-900 border-yellow-300',
  platinum: 'from-cyan-300 to-blue-400 shadow-cyan-500/30 text-cyan-900 border-cyan-300',
};

import { useUser } from '../hooks/useUser';

export function Achievements() {
  const { profile, achievements } = useUser() as any;
  const questsCount = profile?.totalQuestsCompleted || 0;
  const currentStreak = profile?.currentStreak || 0;
  const level = profile?.level || 1;
  
  const ACHIEVEMENTS_DYNAMIC = [
    { id: 'first_quest', title: 'First Quest', description: 'Complete your first quest.', icon: Zap, tier: 'bronze', unlocked: !!achievements?.['first_quest'], date: achievements?.['first_quest']?.unlockedAt, progress: questsCount >= 1 ? 100 : 0 },
    { id: '7_day_warrior', title: '7 Day Warrior', description: 'Maintain a 7-day streak.', icon: Clock, tier: 'silver', unlocked: !!achievements?.['7_day_warrior'], date: achievements?.['7_day_warrior']?.unlockedAt, progress: Math.min(100, (currentStreak / 7) * 100) },
    { id: 'level_10', title: 'Level 10', description: 'Reach Level 10.', icon: Star, tier: 'gold', unlocked: !!achievements?.['level_10'], date: achievements?.['level_10']?.unlockedAt, progress: Math.min(100, (level / 10) * 100) },
    { id: 'master_strategist', title: 'Master Strategist', description: 'Complete 50 quests.', icon: Brain, tier: 'platinum', unlocked: !!achievements?.['master_strategist'], date: achievements?.['master_strategist']?.unlockedAt, progress: Math.min(100, (questsCount / 50) * 100) },
  ];
  
  const unlockedCount = ACHIEVEMENTS_DYNAMIC.filter(a => a.unlocked).length;
  const totalCount = ACHIEVEMENTS_DYNAMIC.length;

  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Achievements</h1>
          <p className="text-sm text-zinc-500 mt-1">Unlock epic badges by pushing your limits.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-zinc-200/60 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900">{unlockedCount} / {totalCount} Unlocked</div>
            <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(unlockedCount/totalCount)*100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS_DYNAMIC.map((achievement) => {
          const Icon = achievement.icon;
          
          return (
            <div 
              key={achievement.id} 
              className={cn(
                "relative bg-white p-6 rounded-2xl border transition-all duration-300",
                achievement.unlocked 
                  ? "border-zinc-200/60 shadow-sm hover:shadow-md hover:border-amber-200 hover:-translate-y-1" 
                  : "border-zinc-200/40 shadow-sm bg-zinc-50/50 opacity-80"
              )}
            >
              {!achievement.unlocked && (
                <div className="absolute top-4 right-4 text-zinc-300">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110",
                  achievement.unlocked 
                    ? `bg-gradient-to-br border-2 shadow-lg ${tierStyles[achievement.tier as keyof typeof tierStyles]}` 
                    : "bg-zinc-100 border-2 border-zinc-200 text-zinc-400"
                )}>
                  <Icon className={cn("w-10 h-10", achievement.unlocked ? "drop-shadow-sm" : "")} />
                </div>
                
                <h3 className={cn(
                  "text-lg font-bold mb-1",
                  achievement.unlocked ? "text-zinc-900" : "text-zinc-500"
                )}>
                  {achievement.title}
                </h3>
                
                <p className="text-sm text-zinc-500 mb-6 h-10">
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <Unlock className="w-3.5 h-3.5" />
                    Unlocked {new Date(achievement.date).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between text-xs font-medium text-zinc-500 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
