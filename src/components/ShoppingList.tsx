import { Check, Trash2, Plus, Minus } from 'lucide-react';
import type { ShoppingItem, Category } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_ORDER_LIST } from '@/utils/categorize';

interface Props {
  items: ShoppingItem[];
  loading: boolean;
  onToggleCheck: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
  onUpdateQty: (item: ShoppingItem, delta: number) => void;
}

export function ShoppingList({ items, loading, onToggleCheck, onRemove, onUpdateQty }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-rose-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your list...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6">
          <ShoppingBagIcon />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Your list is empty</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Tap the microphone and say "add milk" to start building your shopping list.
        </p>
      </div>
    );
  }

  const grouped: Record<Category, ShoppingItem[]> = {
    dairy: [], produce: [], snacks: [], beverages: [], bakery: [],
    pantry: [], meat: [], household: [], other: [],
  };
  for (const item of items) {
    grouped[item.category].push(item);
  }

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const totalCount = items.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {uncheckedCount} of {totalCount} remaining
        </p>
        <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${totalCount ? ((totalCount - uncheckedCount) / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {CATEGORY_ORDER_LIST.map((cat) => {
        const catItems = grouped[cat];
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {CATEGORY_LABELS[cat]}
              </h3>
              <span className="text-xs text-slate-400">({catItems.length})</span>
            </div>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700 animate-item-in hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => onToggleCheck(item)}
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      item.checked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-400'
                    }`}
                    aria-label={item.checked ? 'Mark as not done' : 'Mark as done'}
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-100'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQty(item, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateQty(item, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemove(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5M3.75 10.5h16.5l-1.5 9a2.25 2.25 0 01-2.25 1.875H7.5a2.25 2.25 0 01-2.25-1.875l-1.5-9z" />
    </svg>
  );
}
