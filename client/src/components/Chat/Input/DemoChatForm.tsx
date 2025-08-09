import { useEffect, useState } from 'react';

export default function DemoChatForm() {
  const [message, setMessage] = useState('');
  const messages = [
    'Wie kann ich dir heute helfen?',
    'Erstelle mir eine E-Mail',
    'Erkläre mir KI in einfachen Worten',
    'Schreibe einen Code für eine To-Do-Liste'
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
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">Chat Demo</span>
          </div>
        </div>
        
        <div className="h-40 p-4 overflow-y-auto">
          <div className="flex items-start mb-2">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 max-w-xs">
              {messages[(index - 1 + messages.length) % messages.length]}
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
              {typing ? message + '|' : message}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-gray-400">
              {typing ? 'Tippe...' : 'Chat wird simuliert...'}
            </div>
            <button 
              className="ml-2 bg-blue-500 text-white rounded-full p-2"
              disabled
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
