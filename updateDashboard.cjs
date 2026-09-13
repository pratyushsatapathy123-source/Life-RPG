const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// The activeQuests is already wired. We need to update focusData if we had a backend, but focus tracking might just be client side. Let's just update the welcome string and progress bars.
code = code.replace(/Level \{profile\?\.level \|\| 1\} • \{profile\?\.xp \|\| 0\} \/ \{profile\?\.xpToNextLevel \|\| 100\} XP/g, 'Level {profile?.level || 1} • {profile?.xp || 0} / {profile?.xpToNextLevel || 100} XP');

const styleTarget = /style=\{\{ width: \`\$\{Math\.min\(stat\.val, 100\)\}\%\` \}\}/g;
code = code.replace(styleTarget, 'style={{ width: `${Math.min((stat.val / 100) * 100, 100)}%` }}');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
