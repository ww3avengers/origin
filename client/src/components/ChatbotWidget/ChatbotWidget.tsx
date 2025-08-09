import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { defaultChatbotConfig } from './config';
import type { ChatbotConfig, ChatMessage } from './types';
import { useChatbot } from './useChatbot';

export interface ChatbotWidgetProps {
  config?: Partial<ChatbotConfig>;
  className?: string;
}

const panelVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.98 },
};

export function ChatbotWidget({ config, className }: ChatbotWidgetProps) {
  const merged = useMemo<ChatbotConfig>(() => ({ ...defaultChatbotConfig, ...(config || {}) }), [config]);
  const { open, toggle, loading, error, messages, send, stop, reset } = useChatbot(merged);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    await send(text);
  };

  return (
    <div className={`fixed z-50 right-4 bottom-4 ${className || ''}`} aria-live="polite">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20 transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <span className="sr-only">Chat öffnen</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6"
        >
          <path d="M7 8h10M7 12h6m7-2a8 8 0 10-3.293 6.293L21 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white/90" aria-hidden></span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="mt-3 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-white/10 ring-1 ring-white/10 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-xl shadow-2xl dark:from-zinc-900/80 dark:to-zinc-900/60 dark:ring-zinc-800/40"
            role="dialog"
            aria-modal="true"
            aria-label="Produkt-Chatbot"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300">LibreChat Berater</p>
              </div>
              <div className="flex items-center gap-2">
                {loading ? (
                  <button
                    onClick={stop}
                    className="text-xs text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={reset}
                    className="text-xs text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={toggle}
                  className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <span className="sr-only">Schließen</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="max-h-80 overflow-y-auto px-3 py-2 space-y-2 bg-gradient-to-b from-transparent via-white/40 to-transparent dark:via-zinc-800/40">
              {messages.map((m: ChatMessage) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ring-1 ${
                      m.role === 'user'
                        ? 'bg-blue-50 ring-blue-200 text-blue-900 dark:bg-sky-950/40 dark:ring-sky-900/40 dark:text-sky-100'
                        : 'bg-white/70 ring-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:ring-zinc-700 dark:text-zinc-100'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {error && (
                <p className="text-xs text-rose-500">{error}</p>
              )}
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Frag mich nach Features, Preisen oder der Integration…"
                  className="flex-1 rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-cyan-700 dark:focus:ring-cyan-900/30"
                  aria-label="Nachricht eingeben"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 px-3 py-2 text-sm font-medium text-white shadow ring-1 ring-white/30 transition hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20" /><path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" className="opacity-80"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12l16-7-7 16-2-6-7-3z"/></svg>
                  )}
                  <span>Senden</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatbotWidget;
