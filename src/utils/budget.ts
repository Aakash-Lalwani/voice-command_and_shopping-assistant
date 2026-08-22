import type { ShoppingItem } from '@/types';
import { CATALOG } from './catalog';

const BUDGET_KEY = 'voicecart_budget';

export function getBudget(): number | null {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw === null) return null;
    const n = parseFloat(raw);
    return isNaN(n) || n <= 0 ? null : n;
  } catch {
    return null;
  }
}

export function setBudget(amount: number): void {
  try {
    localStorage.setItem(BUDGET_KEY, String(amount));
  } catch {
    // ignore storage errors
  }
}

export function clearBudget(): void {
  try {
    localStorage.removeItem(BUDGET_KEY);
  } catch {
    // ignore storage errors
  }
}

/**
 * Estimate the rupee price for a single list item by matching against the
 * product catalog (case-insensitive, partial match). Matched items use
 * (catalog price × 85) rounded to the nearest 10. Unmatched items default
 * to 50 rupees. The result is multiplied by quantity.
 */
export function estimateItemRupees(item: ShoppingItem): number {
  try {
    const lowerName = item.name.toLowerCase();
    const match = CATALOG.find(
      (p) =>
        p.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(p.name.toLowerCase()),
    );
    let unitPrice: number;
    if (match) {
      unitPrice = Math.round((match.price * 85) / 10) * 10;
    } else {
      unitPrice = 50;
    }
    return unitPrice * item.quantity;
  } catch {
    return 50 * item.quantity;
  }
}

export function estimateTotalRupees(items: ShoppingItem[]): number {
  try {
    return items.reduce((sum, item) => sum + estimateItemRupees(item), 0);
  } catch {
    return 0;
  }
}

export function formatRupees(amount: number): string {
  try {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } catch {
    return `₹${Math.round(amount)}`;
  }
}
