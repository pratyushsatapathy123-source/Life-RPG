const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');

const targetDiv = `<div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60">`;
const newLink = `<Link to="/settings#account" className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200/60">`;

code = code.replace(targetDiv, newLink);
code = code.replace(
  `          </div>\n        </div>\n      </div>\n    </aside>`,
  `          </div>\n        </Link>\n      </div>\n    </aside>`
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
