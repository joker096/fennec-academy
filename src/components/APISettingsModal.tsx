import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ExternalLink, Check, AlertCircle, Eye, EyeOff, Copy, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

interface APISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function APISettingsModal({ isOpen, onClose }: APISettingsModalProps) {
  const geminiApiKey = useStore(state => state.geminiApiKey);
  const setGeminiApiKey = useStore(state => state.setGeminiApiKey);
  const uiLang = useStore(state => state.uiLang);

  const [apiKey, setApiKey] = useState(geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'AI Settings',
      subtitle: 'Configure your Gemini API Key',
      apiKeyLabel: 'Gemini API Key',
      apiKeyPlaceholder: 'Enter your API key (starts with AIza...)',
      save: 'Save API Key',
      saved: 'Saved!',
      clear: 'Remove API Key',
      help: 'How to get an API key',
      instructions: {
        title: 'How to get a Gemini API Key',
        step1: 'Go to Google AI Studio',
        step2: 'Sign in with your Google account',
        step3: 'Click "Get API Key" in the sidebar',
        step4: 'Create a new API key or use an existing one',
        step5: 'Copy the API key and paste it here',
        note: 'Your API key is stored locally in your browser and is only used for AI features in this app.'
      },
      error: 'Invalid API key format. Keys should start with AIza...'
    },
    ru: {
      title: 'Настройки AI',
      subtitle: 'Настройте свой ключ Gemini API',
      apiKeyLabel: 'Ключ Gemini API',
      apiKeyPlaceholder: 'Введите ваш API ключ (начинается с AIza...)',
      save: 'Сохранить API ключ',
      saved: 'Сохранено!',
      clear: 'Удалить API ключ',
      help: 'Как получить API ключ',
      instructions: {
        title: 'Как получить ключ Gemini API',
        step1: 'Перейдите в Google AI Studio',
        step2: 'Войдите через аккаунт Google',
        step3: 'Нажмите "Получить API ключ" в боковой панели',
        step4: 'Создайте новый ключ или используйте существующий',
        step5: 'Скопируйте ключ и вставьте его сюда',
        note: 'Ваш API ключ хранится локально в браузере и используется только для AI функций в этом приложении.'
      },
      error: 'Неверный формат API ключа. Ключи должны начинаться с AIza...'
    }
  };

  const t = translations[uiLang as keyof typeof translations] || translations.en;

  const handleSave = () => {
    if (apiKey && !apiKey.startsWith('AIza')) {
      setError(t.error);
      return;
    }
    setError('');
    if (apiKey.trim()) {
      setGeminiApiKey(apiKey.trim());
    } else {
      setGeminiApiKey(null);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey('');
    setGeminiApiKey(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.apiKeyLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t.saved}
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      {t.save}
                    </>
                  )}
                </button>
                {geminiApiKey && (
                  <button
                    onClick={handleClear}
                    className="py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t.clear}
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                {t.help}
              </button>

              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t.instructions.title}</h3>
                  <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">1</span>
                      <span>{t.instructions.step1}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">2</span>
                      <span>{t.instructions.step2}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">3</span>
                      <span>{t.instructions.step3}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">4</span>
                      <span>{t.instructions.step4}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">5</span>
                      <span>{t.instructions.step5}</span>
                    </li>
                  </ol>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.instructions.note}</p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Google AI Studio
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}