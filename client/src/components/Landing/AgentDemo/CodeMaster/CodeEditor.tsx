import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeEditorProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = true,
  readOnly = false,
  className = '',
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const lineHeight = 20; // px
  
  // Cursor-Animation
  useEffect(() => {
    if (cursorRef.current) {
      const cursor = cursorRef.current;
      let isVisible = true;
      
      const blink = () => {
        isVisible = !isVisible;
        cursor.style.opacity = isVisible ? '1' : '0';
        setTimeout(blink, 500);
      };
      
      blink();
      return () => {
        isVisible = true; // Reset for cleanup
      };
    }
  }, []);
  
  // Berechne die Position des Cursors
  const getCursorPosition = () => {
    if (!code) return { top: 0, left: 0 };
    
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1];
    const line = lines.length - 1;
    const column = lastLine.length;
    
    return {
      top: `${line * lineHeight}px`,
      left: `${column * 8.5}px`, // Ca. 8.5px pro Zeichen (Monospace)
    };
  };
  
  const cursorPosition = getCursorPosition();
  
  return (
    <div 
      ref={editorRef}
      className={`relative font-mono text-sm ${className}`}
      style={{
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        lineHeight: `${lineHeight}px`,
        minHeight: '100%',
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.9em',
          lineHeight: `${lineHeight}px`,
          minHeight: '100%',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'Fira Code, monospace',
            lineHeight: `${lineHeight}px`,
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
      
      {/* Cursor */}
      {!readOnly && (
        <motion.span
          ref={cursorRef}
          className="absolute w-0.5 h-6 bg-blue-400"
          style={{
            ...cursorPosition,
            transition: 'opacity 0.2s ease-in-out',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Overlay für Klick-Events, falls readOnly */}
      {readOnly && (
        <div 
          className="absolute inset-0 cursor-not-allowed"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
};

export default CodeEditor;
