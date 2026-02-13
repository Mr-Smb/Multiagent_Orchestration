
export interface SubAgent {
  id: string;
  display_name: string;
  status: 'idle' | 'working' | 'success' | 'error';
}

export interface PrimaryAgent {
  id: string;
  display_name: string;
  description: string;
  sub_agents: SubAgent[];
  active: boolean;
  priority: number;
  icon: string; // Lucide icon name
  usageCount?: number;
  status?: 'idle' | 'working' | 'success' | 'error';
}

export interface EvaluatorAgent {
  id: string;
  role: string;
  description: string;
  status: 'idle' | 'evaluating' | 'approved' | 'rejected';
  confidence_score?: number;
}

export interface LogicStep {
  step: string;
  detail: string;
  latencyMs: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string; // Which agent generated this
  metrics?: {
    latencyMs: number;
    confidence: number;
    sources: string[];
  };
  computation?: {
    steps: LogicStep[];
    alternatives?: { target: string; score: number }[];
  };
}

export interface SystemState {
  isAuthenticated: boolean;
  isRecording: boolean;
  activeAgentId: string | null;
  latency: number;
  confidence: number;
}

export interface TrendingTopic {
  category: string;
  headline: string;
  query: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  domain?: string;
  isArchived?: boolean;
}