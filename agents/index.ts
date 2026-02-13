
import { SportsAgent } from './SportsAgent';
import { CodingAgent } from './CodingAgent';
import { NewsAgent } from './NewsAgent';
import { FinanceAgent } from './FinanceAgent';
import { TravelAgent } from './TravelAgent';
import { ShoppingAgent } from './ShoppingAgent';
import { GeneralAgent } from './GeneralAgent';
import { Agent } from './types';

export const agents: Record<string, Agent> = {
    [SportsAgent.id]: SportsAgent,
    [CodingAgent.id]: CodingAgent,
    [NewsAgent.id]: NewsAgent,
    [FinanceAgent.id]: FinanceAgent,
    [TravelAgent.id]: TravelAgent,
    [ShoppingAgent.id]: ShoppingAgent,
    [GeneralAgent.id]: GeneralAgent,
};

export const agentsList = Object.values(agents);

export const runAgent = async (agentId: string, input: string, history: any[]) => {
    const agent = agents[agentId];
    if (agent) {
        return agent.run(input, history);
    }
    // Fallback to General if agent not found
    return agents['general'].run(input, history);
};
