const fs = require('fs');

// 1. Fix src/lib/firebase.ts
let firebaseLib = fs.readFileSync('src/lib/firebase.ts', 'utf-8');
firebaseLib = firebaseLib.replace(
  /getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where/,
  'getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, writeBatch, getDocs'
);
firebaseLib = firebaseLib.replace(
  /doc,\s*getDoc,\s*setDoc,\s*onSnapshot,\s*collection,\s*query,\s*where/,
  'doc, getDoc, setDoc, onSnapshot, collection, query, where, writeBatch, getDocs'
);
fs.writeFileSync('src/lib/firebase.ts', firebaseLib);

// 2. Fix src/pages/Quests.tsx
let quests = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');
quests = quests.replace(
  /import \{ db, collection, doc, setDoc, getDoc \} from '\.\.\/lib\/firebase';/,
  "import { db, collection, doc, setDoc, getDoc, writeBatch } from '../lib/firebase';"
);
// Also it might have a spurious 'firebase/firestore' import from my earlier fix attempt
quests = quests.replace(
  /import \{.*\} from 'firebase\/firestore';\n?/g,
  ""
);
fs.writeFileSync('src/pages/Quests.tsx', quests);

// 3. Fix src/pages/Settings.tsx
let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');
settings = settings.replace(
  /import \{ db, doc, getDoc, setDoc, auth, signOut \} from '\.\.\/lib\/firebase';/,
  "import { db, doc, getDoc, setDoc, auth, signOut, writeBatch, getDocs, collection } from '../lib/firebase';"
);
settings = settings.replace(
  /import \{.*\} from 'firebase\/firestore';\n?/g,
  "import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';\n"
);
// Make sure auth imports are clean
fs.writeFileSync('src/pages/Settings.tsx', settings);
