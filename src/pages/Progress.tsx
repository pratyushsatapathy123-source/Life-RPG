import { User, Shield, Zap, Brain, Heart, Star, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const statsData = [
  { subject: 'Intelligence', A: 78, fullMark: 100 },
  { subject: 'Endurance', A: 65, fullMark: 100 },
  { subject: 'Creativity', A: 82, fullMark: 100 },
  { subject: 'Discipline', A: 90, fullMark: 100 },
  { subject: 'Agility', A: 45, fullMark: 100 },
  { subject: 'Charisma', A: 60, fullMark: 100 },
];

const xpHistory = [
  { day: 'Mon', xp: 200 },
  { day: 'Tue', xp: 450 },
  { day: 'Wed', xp: 300 },
  { day: 'Thu', xp: 600 },
  { day: 'Fri', xp: 400 },
  { day: 'Sat', xp: 150 },
  { day: 'Sun', xp: 800 },
];

import { useUser } from '../hooks/useUser';
export function Progress() {
  const { profile, stats } = useUser();
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Player';
  const currentXp = profile?.xp || 0;
  const xpToNextLevel = profile?.xpToNextLevel || 100;
  const level = profile?.level || 1;
  const streak = profile?.currentStreak || 0;
  const questsCompleted = profile?.totalQuestsCompleted || 0;

  const realStatsData = [
    { subject: 'Intelligence', A: stats?.intelligence || 5, fullMark: 100 },
    { subject: 'Vitality', A: stats?.vitality || 5, fullMark: 100 },
    { subject: 'Wisdom', A: stats?.wisdom || 5, fullMark: 100 },
    { subject: 'Discipline', A: stats?.discipline || 5, fullMark: 100 },
    { subject: 'Charisma', A: stats?.charisma || 5, fullMark: 100 },
    { subject: 'Strength', A: stats?.strength || 5, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Your Progress</h1>
        <p className="text-sm text-zinc-500 mt-1">Track your character's growth and skill development.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-4 border-white shadow-lg shadow-zinc-200/50 shrink-0">
            <span className="text-6xl font-black text-amber-500 tracking-tighter">{displayName[0].toUpperCase()}</span>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{displayName}</h2>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-200/50">
                    Tier II Craftsman
                  </span>
                </div>
                <p className="text-zinc-500 font-medium">Software Engineer • Level {level}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center justify-center bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200/60 min-w-[80px]">
                  <span className="text-2xl font-bold text-zinc-900">{streak}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Day Streak</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200/60 min-w-[80px]">
                  <span className="text-2xl font-bold text-zinc-900">{questsCompleted}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Quests</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-zinc-700">Level {level}</span>
                <span className="font-bold text-amber-600">Level {level + 1}</span>
              </div>
              <div className="h-4 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative" style={{ width: `${Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100))}%` }}>
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                <span>{currentXp} XP</span>
                <span>{xpToNextLevel} XP Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart for Stats */}
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-500" />
            Attribute Distribution
          </h3>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={realStatsData}>
                <PolarGrid stroke="#e4e4e9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Attributes" dataKey="A" stroke="#d97706" strokeWidth={2} fill="#fef3c7" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Stats Bars */}
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Core Attributes
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Intelligence', val: stats?.intelligence || 5, color: 'from-blue-500 to-blue-400', bg: 'bg-blue-100', icon: Brain },
              { label: 'Discipline', val: stats?.discipline || 5, color: 'from-amber-500 to-amber-400', bg: 'bg-amber-100', icon: Shield },
              { label: 'Wisdom', val: stats?.wisdom || 5, color: 'from-purple-500 to-purple-400', bg: 'bg-purple-100', icon: Sparkles },
              { label: 'Vitality', val: stats?.vitality || 5, color: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-100', icon: Zap },
              { label: 'Charisma', val: stats?.charisma || 5, color: 'from-rose-500 to-rose-400', bg: 'bg-rose-100', icon: Heart },
              { label: 'Strength', val: stats?.strength || 5, color: 'from-cyan-500 to-cyan-400', bg: 'bg-cyan-100', icon: Star },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-3.5 h-3.5", stat.color.replace('from-', 'text-').split(' ')[0])} />
                    </div>
                    <span className="font-bold text-zinc-700">{stat.label}</span>
                  </div>
                  <span className="text-zinc-500 font-mono font-medium">{stat.val}/100</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                  <div className={cn("h-full rounded-full bg-gradient-to-r", stat.color)} style={{ width: `${stat.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* XP History Chart */}
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6 lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              XP History
            </h3>
            <select className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 font-medium outline-none text-zinc-700">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }} 
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
                  dataKey="xp" 
                  stroke="#d97706" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorXp)" 
                  activeDot={{ r: 6, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
