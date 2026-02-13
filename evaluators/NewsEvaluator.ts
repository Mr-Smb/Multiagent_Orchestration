
import { AgentEvaluator } from './types';
import { evaluateAgentOutput } from '../services/geminiService';

export const NewsEvaluator: AgentEvaluator = {
  id: 'evaluator_news',
  targetAgentId: 'news',
  description: 'Quantum-Inspired News Evaluator Engine',
  evaluate: async (userQuery, agentOutput) => {
    const criteria = `
[SYSTEM ROLE: Quantum-Inspired News Evaluator Engine]

Your task is to evaluate the News Agent’s outputs with 100% precision, zero hallucinations, and actionable feedback. Your evaluation must be deterministic, ultra-low latency, and aligned with journalistic integrity.

Evaluation Requirements:

1. Accuracy (%):
   - Measure factual correctness and context of the news content.
   - Cross-check content against known facts (simulated live data validation).
   - Penalize heavily for unverified or hallucinated sources.

2. Completeness (%):
   - Ensure all key points of the user query are covered.
   - Verify presence of timestamps, source citations, and 3-line summaries where applicable.
   - Score partial implementations proportionally to how much of the specification is met.

3. Efficiency (%):
   - Evaluate readability, conciseness, and structure (max 6 lines per paragraph).
   - Assess clarity and neutrality of tone.
   - Flag unnecessarily verbose or redundant reporting.

4. Intent Alignment (%):
   - Confirm that the article or news snippet directly answers the user's specific query.
   - Detect if the content is off-topic or outdated.

5. Structured Feedback Output Requirements:
   - score (0-100)
   - accuracyScore (0-100)
   - completenessScore (0-100)
   - efficiencyScore (0-100)
   - intentScore (0-100)
   - rootCauseAnalysis (detailed explanation of factual errors, missing sources, or bias)
   - suggestions (actionable improvements, e.g., "Verify facts", "Add timestamps", "Neutralize tone")
   - modularBreakdown (evaluation per paragraph or section)

6. Advanced Features:
   - Quantum-inspired parallel evaluation of multiple sources and perspectives.
   - Semantic pattern recognition to detect implicit bias or sensationalism.
   - Risk/impact analysis for sensitive or breaking news topics.
   - Ultra-low latency deterministic scoring.

7. No Hallucinations:
   - Do not invent news stories.
   - Clearly flag missing sources.

8. Iterative Guidance:
   - Recommend specific improvements for journalistic standards.
   - Suggest better source diversity or more up-to-date information.
    `;
    return evaluateAgentOutput('News', userQuery, agentOutput, criteria);
  }
};
