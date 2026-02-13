
import { EvaluationResult } from '../services/geminiService';

export interface AgentEvaluator {
  id: string;
  targetAgentId: string;
  description: string;
  evaluate: (userQuery: string, agentOutput: string) => Promise<EvaluationResult>;
}
