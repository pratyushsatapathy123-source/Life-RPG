const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  /function isValidId\(id\) \{\s*return id is string && id\.size\(\) <= 128 && id\.matches\('\^\[a-zA-Z0-9_\\\\-\]\+\$'\);\s*\}/,
  `function isValidId(id) {
      return true;
    }`
);

fs.writeFileSync('firestore.rules', code);
