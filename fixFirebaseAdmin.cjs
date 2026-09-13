const fs = require('fs');
let code = fs.readFileSync('src/backend/firebaseAdmin.ts', 'utf-8');

code = `import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let dbId = '(default)';
let projectId = undefined;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.firestoreDatabaseId) {
      dbId = config.firestoreDatabaseId;
    }
    if (config.projectId) {
      projectId = config.projectId;
    }
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json');
}

const appOptions = projectId ? { projectId } : undefined;
const app = getApps().length === 0 ? initializeApp(appOptions) : getApps()[0];

export const db = getFirestore(app, dbId);
export const adminAuth = getAuth(app);
`;

fs.writeFileSync('src/backend/firebaseAdmin.ts', code);
