import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AppLanguage } from '@/types';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return null;
  if (!client) client = new GoogleGenerativeAI(key);
  return client;
}

const FALLBACK_SUBSTITUTES: Record<string, string[]> = {
  milk: ['Almond milk', 'Oat milk', 'Soy milk'],
  butter: ['Margarine', 'Ghee', 'Olive oil'],
  eggs: ['Flax eggs', 'Tofu scramble', 'Applesauce'],
  sugar: ['Honey', 'Maple syrup', 'Stevia'],
  flour: ['Almond flour', 'Coconut flour', 'Rice flour'],
  rice: ['Quinoa', 'Couscous', 'Cauliflower rice'],
  bread: ['Tortilla', 'Pita', 'Lettuce wraps'],
  cheese: ['Nutritional yeast', 'Cashew cheese', 'Tofu'],
  yogurt: ['Greek yogurt', 'Coconut yogurt', 'Sour cream'],
  oil: ['Butter', 'Ghee', 'Coconut oil'],
  chicken: ['Tofu', 'Tempeh', 'Seitan'],
  beef: ['Mushrooms', 'Jackfruit', 'Lentils'],
  coffee: ['Tea', 'Matcha', 'Decaf coffee'],
  tea: ['Herbal tea', 'Green tea', 'Chamomile'],
  water: ['Sparkling water', 'Coconut water', 'Mineral water'],
  juice: ['Fresh fruit', 'Smoothie', 'Coconut water'],
  salt: ['Sea salt', 'Himalayan salt', 'Soy sauce'],
  pasta: ['Rice noodles', 'Zucchini noodles', 'Spaghetti squash'],
  potatoes: ['Sweet potatoes', 'Cauliflower', 'Turnips'],
  tomatoes: ['Tomato sauce', 'Sun-dried tomatoes', 'Red bell pepper'],
};

function getFallback(itemName: string): string[] {
  const key = itemName.toLowerCase().trim();
  for (const [k, v] of Object.entries(FALLBACK_SUBSTITUTES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return [];
}

export async function getSubstitutes(itemName: string, lang: AppLanguage = 'en-US'): Promise<string[]> {
  const ai = getClient();
  if (!ai) return getFallback(itemName);
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const langName = lang === 'hi-IN' ? 'Hindi' : 'English';
    const prompt = `Suggest exactly 3 common substitute items that a shopper could buy instead of "${itemName}". Return ONLY a JSON array of 3 strings, each being a substitute item name. No explanation, no extra text. Respond in ${langName}. Example format: ["item1","item2","item3"]`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getFallback(itemName);
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return getFallback(itemName);
    const filtered = parsed.filter((x) => typeof x === 'string').slice(0, 3);
    return filtered.length > 0 ? filtered : getFallback(itemName);
  } catch {
    return getFallback(itemName);
  }
}
