
import { SubAgent } from '../types';

export interface Agent {
  id: string;
  display_name: string;
  description: string;
  priority: number;
  icon: string;
  sub_agents: SubAgent[];
  run: (userMessage: string, history: { role: string; content: string }[]) => Promise<any>;
}
