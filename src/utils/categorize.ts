import type { Category } from '@/types';

const KEYWORDS: Record<Category, string[]> = {
  dairy: ['milk', 'cheese', 'butter', 'yogurt', 'curd', 'cream', 'paneer', 'ghee', 'eggs', 'egg'],
  produce: ['apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'tomato', 'tomatoes', 'onion', 'onions', 'potato', 'potatoes', 'carrot', 'carrots', 'spinach', 'lettuce', 'cucumber', 'pepper', 'peppers', 'garlic', 'ginger', 'lemon', 'lemons', 'lime', 'grapes', 'strawberry', 'strawberries', 'broccoli', 'cauliflower', 'cilantro', 'mint', 'fruit', 'fruits', 'vegetable', 'vegetables', 'avocado', 'corn', 'cabbage'],
  snacks: ['chips', 'cookies', 'biscuit', 'biscuits', 'crackers', 'popcorn', 'chocolate', 'candy', 'nuts', 'almonds', 'cashews', 'raisins', 'pretzels', 'wafers', 'namkeen'],
  beverages: ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine', 'cola', 'drink', 'smoothie', 'milkshake', 'soda', 'energy drink', 'juice box'],
  bakery: ['bread', 'bun', 'buns', 'bagel', 'bagels', 'muffin', 'muffins', 'cake', 'pastry', 'croissant', 'donut', 'donuts', 'rolls', 'pita', 'tortilla'],
  pantry: ['rice', 'flour', 'sugar', 'salt', 'oil', 'pasta', 'noodles', 'spaghetti', 'cereal', 'oats', 'lentils', 'beans', 'chickpeas', 'spice', 'spices', 'honey', 'jam', 'peanut butter', 'soy sauce', 'vinegar', 'quinoa', 'couscous'],
  meat: ['chicken', 'beef', 'pork', 'bacon', 'sausage', 'sausages', 'turkey', 'lamb', 'fish', 'shrimp', 'ham', 'steak', 'mince', 'mutton', 'prawns'],
  household: ['soap', 'shampoo', 'toothpaste', 'toothbrush', 'detergent', 'cleaner', 'tissue', 'paper towel', 'toilet paper', 'garbage bag', 'trash bag', 'sponge', 'dish soap', 'laundry', 'batteries', 'light bulb', 'diaper', 'diapers'],
  other: [],
};

const CATEGORY_ORDER: Category[] = [
  'produce', 'dairy', 'meat', 'bakery', 'pantry', 'beverages', 'snacks', 'household', 'other',
];

export function categorize(name: string): Category {
  const lower = name.toLowerCase().trim();
  for (const cat of CATEGORY_ORDER) {
    if (cat === 'other') continue;
    const words = KEYWORDS[cat];
    for (const w of words) {
      if (lower === w || lower.includes(w)) {
        return cat;
      }
    }
  }
  return 'other';
}

export const CATEGORY_LABELS: Record<Category, string> = {
  dairy: 'Dairy',
  produce: 'Produce',
  snacks: 'Snacks',
  beverages: 'Beverages',
  bakery: 'Bakery',
  pantry: 'Pantry',
  meat: 'Meat',
  household: 'Household',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  dairy: '🥛',
  produce: '🥬',
  snacks: '🍪',
  beverages: '🥤',
  bakery: '🍞',
  pantry: '🥫',
  meat: '🥩',
  household: '🧼',
  other: '🛒',
};

export const CATEGORY_ORDER_LIST = CATEGORY_ORDER;
