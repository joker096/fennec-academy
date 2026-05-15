import { useRef } from 'react';
import { Keyboard as KeyboardIcon } from 'lucide-react';
import { VirtualKeyboard } from '../VirtualKeyboard';

interface TypingInputProps {
  t: Record<string, string>;
  status: 'idle' | 'correct' | 'incorrect';
  typedAnswer: string;
  isInputValid: boolean;
  currentQuestionType: string;
  targetLang: string;
  uiLang: string;
  onTypeAnswer: (answer: string) => void;
  onCheck: () => void;
  onToggleKeyboard: () => void;
  onVirtualKeyboardInput: (char: string) => void;
  onVirtualKeyboardDelete: () => void;
  onVirtualKeyboardEnter: () => void;
  onToggleFullKeyboard: () => void;
  isVirtualKeyboardOpen: boolean;
  isKeyboardVisible: boolean;
  showFullKeyboard: boolean;
}

export default function TypingInputField({
  t, status, typedAnswer, isInputValid, currentQuestionType,
  targetLang, uiLang, onTypeAnswer, onCheck,
  onToggleKeyboard, onVirtualKeyboardInput, onVirtualKeyboardDelete,
  onVirtualKeyboardEnter, onToggleFullKeyboard,
  isVirtualKeyboardOpen, isKeyboardVisible, showFullKeyboard
}: TypingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isInputValid) onCheck();
  };

  return (
    <div className="mt-auto mb-12">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {currentQuestionType === 'typing-target' ? t.special_characters : t.keyboard}
        </div>
        <button
          onClick={onToggleKeyboard}
          className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isKeyboardVisible ? t.hide_keyboard : t.show_keyboard}
        >
          <KeyboardIcon className={`w-5 h-5 ${isKeyboardVisible ? 'text-indigo-500' : ''}`} />
        </button>
      </div>

      {isKeyboardVisible && status === 'idle' && (
        <VirtualKeyboard
          isOpen={isVirtualKeyboardOpen}
          onClose={() => {}}
          onInput={onVirtualKeyboardInput}
          onDelete={onVirtualKeyboardDelete}
          onEnter={onVirtualKeyboardEnter}
          language={(currentQuestionType === 'typing-target' ? targetLang : uiLang) as any}
        />
      )}

      <div className="relative flex items-center group">
        {status === 'correct' ? (
          <div className="absolute left-6 flex items-center justify-center">
            <div className="w-6 h-6 text-emerald-500">✓</div>
          </div>
        ) : status === 'incorrect' ? (
          <XCircleStyled className="absolute left-6 w-6 h-6 text-rose-500" />
        ) : (
          <KeyboardIcon className="absolute left-6 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={typedAnswer}
          onChange={(e) => onTypeAnswer(e.target.value.replace(/[^\p{L}\s]/gu, ''))}
          disabled={status !== 'idle'}
          placeholder={t.type_answer_placeholder}
          className={`w-full bg-white dark:bg-slate-800 border-2 text-xl p-6 pl-16 pr-32 rounded-2xl outline-none transition-all shadow-inner volumetric-shadow-slate hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70 focus:volumetric-shadow-indigo ${
            status === 'correct'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
              : status === 'incorrect'
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-lg shadow-rose-500/10'
                : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500'
          }`}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-6 flex items-center gap-2">
          <button
            onClick={() => onToggleKeyboard()}
            className={`p-2 rounded-xl transition-all ${
              isVirtualKeyboardOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500'
            }`}
            title={t.virtual_keyboard || 'Virtual Keyboard'}
          >
            <KeyboardIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function XCircleStyled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={12} cy={12} r={10} />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}