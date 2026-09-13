const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

code = code.replace(
  "  const { settings: globalSettings } = useQuests() as any; // Not right\n",
  ""
);

fs.writeFileSync('src/pages/Quests.tsx', code);
