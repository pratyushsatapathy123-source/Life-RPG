const fs = require('fs');
let code = fs.readFileSync('src/contexts/PlayerContext.tsx', 'utf-8');

// We can add a useEffect to apply appearance settings
const effectStr = `
  useEffect(() => {
    if (settings?.appearance) {
      const { theme, reduceAnimations } = settings.appearance;
      if (theme === 'Dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'Light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           document.documentElement.classList.add('dark');
        } else {
           document.documentElement.classList.remove('dark');
        }
      }
      
      if (reduceAnimations) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, [settings?.appearance]);
`;

code = code.replace(
  "return (",
  effectStr + "\n  return ("
);

fs.writeFileSync('src/contexts/PlayerContext.tsx', code);

// Let's add reduce-motion styles to index.css
let css = fs.readFileSync('src/index.css', 'utf-8');
if (!css.includes('.reduce-motion')) {
  css += `

.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
`;
  fs.writeFileSync('src/index.css', css);
}

