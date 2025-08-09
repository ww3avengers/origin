export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number; // epoch ms
}

export interface SendMessagePayload {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>;
  // optional metadata for routing/models
  model?: string;
  persona?: string;
  pagePath?: string;
  language?: string;
}

export interface ChatResponseChunk {
  id?: string;
  content?: string;
  done?: boolean;
  error?: string;
}

export interface ChatbotConfig {
  apiUrl?: string; // full URL to your chatbot endpoint
  model?: string;
  persona?: string;
  welcome?: string;
  // Safety limits
  maxHistory?: number; // how many messages to keep client-side
}
