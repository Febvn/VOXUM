import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import type { AuthUser } from '../types/auth';

export type AuthViewMode = 'login' | 'register' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'login' | 'register';
  onLoginSuccess: (user: AuthUser) => void;
}

interface StoredUserRecord extends AuthUser {
  passwordHash: string;
}

const STORAGE_USERS_KEY = 'voxtum_registered_users';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const normalizeMode = (m: string): AuthViewMode => {
    if (m === 'signup' || m === 'register') return 'register';
    return 'login';
  };

  const [mode, setMode] = useState<AuthViewMode>(normalizeMode(initialMode));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetDispatched, setResetDispatched] = useState(false);

  // Sync mode when modal opens or initialMode prop changes
  useEffect(() => {
    setMode(normalizeMode(initialMode));
    setError(null);
    setSuccessNotice(null);
    setResetDispatched(false);
  }, [initialMode, isOpen]);

  // Seed demo VOXTUM user if none exist yet
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const demoUsers: StoredUserRecord[] = [
        {
          id: 'usr_demo_01',
          name: 'Demo Engineer',
          email: 'demo@voxtum.ai',
          passwordHash: 'password123',
          provider: 'voxtum',
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(demoUsers));
    }
  }, []);

  if (!isOpen) return null;

  const getStoredUsers = (): StoredUserRecord[] => {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const defaultEmail = email && email.includes('@') ? email : 'developer@gmail.com';
      const defaultName = fullName || (defaultEmail.split('@')[0].replace(/[._]/g, ' ') || 'Google User');

      const googleUser: AuthUser = {
        id: `usr_google_${Date.now()}`,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: defaultEmail,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(defaultEmail)}`,
        provider: 'google',
        createdAt: new Date().toISOString(),
      };

      setIsLoading(false);
      onLoginSuccess(googleUser);
      onClose();
    }, 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const storedUsers = getStoredUsers();
      const userMatch = storedUsers.find(
        (u) => u.email === cleanEmail && u.passwordHash === cleanPassword
      );

      if (!userMatch) {
        setIsLoading(false);
        setError('Invalid email or password. You can use demo@voxtum.ai / password123 or register below.');
        return;
      }

      setIsLoading(false);
      const { passwordHash: _, ...publicUser } = userMatch;
      onLoginSuccess(publicUser);
      onClose();
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    const storedUsers = getStoredUsers();
    const existing = storedUsers.find((u) => u.email === cleanEmail);
    if (existing) {
      setError('An account with this email already exists. Please login instead.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: StoredUserRecord = {
        id: `usr_vxt_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash: cleanPassword,
        provider: 'voxtum',
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString(),
      };

      storedUsers.push(newUser);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(storedUsers));

      setIsLoading(false);
      const { passwordHash: _, ...publicUser } = newUser;
      onLoginSuccess(publicUser);
      onClose();
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetDispatched(true);
      setSuccessNotice(`Password recovery instructions have been sent to ${cleanEmail}.`);
    }, 600);
  };

  const autofillDemo = () => {
    setEmail('demo@voxtum.ai');
    setPassword('password123');
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-['Geist',system-ui,-apple-system,sans-serif] select-none">
      <div className="bg-[#0b0c10] border border-zinc-800 rounded-none w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-none hover:bg-zinc-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Metadata */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-0.5 rounded-none">
              VOXTUM SECURITY
            </span>
            <span className="text-[10px] font-mono text-zinc-500">ID GATEWAY</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-mono">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot_password' && 'Reset Password'}
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            {mode === 'login' && 'Access speech processing sessions, saved audio models, and Pro features.'}
            {mode === 'register' && 'Set up your workspace to synchronize transcription logs and custom vocabularies.'}
            {mode === 'forgot_password' && 'Enter your email address and we will dispatch a secure recovery link.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="flex-1 leading-normal">{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successNotice && (
          <div className="mb-4 p-3 bg-white/10 border border-white/30 text-white text-xs font-mono flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white mt-0.5" />
            <span className="flex-1 leading-normal">{successNotice}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: LOGIN (DEFAULT)                                                  */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="space-y-4">
            {/* Google Quick Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white font-medium text-xs flex items-center justify-center gap-3 transition-colors active:scale-[0.99] rounded-none"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                OR EMAIL &amp; PASSWORD
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessNotice(null);
                    }}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-9 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 rounded-none"
              >
                {isLoading ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Autofill Demo Helper */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={autofillDemo}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline"
              >
                Autofill Demo Account (demo@voxtum.ai)
              </button>
            </div>

            {/* Switch to Register */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Don't have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="text-white hover:text-zinc-300 font-bold underline uppercase"
              >
                Register now
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTER                                                         */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div className="space-y-4">
            {/* Google Quick Sign-Up */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white font-medium text-xs flex items-center justify-center gap-3 transition-colors active:scale-[0.99] rounded-none"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                OR REGISTER WITH EMAIL
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Chandra"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Work or Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-9 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 rounded-none"
              >
                {isLoading ? (
                  <span>REGISTERING...</span>
                ) : (
                  <>
                    <span>CREATE VOXTUM ACCOUNT</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="text-white hover:text-zinc-300 font-bold underline uppercase"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD                                                  */}
        {/* ========================================================================= */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            {resetDispatched ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <KeyRound className="w-4 h-4" />
                    <span>RECOVERY INSTRUCTIONS SENT</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                    If an account with <span className="text-white font-mono">{email}</span> exists, a recovery token has been created.
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono pt-1">
                    Demo credentials remain: <span className="text-white">demo@voxtum.ai</span> / <span className="text-white">password123</span>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetDispatched(false);
                    setError(null);
                  }}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>RETURN TO LOGIN</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono text-xs"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 rounded-none"
                >
                  {isLoading ? (
                    <span>DISPATCHING...</span>
                  ) : (
                    <>
                      <span>SEND RECOVERY LINK</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-white hover:text-zinc-300 underline font-bold uppercase"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal Security Badge Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span>Air-Gapped Client Auth</span>
          </span>
          <span>Zero External Tracking</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
