import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const FINANCE_SYSTEM_PROMPT = `
TASK: Finance data.
RULE: NO BOLDING. NO **. Plain text only.
FORMAT: Numbers and trends. 1 line analysis.
`;

export const FinanceAgent: Agent = {
  id: 'finance',
  display_name: 'Finance',
  description: 'Market analysis',
  priority: 85,
  icon: 'Briefcase',
  sub_agents: [
    { id: 'market_monitor', display_name: 'Monitor', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = FINANCE_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    // Finance analysis requires advanced reasoning, upgrading to gemini-3-pro-preview
    return generateContentStream(systemInstruction, input, history, [{ googleSearch: {} }], 'gemini-3-pro-preview');
  }
};