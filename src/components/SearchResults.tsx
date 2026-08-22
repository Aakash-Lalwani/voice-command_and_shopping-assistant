import { useState } from 'react';
import { Plus, Tag, DollarSign } from 'lucide-react';
import type { CatalogProduct } from '@/types';
import { CATALOG } from '@/utils/catalog';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/utils/categorize';

interface Props {
  query: string;
  brand?: string;
  maxPrice?: number;
  onAdd: (product: CatalogProduct) => void;
}

export function SearchResults({ query, brand, maxPrice, onAdd }: Props) {
  const [added, setAdded] = useState<Set<number>>(new Set());

  let results = CATALOG;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (brand) {
    const b = brand.toLowerCase();
    results = results.filter((p) => p.brand.toLowerCase().includes(b));
  }

  if (maxPrice !== undefined) {
    results = results.filter((p) => p.price <= maxPrice!);
  }

  const handleAdd = (p: CatalogProduct) => {
    onAdd(p);
    setAdded((prev) => new Set(prev).add(p.id));
    setTimeout(() => {
      setAdded((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
        <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        {brand && (
          <span className="flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 text-xs text-sky-600 dark:text-sky-300">
            <Tag className="h-3 w-3" /> {brand}
          </span>
        )}
        {maxPrice !== undefined && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-300">
            <DollarSign className="h-3 w-3" />under {maxPrice}
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {results.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700 animate-item-in"
            >
              <span className="text-2xl">{CATEGORY_ICONS[p.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-100 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {p.brand} · {CATEGORY_LABELS[p.category]}
                </p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">${p.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleAdd(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  added.has(p.id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20'
                }`}
                aria-label="Add to list"
              >
                {added.has(p.id) ? <span className="text-sm">✓</span> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
