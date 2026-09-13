import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, Zap, Clock, TrendingUp } from 'lucide-react';

const weeklyData = [
  { name: 'Mon', xp: 200, tasks: 4 },
  { name: 'Tue', xp: 450, tasks: 7 },
  { name: 'Wed', xp: 300, tasks: 5 },
  { name: 'Thu', xp: 600, tasks: 9 },
  { name: 'Fri', xp: 400, tasks: 6 },
  { name: 'Sat', xp: 150, tasks: 2 },
  { name: 'Sun', xp: 800, tasks: 12 },
];

import { useUser } from '../hooks/useUser';
export function Analytics() {
  const { profile } = useUser();
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const quests = profile?.totalQuestsCompleted || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Deep dive into your productivity metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP Gained', value: xp.toString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Quests Completed', value: quests.toString(), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Focus Hours', value: '0h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Current Level', value: level.toString(), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">XP Gain This Week</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f7' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e9', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="xp" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Tasks Completed</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e9', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
                <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
