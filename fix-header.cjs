const fs = require('fs');

let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

if (!code.includes('Coins className')) {
  code = code.replace(
    "import { Search, User, ChevronRight, LogOut } from 'lucide-react';",
    "import { Search, User, ChevronRight, LogOut, Coins } from 'lucide-react';"
  );
  
  code = code.replace(
    /<div className="flex flex-col items-end leading-none">/,
    `<div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 rounded-full text-yellow-700 mr-2 border border-yellow-200">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono">{profile?.coins || 0}</span>
            </div>
            <div className="flex flex-col items-end leading-none">`
  );
  
  fs.writeFileSync('src/components/layout/Header.tsx', code);
}
