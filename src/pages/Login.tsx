import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, Loader2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { signInWithEmail, signUpWithEmail, handleAuthState, resetPassword } from '../lib/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { uiLang, crtMode, setUser, setUiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS['en'];
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError(t.fill_all_fields || 'Please fill in all fields');
        return;
      }
      setIsLoading(true);
      try {
        await resetPassword(email);
        setSuccess(t.reset_password_sent || 'Password reset link sent to your email');
      } catch (error: any) {
        setError(error?.message || 'Failed to send reset link');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      setError(t.fill_all_fields || 'Please fill in all fields');
      return;
    }
    
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError(t.passwords_not_match || 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError(t.password_min_length || 'Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        const authResult = await handleAuthState();
        if (authResult.user) {
          setUser(authResult.user);
        } else {
          setError('Login succeeded but session not found. Please try again.');
        }
      } else {
        const result = await signUpWithEmail(email, password);
        if (result.success) {
          const authResult = await handleAuthState();
          if (authResult.user) {
            setUser(authResult.user);
          } else {
            setSuccess(t.check_email_confirm || 'Account created! Please check your email to confirm.');
          }
        }
      }
    } catch (error: any) {
      const msg = error?.message || 'Authentication failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans ${crtMode ? 'scanlines' : ''}`}>
      <SEO 
        title={t.login_title || 'Fennec Academy Login'} 
        description={t.login_desc || 'Join the Fennec Academy and master new languages.'}
      />
      {/* Background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        {crtMode && <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 animate-[scanline_8s_linear_infinite]" />}
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          {/* Logo Section */}
          <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-700 overflow-hidden">
              <img src="/logo.svg" alt="Fennec Academy" className="w-16 h-16" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white text-center mb-2 tracking-tighter uppercase leading-none">
            Fennec Academy
          </h1>
          <p className="text-slate-400 text-center font-bold text-xs uppercase tracking-[0.3em] mb-6">
            Language Survival Neural Interface
          </p>

          {/* Language Switcher */}
          <div className="flex justify-center gap-2 mb-6">
            {(['en', 'ru'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setUiLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  uiLang === lang
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-primary/50'
                }`}
              >
                {lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
              </button>
            ))}
          </div>
          
          {/* Mode Toggle */}
          {mode !== 'forgot' && (
            <div className="flex bg-slate-800/50 rounded-xl p-1 mb-8">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  mode === 'login' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {t.sign_in || 'Sign In'}
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  mode === 'register' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {t.register || 'Register'}
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-200 leading-relaxed">{error}</div>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                  <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-200 leading-relaxed">{success}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'forgot' && (
              <h3 className="text-lg font-bold text-white mb-2">
                {t.forgot_password || 'Reset Password'}
              </h3>
            )}
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email_placeholder || 'Email address'}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoComplete="email"
                disabled={isLoading}
              />
              
              {mode !== 'forgot' && (
                <>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.password_placeholder || 'Password'}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'register' && (
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirm_password_placeholder || 'Confirm password'}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-slate-900 h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'forgot' ? (
                <>
                  {t.send_reset_link || 'Send Reset Link'}
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {t.sign_in || 'Sign In'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t.create_account || 'Create Account'}
                </>
              )}
            </button>
            
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors mt-2"
              >
                {t.forgot_password || 'Forgot password?'}
              </button>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors mt-2"
              >
                {t.back_to_login || 'Back to Sign In'}
              </button>
            )}
          </form>

          {/* Academy Status Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Campus Online</span>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">v4.0.2-Stable</span>
            </div>
          </div>
        </motion.div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-8 leading-relaxed">
          {t.login_disclaimer || "By enrolling, you agree to comply with campus regulations and the Fennec Academy terms of service."}
        </p>
      </div>
    </div>
  );
}
