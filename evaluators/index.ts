
import { CodingEvaluator } from './CodingEvaluator';
import { NewsEvaluator } from './NewsEvaluator';
import { SportsEvaluator } from './SportsEvaluator';
import { FinanceEvaluator } from './FinanceEvaluator';
import { TravelEvaluator } from './TravelEvaluator';
import { ShoppingEvaluator } from './ShoppingEvaluator';
import { GeneralEvaluator } from './GeneralEvaluator';
import { AgentEvaluator } from './types';

export const evaluators: Record<string, AgentEvaluator> = {
    'coding': CodingEvaluator,
    'news': NewsEvaluator,
    'sports': SportsEvaluator,
    'finance': FinanceEvaluator,
    'travel': TravelEvaluator,
    'shopping': ShoppingEvaluator,
    'general': GeneralEvaluator,
};

export const getEvaluator = (agentId: string): AgentEvaluator => {
    return evaluators[agentId] || evaluators['general'];
};
