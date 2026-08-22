import { useState, useEffect } from 'react';
import { Sparkles, Calendar, Repeat2, Plus, Loader2 } from 'lucide-react';
import type { HistoryItem, AppLanguage } from '@/types';
import { getSeasonalItems } from '@/utils/seasonal';
import { getSubstitutes } from '@/services/gemini';

interface Props {
  history: HistoryItem[];
  lastAddedItem: string | null;
  onAddSuggestion: (name: string) => void;
  lang: AppLanguage;
}

type Tab = 'foryou' | 'seasonal' | 'substitutes';

export function SmartSuggestions({ history, lastAddedItem, onAddSuggestion, lang }: Props) {
  const [tab, setTab] = useState<Tab>('foryou');
  const [subs, setSubs] = useState<string[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subsFor, setSubsFor] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedItem) return;
    setTab('substitutes');
    setLoadingSubs(true);
    setSubs([]);
    setSubsFor(lastAddedItem);
    getSubstitutes(lastAddedItem, lang).then((result) => {
      setSubs(result);
      setLoadingSubs(false);
    });
  }, [lastAddedItem, lang]);

  const seasonal = getSeasonalItems();
  const topHistory = history.slice(0, 8);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'foryou', label: 'For You', icon: <Repeat2 className="h-4 w-4" /> },
    { id: 'seasonal', label: 'In Season', icon: <Calendar className="h-4 w-4" /> },
    { id: 'substitutes', label: 'Substitutes', icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="flex border-b border-slate-100 dark:border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              tab === t.id
                ? 'text-rose-500 border-b-2 border-rose-500 bg-rose-50/50 dark:bg-rose-500/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'foryou' && (
          <div>
            <p className="text-xs text-slate-400 mb-3">Items you buy frequently</p>
            {topHistory.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No history yet. Add items to see suggestions here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topHistory.map((h) => (
                  <button
                    key={h.name}
                    onClick={() => onAddSuggestion(h.name)}
                    className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-colors animate-chip-in"
                  >
                    <Plus className="h-3 w-3" />
                    {h.name}
                    <span className="text-xs text-slate-400">×{h.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'seasonal' && (
          <div>
            <p className="text-xs text-slate-400 mb-3">
              {seasonal.season} produce · {seasonal.month}
            </p>
            <div className="flex flex-wrap gap-2">
              {seasonal.items.map((item) => (
                <button
                  key={item}
                  onClick={() => onAddSuggestion(item)}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors animate-chip-in"
                >
                  <Plus className="h-3 w-3" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'substitutes' && (
          <div>
            {subsFor && (
              <p className="text-xs text-slate-400 mb-3">
                Substitutes for <span className="font-semibold text-slate-600 dark:text-slate-200">{subsFor}</span>
              </p>
            )}
            {!subsFor && (
              <p className="text-sm text-slate-400 py-4 text-center">Add an item to see substitute suggestions.</p>
            )}
            {loadingSubs && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                <span className="text-sm text-slate-400">Finding substitutes...</span>
              </div>
            )}
            {!loadingSubs && subs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subs.map((s) => (
                  <button
                    key={s}
                    onClick={() => onAddSuggestion(s)}
                    className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors animate-chip-in"
                  >
                    <Plus className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
            )}
            {!loadingSubs && subs.length === 0 && subsFor && (
              <p className="text-sm text-slate-400 py-4 text-center">No substitutes found. Try adding another item.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
