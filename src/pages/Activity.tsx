import { Clock } from 'lucide-react';

export function Activity() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Activity History</h1>
          <p className="text-sm text-zinc-500 mt-1">Review your past actions and completed quests.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Clock className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Coming Soon</h3>
          <p className="text-sm text-zinc-500">The activity history feature is under development.</p>
        </div>
      </div>
    </div>
  );
}
