import { formatRupees } from '@/utils/budget';

interface Props {
  total: number;
  budget: number;
}

export function BudgetBar({ total, budget }: Props) {
  const pct = budget > 0 ? (total / budget) * 100 : 0;
  const clampedPct = Math.min(pct, 100);

  let barColor: string;
  let textColor: string;
  let label: string;

  if (pct > 100) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
    label = 'Over budget';
  } else if (pct >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
    label = 'Approaching budget';
  } else {
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-600 dark:text-emerald-400';
    label = 'Within budget';
  }

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${textColor}`}>
          {label}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Estimated: {formatRupees(total)} / Budget: {formatRupees(budget)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
}
