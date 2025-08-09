import type { ChatbotConfig } from './types';

export const defaultChatbotConfig: ChatbotConfig = {
  apiUrl: import.meta.env.VITE_CHATBOT_API_URL || '/api/chatbot',
  model: import.meta.env.VITE_CHATBOT_MODEL || 'gpt-4o-mini',
  persona: import.meta.env.VITE_CHATBOT_PERSONA || 'sales-advisor',
  welcome:
    import.meta.env.VITE_CHATBOT_WELCOME ||
    'Hi! Ich helfe dir, LibreChat zu verstehen und den passenden Plan zu finden. Wie kann ich dir helfen?',
  maxHistory: Number(import.meta.env.VITE_CHATBOT_MAX_HISTORY || 12),
};
