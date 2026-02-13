
import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const GENERAL_SYSTEM_PROMPT = `
IDENTITY: Standard Data Generator. 
NO BOLDING. NO INTROS. NO FILLER.
Provide raw information directly. 
`;

export const GeneralAgent: Agent = {
  id: 'general',
  display_name: 'General Agent',
  description: 'General reasoning',
  priority: 50,
  icon: 'Cpu',
  sub_agents: [
    { id: 'fact_verifier', display_name: 'Fact Verifier', status: 'idle' },
    { id: 'reasoning_engine', display_name: 'Reasoning', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = GENERAL_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    return generateContentStream(systemInstruction, input, history);
  }
};
