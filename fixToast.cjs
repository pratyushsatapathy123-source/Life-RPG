const fs = require('fs');
let code = fs.readFileSync('src/pages/Quests.tsx', 'utf-8');

// Add import
const importRegex = /import React, \{ useState \} from 'react';/;
code = code.replace(importRegex, `import React, { useState } from 'react';\nimport toast from 'react-hot-toast';`);

// Replace alert in handleManualCreate
const manualAlert = /alert\('Error creating quest\. Please try again\.'\);/;
code = code.replace(manualAlert, `toast.error('Error creating quest. Please try again.');`);

// Add success toast in handleManualCreate
const manualSuccessRegex = /setShowCreateModal\(false\);\n      setNewQuest\(\{ title: '', description: '', difficulty: 'Easy', category: 'General' \}\);/;
code = code.replace(manualSuccessRegex, `setShowCreateModal(false);\n      setNewQuest({ title: '', description: '', difficulty: 'Easy', category: 'General' });\n      toast.success('Quest created!');`);

// Replace alert in handleGenerateAI
const aiAlert = /alert\('Failed to generate quests\. Please try again\.'\);/;
code = code.replace(aiAlert, `toast.error('Failed to generate quests. Please try again.');`);

// Add success toast in handleGenerateAI
const aiSuccessRegex = /setShowAiModal\(false\);\n      setAiGoals\('Improve my general productivity and health'\);/;
code = code.replace(aiSuccessRegex, `setShowAiModal(false);\n      setAiGoals('Improve my general productivity and health');\n      toast.success('Quests generated successfully!');`);

// Replace alert in handleCompleteQuest
const completeAlert = /alert\('Failed to complete quest\.'\);/;
code = code.replace(completeAlert, `toast.error('Failed to complete quest.');`);

// Add success toast in handleCompleteQuest
const completeSuccessRegex = /setSelectedQuest\(null\);/;
code = code.replace(completeSuccessRegex, `setSelectedQuest(null);\n      toast.success('Quest completed! XP and Coins awarded.');`);

fs.writeFileSync('src/pages/Quests.tsx', code);
