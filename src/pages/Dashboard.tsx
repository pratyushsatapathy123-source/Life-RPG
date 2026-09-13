import { Play, TrendingUp, CheckCircle, Award, Plus, Coins, Zap, MoreHorizontal, ArrowRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useQuests } from '../hooks/useQuests';

const focusData = [
  { name: 'Mon', time: 120 },
  { name: 'Tue', time: 180 },
  { name: 'Wed', time: 150 },
  { name: 'Thu', time: 240 },
  { name: 'Fri', time: 210 },
  { name: 'Sat', time: 90 },
  { name: 'Sun', time: 300 },
];

export function Dashboard() {
  const { profile, stats } = useUser();
  const { quests } = useQuests();
  
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Pratyush';
  const activeQuests = quests.filter(q => q.status !== 'completed').slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back, {displayName}!</h1>
          <p className="text-sm text-zinc-500 mt-1">Level {profile?.level || 1} • {profile?.xp || 0} / {profile?.xpToNextLevel || 100} XP</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/quests" className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Quest
          </Link>
          <Link to="/progress" className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Play className="w-4 h-4 fill-white" />
            Start Focus
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Focus Time Today', value: `${Math.floor((profile?.totalFocusMinutes || 0) / 60)}h ${(profile?.totalFocusMinutes || 0) % 60}m`, change: '+12%', trend: 'up', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Quests Completed', value: profile?.totalQuestsCompleted || 0, change: '+4', trend: 'up', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Current Streak', value: `${profile?.currentStreak || 0} Days`, change: 'Personal best', trend: 'neutral', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Gold Balance', value: profile?.coins || 0, change: '+240 today', trend: 'up', icon: Coins, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 font-medium">{stat.label}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                <span className={cn(
                  "text-xs font-medium",
                  stat.trend === 'up' ? "text-emerald-600" : "text-zinc-500"
                )}>{stat.change}</span>
                <span className="text-xs text-zinc-400">from last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Quests */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900">Active Quests</h2>
              <Link to="/quests" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {activeQuests.length > 0 ? activeQuests.map((quest: any) => (
                <div key={quest.id} className="group p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm cursor-pointer hover:border-amber-500 transition-colors">
                        <CheckCircle className="w-5 h-5 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">{quest.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">{quest.category}</span>
                          <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                            <Award className="w-3 h-3" />
                            {quest.xpReward || 50} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all border border-transparent hover:border-zinc-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-zinc-500 w-8 text-right">0%</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-zinc-500">No active quests! Create one to earn XP.</div>
              )}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Focus Time</h2>
                <p className="text-sm text-zinc-500">Your deep work hours this week.</p>
              </div>
              <select className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 font-medium outline-none text-zinc-700">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e9', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                    itemStyle={{ color: '#09090b', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#d97706" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTime)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar / Right Column */}
        <div className="space-y-6">
          {/* Character Stats Preview */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Character Stats</h2>
            <div className="space-y-4">
              {[
                { label: 'Intelligence', val: stats?.intelligence || 5, color: 'bg-blue-500' },
                { label: 'Vitality', val: stats?.vitality || 5, color: 'bg-emerald-500' },
                { label: 'Wisdom', val: stats?.wisdom || 5, color: 'bg-purple-500' },
                { label: 'Discipline', val: stats?.discipline || 5, color: 'bg-amber-500' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-zinc-700">{stat.label}</span>
                    <span className="text-zinc-500 font-mono">{stat.val}/100</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                    <div className={cn("h-full rounded-full transition-all duration-1000 delay-300", stat.color)} style={{ width: `${Math.min((stat.val / 100) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900">Recent Unlocks</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Deep Worker', desc: '4 hours of uninterrupted focus', icon: Zap, bg: 'bg-amber-100', color: 'text-amber-600', time: '2h ago' },
                { title: 'Early Bird', desc: 'Completed a quest before 8 AM', icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600', time: '1d ago' },
                { title: 'Consistency Key', desc: 'Hit a 10 day streak', icon: Award, bg: 'bg-purple-100', color: 'text-purple-600', time: '2d ago' },
              ].map((achievement, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5", achievement.bg, achievement.color)}>
                    <achievement.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">{achievement.title}</h3>
                    <p className="text-xs text-zinc-500 leading-tight mt-0.5">{achievement.desc}</p>
                    <span className="text-[10px] text-zinc-400 font-medium mt-1 block">{achievement.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
