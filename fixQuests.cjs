const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

// The active filter is: activeTab === 'Active' ? q.status !== 'completed' : q.status === 'completed'
// Which is fine for 'active' / 'pending'. The backend uses 'active'.
// But we need to update handleManualCreate and handleGenerateAI

const manualTarget = /const handleManualCreate = async \(e: React.FormEvent\) => \{[\s\S]*?\}\;/;
const manualReplacement = `const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuest.title) return;
    
    setGenerating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/quests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(newQuest)
      });
      if (!res.ok) throw new Error('Failed to create quest');
      setShowCreateModal(false);
      setNewQuest({ title: '', description: '', difficulty: 'Easy', category: 'General' });
    } catch (e) {
      console.error(e);
      alert('Error creating quest. Please try again.');
    }
    setGenerating(false);
  };`;

const aiTarget = /const handleGenerateAI = async \(\) => \{[\s\S]*?setGenerating\(false\);\n  \};/;
const aiReplacement = `const [aiGoals, setAiGoals] = useState('Improve my general productivity and health');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleGenerateAI = async () => {
    if (!user || !aiGoals) return;
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
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ 
          goals: aiGoals,
          level,
          stats
        })
      });
      if (!res.ok) {
        throw new Error('Server error when generating quests');
      }
      setShowAiModal(false);
      setAiGoals('Improve my general productivity and health');
    } catch (e) {
      console.error(e);
      alert('Failed to generate quests. Please try again.');
    }
    setGenerating(false);
  };`;

code = code.replace(manualTarget, manualReplacement);
code = code.replace(aiTarget, aiReplacement);

// Hook up the AI modal
// We need to find the place where AI Generate is, and wrap it in a modal or just show modal
const generateBtnTarget = /<button \n             onClick=\{handleGenerateAI\}\n            disabled=\{generating\}\n            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"\n          >\n            \{generating \? <Loader2 className="w-4 h-4 animate-spin" \/> : <Sparkles className="w-4 h-4" \/>\}\n            AI Generate\n          <\/button>/;

const generateBtnReplacement = `<button 
             onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>`;

code = code.replace(generateBtnTarget, generateBtnReplacement);

const createModalTarget = `      {showCreateModal && (`;
const modalsReplacement = `      {showAiModal && (
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
      {showCreateModal && (`;

code = code.replace(createModalTarget, modalsReplacement);

const creatingBtnTarget = `<button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Create Quest</button>`;
const creatingBtnReplacement = `<button type="submit" disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
  {generating ? 'Creating...' : 'Create Quest'}
</button>`;
code = code.replace(creatingBtnTarget, creatingBtnReplacement);

fs.writeFileSync('src/pages/Quests.tsx', code);
