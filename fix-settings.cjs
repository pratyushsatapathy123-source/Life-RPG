const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const imports = `import { useUser } from '../hooks/useUser';`;

if (!code.includes('import { useUser }')) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\n" + imports);
}

// Replace the Settings component start
const newSettingsLogic = `
export function Settings() {
  const { user } = useAuth();
  const { profile, settings: globalSettings } = useUser() as any;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);

  const defaultSettings = {
    preferences: {
      difficultyPreference: 'Balanced',
      dailyQuestLimit: '5',
      preferredCategories: [] as string[],
      rewardConfirmation: true,
      autoDifficulty: false
    },
    notifications: {
      enabled: false,
      dailyQuestReminder: true,      
      habitReminder: true,
      streakReminder: true,
      deadlineReminder: true,
      achievementNotifications: true,
      levelUpNotifications: true,
      aiNotifications: true
    },
    ai: {
      enabled: true,
      dailyQuestGeneration: true,
      adaptiveDifficulty: true,
      feedbackFrequency: 'Balanced',
      personalization: true
    },
    appearance: {
      theme: 'System',
      reduceAnimations: false,
      interfaceDensity: 'Comfortable'
    },
    gameplay: {
      restDays: 'No rest days',
      weekendMode: 'Normal',
      streakProtection: false,
      completionConfirmation: false
    }
  };

  // Merge global settings with defaults
  const settings = {
    preferences: { ...defaultSettings.preferences, ...(globalSettings?.preferences || {}) },
    notifications: { ...defaultSettings.notifications, ...(globalSettings?.notifications || {}) },
    ai: { ...defaultSettings.ai, ...(globalSettings?.ai || {}) },
    appearance: { ...defaultSettings.appearance, ...(globalSettings?.appearance || {}) },
    gameplay: { ...defaultSettings.gameplay, ...(globalSettings?.gameplay || {}) }
  };

  const [resetText, setResetText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const saveSettings = async (newSettings: any) => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(docRef, { ...newSettings, updatedAt: new Date().toISOString() }, { merge: true });
      // showToast('Settings saved.', 'success'); // Too much noise for auto-save toggles
    } catch (e) {
      console.error('Failed to save settings', e);
      showToast('Unable to save settings. Please try again.', 'error');
    }
    setSaving(false);
  };

  const updateSettingCategory = (category: string, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...(settings as any)[category],
        [field]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: profileForm.name,
      }, { merge: true });
      showToast('Profile updated!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

  const showToast = (title: string, type: 'success' | 'error') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };
`;

code = code.replace(
  /export function Settings\(\) \{[\s\S]*?const showToast = \(title: string, type: 'success' \| 'error'\) => \{[\s\S]*?\n  \};/,
  newSettingsLogic
);

// We need to also replace the Account settings form (which wasn't fully there). 
fs.writeFileSync('src/pages/Settings.tsx', code);
