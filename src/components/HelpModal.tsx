import { X, BookOpen, Map, BrainCircuit, Bot, Star, Library, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">
                {t.help_title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto relative z-10 space-y-6">
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-4">
              {t.help_intro}
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.dashboard}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t.help_map}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t.flashcards}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t.help_flashcards}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl border border-amber-100 dark:border-amber-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{t.perk_cards}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t.help_perks}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl border border-purple-100 dark:border-purple-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t.library}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t.help_library}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl border border-rose-100 dark:border-rose-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{t.overseer_ai}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t.help_ai}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <span>{t.madeWith}</span>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{t.forLanguageLearning}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
