import type { ShoppingItem, HistoryItem, Category } from '@/types';
import { categorize } from '@/utils/categorize';

let offlineItems: ShoppingItem[] = [];
let offlineHistory: Record<string, HistoryItem> = {};
let listListeners: ((items: ShoppingItem[]) => void)[] = [];
let historyListeners: ((items: HistoryItem[]) => void)[] = [];
let idCounter = 0;

function genId(): string {
  idCounter++;
  return `offline-${Date.now()}-${idCounter}`;
}

function notifyList(): void {
  const sorted = [...offlineItems].sort((a, b) => a.createdAt - b.createdAt);
  listListeners.forEach((fn) => fn(sorted));
}

function notifyHistory(): void {
  const sorted = Object.values(offlineHistory).sort((a, b) => b.count - a.count);
  historyListeners.forEach((fn) => fn(sorted));
}

export function subscribeToListOffline(
  onUpdate: (items: ShoppingItem[]) => void,
  _onError: (msg: string) => void,
): () => void {
  listListeners.push(onUpdate);
  onUpdate([...offlineItems].sort((a, b) => a.createdAt - b.createdAt));
  return () => {
    listListeners = listListeners.filter((fn) => fn !== onUpdate);
  };
}

export function subscribeToHistoryOffline(
  onUpdate: (items: HistoryItem[]) => void,
  _onError: (msg: string) => void,
): () => void {
  historyListeners.push(onUpdate);
  const sorted = Object.values(offlineHistory).sort((a, b) => b.count - a.count);
  onUpdate(sorted);
  return () => {
    historyListeners = historyListeners.filter((fn) => fn !== onUpdate);
  };
}

export async function addItemOffline(name: string, quantity: number, unit: string): Promise<void> {
  const category: Category = categorize(name);
  const item: ShoppingItem = {
    id: genId(),
    name,
    quantity,
    unit,
    category,
    checked: false,
    createdAt: Date.now(),
  };
  offlineItems.push(item);
  const key = name.toLowerCase().trim();
  const existing = offlineHistory[key];
  if (existing) {
    offlineHistory[key] = { ...existing, count: existing.count + 1, lastAdded: Date.now() };
  } else {
    offlineHistory[key] = { name, count: 1, lastAdded: Date.now() };
  }
  notifyList();
  notifyHistory();
}

export async function updateItemOffline(itemId: string, updates: Partial<ShoppingItem>): Promise<void> {
  offlineItems = offlineItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
  notifyList();
}

export async function removeItemOffline(itemId: string): Promise<void> {
  offlineItems = offlineItems.filter((i) => i.id !== itemId);
  notifyList();
}

export async function clearListOffline(): Promise<void> {
  offlineItems = [];
  notifyList();
}
