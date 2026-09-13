import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

export function SignUp() {
  const { user, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must meet the required security requirements.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Google sign-in was unsuccessful. Please try again.');
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9fb] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200/60 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-zinc-900 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.12 6.4-6.05-4.06a2.49 2.49 0 0 0-2.14 0L6.88 6.4A2.5 2.5 0 0 0 5.5 8.5v7a2.5 2.5 0 0 0 1.38 2.1l6.05 4.06c.65.44 1.49.44 2.14 0l6.05-4.06A2.5 2.5 0 0 0 22.5 15.5v-7a2.5 2.5 0 0 0-1.38-2.1z"></path>
              <path d="M12 22V12"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 12 7.5 9.5"></path>
              <path d="m12 12 4.5-2.5"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create an Account</h1>
          <p className="text-sm text-zinc-500 mt-1">Join Life RPG and level up your life.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-zinc-200"></div>
          <span className="px-3 text-sm text-zinc-400 font-medium bg-white">OR</span>
          <div className="flex-1 border-t border-zinc-200"></div>
        </div>
                
        <button 
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {googleLoading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
