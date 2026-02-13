import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TrendingTopic } from '../types';

// Use standard formatting policy for agent outputs
export const FORMATTING_POLICY = `
STANDARD GENERATOR RULES:
1. OUTPUT MODE: Raw data stream. 
2. NO MARKDOWN BOLDING: Never use ** or __.
3. NO FILLER: Zero conversational text. No "Certainly", "Here is", or "Based on".
4. STRUCTURE: Direct answer first. Use simple dashes for lists.
5. NO FORMAL LABELS: Do not label sections with bold headers.
6. MAX 50 WORDS.
`;

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    return originalPrompt;
};

// Transcribe audio using gemini-3-flash-preview for speed and efficiency
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: audioBase64 } },
                    { text: "Transcribe the following audio content into plain text. No markdown or bolding." }
                ]
            }
        });
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Transcription error", error);
        return "";
    }
};

// Retrieve trending topics using Google Search grounding
export const getTrendingTopics = async (): Promise<TrendingTopic[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const mockData: TrendingTopic[] = [
        { category: 'MARKETS', headline: "Global markets stable", query: "market summary" },
        { category: 'TECH', headline: "AI development reaches new milestones", query: "latest AI tech news" },
        { category: 'WORLD', headline: "International summit concludes", query: "world news headlines" },
        { category: 'SPORTS', headline: "Championship race intensifies", query: "sports news today" },
    ];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Search for top 5 breaking news headlines globally across various categories.`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING, description: "News category (e.g. MARKETS, TECH)" },
                            headline: { type: Type.STRING, description: "Catchy headline" },
                            query: { type: Type.STRING, description: "Search query for more details" }
                        },
                        required: ['category', 'headline', 'query']
                    }
                }
            }
        });
        
        const result = JSON.parse(response.text || '[]') as TrendingTopic[];
        return Array.isArray(result) && result.length > 0 ? result : mockData;
    } catch (error) {
        console.error("Trending topics error", error);
        return mockData;
    }
};

// Stream generated content from agents using specific Gemini 3 models
export const generateContentStream = async (
    systemInstruction: string,
    userMessage: string,
    history: { role: string; content: string }[],
    tools: any[] = [{ googleSearch: {} }],
    modelName: string = 'gemini-3-flash-preview'
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const recentHistory = history.slice(-4); 
    const validHistory = recentHistory
        .filter(h => (h.role === 'user' || h.role === 'assistant') && h.content?.trim())
        .map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }));

    try {
        const chat = ai.chats.create({
            model: modelName,
            config: { 
                systemInstruction, 
                tools,
                thinkingConfig: { thinkingBudget: 0 }
            },
            history: validHistory
        });
        return await chat.sendMessageStream({ message: userMessage });
    } catch (error) {
        console.error("Stream Error", error);
        throw error;
    }
};

export interface EvaluationResult {
    score: number;
    accuracy: 'High' | 'Medium' | 'Low';
    completeness: 'Complete' | 'Partial' | 'Incomplete';
    suggestions: string[];
    reasoning: string;
}

// Evaluate agent output using gemini-3-pro-preview for complex reasoning tasks
export const evaluateAgentOutput = async (
    agentId: string, 
    userQuery: string, 
    agentOutput: string, 
    criteria: string
): Promise<EvaluationResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Evaluate the following output for the ${agentId} agent.\n\nCriteria:\n${criteria}\n\nUser Query: ${userQuery}\nAgent Output: ${agentOutput}`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        accuracy: { type: Type.STRING },
                        completeness: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reasoning: { type: Type.STRING }
                    },
                    required: ['score', 'accuracy', 'completeness', 'suggestions', 'reasoning']
                },
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return JSON.parse(response.text || '{}') as EvaluationResult;
    } catch (error) {
        console.error("Evaluation error", error);
        return { score: 0, accuracy: 'Low', completeness: 'Incomplete', suggestions: [], reasoning: "Evaluation service error." };
    }
};