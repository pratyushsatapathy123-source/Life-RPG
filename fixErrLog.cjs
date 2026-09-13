const fs = require('fs');
let code = fs.readFileSync('src/backend/routes/api.ts', 'utf-8');

const regex = /console\.error\("Create Quest Error:", error\);/;
const replacement = `console.error("Create Quest Error:", error);
    require('fs').writeFileSync('create_error.log', String(error.stack || error));`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/backend/routes/api.ts', code);
