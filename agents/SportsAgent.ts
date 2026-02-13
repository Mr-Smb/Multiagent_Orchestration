
import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const SPORTS_SYSTEM_PROMPT = `
TASK: Live sports data.
RULE: NO BOLDING. NO **. Plain text only.
FORMAT: Scores and stats only. No intros.
`;

export const SportsAgent: Agent = {
  id: 'sports',
  display_name: 'Sports',
  description: 'Live results & stats',
  priority: 100,
  icon: 'Trophy',
  sub_agents: [
    { id: 'live_score_monitor', display_name: 'Monitor', status: 'idle' },
    { id: 'player_stats_analyzer', display_name: 'Analyzer', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = SPORTS_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    return generateContentStream(systemInstruction, input, history);
  }
};
