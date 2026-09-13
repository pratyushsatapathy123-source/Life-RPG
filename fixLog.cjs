const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

const regex = /if \(\!res\.ok\) throw new Error\('Failed to create quest'\);/;
const replacement = `if (!res.ok) {
        const errText = await res.text();
        console.error("Create Quest Error Details:", errText);
        throw new Error('Failed to create quest');
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Quests.tsx', code);
