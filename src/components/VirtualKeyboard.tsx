import { useState } from 'react';
import { X, Delete, ArrowUp, Globe, Check } from 'lucide-react';
import { motion } from 'motion/react';

export interface VirtualKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onClose: () => void;
  onEnter?: () => void;
  currentValue?: string;
  isOpen?: boolean;
  language?: string;
  variant?: 'default' | 'terminal';
}

type LayoutType = 'en' | 'sr' | 'es' | 'fr' | 'de' | 'it' | 'ru' | 'ar' | 'pt' | 'ko' | 'symbols';

export function VirtualKeyboard({ 
  onInput, 
  onDelete, 
  onClose, 
  onEnter, 
  currentValue, 
  isOpen = true, 
  language = 'en',
  variant = 'default'
}: VirtualKeyboardProps) {
  const [layout, setLayout] = useState<LayoutType>(() => {
    const lang = language.toLowerCase();
    if (lang.includes('sr')) return 'sr';
    if (lang.includes('ru')) return 'ru';
    if (lang.includes('es')) return 'es';
    if (lang.includes('fr')) return 'fr';
    if (lang.includes('de')) return 'de';
    if (lang.includes('it')) return 'it';
    if (lang.includes('ar')) return 'ar';
    if (lang.includes('pt')) return 'pt';
    if (lang.includes('ko')) return 'ko';
    return 'en';
  });
  const [isShift, setIsShift] = useState(false);

  if (!isOpen) return null;

  const layouts: Record<LayoutType, string[][]> = {
    en: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    sr: [
      ['љ', 'њ', 'е', 'р', 'т', 'з', 'у', 'и', 'о', 'п', 'ш', 'ђ'],
      ['а', 'с', 'д', 'ф', 'г', 'х', 'ј', 'к', 'л', 'ч', 'ћ', 'ж'],
      ['з', 'џ', 'ц', 'в', 'б', 'н', 'м']
    ],
    ru: [
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ],
    es: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'á', 'é', 'í', 'ó', 'ú']
    ],
    fr: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['w', 'x', 'c', 'v', 'b', 'n', 'é', 'è', 'à', 'ç', 'ù']
    ],
    de: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm', 'ß']
    ],
    it: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'à', 'è', 'é', 'ì', 'ò', 'ù']
    ],
    ar: [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
      ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
      ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
    ],
    pt: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú']
    ],
    ko: [
      ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
      ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
      ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['@', '#', '$', '%', '&', '*', '-', '+', '=', '/'],
      ['(', ')', '!', '?', '"', "'", ':', ';', ',', '.']
    ]
  };

  const layoutNames: Record<LayoutType, string> = {
    en: 'EN',
    sr: 'SR',
    ru: 'RU',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    it: 'IT',
    ar: 'AR',
    pt: 'PT',
    ko: 'KO',
    symbols: '?123'
  };

  const nextLayout = () => {
    const types: LayoutType[] = ['en', 'sr', 'ru', 'es', 'fr', 'de', 'it', 'ar', 'pt', 'ko', 'symbols'];
    const currentIndex = types.indexOf(layout);
    setLayout(types[(currentIndex + 1) % types.length]);
  };

  const handleKeyClick = (key: string) => {
    onInput(isShift ? key.toUpperCase() : key);
    if (isShift) setIsShift(false);
  };

  return (
    <motion.div 
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className={`fixed bottom-0 left-0 right-0 z-50 border-t p-2 pb-6 shadow-2xl transition-colors ${
        variant === 'terminal' 
          ? 'bg-slate-950/95 border-emerald-500/30 font-mono' 
          : 'bg-slate-900/95 border-slate-700'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex gap-2">
            <span className={`text-xs uppercase tracking-widest ${
              variant === 'terminal' ? 'text-emerald-500' : 'text-emerald-500/60 font-mono'
            }`}>
              {variant === 'terminal' ? 'Input Subroutine v3.4' : 'Input System v2.1'}
            </span>
            {currentValue && (
              <span className={`text-xs opacity-40 truncate max-w-[200px] ${variant === 'terminal' ? 'text-emerald-500' : 'text-white'}`}>
                | {currentValue}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              variant === 'terminal' ? 'hover:bg-emerald-500/10 text-emerald-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {layouts[layout].map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {rowIndex === 2 && (
                <button
                  onClick={() => setIsShift(!isShift)}
                  className={`flex-1 max-w-[60px] h-12 rounded-lg flex items-center justify-center transition-all ${
                    isShift 
                      ? variant === 'terminal' ? 'bg-emerald-500 text-slate-950' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : variant === 'terminal' ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              )}
              
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyClick(key)}
                  className={`flex-1 h-12 min-w-[32px] max-w-[50px] rounded-lg font-medium text-lg transition-all active:scale-95 flex items-center justify-center ${
                    variant === 'terminal'
                      ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500 hover:border-emerald-500/50 active:bg-emerald-500 active:text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white active:bg-indigo-600'
                  }`}
                >
                  {isShift ? key.toUpperCase() : key}
                </button>
              ))}

              {rowIndex === 2 && (
                <button
                  onClick={onDelete}
                  className={`flex-1 max-w-[60px] h-12 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                    variant === 'terminal'
                      ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500 hover:border-emerald-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          {/* Bottom Row */}
          <div className="flex justify-center gap-1 mt-1.5">
            <button
              onClick={nextLayout}
              className={`flex-1 max-w-[70px] h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                variant === 'terminal'
                  ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500 hover:border-emerald-500/50'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              {layoutNames[layout]}
            </button>
            
            <button
              onClick={() => handleKeyClick(' ')}
              className={`flex-[4] h-12 rounded-lg transition-all flex items-center justify-center ${
                variant === 'terminal'
                  ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500 group overflow-hidden'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <div className={`w-24 h-1 rounded-full opacity-50 ${variant === 'terminal' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              {variant === 'terminal' && (
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            <button
              onClick={onEnter || onClose}
              className={`flex-1 max-w-[100px] h-12 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                variant === 'terminal'
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {onEnter ? <Check className="w-5 h-5" /> : 'DONE'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
