
import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const SHOPPING_SYSTEM_PROMPT = `
ROLE: Shopping Assistant. 
GOAL: Product search and price comparison.
SUB-AGENTS: Price, Stock, Reviews, Deals.
DIRECTIVE: Format as: Product - Price - Store. List max 5 items.
`;

export const ShoppingAgent: Agent = {
  id: 'shopping',
  display_name: 'Shopping Agent',
  description: 'Search & comparison',
  priority: 75,
  icon: 'ShoppingBag',
  sub_agents: [
    { id: 'price_comparator', display_name: 'Price Check', status: 'idle' },
    { id: 'stock_checker', display_name: 'Stock Check', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = SHOPPING_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    return generateContentStream(systemInstruction, input, history);
  }
};
