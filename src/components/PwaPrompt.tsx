import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';

export default function PwaPrompt() {
  const { uiLang } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if user has dismissed it recently
      const lastDismissed = localStorage.getItem('pwaPromptDismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Download className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {t.pwa_title || 'Download for offline access'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.pwa_desc || 'Install the app to access lessons without internet.'}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors"
            >
              {t.pwa_install_btn || 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
            >
              {t.pwa_later_btn || 'Later'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
