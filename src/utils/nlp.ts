import type { ParsedCommand } from '@/types';
import { parseQuantity } from './numberWords';

const ADD_PATTERNS = [
  /^(?:add|buy|get|need|want|i need|i want|i need to buy|i want to buy|put|include|grab|pick up|pick)\s+(.+)/i,
  /^(?:i'd like|i would like|let's get|lets get|can you add|could you add|please add|add)\s+(?:some\s+)?(.+)/i,
];

const REMOVE_PATTERNS = [
  /^(?:remove|delete|drop|take off|take out|get rid of|erase)\s+(.+)/i,
  /^(?:remove)\s+(.+?)\s+from\s+(?:my\s+)?(?:list|the\s+list|cart)$/i,
];

const UPDATE_PATTERNS = [
  /^(?:update|change|set|make|increase|decrease|reduce)\s+(.+?)\s+(?:to|by)\s+(.+)/i,
  /^(?:change|update)\s+(.+?)\s+quantity\s+(?:to)\s+(.+)/i,
];

const CHECK_PATTERNS = [
  /^(?:mark|check)\s+(.+?)\s+(?:as\s+)?(?:done|complete|completed|bought|purchased)/i,
  /^(?:check|tick)\s+(?:off\s+)?(.+)/i,
  /^(?:i\s+(?:bought|got|have)\s+)(.+)/i,
  /^(?:uncheck|unmark)\s+(.+)/i,
];

const CLEAR_PATTERNS = [
  /^(?:clear|empty|delete all|remove all|wipe|reset)\s+(?:my\s+)?(?:list|cart|shopping\s+list|everything|all)$/i,
  /^(?:clear|empty|wipe|reset)$/i,
];

const SEARCH_PATTERNS = [
  /^(?:find|search|look for|show me|find me|search for|do you have|have you got)\s+(.+)/i,
];

const SET_BUDGET_PATTERNS = [
  /^(?:set\s+budget|my\s+budget\s+is|set\s+my\s+budget\s+to|set\s+my\s+budget)\s+(?:to\s+)?(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?$/i,
  /^(?:set\s+budget|my\s+budget\s+is|set\s+my\s+budget\s+to|set\s+my\s+budget)\s+(?:to\s+)?(?:rupees?|rs\.?|₹)\s*(\d+(?:\.\d+)?)$/i,
];

const ASK_TOTAL_PATTERNS = [
  /^(?:how\s+much\s+is\s+my\s+list|what\s+is\s+my\s+total|how\s+much\s+will\s+this\s+cost|what's\s+my\s+total|how\s+much\s+does\s+my\s+list\s+cost)$/i,
];

function cleanItem(item: string): string {
  return item
    .replace(/^(a|an|the|some|more|extra)\s+/i, '')
    .replace(/\s+(to|my|the)\s+.*$/i, '')
    .replace(/^(of|some)\s+/i, '')
    .trim();
}

export function parseCommand(input: string): ParsedCommand {
  const text = input.trim();
  if (!text) return { intent: 'unknown' };

  for (const re of CLEAR_PATTERNS) {
    if (re.test(text)) return { intent: 'clear' };
  }

  for (const re of SET_BUDGET_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const budget = parseFloat(m[1]);
      if (!isNaN(budget) && budget > 0) return { intent: 'set_budget', budget };
    }
  }

  for (const re of ASK_TOTAL_PATTERNS) {
    if (re.test(text)) return { intent: 'ask_total' };
  }

  for (const re of REMOVE_PATTERNS) {
    const m = text.match(re);
    if (m) {
      let item = m[1].replace(/(?:from\s+)?(?:my\s+)?(?:list|cart|the\s+list)$/i, '').trim();
      item = cleanItem(item);
      return { intent: 'remove', item };
    }
  }

  for (const re of CHECK_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const item = cleanItem(m[1]);
      const checked = !/^uncheck|^unmark/i.test(text);
      return { intent: 'check', item, checked };
    }
  }

  for (const re of UPDATE_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const item = cleanItem(m[1]);
      const { quantity, unit } = parseQuantity(m[2]);
      return { intent: 'update', item, quantity, unit };
    }
  }

  for (const re of SEARCH_PATTERNS) {
    const m = text.match(re);
    if (m) {
      return parseSearch(m[1]);
    }
  }

  for (const re of ADD_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const { quantity, unit, item } = parseQuantity(m[1]);
      const cleanName = cleanItem(item || m[1]);
      return {
        intent: 'add',
        item: cleanName,
        quantity: quantity ?? 1,
        unit: unit || 'pieces',
      };
    }
  }

  const { quantity, unit, item } = parseQuantity(text);
  if (item) {
    return { intent: 'add', item: cleanItem(item), quantity: quantity ?? 1, unit: unit || 'pieces' };
  }

  return { intent: 'unknown', item: text };
}

function parseSearch(query: string): ParsedCommand {
  let brand: string | undefined;
  let maxPrice: number | undefined;
  let q = query.trim();

  const priceMatch = q.match(/(?:under|below|less than|cheaper than|within)\s*\$?(\d+(?:\.\d+)?)/i);
  if (priceMatch) {
    maxPrice = parseFloat(priceMatch[1]);
    q = q.replace(priceMatch[0], '').trim();
  }
  const priceMatch2 = q.match(/\$?(\d+(?:\.\d+)?)\s*(?:or\s+less|dollars?)/i);
  if (priceMatch2 && !maxPrice) {
    maxPrice = parseFloat(priceMatch2[1]);
    q = q.replace(priceMatch2[0], '').trim();
  }

  q = q.replace(/^(me|us|some|any)\s+/i, '').trim();
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const first = words[0];
    if (/^[A-Z]/.test(first) && first.length > 2) {
      brand = first;
    }
  }

  return {
    intent: 'search',
    search: {
      query: q.replace(/^(me|us|some|any)\s+/i, '').trim(),
      brand,
      maxPrice,
    },
  };
}
