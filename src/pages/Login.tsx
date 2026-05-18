import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { signInWithGoogle } from '../lib/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { uiLang, crtMode, setUiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS['en'];

  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
    setTimeout(() => setGoogleLoading(false), 30000);
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans ${crtMode ? 'scanlines' : ''}`}>
      <SEO title={t.login_title || 'Fennec Academy Login'} description={t.login_desc || ''}/>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700"/>
        {crtMode && <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 animate-[scanline_8s_linear_infinite]"/>}
      </div>
      <div className="max-w-md w-full relative z-10">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-primary/20 blur-3xl rounded-full"/>
            <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-700 overflow-hidden">
              <img src="/logo.svg" alt="Fennec Academy" className="w-16 h-16"/>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"/>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white text-center mb-2 tracking-tighter uppercase leading-none">Fennec Academy</h1>
          <p className="text-slate-400 text-center font-bold text-xs uppercase tracking-[0.3em] mb-6">Language Survival Neural Interface</p>

          <div className="flex justify-center gap-2 mb-6">
            {(['en','ru'] as const).map(l=>(<button key={l} type="button" onClick={()=>setUiLang(l)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${uiLang===l?'bg-primary text-white border-primary shadow-md':'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-primary/50'}`}>{l==='en'?'🇬🇧 EN':'🇷🇺 RU'}</button>))}
          </div>

          <AnimatePresence>
            {error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mb-4"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/><div className="text-sm text-red-200">{error}</div></motion.div>}
          </AnimatePresence>

          {/* Google Sign-In */}
          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold text-base transition-all shadow-md mb-6 disabled:opacity-50">
            {googleLoading?<Loader2 className="w-5 h-5 animate-spin"/>:<><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>{t.login_google || 'Sign in with Google'}</>}
          </button>

          <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Campus Online</span></div>
            <div className="flex items-center gap-3 justify-end"><Sparkles className="w-3 h-3 text-amber-500"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">v4.0.2-Stable</span></div>
          </div>
        </motion.div>
        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-8 leading-relaxed">{t.login_disclaimer||"By enrolling, you agree to comply with campus regulations."}</p>
      </div>
    </div>
  );
}
