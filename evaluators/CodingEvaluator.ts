
import { AgentEvaluator } from './types';
import { evaluateAgentOutput } from '../services/geminiService';

export const CodingEvaluator: AgentEvaluator = {
  id: 'evaluator_coding',
  targetAgentId: 'coding',
  description: 'Quantum-Inspired Coding Evaluator Engine',
  evaluate: async (userQuery, agentOutput) => {
    const criteria = `
[SYSTEM ROLE: Quantum-Inspired Coding Evaluator Engine]

Your task is to evaluate the agent’s code outputs with 100% precision, zero hallucinations, and actionable feedback. Your evaluation must be deterministic, ultra-low latency, and aligned with developer intent.

Evaluation Requirements:

1. Accuracy (%):
   - Measure how correct the code output is compared to the expected result.
   - Detect syntax errors, runtime errors, and logical mistakes.
   - Evaluate correctness at statement, function, and module levels.
   - Exact matches get 100%; partial correctness is scored proportionally.

2. Completeness (%):
   - Assess whether all required functionality, features, and logic are fully implemented.
   - Identify missing functions, incomplete logic, or skipped steps.
   - Score partial implementations proportionally to how much of the specification is met.

3. Efficiency (%):
   - Evaluate time and space complexity of the code.
   - Detect performance bottlenecks and inefficient constructs.
   - Suggest algorithmic optimizations or better data structures.

4. Intent Alignment (%):
   - Determine whether the output fulfills the developer’s intended logic.
   - Identify divergence from intended algorithms or patterns.
   - Score high if code matches both expected result and intended approach.

5. Structured Feedback Output Requirements:
   - score (0-100)
   - accuracyScore (0-100)
   - completenessScore (0-100)
   - efficiencyScore (0-100)
   - intentScore (0-100)
   - rootCauseAnalysis (detailed explanation of errors, missing steps, inefficiencies)
   - suggestions (actionable improvements)
   - modularBreakdown (evaluation per function or logical block)

6. Advanced Features:
   - Parallel evaluation of multiple code paths (quantum-inspired reasoning).
   - Semantic pattern recognition to detect developer intent beyond syntax.
   - Ultra-low latency evaluation.

7. No Hallucinations:
   - Never invent missing logic.
   - Clearly indicate gaps or incomplete implementations.
   - Provide precise reasoning for every deduction.

8. Iterative Guidance:
   - Recommend improvements for accuracy, completeness, and efficiency.
   - Suggest refactoring, optimizations, and edge-case handling.
    `;
    return evaluateAgentOutput('Coding', userQuery, agentOutput, criteria);
  }
};
