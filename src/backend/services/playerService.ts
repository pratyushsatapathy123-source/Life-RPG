import { db } from '../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const LEVEL_MULTIPLIER = 100;

export const calculateNextLevelXp = (level: number) => {
  // Balanced progression formula: level * 100
  return level * LEVEL_MULTIPLIER;
};

export const addXpAndCoins = async (uid: string, xpToAdd: number, coinsToAdd: number, statToIncrease?: string, statIncreaseAmount: number = 1) => {
  const userRef = db.collection('users').doc(uid);
  const statsRef = userRef.collection('stats').doc('current');
  
  return await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const data = userDoc.data()!;
    let currentLevel = data.level || 1;
    let currentXp = (data.xp || 0) + xpToAdd;
    let xpRequired = data.xpToNextLevel || calculateNextLevelXp(currentLevel);
    
    let levelUp = false;
    let previousLevel = currentLevel;

    while (currentXp >= xpRequired) {
      currentXp -= xpRequired;
      currentLevel += 1;
      xpRequired = calculateNextLevelXp(currentLevel);
      levelUp = true;
    }

    const updates: any = {
      xp: currentXp,
      level: currentLevel,
      xpToNextLevel: xpRequired,
      coins: (data.coins || 0) + coinsToAdd,
      updatedAt: FieldValue.serverTimestamp()
    };

    transaction.update(userRef, updates);

    // Update stats
    if (statToIncrease) {
      const statDoc = await transaction.get(statsRef);
      if (statDoc.exists) {
        const currentStatVal = statDoc.data()?.[statToIncrease] || 0;
        transaction.update(statsRef, { [statToIncrease]: currentStatVal + statIncreaseAmount });
      } else {
        transaction.set(statsRef, {
          strength: 0, intelligence: 0, discipline: 0, vitality: 0, wisdom: 0, charisma: 0,
          [statToIncrease]: statIncreaseAmount
        });
      }
    }

    return {
      levelUp,
      previousLevel,
      newLevel: currentLevel,
      xpAdded: xpToAdd,
      coinsAdded: coinsToAdd
    };
  });
};
