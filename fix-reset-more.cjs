const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const resetLogic = `
      // Clear achievements
      const aSnap = await getDocs(collection(db, 'users', user.uid, 'activity'));
      const aBatch = writeBatch(db);
      aSnap.forEach(d => aBatch.delete(d.ref));
      await aBatch.commit();
      
      const pSnap = await getDocs(collection(db, 'users', user.uid, 'purchases'));
      const pBatch = writeBatch(db);
      pSnap.forEach(d => pBatch.delete(d.ref));
      await pBatch.commit();

      const achRef = doc(db, 'users', user.uid, 'achievements', 'unlocked');
      await setDoc(achRef, {});
      
      showToast('Game progress has been reset.', 'success');
      setResetText('');
`;

code = code.replace(
  /showToast\('Game progress has been reset\.', 'success'\);\n\s*setResetText\(''\);/,
  resetLogic
);
fs.writeFileSync('src/pages/Settings.tsx', code);
