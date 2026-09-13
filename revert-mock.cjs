const fs = require('fs');
let code = fs.readFileSync('src/backend/routes/api.ts', 'utf-8');

const regex = /router\.use\(\(req, res, next\) => \{\n  req\.user = \{ uid: "test_user_id" \};\n  next\(\);\n\}\);/;
const replacement = `router.use(requireAuth);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/backend/routes/api.ts', code);
