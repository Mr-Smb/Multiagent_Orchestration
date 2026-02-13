
import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const NEWS_SYSTEM_PROMPT = `
TASK: Global news.
RULE: NO BOLDING. NO **. Plain text only.
FORMAT: Bulleted headlines only. No summary or intros.
`;

export const NewsAgent: Agent = {
  id: 'news',
  display_name: 'News',
  description: 'Global news alerts',
  priority: 95,
  icon: 'Newspaper',
  sub_agents: [
    { id: 'breaking_news', display_name: 'Breaking', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = NEWS_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    return generateContentStream(systemInstruction, input, history);
  }
};
