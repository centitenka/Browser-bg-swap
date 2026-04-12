import { createContext, useContext } from 'react';
import en, { type LocaleKeys } from './en';
import zh from './zh';

export type Lang = 'en' | 'zh';

const locales: Record<Lang, Record<LocaleKeys, string>> = { en, zh };

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: LocaleKeys, vars?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function createT(lang: Lang) {
  return (key: LocaleKeys, vars?: Record<string, string>): string => {
    let str = locales[lang]?.[key] ?? locales.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  };
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}

const LANG_KEY = 'browserswap_lang';

export function getSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // Ignore storage access failures and fall back to English.
  }
  return 'en';
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage write failures in restricted environments.
  }
}
