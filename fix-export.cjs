const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const exportLogic = `  const handleExportData = async () => {
    if(!user) return;
    try {
      const uDoc = await getDoc(doc(db, 'users', user.uid));
      const sDoc = await getDoc(doc(db, 'users', user.uid, 'stats', 'current'));
      const qSnap = await getDocs(collection(db, 'users', user.uid, 'quests'));
      const aSnap = await getDocs(collection(db, 'users', user.uid, 'activity'));
      const pSnap = await getDocs(collection(db, 'users', user.uid, 'purchases'));
      const achDoc = await getDoc(doc(db, 'users', user.uid, 'achievements', 'unlocked'));
      
      const quests = qSnap.docs.map(d => ({id: d.id, ...d.data()}));
      const activity = aSnap.docs.map(d => ({id: d.id, ...d.data()}));
      const purchases = pSnap.docs.map(d => ({id: d.id, ...d.data()}));

      const data = {
        profile: uDoc.data(),
        stats: sDoc.data(),
        settings: settings,
        achievements: achDoc.data() || {},
        quests,
        activity,
        purchases
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'life-rpg-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (e) {
      showToast('Failed to export data', 'error');
    }
  };`;

code = code.replace(
  /const handleExportData = async \(\) => \{[\s\S]*?showToast\('Failed to export data', 'error'\);\n    \}\n  \};/,
  exportLogic
);

fs.writeFileSync('src/pages/Settings.tsx', code);
