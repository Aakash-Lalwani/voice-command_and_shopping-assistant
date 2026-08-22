import type { Category } from '@/types';

interface SeasonalEntry {
  months: number[];
  items: string[];
}

const SEASONAL_MAP: SeasonalEntry[] = [
  { months: [12, 1, 2], items: ['Oranges', 'Grapefruit', 'Brussels Sprouts', 'Kale', 'Leeks', 'Pears', 'Sweet Potatoes', 'Pomegranate'] },
  { months: [3, 4, 5], items: ['Asparagus', 'Peas', 'Strawberries', 'Spinach', 'Radishes', 'Artichokes', 'Apricots', 'Rhubarb'] },
  { months: [6, 7, 8], items: ['Tomatoes', 'Corn', 'Watermelon', 'Peaches', 'Zucchini', 'Bell Peppers', 'Blueberries', 'Cucumber'] },
  { months: [9, 10, 11], items: ['Apples', 'Pumpkin', 'Squash', 'Cranberries', 'Sweet Potatoes', 'Pears', 'Figs', 'Grapes'] },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getSeasonalItems(date = new Date()): { items: string[]; season: string; month: string } {
  const month = date.getMonth() + 1;
  const entry = SEASONAL_MAP.find((e) => e.months.includes(month)) || SEASONAL_MAP[0];
  const seasonName =
    month >= 3 && month <= 5 ? 'Spring' :
    month >= 6 && month <= 8 ? 'Summer' :
    month >= 9 && month <= 11 ? 'Fall' : 'Winter';
  return { items: entry.items, season: seasonName, month: MONTH_NAMES[month - 1] };
}

export function categorizeSeasonal(items: string[]): Record<Category, string[]> {
  const grouped: Record<Category, string[]> = {
    dairy: [], produce: [], snacks: [], beverages: [], bakery: [],
    pantry: [], meat: [], household: [], other: [],
  };
  for (const item of items) {
    grouped.produce.push(item);
  }
  return grouped;
}
