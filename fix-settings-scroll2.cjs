const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

code = code.replace(
  "export function Settings() {\n  const { user }\n  const location = useLocation();\n  useEffect(() => {\n    if (location.hash) {\n      const id = location.hash.replace('#', '');\n      const element = document.getElementById(id);\n      if (element) {\n        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);\n      }\n    }\n  }, [location.hash]);\n = useAuth();",
  `export function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);`
);

fs.writeFileSync('src/pages/Settings.tsx', code);
