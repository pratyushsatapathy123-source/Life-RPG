const fs = require('fs');

const appCode = `
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Quests } from './pages/Quests';
import { Progress } from './pages/Progress';
import { Achievements } from './pages/Achievements';
import { Rewards } from './pages/Rewards';
import { Analytics } from './pages/Analytics';
import { Activity } from './pages/Activity';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="quests" element={<Quests />} />
                <Route path="progress" element={<Progress />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="activity" element={<Activity />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
`;
fs.writeFileSync('src/App.tsx', appCode);
