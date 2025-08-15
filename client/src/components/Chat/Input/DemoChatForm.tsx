import { useEffect, useState } from 'react';

export default function DemoChatForm() {
  const [message, setMessage] = useState('');
  const messages = [
    'Wie kann ich dir heute helfen?',
    'Erstelle mir eine E-Mail',
    'Erkläre mir KI in einfachen Worten',
    'Schreibe einen Code für eine To-Do-Liste',
  ];
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  // Automatischer Nachrichtenwechsel
  useEffect(() => {
    const timer = setInterval(() => {
      setTyping(false);
      setMessage(messages[index]);
      setTyping(true);
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [index]);

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 bg-white/10 p-4 backdrop-blur dark:border-zinc-800/40 dark:bg-zinc-900/20">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Chat Demo</span>
          </div>
        </div>

        <div className="h-40 overflow-y-auto p-4">
          <div className="mb-2 flex items-start">
            <div className="max-w-xs rounded-lg border border-white/10 bg-white/60 px-4 py-2 text-gray-800 dark:border-zinc-800/40 dark:bg-zinc-900/60 dark:text-gray-200">
              {messages[(index - 1 + messages.length) % messages.length]}
            </div>
          </div>
          <div className="flex items-start">
            <div className="btn-brand max-w-xs rounded-lg px-4 py-2">
              {typing ? message + '|' : message}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 dark:border-zinc-800/40">
          <div className="flex items-center">
            <div className="badge-brand-soft flex-1 text-center">
              {typing ? 'Tippe...' : 'Chat wird simuliert...'}
            </div>
            <button className="btn-chat btn-chat--circle ml-2" disabled>
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
