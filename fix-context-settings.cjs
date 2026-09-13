const fs = require('fs');
let code = fs.readFileSync('src/contexts/PlayerContext.tsx', 'utf-8');

code = code.replace(
  "achievements: any;",
  "achievements: any;\n  settings: any;"
);
code = code.replace(
  "const [achievements, setAchievements] = useState<any>({});",
  "const [achievements, setAchievements] = useState<any>({});\n  const [settings, setSettings] = useState<any>({});"
);
code = code.replace(
  "setAchievements({});",
  "setAchievements({});\n      setSettings({});"
);
const unsubSettingsStr = `
    const unsubSettings = onSnapshot(doc(db, 'users', user.uid, 'settings', 'preferences'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setSettings({});
      }
    });
`;
code = code.replace(
  "return () => {",
  unsubSettingsStr + "\n    return () => {"
);
code = code.replace(
  "unsubAchievements();",
  "unsubAchievements();\n      unsubSettings();"
);
code = code.replace(
  "profile, stats, achievements, loading",
  "profile, stats, achievements, settings, loading"
);

fs.writeFileSync('src/contexts/PlayerContext.tsx', code);
