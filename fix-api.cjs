const fs = require('fs');

let code = `
import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middlewares/auth';
import { generateQuests } from '../services/geminiService';

const router = Router();
router.use(requireAuth);

router.post('/ai/generate-quests', async (req: AuthenticatedRequest, res) => {
  try {
    const { goals, level, stats } = req.body;
    const generatedQuests = await generateQuests(goals || "Improve my life", level || 1, stats || {});
    res.json({ success: true, quests: generatedQuests });
  } catch (error: any) {
    console.error("Generate Quests Error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
`;

fs.writeFileSync('src/backend/routes/api.ts', code);
