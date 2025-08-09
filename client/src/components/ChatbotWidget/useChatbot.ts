import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ChatResponseChunk, ChatbotConfig, SendMessagePayload } from './types';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChatbot(config: ChatbotConfig) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initial: ChatMessage[] = config.welcome
      ? [{ id: uuid(), role: 'assistant', content: config.welcome, createdAt: Date.now() }]
      : [];
    return initial;
  });

  const controllerRef = useRef<AbortController | null>(null);

  const history = useMemo(() => {
    const max = config.maxHistory ?? 12;
    const start = Math.max(0, messages.length - max);
    return messages.slice(start);
  }, [messages, config.maxHistory]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const send = useCallback(
    async (content: string) => {
      if (!config.apiUrl) {
        setError('Chatbot API URL ist nicht konfiguriert');
        return;
      }
      setError(null);
      setLoading(true);

      const userMsg: ChatMessage = { id: uuid(), role: 'user', content, createdAt: Date.now() };
      const tempAssistant: ChatMessage = { id: uuid(), role: 'assistant', content: '', createdAt: Date.now() };
      setMessages((prev) => [...prev, userMsg, tempAssistant]);

      const payload: SendMessagePayload = {
        messages: history.map((m) => ({ role: m.role, content: m.content })).concat({ role: 'user', content }),
        model: config.model,
        persona: config.persona,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      };

      try {
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();

        const res = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controllerRef.current.signal,
        });

        // Try streaming first (text/event-stream or chunked text)
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }

        if (contentType.includes('text/event-stream') || contentType.includes('ndjson')) {
          const reader = res.body?.getReader();
          if (!reader) throw new Error('Stream nicht verfügbar');
          const decoder = new TextDecoder();
          let acc = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });

            // try to split by lines
            const lines = acc.split(/\n+/);
            acc = lines.pop() || '';
            for (const line of lines) {
              const l = line.trim();
              if (!l) continue;
              try {
                const chunk: ChatResponseChunk = JSON.parse(l);
                if (chunk.error) throw new Error(chunk.error);
                if (chunk.content) {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === tempAssistant.id ? { ...m, content: m.content + chunk.content } : m))
                  );
                }
              } catch {
                // fallback: treat as plain text token
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempAssistant.id ? { ...m, content: m.content + l } : m))
                );
              }
            }
          }
        } else if (contentType.includes('application/json')) {
          const data = await res.json();
          const text: string = data?.content || data?.message || '';
          setMessages((prev) => prev.map((m) => (m.id === tempAssistant.id ? { ...m, content: text } : m)));
        } else {
          const text = await res.text();
          setMessages((prev) => prev.map((m) => (m.id === tempAssistant.id ? { ...m, content: text } : m)));
        }
      } catch (e: any) {
        setError(e?.message || 'Unbekannter Fehler');
        setMessages((prev) =>
          prev.map((m) => (m.role === 'assistant' && m.content === '' ? { ...m, content: 'Entschuldige, da ging etwas schief.' } : m))
        );
      } finally {
        setLoading(false);
      }
    },
    [config.apiUrl, config.model, config.persona, history]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setMessages(config.welcome ? [{ id: uuid(), role: 'assistant', content: config.welcome, createdAt: Date.now() }] : []);
    setError(null);
  }, [config.welcome]);

  return { open, toggle, loading, error, messages, send, stop, reset };
}
