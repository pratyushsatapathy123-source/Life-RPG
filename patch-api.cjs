const fs = require('fs');
let code = fs.readFileSync('src/backend/routes/api.ts', 'utf8');

code = code.replace(
  /const userDoc = await db\.collection\('users'\)\.doc\(uid\)\.get\(\);\s+const statsDoc = await db\.collection\('users'\)\.doc\(uid\)\.collection\('stats'\)\.doc\('current'\)\.get\(\);\s+const level = userDoc\.data\(\)\?\.level \|\| 1;\s+const stats = statsDoc\.data\(\) \|\| \{\};\s+const \{ goals \} = req\.body;/,
  `const { goals, level, stats } = req.body;`
);

// Also need to fix handleCompleteQuest because db.runTransaction in firebase-admin will also fail!
code = code.replace(
  /const questRef = db\.collection\('users'\)\.doc\(uid\)\.collection\('quests'\)\.doc\(questId\);/g,
  `const questRef = db.collection('users').doc(uid).collection('quests').doc(questId);
    /* `
);

fs.writeFileSync('src/backend/routes/api.ts', code);
