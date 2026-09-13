import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, getDoc, setDoc, auth, signOut, writeBatch, getDocs, collection } from '../lib/firebase';
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import {
  User, Settings as SettingsIcon, Bell, Sparkles, Palette,
  Shield, Gamepad2, AlertTriangle, Save, LogOut, Download, Trash2, Loader2, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';


export function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);
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


  const handleLogout = async () => {
    await signOut(auth);
  };

    const handleExportData = async () => {
    if(!user) return;
    try {
      const uDoc = await getDoc(doc(db, 'users', user.uid));
      const sDoc = await getDoc(doc(db, 'users', user.uid, 'stats', 'current'));
      const qSnap = await getDocs(collection(db, 'users', user.uid, 'quests'));
      const aSnap = await getDocs(collection(db, 'users', user.uid, 'activity'));
      const pSnap = await getDocs(collection(db, 'users', user.uid, 'purchases'));
      const achDoc = await getDoc(doc(db, 'users', user.uid, 'achievements', 'unlocked'));
      
      const quests = qSnap.docs.map(d => ({id: d.id, ...d.data()}));
      const activity = aSnap.docs.map(d => ({id: d.id, ...d.data()}));
      const purchases = pSnap.docs.map(d => ({id: d.id, ...d.data()}));

      const data = {
        profile: uDoc.data(),
        stats: sDoc.data(),
        settings: settings,
        achievements: achDoc.data() || {},
        quests,
        activity,
        purchases
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'life-rpg-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (e) {
      showToast('Failed to export data', 'error');
    }
  };

    const handleResetPassword = async () => {
    if (!user || !user.email) return;
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, user.email);
      showToast('Password reset email sent!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset email', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("Delete your account?\n\nThis will permanently remove your profile and game progress.");
    if (!confirmDelete) return;
    try {
      await deleteUser(user);
      showToast('Account deleted.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete account. You may need to log in again.', 'error');
    }
  };

  const handleResetProgress = async () => {
    if (resetText !== 'RESET' || !user) return;
    setIsResetting(true);
    try {
      const token = await user.getIdToken();
      
      // Reset User Profile
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        level: 1,
        xpToNextLevel: 100,
        xp: 0,
        coins: 0,
        totalQuestsCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Delete stats and recreate
      const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
      await setDoc(statsRef, {

        xp: 0,
        coins: 0,
        strength: 1,
        intelligence: 1,
        discipline: 1,
        creativity: 1,
        health: 1,
        updatedAt: new Date().toISOString()
      });

      // Clear quests and habits
      const qSnap = await getDocs(collection(db, 'users', user.uid, 'quests'));
      const qBatch = writeBatch(db);
      qSnap.forEach(d => qBatch.delete(d.ref));
      await qBatch.commit();

      const hSnap = await getDocs(collection(db, 'users', user.uid, 'habits'));
      const hBatch = writeBatch(db);
      hSnap.forEach(d => hBatch.delete(d.ref));
      await hBatch.commit();
      
      setResetText('');
      showToast('Game progress has been reset.', 'success');
      // In a real app we might want to reload the user context here
      window.location.reload();
    } catch (e) {
      showToast('Failed to reset progress', 'error');
    }
    setIsResetting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your account, preferences, and game settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation / TOC */}
        <div className="lg:col-span-3 space-y-1 sticky top-24 h-max hidden lg:block">
          {[
            { id: 'account', icon: User, label: 'Account' },
            { id: 'game-preferences', icon: SettingsIcon, label: 'Game Preferences' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'ai-game-master', icon: Sparkles, label: 'AI Game Master' },
            { id: 'appearance', icon: Palette, label: 'Appearance' },
            { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
            { id: 'gameplay', icon: Gamepad2, label: 'Gameplay' },
            { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', danger: true },
          ].map(item => (
            <a 
              key={item.id} 
              href={`#${item.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* Account */}
          <section id="account" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Account</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-white text-2xl font-bold">
                  {profileForm.name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{profile?.name || 'Adventurer'}</h3>
                  <p className="text-sm text-zinc-500">{user?.email}</p>
                  <p className="text-xs text-zinc-400 mt-1">ID: {user?.uid}</p>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Display Name</label>
                    <input 
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Email</label>
                    <input 
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="w-full p-2.5 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                   <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                   </button>
                   <button type="button" onClick={handleLogout} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Game Preferences */}
          <section id="game-preferences" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Game Preferences</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Quest Difficulty</label>
                  <select 
                    value={settings.preferences.difficultyPreference}
                    onChange={(e) => updateSettingCategory('preferences', 'difficultyPreference', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Easy</option>
                    <option>Balanced</option>
                    <option>Challenging</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Daily Quest Limit</label>
                  <select 
                    value={settings.preferences.dailyQuestLimit}
                    onChange={(e) => updateSettingCategory('preferences', 'dailyQuestLimit', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="10">10</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <Toggle 
                  label="Ask before spending coins" 
                  checked={settings.preferences.rewardConfirmation}
                  onChange={(c) => updateSettingCategory('preferences', 'rewardConfirmation', c)}
                />
                <Toggle 
                  label="Let AI adjust quest difficulty based on my progress" 
                  checked={settings.preferences.autoDifficulty}
                  onChange={(c) => updateSettingCategory('preferences', 'autoDifficulty', c)}
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section id="notifications" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Notifications</h2>
              <Toggle 
                label=""
                checked={settings.notifications.enabled}
                onChange={(c) => updateSettingCategory('notifications', 'enabled', c)}
              />
            </div>
            <div className={cn("bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-sm transition-opacity", !settings.notifications.enabled && "opacity-50 pointer-events-none")}>
              <Toggle label="Daily Quest Reminder" checked={settings.notifications.dailyQuestReminder} onChange={(c) => updateSettingCategory('notifications', 'dailyQuestReminder', c)} />
              <Toggle label="Habit Reminder" checked={settings.notifications.habitReminder} onChange={(c) => updateSettingCategory('notifications', 'habitReminder', c)} />
              <Toggle label="Streak-at-Risk Reminder" checked={settings.notifications.streakReminder} onChange={(c) => updateSettingCategory('notifications', 'streakReminder', c)} />
              <Toggle label="Quest Deadline Reminder" checked={settings.notifications.deadlineReminder} onChange={(c) => updateSettingCategory('notifications', 'deadlineReminder', c)} />
              <Toggle label="Achievement Notifications" checked={settings.notifications.achievementNotifications} onChange={(c) => updateSettingCategory('notifications', 'achievementNotifications', c)} />
              <Toggle label="Level-Up Notifications" checked={settings.notifications.levelUpNotifications} onChange={(c) => updateSettingCategory('notifications', 'levelUpNotifications', c)} />
              <Toggle label="AI Game Master Notifications" checked={settings.notifications.aiNotifications} onChange={(c) => updateSettingCategory('notifications', 'aiNotifications', c)} />
            </div>
          </section>

          {/* AI Game Master */}
          <section id="ai-game-master" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI Game Master
              </h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-5 shadow-sm">
              <p className="text-sm text-zinc-500 pb-2">The AI uses your goals and activity history to personalize your RPG experience and suggest the best next steps.</p>
              <Toggle label="Enable AI suggestions" checked={settings.ai.enabled} onChange={(c) => updateSettingCategory('ai', 'enabled', c)} />
              <Toggle label="Automatically generate my daily quests" checked={settings.ai.dailyQuestGeneration} onChange={(c) => updateSettingCategory('ai', 'dailyQuestGeneration', c)} />
              <Toggle label="Automatically adjust quest difficulty" checked={settings.ai.adaptiveDifficulty} onChange={(c) => updateSettingCategory('ai', 'adaptiveDifficulty', c)} />
              <Toggle label="Use my goals and activity history to personalize suggestions" checked={settings.ai.personalization} onChange={(c) => updateSettingCategory('ai', 'personalization', c)} />
              
              <div className="pt-2 space-y-2">
                <label className="text-sm font-medium text-zinc-900">AI Feedback Frequency</label>
                <select 
                  value={settings.ai.feedbackFrequency}
                  onChange={(e) => updateSettingCategory('ai', 'feedbackFrequency', e.target.value)}
                  className="w-full md:w-1/2 block p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option>Minimal</option>
                  <option>Balanced</option>
                  <option>Frequent</option>
                </select>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section id="appearance" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Appearance</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Theme</label>
                  <select 
                    value={settings.appearance.theme}
                    onChange={(e) => updateSettingCategory('appearance', 'theme', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Dark</option>
                    <option>Light</option>
                    <option>System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Interface Density</label>
                  <select 
                    value={settings.appearance.interfaceDensity}
                    onChange={(e) => updateSettingCategory('appearance', 'interfaceDensity', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Comfortable</option>
                    <option>Compact</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <Toggle label="Reduce animations" checked={settings.appearance.reduceAnimations} onChange={(c) => updateSettingCategory('appearance', 'reduceAnimations', c)} />
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section id="privacy" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Privacy & Security</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-zinc-900">Export My Data</h3>
                  <p className="text-sm text-zinc-500">Download a copy of your profile, quests, and stats.</p>
                </div>
                <button onClick={handleExportData} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-zinc-900">Change Password</h3>
                  <p className="text-sm text-zinc-500">Send a secure password reset link to your email.</p>
                </div>
                <button onClick={handleResetPassword} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors">
                  Reset Password
                </button>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-zinc-900">Active Sessions</h3>
                  <p className="text-sm text-zinc-500">Manage where you're logged in.</p>
                </div>
                <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors">
                  Sign Out All Devices
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900">Delete Account</h3>
                  <p className="text-sm text-zinc-500">Permanently delete your account and all data.</p>
                </div>
                <button onClick={handleDeleteAccount} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {/* Gameplay Settings */}
          <section id="gameplay" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Gameplay Settings</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Rest Days</label>
                  <select 
                    value={settings.gameplay.restDays}
                    onChange={(e) => updateSettingCategory('gameplay', 'restDays', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>No rest days</option>
                    <option>1 day/week</option>
                    <option>2 days/week</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">Weekend Mode</label>
                  <select 
                    value={settings.gameplay.weekendMode}
                    onChange={(e) => updateSettingCategory('gameplay', 'weekendMode', e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Normal</option>
                    <option>Reduced Quests</option>
                    <option>Rest Mode</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <Toggle label="Allow one rest day without breaking my streak" checked={settings.gameplay.streakProtection} onChange={(c) => updateSettingCategory('gameplay', 'streakProtection', c)} />
                <Toggle label="Ask for confirmation before completing a quest" checked={settings.gameplay.completionConfirmation} onChange={(c) => updateSettingCategory('gameplay', 'completionConfirmation', c)} />
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section id="danger" className="space-y-4 pt-8">
            <div className="border-b border-red-200 pb-2">
              <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm">
              <h3 className="font-bold text-red-900 mb-2">Reset Game Progress</h3>
              <p className="text-sm text-red-700 mb-4">
                Your account will remain, but all RPG progression (XP, Level, Coins, Stats, Quest history) will be permanently erased.
              </p>
              <div className="bg-white p-4 rounded-lg border border-red-100 mb-4">
                <p className="text-sm font-medium text-zinc-900 mb-2">Type <span className="font-bold text-red-600 select-all">RESET</span> to confirm.</p>
                <input 
                  type="text" 
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  className="w-full md:w-1/2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="RESET"
                />
              </div>
              <button 
                onClick={handleResetProgress}
                disabled={resetText !== 'RESET' || isResetting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Reset All Progress
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border",
            toastMessage.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"
          )}>
            {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-semibold">{toastMessage.title}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle Switch Component
function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={cn(
          "w-11 h-6 rounded-full flex items-center px-1 transition-colors relative",
          checked ? "bg-amber-500" : "bg-zinc-200"
        )}
      >
        <span className={cn(
          "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
