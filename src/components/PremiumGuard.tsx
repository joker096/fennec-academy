import React from 'react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { Lock, Sparkles } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface PremiumGuardProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children, featureName, description }) => {
  const { isPremium, uiLang, buyPremium } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-900/10 pointer-events-none" />
      <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl flex items-center justify-center mb-8 shadow-inner relative z-10">
        <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4 relative z-10">
        {featureName || t.premium_feature || 'Premium Feature'}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-lg relative z-10">
        {description || t.premium_guard_desc}
      </p>
      <button
        onClick={buyPremium}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:scale-105 flex items-center gap-3 relative z-10"
      >
        <Sparkles className="w-6 h-6" />
        {t.upgrade_now || 'Upgrade Now'}
      </button>
      <div className="mt-12 w-full max-w-lg relative z-10">
        <AdBanner position="inline" />
      </div>
    </div>
  );
};
