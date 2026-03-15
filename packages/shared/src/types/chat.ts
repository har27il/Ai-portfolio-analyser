export interface Conversation {
  id: string;
  userId: string;
  portfolioId?: string;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    citations?: Citation[];
    suggestedFollowUps?: string[];
    analysisUsed?: string[];
  };
  createdAt: Date;
}

export interface Citation {
  type: 'holding' | 'sector' | 'metric' | 'benchmark';
  label: string;
  value: string | number;
}

export type ChatIntent =
  | 'health_check'
  | 'sector_query'
  | 'holding_query'
  | 'comparison'
  | 'recommendation'
  | 'risk_query'
  | 'cost_query'
  | 'overlap_query'
  | 'general';
