const fs = require('fs');

function fix(path) {
  let code = fs.readFileSync(path, 'utf-8');
  if (!code.includes("import React")) {
    if (code.includes("import { useState") || code.includes("import { useEffect")) {
      code = code.replace(/import \{ (.*?) \} from 'react';/, "import React, { $1 } from 'react';");
    } else {
      code = "import React from 'react';\n" + code;
    }
    fs.writeFileSync(path, code);
  }
}

['src/pages/Login.tsx', 'src/pages/SignUp.tsx', 'src/pages/Quests.tsx'].forEach(fix);
