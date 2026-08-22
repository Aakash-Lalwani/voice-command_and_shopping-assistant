export type Category =
  | 'dairy'
  | 'produce'
  | 'snacks'
  | 'beverages'
  | 'bakery'
  | 'pantry'
  | 'meat'
  | 'household'
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  checked: boolean;
  createdAt: number;
}

export interface HistoryItem {
  name: string;
  count: number;
  lastAdded: number;
}

export interface CatalogProduct {
  id: number;
  name: string;
  brand: string;
  category: Category;
  price: number;
  tags: string[];
}

export type IntentType =
  | 'add'
  | 'remove'
  | 'update'
  | 'check'
  | 'clear'
  | 'search'
  | 'set_budget'
  | 'ask_total'
  | 'unknown';

export interface ParsedCommand {
  intent: IntentType;
  item?: string;
  quantity?: number;
  unit?: string;
  checked?: boolean;
  budget?: number;
  search?: {
    query: string;
    brand?: string;
    maxPrice?: number;
  };
}

export type AppLanguage = 'en-US' | 'hi-IN';
