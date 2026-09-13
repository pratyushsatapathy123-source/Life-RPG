const fs = require('fs');
let code = fs.readFileSync('src/backend/firebaseAdmin.ts', 'utf-8');

code = code.replace(
  /const appOptions = projectId \? \{ projectId \} : undefined;/g,
  `import { applicationDefault } from 'firebase-admin/app';
const appOptions = projectId ? { projectId, credential: applicationDefault() } : { credential: applicationDefault() };`
);

fs.writeFileSync('src/backend/firebaseAdmin.ts', code);
