const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

// Need to import useLocation
if (!code.includes('useLocation')) {
  code = code.replace(
    "import { cn } from '@/lib/utils';",
    "import { cn } from '@/lib/utils';\nimport { useLocation } from 'react-router-dom';"
  );
}

const hookStr = `
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);
`;

code = code.replace(
  "export function Settings() {\n  const { user }",
  "export function Settings() {\n  const { user }" + hookStr
);

fs.writeFileSync('src/pages/Settings.tsx', code);
