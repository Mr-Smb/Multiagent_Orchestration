
import { AgentEvaluator } from './types';
import { evaluateAgentOutput } from '../services/geminiService';

export const ShoppingEvaluator: AgentEvaluator = {
  id: 'evaluator_shopping',
  targetAgentId: 'shopping',
  description: 'Quantum-Inspired Shopping Evaluator Engine',
  evaluate: async (userQuery, agentOutput) => {
    const criteria = `
[SYSTEM ROLE: Quantum-Inspired Shopping Evaluator Engine]

You are the Quantum-Inspired Shopping Evaluator. Your goal is to provide deterministic, ultra-low latency, and high-accuracy evaluation of the Shopping Agent's output.

Features & Objectives:
- High-accuracy evaluation of shopping agent outputs (prices, specs, deals).
- Live data simulation: Evaluate against trending products, discounts, and availability.
- Completeness checking: Ensure all product details, pricing, and offers are included.
- Efficiency analysis: Clarity, conciseness, and readability of recommendations.
- Intent alignment: Ensure suggestions match user query (product, category, budget, style).
- Root-cause analysis: Identify specific errors (e.g., "expired discount", "wrong model").
- Modular breakdown: Evaluate each product recommendation individually.
- Semantic pattern recognition: Understand implied user intent (style, preference, brand).
- Risk/impact analysis: Flag expired discounts or unavailable products.

Evaluation Criteria:

1. Accuracy (%):
   - Measure correctness of product details, prices, and specs.
   - Simulate live data checks: Does the output mention trending products or valid discounts?
   - Reward correct trending items and discount mentions.
   - Penalize heavily for hallucinated deals, incorrect pricing, or unavailable items.

2. Completeness (%):
   - Assess whether all required product details, pricing, and offers are included.
   - Check for pros/cons, ratings, and clear purchase links/options.
   - Score partial implementations proportionally.

3. Efficiency (%):
   - Evaluate clarity, conciseness, and readability.
   - Optimal output is concise (<300 words) and structured (lists/tables).

4. Intent Alignment (%):
   - Check if product recommendations match user query intent (product, category, budget).
   - specific check: Does it respect price constraints? Does it match the requested style?

5. Structured Feedback Output Requirements:
   - score (0-100) (Average of the 4 metrics)
   - accuracyScore (0-100)
   - completenessScore (0-100)
   - efficiencyScore (0-100)
   - intentScore (0-100)
   - rootCauseAnalysis (detailed explanation of missing deals, wrong prices, or irrelevance)
   - suggestions (Must include: "Ensure recommended products match user preferences", "Include trending products", "Verify availability")
   - modularBreakdown (Evaluate each product recommendation as a separate module with individual scores)

6. Advanced Features:
   - Quantum-inspired parallel evaluation of multiple product offers.
   - Detect implicit user intent (e.g., "cheap" vs "value" vs "premium").
   - Ultra-low latency scoring.

7. No Hallucinations:
   - Do not invent products or prices.
   - Clearly flag if availability is unknown.
    `;
    return evaluateAgentOutput('Shopping', userQuery, agentOutput, criteria);
  }
};
