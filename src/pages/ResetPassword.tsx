import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UI_TRANSLATIONS } from '../data/translations';
import { useStore } from '../store/useStore';

export default function ResetPassword() {
  const { uiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS['en'];

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessingHash, setIsProcessingHash] = useState(true);

  useEffect(() => {
    // Supabase sends recovery tokens in URL hash like:
    // #access_token=xxx&refresh_token=xxx&token_type=bearer&type=recovery
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Supabase client automatically parses the hash and sets the session
      // when we call getSession or onAuthStateChange
      supabase.auth.getSession().then(({ data, error }) => {
        setIsProcessingHash(false);
        if (error || !data.session) {
          setError(t.invalid_reset_link || 'Invalid or expired reset link. Please request a new one.');
        }
      });
    } else {
      setIsProcessingHash(false);
      setError(t.invalid_reset_link || 'Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim()) {
      setError(t.fill_all_fields || 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwords_not_match || 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError(t.password_min_length || 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isProcessingHash) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            {t.processing || 'Processing...'}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
            {t.password_updated || 'Password Updated'}
          </h2>
          <p className="text-slate-400 mb-8">
            {t.password_updated_desc || 'Your password has been successfully updated. You can now sign in with your new password.'}
          </p>
          <a
            href="/"
            className="inline-block w-full bg-primary text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center hover:bg-primary/90 transition-all"
          >
            {t.sign_in || 'Sign In'}
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 md:p-14 rounded-[3rem] shadow-2xl"
        >
          {/* Logo Section */}
          <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-700 overflow-hidden">
              <img src="/logo.svg" alt="Fennec Academy" className="w-16 h-16" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tighter uppercase leading-none">
            {t.reset_password || 'Reset Password'}
          </h1>
          <p className="text-slate-400 text-center font-bold text-xs uppercase tracking-[0.3em] mb-10">
            {t.enter_new_password || 'Enter your new password'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.new_password_placeholder || 'New password'}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
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

            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirm_password_placeholder || 'Confirm password'}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-slate-900 h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {t.update_password || 'Update Password'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-primary transition-colors">
              {t.back_to_login || 'Back to Sign In'}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
