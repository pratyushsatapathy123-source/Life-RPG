const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

if (!code.includes('writeBatch')) {
  code = code.replace(/import \{ collection, query, onSnapshot, doc, getDoc \} from 'firebase\/firestore';/,
    "import { collection, query, onSnapshot, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';");
}
fs.writeFileSync('src/pages/Quests.tsx', code);
