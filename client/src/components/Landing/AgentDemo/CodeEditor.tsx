import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeEditorProps {
  code: string;
  isTyping: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, isTyping }) => {
  const [typedCode, setTypedCode] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping) {
      setTypedCode(code);
      return;
    }

    setTypedCode('');
    let currentIndex = 0;
    
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    // Typing effect
    const typingInterval = setInterval(() => {
      if (currentIndex < code.length) {
        setTypedCode(prev => prev + code[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        clearInterval(cursorInterval);
        setShowCursor(true);
      }
    }, 10); // Faster typing speed for better UX

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [code, isTyping]);

  // Trigger animation when component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          ease: "easeOut"
        }
      } : {}}
    >
      {/* Window controls */}
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs text-gray-400">code.js</div>
      </div>
      
      {/* Code content */}
      <div className="p-4 font-mono text-sm text-gray-300 h-64 overflow-auto">
        <pre className="whitespace-pre-wrap">
          <code>
            {typedCode}
            {showCursor && (
              <span className="inline-block w-2 h-5 ml-1 bg-blue-500 align-middle animate-pulse"></span>
            )}
          </code>
        </pre>
        
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              className="flex items-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.3 }
              }}
              exit={{ opacity: 0 }}
            >
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse mr-2"></div>
              <span className="text-xs text-blue-400">CodeMaster schreibt...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
