const fs = require('fs');
let code = fs.readFileSync('src/backend/services/geminiService.ts', 'utf-8');

code = code.replace(/suggestedXp: \{ type: Type.INTEGER \},?/, '');
code = code.replace(/, 'suggestedXp'/, '');

fs.writeFileSync('src/backend/services/geminiService.ts', code);
