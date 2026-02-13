
import { generateContentStream, FORMATTING_POLICY } from '../services/geminiService';
import { Agent } from './types';

const TRAVEL_SYSTEM_PROMPT = `
ROLE: Travel Concierge. 
GOAL: Flights, hotels, and planning.
SUB-AGENTS: Deals, Itinerary, Weather, Safety.
DIRECTIVE: List top 3 options. Prices and locations only. No flowery descriptions.
`;

export const TravelAgent: Agent = {
  id: 'travel',
  display_name: 'Travel Agent',
  description: 'Planning & deals',
  priority: 80,
  icon: 'Plane',
  sub_agents: [
    { id: 'itinerary_builder', display_name: 'Itinerary', status: 'idle' },
    { id: 'discount_tracker', display_name: 'Deals', status: 'idle' },
  ],
  run: async (input, history) => {
    const systemInstruction = TRAVEL_SYSTEM_PROMPT + "\n" + FORMATTING_POLICY;
    return generateContentStream(systemInstruction, input, history);
  }
};
