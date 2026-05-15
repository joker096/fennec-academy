import { useMemo } from 'react';
import { UI_TRANSLATIONS } from '../data/translations';
import { useStore } from '../store/useStore';

export const getTranslation = (lang: string, key: string): string => {
  const translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];
  const value = translations[key];
  
  if (value === undefined && lang !== 'en') {
    // Fallback to English
    return UI_TRANSLATIONS['en'][key] || key;
  }
  
  return value || key;
};

export const useT = () => {
  const uiLang = useStore(state => state.uiLang);
  
  return useMemo(() => {
    const base = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
    return new Proxy(base as any, {
      get: (target, prop) => target[prop] || (UI_TRANSLATIONS['en'] as any)[prop] || prop
    });
  }, [uiLang]);
};
