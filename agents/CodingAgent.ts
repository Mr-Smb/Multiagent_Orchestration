import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const CODING_SYSTEM_PROMPT = `
TASK: Code analysis and generation.
RULE: NO BOLDING. NO **. Plain text only.
FORMAT: Code snippet + 1 line fix. No professional structure or greetings.
`;

export const CodingAgent: Agent = {
  id: 'coding',
  display_name: 'Coding',
  description: 'Code gen & debugging',
  priority: 90,
  icon: 'Terminal',
  sub_agents: [
    { id: 'error_debugger', display_name: 'Debugger', status: 'idle' },
    { id: 'code_optimizer', display_name: 'Optimizer', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = CODING_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    // Coding requires advanced reasoning, upgrading to gemini-3-pro-preview
    return generateContentStream(systemInstruction, input, history, [{ googleSearch: {} }], 'gemini-3-pro-preview');
  }
};