const WORD_TO_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  dozen: 12, fifteen: 15, twenty: 20, twentyfive: 25, fifty: 50, hundred: 100,
};

const UNITS = [
  'kg', 'kgs', 'kilogram', 'kilograms', 'kilos', 'kilo',
  'g', 'gm', 'gms', 'gram', 'grams',
  'l', 'litre', 'litre', 'liters', 'ltr', 'ltrs',
  'ml', 'millilitre', 'millilitres',
  'bottle', 'bottles', 'can', 'cans', 'pack', 'packs', 'packet', 'packets',
  'box', 'boxes', 'bag', 'bags', 'piece', 'pieces', 'pcs', 'pc',
  'loaf', 'loaves', 'dozen', 'dozens', 'bar', 'bars', 'jar', 'jars',
  'pound', 'pounds', 'lb', 'lbs', 'oz', 'ounces', 'ounce',
  'bunch', 'bunches', 'slice', 'slices', 'tray', 'trays',
];

export function parseQuantity(text: string): { quantity?: number; unit?: string; item?: string } {
  const lower = text.toLowerCase().trim();
  const digitMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|l|ltr|ml|bottle[s]?|can[s]?|pack[s]?|packet[s]?|box[es]?|bag[s]?|piece[s]?|pcs?|loaf|loaves|dozen[s]?|bar[s]?|jar[s]?|pound[s]?|lbs?|oz|bunch[es]?|slice[s]?|tray[s]?)?/);
  if (digitMatch) {
    const qty = parseFloat(digitMatch[1]);
    let unit: string | undefined;
    let item = lower;
    if (digitMatch[2]) {
      unit = normalizeUnit(digitMatch[2]);
      item = lower.replace(digitMatch[0], '').trim();
    } else {
      item = lower.replace(digitMatch[1], '').trim();
    }
    item = item.replace(/^(of|some)\s+/, '').trim();
    return { quantity: qty, unit, item: item || undefined };
  }
  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    const re = new RegExp(`\\b${word}\\s+(kg|g|gm|l|ltr|ml|bottle[s]?|can[s]?|pack[s]?|packet[s]?|box[es]?|bag[s]?|piece[s]?|pcs?|loaf|loaves|dozen[s]?|bar[s]?|jar[s]?|pound[s]?|lbs?|oz|bunch[es]?|slice[s]?|tray[s]?)?`, 'i');
    const m = lower.match(re);
    if (m) {
      let unit: string | undefined;
      let item = lower;
      if (m[1]) {
        unit = normalizeUnit(m[1]);
        item = lower.replace(m[0], '').trim();
      } else {
        item = lower.replace(new RegExp(`\\b${word}\\b`, 'i'), '').trim();
      }
      item = item.replace(/^(of|some)\s+/, '').trim();
      return { quantity: num, unit, item: item || undefined };
    }
  }
  return {};
}

export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  const map: Record<string, string> = {
    kgs: 'kg', kilogram: 'kg', kilograms: 'kg', kilos: 'kg', kilo: 'kg',
    gms: 'g', gm: 'g', gram: 'g', grams: 'g',
    litre: 'l', litres: 'l', liters: 'l', ltr: 'l', ltrs: 'l',
    millilitre: 'ml', millilitres: 'ml',
    bottles: 'bottle', cans: 'can', packs: 'pack', packets: 'pack', box: 'box', boxes: 'box',
    bags: 'bag', pieces: 'pieces', pcs: 'pieces', pc: 'pieces', piece: 'pieces',
    loaves: 'loaf', dozens: 'dozen', bars: 'bar', jars: 'jar',
    pounds: 'lb', lbs: 'lb', pound: 'lb',
    ounces: 'oz', ounce: 'oz',
    bunches: 'bunch', slices: 'slice', trays: 'tray',
  };
  return map[u] || u;
}

export const KNOWN_UNITS = UNITS;
