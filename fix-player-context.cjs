const fs = require('fs');

let code = fs.readFileSync('src/contexts/PlayerContext.tsx', 'utf-8');

const regex = /\s*useEffect\(\(\) => \{\n\s*if \(settings\?\.appearance\) \{[\s\S]*?\}, \[settings\?\.appearance\]\);\n/;

// Extract the nested useEffect
const match = code.match(regex);
if (match) {
  code = code.replace(match[0], "\n"); // Remove it from inside the other useEffect
  
  // Insert it before the return (
  code = code.replace(
    "  return (",
    match[0] + "  return ("
  );
  
  fs.writeFileSync('src/contexts/PlayerContext.tsx', code);
} else {
  console.log("Could not find nested useEffect");
}
