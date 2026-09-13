const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const targetRegex = /const handleCompleteQuest = async \(questId: string\) => \{[\s\S]*?setCompleting\(false\);\n  \};/;
const replacement = `const handleCompleteQuest = async (questId: string) => {
    if (!user) return;
    setCompleting(true);
    try {
      const token = await getToken();
      const res = await fetch(\`/api/quests/\${questId}/complete\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!res.ok) throw new Error('Server error when completing quest');
      setSelectedQuest(null);
    } catch (e) {
      console.error(e);
      alert('Failed to complete quest.');
    }
    setCompleting(false);
  };`;

code = code.replace(targetRegex, replacement);
fs.writeFileSync('src/pages/Quests.tsx', code);
