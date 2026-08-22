import { Moon, Sun, Globe, ShoppingBag, Trash2 } from 'lucide-react';
import type { AppLanguage } from '@/types';

interface Props {
  darkMode: boolean;
  onToggleDark: () => void;
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  onClear: () => void;
  hasItems: boolean;
}

export function Header({ darkMode, onToggleDark, lang, onLangChange, onClear, hasItems }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">VoiceCart</h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Voice shopping assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onLangChange.bind(null, lang === 'en-US' ? 'hi-IN' : 'en-US')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === 'en-US' ? 'EN' : 'हि'}</span>
          </button>

          {hasItems && (
            <button
              onClick={onClear}
              className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              aria-label="Clear list"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onToggleDark}
            className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
