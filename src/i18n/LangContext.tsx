import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ui, type UiKey } from './ui';

export type Lang = 'en' | 'ar';
/** A piece of bilingual content. */
export type T = { en: string; ar: string };

type Ctx = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  /** Interface label lookup. */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Pick the current language from bilingual content. */
  tx: (value: T) => string;
  /** Locale-aware number formatting (Arabic keeps Western digits for codes and areas). */
  num: (n: number, digits?: number) => string;
};

const LangContext = createContext<Ctx | null>(null);
const STORAGE_KEY = 'd8-lang';

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* storage can be unavailable (private mode); fall through */
  }
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const t: Ctx['t'] = (key, vars) => {
      let s = ui[key][lang];
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };
    const fmt = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US');
    return {
      lang,
      dir,
      setLang,
      t,
      tx: (v) => v[lang],
      num: (n, digits) =>
        digits === undefined
          ? fmt.format(n)
          : new Intl.NumberFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
              minimumFractionDigits: digits,
              maximumFractionDigits: digits,
            }).format(n),
    };
  }, [lang, dir, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
