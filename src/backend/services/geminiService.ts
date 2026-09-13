import { GoogleGenAI, Type, Schema } from '@google/genai';

// Instantiate the SDK. The GEMINI_API_KEY environment variable is used automatically.
const ai = new GoogleGenAI({});

export const generateQuests = async (goals: string, currentLevel: number, userStats: any, settings: any) => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard', 'Epic'] },
        estimatedMinutes: { type: Type.INTEGER },
        
        relatedStat: { type: Type.STRING, enum: ['strength', 'intelligence', 'discipline', 'vitality', 'wisdom', 'charisma'] }
      },
      required: ['title', 'description', 'category', 'difficulty', 'estimatedMinutes', 'relatedStat']
    }
  };

  
  const diffPref = settings?.preferences?.difficultyPreference || 'Balanced';
  const dailyLimit = parseInt(settings?.preferences?.dailyQuestLimit || '5');
  const amountToGen = Math.min(dailyLimit, 3); // Let's just generate a few, or use limit
  
  const prompt = `As an AI Game Master for an RPG productivity app, generate ${amountToGen} quests for a level ${currentLevel} player whose goal is: "${goals}". 
Their current stats are: ${JSON.stringify(userStats)}. 
Provide realistic, actionable quests. Difficulty preference: ${diffPref} (Scale: Easy, Medium, Hard, Epic).
Return exactly ${amountToGen} quests.`;


  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Error:", err);
    return [];
  }
};
