import { GoogleGenAI, Type } from "@google/genai";
import { LogicStep } from '../types';

// Expanded Heuristic keyword maps for ultra-low latency L1 caching
const DETERMINISTIC_MAP: Record<string, string> = {
    // SPORTS
    'score': 'sports', 'scores': 'sports', 'game': 'sports', 'games': 'sports',
    'match': 'sports', 'matches': 'sports', 'won': 'sports', 'win': 'sports',
    'loss': 'sports', 'lost': 'sports', 'draw': 'sports', 'tie': 'sports',
    'nba': 'sports', 'nfl': 'sports', 'mlb': 'sports', 'nhl': 'sports',
    'fifa': 'sports', 'uefa': 'sports', 'epl': 'sports', 'laliga': 'sports',
    'bundesliga': 'sports', 'seriea': 'sports', 'f1': 'sports', 'formula1': 'sports',
    'nascar': 'sports', 'cricket': 'sports', 'ipl': 'sports', 't20': 'sports',
    'tennis': 'sports', 'wimbledon': 'sports', 'atp': 'sports', 'wta': 'sports',
    'golf': 'sports', 'pga': 'sports', 'rugby': 'sports', 'boxing': 'sports',
    'ufc': 'sports', 'mma': 'sports', 'olympics': 'sports', 'medal': 'sports',
    'goal': 'sports', 'standings': 'sports', 'playoffs': 'sports', 'finals': 'sports',
    'soccer': 'sports', 'football': 'sports', 'basketball': 'sports', 'baseball': 'sports',

    // CODING
    'code': 'coding', 'coding': 'coding', 'program': 'coding', 'programming': 'coding',
    'function': 'coding', 'method': 'coding', 'class': 'coding', 'bug': 'coding',
    'error': 'coding', 'debug': 'coding', 'fix': 'coding', 'api': 'coding',
    'json': 'coding', 'python': 'coding', 'javascript': 'coding', 'typescript': 'coding',
    'react': 'coding', 'html': 'coding', 'css': 'coding', 'sql': 'coding',

    // FINANCE
    'stock': 'finance', 'stocks': 'finance', 'market': 'finance', 'markets': 'finance',
    'invest': 'finance', 'investment': 'finance', 'portfolio': 'finance', 'trading': 'finance',
    'bitcoin': 'finance', 'crypto': 'finance', 'bank': 'finance', 'economy': 'finance',

    // TRAVEL
    'travel': 'travel', 'trip': 'travel', 'vacation': 'travel', 'flight': 'travel',
    'hotels': 'travel', 'booking': 'travel', 'destination': 'travel',

    // SHOPPING
    'shop': 'shopping', 'buy': 'shopping', 'purchase': 'shopping', 'store': 'shopping',
    'product': 'shopping', 'deal': 'shopping', 'discount': 'shopping',

    // NEWS
    'breaking': 'news', 'headline': 'news', 'headlines': 'news', 'news': 'news'
};

export interface RoutingResult {
    target: string;
    reason: string;
    confidence: number;
    latency: number;
    steps: LogicStep[];
    alternatives: { target: string; score: number }[];
}

export class QuantumRoutingGateway {
    /**
     * The Main Entry Point: Routes a user query to the best agent.
     */
    public static async route(query: string): Promise<RoutingResult> {
        const start = performance.now();
        const steps: LogicStep[] = [];
        const lowerQuery = query.toLowerCase();

        // 1. FAST PATH: Heuristic / Deterministic Check
        const tokens = lowerQuery.split(/[\s,.?!]+/);
        steps.push({ step: 'Tokenization', detail: `${tokens.length} tokens parsed`, latencyMs: performance.now() - start });

        for (const token of tokens) {
            if (DETERMINISTIC_MAP[token]) {
                const target = DETERMINISTIC_MAP[token];
                const end = performance.now();
                steps.push({ step: 'L1 Cache Hit', detail: `Deterministic keyword match: "${token}" -> ${target}`, latencyMs: end - start });
                
                return {
                    target,
                    reason: `Deterministic Keyword: ${token}`,
                    confidence: 1.0,
                    latency: end - start,
                    steps: steps,
                    alternatives: []
                };
            }
        }

        // 2. QUANTUM FALLBACK: Gemini 3 Flash Preview
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const prompt = `Classify the following query into one of these categories: sports, coding, news, finance, travel, shopping, or general. Return strictly JSON.\nQuery: "${query}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            target: { type: Type.STRING, description: "Category target" },
                            confidence: { type: Type.NUMBER, description: "Classification confidence (0-1)" }
                        },
                        required: ['target', 'confidence']
                    }
                }
            });

            const end = performance.now();
            steps.push({ step: 'Model Inference', detail: 'Gemini 3 Flash Classification', latencyMs: end - start });

            const result = JSON.parse(response.text || '{"target": "general", "confidence": 0.5}');

            return {
                target: result.target || 'general',
                reason: 'Gemini 3 Flash Routing',
                confidence: result.confidence || 0.8,
                latency: end - start,
                steps: steps,
                alternatives: []
            };

        } catch (e) {
            console.error("Routing Error", e);
             return {
                target: 'general',
                reason: 'Fallback (Routing Error)',
                confidence: 0.0,
                latency: performance.now() - start,
                steps: [...steps, { step: 'Error', detail: 'LLM Routing Failed', latencyMs: 0 }],
                alternatives: []
            };
        }
    }
}