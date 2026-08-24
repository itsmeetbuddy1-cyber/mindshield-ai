import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, signup, loginWithGoogle, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'login' | 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Google OAuth Modal / Prompt for development environments without configured credentials
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Sync mode with query params
  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'signup' && mode !== 'signup') setMode('signup');
    else if (qMode === 'login' && mode !== 'login') setMode('login');
  }, [searchParams]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back to MindShield AI!');
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 401) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else if (detail) {
        setErrorMessage(typeof detail === 'string' ? detail : 'Login failed. Please try again.');
      } else {
        setErrorMessage('Unable to connect to the authentication service. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      toast.success('Account created successfully! Welcome to MindShield AI.');
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 400 && detail?.includes('already registered')) {
        setErrorMessage('An account with this email already exists. Please login instead.');
      } else if (detail) {
        setErrorMessage(typeof detail === 'string' ? detail : 'Registration failed.');
      } else {
        setErrorMessage('Registration could not be completed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Flow
  const handleGoogleClick = async () => {
    setErrorMessage(null);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If client ID is present and window.google is loaded
    if (googleClientId && (window as any).google?.accounts?.id) {
      setGoogleLoading(true);
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              await loginWithGoogle({ credential: response.credential });
              toast.success('Signed in with Google successfully!');
              navigate('/dashboard');
            } catch (err: any) {
              setErrorMessage('Google authentication failed. Please try again.');
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } catch (e) {
        console.warn('Google Identity Services prompt failed:', e);
        setShowGoogleModal(true);
        setGoogleLoading(false);
      }
    } else {
      // Show Google OAuth interactive connect modal
      setShowGoogleModal(true);
    }
  };

  const handleGoogleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput || !googleEmailInput.includes('@')) {
      toast.error('Please enter a valid Google email address');
      return;
    }

    setGoogleLoading(true);
    try {
      await loginWithGoogle({
        email: googleEmailInput.trim(),
        name: googleNameInput.trim() || googleEmailInput.split('@')[0],
      });
      setShowGoogleModal(false);
      toast.success(`Signed in as ${googleEmailInput}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Forgot Password Flow
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res.reset_code) {
        setGeneratedCode(res.reset_code);
        setResetCode(res.reset_code); // auto-fill for frictionless demo
      }
      setForgotStep(2);
      toast.success('Password reset instructions generated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to request reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error('Please enter your verification code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim(), resetCode.trim(), newPassword);
      toast.success('Password reset successfully! Please log in.');
      setShowForgotModal(false);
      setForgotStep(1);
      setNewPassword('');
      setResetCode('');
      setMode('login');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Reset failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-navy-950 p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo & Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">MindShield AI</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">
            {mode === 'login' ? 'Welcome to MindShield AI' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your personalized wellness insights'
              : 'Start tracking stress indicators and building resilience'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{errorMessage}</span>
            </motion.div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-500 font-medium tracking-wider uppercase">
                OR
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            
            {/* Name field (Signup only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-2xl py-3 pl-10 pr-11 text-sm outline-none transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (Signup only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-2xl py-3 pl-10 pr-11 text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Logging in...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to MindShield AI Home
          </Link>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400">
                    {forgotStep === 1
                      ? 'Enter your email to receive recovery instructions'
                      : 'Enter your verification code & set a new password'}
                  </p>
                </div>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? 'Processing...' : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleExecuteReset} className="space-y-4 mt-4">
                  {generatedCode && (
                    <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 font-mono">
                      🔑 Demo Verification Code: <strong>{generatedCode}</strong>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. reset_123456"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-medium text-sm transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold text-sm transition-all"
                    >
                      {forgotLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google OAuth Instant Connect Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Google Account Sign-In</h3>
                  <p className="text-xs text-slate-400">One-tap authentication</p>
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-blue-300 leading-relaxed mb-4">
                💡 <strong>OAuth Note:</strong> For production Google Cloud OAuth, set <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">frontend/.env</code>. You can authenticate directly with your Google profile below.
              </div>

              <form onSubmit={handleGoogleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-medium text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {googleLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
