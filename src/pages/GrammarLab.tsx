import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  MessageSquare, 
  RefreshCw,
  Zap,
  Cpu,
  Database,
  Terminal as TerminalIcon,
  Keyboard
} from 'lucide-react';
import { analyzeGrammar, GrammarAnalysis } from '../services/geminiService';
import { handleAppError } from '../lib/errors';
import Tooltip from '../components/Tooltip';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

export default function GrammarLab() {
  const uiLang = useStore(state => state.uiLang);
  const targetLang = useStore(state => state.targetLang);
  const isOnline = useStore(state => state.isOnline);
  const addNotification = useStore(state => state.addNotification);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI features require an internet connection.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeGrammar(text, targetLang, uiLang);
      if (result) {
        setAnalysis(result);
      } else {
        setError('Failed to analyze text. Please try again.');
      }
    } catch (err) {
      handleAppError(err, addNotification);
      setError('An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <SEO 
        title={t.grammar_lab || 'Grammar Lab'} 
        description={t.grammar_lab_desc || 'Analyze your sentences for grammatical errors.'} 
      />

      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
              <TerminalIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {t.grammar_lab || 'Grammar Lab'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                {t.grammar_lab_desc || 'Analyze your sentences for grammatical errors and get detailed explanations.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-800">
              <Cpu className="w-3 h-3" /> ANALYZER.V3
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-800">
              <Database className="w-3 h-3" /> LINGUA.DB
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-lg transition-all">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              {t.grammar_enter_text_to_analyze || 'Enter text in the target language to analyze...'}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`p-2 rounded-lg transition-all ${
                  isKeyboardOpen 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-500'
                }`}
                title="Toggle Keyboard"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                {text.length} / 500
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="..."
              className="w-full h-40 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-lg text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
            />
            <div className="absolute inset-0 rounded-3xl border border-indigo-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
          </div>

          <AnimatePresence>
            {isKeyboardOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <VirtualKeyboard
                  language={targetLang}
                  onInput={(char) => setText(prev => (prev + char).slice(0, 500))}
                  onDelete={() => setText(prev => prev.slice(0, -1))}
                  onEnter={handleAnalyze}
                  onClose={() => setIsKeyboardOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95 overflow-hidden ${
                isAnalyzing || !text.trim()
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  {t.grammar_analyzing || 'Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  {t.grammar_analyze_text || 'Analyze Text'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.grammar_analyzing || 'Analyzing...'}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Consulting the linguistic archives of the wasteland.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-6 rounded-3xl flex items-center gap-4 text-rose-600 dark:text-rose-400"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Feedback */}
            <div className={`p-6 rounded-3xl border flex items-center gap-4 ${
              analysis.hasErrors 
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
            }`}>
              {analysis.hasErrors ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              <p className="font-bold text-lg">{analysis.overallFeedback}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Errors List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2">
                  {analysis.hasErrors ? (t.grammar_errors_identified || 'Errors Identified') : (t.grammar_no_errors_found || 'No errors found! Great job.')}
                </h3>
                
                {analysis.errors.length > 0 ? (
                  analysis.errors.map((err, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded uppercase tracking-tighter">
                              Error
                            </span>
                            <span className="font-mono text-lg text-slate-900 dark:text-white font-bold line-through decoration-rose-500/50">
                              {err.error}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {t.grammar_rule_explanation || 'Rule Explanation'}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {err.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 md:w-48 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                            {t.grammar_suggested_correction || 'Suggested Correction'}
                          </div>
                          <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {err.suggestion}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : !analysis.hasErrors && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Perfect Sentence!</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Your grammar is flawless. Keep up the great work!</p>
                  </div>
                )}
              </div>

              {/* Alternatives */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2">
                  {t.grammar_alternative_phrasings || 'Alternative Phrasings'}
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
                  {analysis.alternatives.map((alt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {alt}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Pro Tip: Using varied phrasings helps you sound more natural and fluent in the target language.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
