import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { ShoppingItem, HistoryItem, AppLanguage, ParsedCommand, CatalogProduct } from '@/types';
import {
  getMissingEnvVars, initAuth, subscribeToList, subscribeToHistory,
  addItem, updateItem, removeItem, clearList,
} from '@/services/firebase';
import {
  subscribeToListOffline, subscribeToHistoryOffline,
  addItemOffline, updateItemOffline, removeItemOffline, clearListOffline,
} from '@/services/offlineList';
import { VoiceRecognizer, speak, isVoiceSupported, type VoiceError } from '@/services/voice';
import { parseCommand } from '@/utils/nlp';
import { getBudget, setBudget as saveBudget, estimateTotalRupees, formatRupees } from '@/utils/budget';
import { BudgetBar } from '@/components/BudgetBar';
import { showToast, ToastContainer } from '@/components/Toast';
import { Header } from '@/components/Header';
import { VoiceButton } from '@/components/VoiceButton';
import { ShoppingList } from '@/components/ShoppingList';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { SearchResults } from '@/components/SearchResults';
import { Onboarding } from '@/components/Onboarding';
import { SetupScreen } from '@/components/SetupScreen';
import { WifiOff } from 'lucide-react';

const ONBOARDING_KEY = 'voicecart_onboarded';
const DARK_KEY = 'voicecart_dark';

export default function App() {
  const missing = getMissingEnvVars();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<VoiceError | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(DARK_KEY) === 'true');
  const [lang, setLang] = useState<AppLanguage>('en-US');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [searchResults, setSearchResults] = useState<ParsedCommand | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);
  const [budget, setBudgetState] = useState<number | null>(() => getBudget());
  const [overBudgetWarned, setOverBudgetWarned] = useState(false);

  const estimatedTotal = estimateTotalRupees(items);

  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  const itemsRef = useRef<ShoppingItem[]>([]);
  itemsRef.current = items;
  const offlineModeRef = useRef(false);
  offlineModeRef.current = offlineMode;

  const voiceSupported = isVoiceSupported();

  useEffect(() => {
    if (missing.length > 0) return;
    const unsub = initAuth(
      (u) => setUser(u),
      (msg) => {
        setAuthError(msg);
        setOfflineMode(true);
        setLoading(false);
      },
    );
    return unsub;
  }, [missing.length]);

  // Firestore subscriptions
  useEffect(() => {
    if (!user || offlineMode) return;
    let cancelled = false;
    const unsubItems = subscribeToList(
      user.uid,
      (list) => {
        if (cancelled) return;
        setItems(list);
        setLoading(false);
      },
      (msg) => {
        if (cancelled) return;
        setOfflineMode(true);
        setLoading(false);
        showToast(`Connection lost — switching to offline mode`, 'error');
      },
    );
    const unsubHist = subscribeToHistory(
      user.uid,
      (h) => { if (!cancelled) setHistory(h); },
      () => {},
    );
    return () => {
      cancelled = true;
      unsubItems();
      unsubHist();
    };
  }, [user, offlineMode]);

  // Offline subscriptions
  useEffect(() => {
    if (!offlineMode) return;
    const unsubItems = subscribeToListOffline(
      (list) => {
        setItems(list);
        setLoading(false);
      },
      () => {},
    );
    const unsubHist = subscribeToHistoryOffline(setHistory, () => {});
    return () => {
      unsubItems();
      unsubHist();
    };
  }, [offlineMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(DARK_KEY, String(darkMode));
  }, [darkMode]);

  // Over-budget warning: fire once when crossing above, reset when going back under
  useEffect(() => {
    try {
      if (budget === null || budget <= 0) return;
      if (estimatedTotal > budget && !overBudgetWarned) {
        setOverBudgetWarned(true);
        showToast('Warning: you are over budget!', 'error');
        speak('Warning: you are over budget!', lang);
      } else if (estimatedTotal <= budget && overBudgetWarned) {
        setOverBudgetWarned(false);
      }
    } catch {
      // ignore
    }
  }, [estimatedTotal, budget, overBudgetWarned, lang]);

  useEffect(() => {
    if (!recognizerRef.current) {
      recognizerRef.current = new VoiceRecognizer();
    }
    recognizerRef.current.setLanguage(lang);
  }, [lang]);

  const handleVoiceToggle = useCallback(() => {
    const recognizer = recognizerRef.current;
    if (!recognizer) return;

    if (listening) {
      recognizer.stop();
      setListening(false);
      return;
    }

    setTranscript('');
    setVoiceError(null);
    setSearchResults(null);
    recognizer.start(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setListening(false);
          processCommand(text);
        }
      },
      (err) => {
        setVoiceError(err);
        setListening(false);
        if (err.type !== 'network') {
          showToast(err.message, 'error');
        }
      },
      () => setListening(false),
    );
    setListening(true);
  }, [listening]);

  const processCommand = useCallback(
    (input: string) => {
      const parsed = parseCommand(input);
      if (!user && !offlineModeRef.current) {
        showToast('Not signed in yet', 'error');
        return;
      }

      const doAdd = (name: string, qty: number, unit: string) => {
        if (offlineModeRef.current) {
          addItemOffline(name, qty, unit)
            .then(() => {
              const msg = `Added ${qty} ${unit} of ${name}`;
              showToast(msg, 'success');
              speak(msg, lang);
              setLastAddedItem(name);
            })
            .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
        } else {
          addItem(user!.uid, name, qty, unit)
            .then(() => {
              const msg = `Added ${qty} ${unit} of ${name}`;
              showToast(msg, 'success');
              speak(msg, lang);
              setLastAddedItem(name);
            })
            .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
        }
      };

      const doRemove = (target: ShoppingItem, name: string) => {
        if (offlineModeRef.current) {
          removeItemOffline(target.id)
            .then(() => {
              showToast(`Removed ${name}`, 'success');
              speak(`Removed ${name}`, lang);
            })
            .catch((e) => showToast(`Failed to remove: ${e.message}`, 'error'));
        } else {
          removeItem(user!.uid, target.id)
            .then(() => {
              showToast(`Removed ${name}`, 'success');
              speak(`Removed ${name}`, lang);
            })
            .catch((e) => showToast(`Failed to remove: ${e.message}`, 'error'));
        }
      };

      const doUpdate = (target: ShoppingItem, updates: Partial<ShoppingItem>, name: string) => {
        if (offlineModeRef.current) {
          updateItemOffline(target.id, updates)
            .then(() => {
              showToast(`Updated ${name}`, 'success');
              speak(`Updated ${name}`, lang);
            })
            .catch((e) => showToast(`Failed to update: ${e.message}`, 'error'));
        } else {
          updateItem(user!.uid, target.id, updates)
            .then(() => {
              showToast(`Updated ${name}`, 'success');
              speak(`Updated ${name}`, lang);
            })
            .catch((e) => showToast(`Failed to update: ${e.message}`, 'error'));
        }
      };

      switch (parsed.intent) {
        case 'add': {
          if (!parsed.item) {
            showToast('What would you like to add?', 'error');
            return;
          }
          const qty = parsed.quantity ?? 1;
          const unit = parsed.unit || 'pieces';
          doAdd(parsed.item, qty, unit);
          break;
        }
        case 'remove': {
          if (!parsed.item) return;
          const target = itemsRef.current.find((i) =>
            i.name.toLowerCase().includes(parsed.item!.toLowerCase()),
          );
          if (!target) {
            showToast(`Couldn't find ${parsed.item} on your list`, 'error');
            return;
          }
          doRemove(target, parsed.item);
          break;
        }
        case 'update': {
          if (!parsed.item) return;
          const target = itemsRef.current.find((i) =>
            i.name.toLowerCase().includes(parsed.item!.toLowerCase()),
          );
          if (!target) {
            showToast(`Couldn't find ${parsed.item} on your list`, 'error');
            return;
          }
          const updates: Partial<ShoppingItem> = {};
          if (parsed.quantity !== undefined) updates.quantity = parsed.quantity;
          if (parsed.unit) updates.unit = parsed.unit;
          doUpdate(target, updates, parsed.item);
          break;
        }
        case 'check': {
          if (!parsed.item) return;
          const target = itemsRef.current.find((i) =>
            i.name.toLowerCase().includes(parsed.item!.toLowerCase()),
          );
          if (!target) {
            showToast(`Couldn't find ${parsed.item} on your list`, 'error');
            return;
          }
          const newChecked = parsed.checked ?? !target.checked;
          doUpdate(target, { checked: newChecked }, parsed.item);
          break;
        }
        case 'clear': {
          if (offlineModeRef.current) {
            clearListOffline()
              .then(() => {
                showToast('List cleared', 'success');
                speak('Your list has been cleared', lang);
              })
              .catch((e) => showToast(`Failed to clear: ${e.message}`, 'error'));
          } else {
            clearList(user!.uid)
              .then(() => {
                showToast('List cleared', 'success');
                speak('Your list has been cleared', lang);
              })
              .catch((e) => showToast(`Failed to clear: ${e.message}`, 'error'));
          }
          break;
        }
        case 'set_budget': {
          if (!parsed.budget || parsed.budget <= 0) {
            showToast('Please say a valid budget amount', 'error');
            return;
          }
          try {
            saveBudget(parsed.budget);
            setBudgetState(parsed.budget);
            setOverBudgetWarned(false);
            const msg = `Budget set to ${parsed.budget} rupees`;
            showToast(msg, 'success');
            speak(msg, lang);
          } catch {
            showToast('Failed to set budget', 'error');
          }
          break;
        }
        case 'ask_total': {
          try {
            const total = estimateTotalRupees(itemsRef.current);
            const msg = `Your list is approximately ${total} rupees`;
            showToast(`Estimated: ${formatRupees(total)}`, 'info');
            speak(msg, lang);
          } catch {
            showToast('Could not calculate total', 'error');
          }
          break;
        }
        default: {
          showToast('Sorry, I didn\'t understand that command', 'error');
          speak('Sorry, I didn\'t understand that command', lang);
        }
      }
    },
    [user, lang, offlineMode],
  );

  const handleToggleCheck = useCallback(
    (item: ShoppingItem) => {
      if (offlineMode) {
        updateItemOffline(item.id, { checked: !item.checked }).catch((e) =>
          showToast(`Failed to update: ${e.message}`, 'error'),
        );
      } else if (user) {
        updateItem(user.uid, item.id, { checked: !item.checked }).catch((e) =>
          showToast(`Failed to update: ${e.message}`, 'error'),
        );
      }
    },
    [user, offlineMode],
  );

  const handleRemove = useCallback(
    (item: ShoppingItem) => {
      if (offlineMode) {
        removeItemOffline(item.id).catch((e) =>
          showToast(`Failed to remove: ${e.message}`, 'error'),
        );
      } else if (user) {
        removeItem(user.uid, item.id).catch((e) =>
          showToast(`Failed to remove: ${e.message}`, 'error'),
        );
      }
    },
    [user, offlineMode],
  );

  const handleUpdateQty = useCallback(
    (item: ShoppingItem, delta: number) => {
      const newQty = Math.max(1, item.quantity + delta);
      if (offlineMode) {
        updateItemOffline(item.id, { quantity: newQty }).catch((e) =>
          showToast(`Failed to update: ${e.message}`, 'error'),
        );
      } else if (user) {
        updateItem(user.uid, item.id, { quantity: newQty }).catch((e) =>
          showToast(`Failed to update: ${e.message}`, 'error'),
        );
      }
    },
    [user, offlineMode],
  );

  const handleClear = useCallback(() => {
    if (offlineMode) {
      clearListOffline()
        .then(() => showToast('List cleared', 'success'))
        .catch((e) => showToast(`Failed to clear: ${e.message}`, 'error'));
    } else if (user) {
      clearList(user.uid)
        .then(() => showToast('List cleared', 'success'))
        .catch((e) => showToast(`Failed to clear: ${e.message}`, 'error'));
    }
  }, [user, offlineMode]);

  const handleAddSuggestion = useCallback(
    (name: string) => {
      if (offlineMode) {
        addItemOffline(name, 1, 'pieces')
          .then(() => {
            showToast(`Added ${name}`, 'success');
            setLastAddedItem(name);
          })
          .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
      } else if (user) {
        addItem(user.uid, name, 1, 'pieces')
          .then(() => {
            showToast(`Added ${name}`, 'success');
            setLastAddedItem(name);
          })
          .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
      }
    },
    [user, offlineMode],
  );

  const handleAddCatalogProduct = useCallback(
    (p: CatalogProduct) => {
      if (offlineMode) {
        addItemOffline(p.name, 1, 'pieces')
          .then(() => {
            showToast(`Added ${p.name}`, 'success');
            setLastAddedItem(p.name);
          })
          .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
      } else if (user) {
        addItem(user.uid, p.name, 1, 'pieces')
          .then(() => {
            showToast(`Added ${p.name}`, 'success');
            setLastAddedItem(p.name);
          })
          .catch((e) => showToast(`Failed to add: ${e.message}`, 'error'));
      }
    },
    [user, offlineMode],
  );

  const closeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'done');
    setShowOnboarding(false);
  }, []);

  if (missing.length > 0) {
    return <SetupScreen missing={missing} />;
  }

  if (!user && !offlineMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-rose-500 animate-spin" />
          <p className="text-sm text-slate-400">Connecting to your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        lang={lang}
        onLangChange={setLang}
        onClear={handleClear}
        hasItems={items.length > 0}
      />

      {offlineMode && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs font-medium">Offline mode — data will not be saved</p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 pb-64 space-y-6">
        {searchResults && searchResults.search && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Search Results
              </h2>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <SearchResults
              query={searchResults.search.query}
              brand={searchResults.search.brand}
              maxPrice={searchResults.search.maxPrice}
              onAdd={handleAddCatalogProduct}
            />
          </section>
        )}

        <section>
          <SmartSuggestions
            history={history}
            lastAddedItem={lastAddedItem}
            onAddSuggestion={handleAddSuggestion}
            lang={lang}
          />
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Your Shopping List
          </h2>
          {budget !== null && budget > 0 && (
            <div className="mb-3">
              <BudgetBar total={estimatedTotal} budget={budget} />
            </div>
          )}
          <ShoppingList
            items={items}
            loading={loading}
            onToggleCheck={handleToggleCheck}
            onRemove={handleRemove}
            onUpdateQty={handleUpdateQty}
          />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-4 py-3 pointer-events-auto">
        <div className="max-w-2xl mx-auto">
          <VoiceButton
            listening={listening}
            transcript={transcript}
            supported={voiceSupported}
            voiceError={voiceError}
            onToggle={handleVoiceToggle}
            onTextSubmit={processCommand}
            bottomBarOnly
          />
        </div>
      </div>

      <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none" style={{ bottom: '170px' }}>
        <div className="max-w-2xl w-full px-4 flex justify-center pointer-events-none">
          <VoiceButton
            listening={listening}
            transcript={transcript}
            supported={voiceSupported}
            voiceError={voiceError}
            onToggle={handleVoiceToggle}
            onTextSubmit={processCommand}
            micButtonOnly
          />
        </div>
      </div>

      {showOnboarding && <Onboarding onClose={closeOnboarding} />}
      <ToastContainer />
    </div>
  );
}
