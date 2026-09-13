const fs = require('fs');
let code = fs.readFileSync('src/backend/middlewares/auth.ts', 'utf-8');

code = `import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Missing or invalid token' } });
    return;
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } });
  }
};`;
fs.writeFileSync('src/backend/middlewares/auth.ts', code);
