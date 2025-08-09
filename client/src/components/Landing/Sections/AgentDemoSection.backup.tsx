import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { CodeMasterDemo } from '../AgentDemo/CodeMaster/CodeMasterDemo';
import { PDFUploader } from '../AgentDemo/PDFUploader';
import { DataAnalysis } from '../AgentDemo/DataAnalysis';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  demo: {
    question: string;
    response: string;
    code?: string;
  };
  specialty: string;
  description: string;
}

const AgentDemoSection = () => {
  const [activeAgent, setActiveAgent] = useState<string>('codeMaster');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Animation beim ersten Anzeigen der Sektion starten
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Verzögerung, um sicherzustellen, dass die Komponente gerendert ist
          setTimeout(() => {
            handleAskQuestion();
          }, 500);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  // Scrollt zum Ende der Nachrichten
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simuliert das Tippen des Agenten
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setShowResponse(true);
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);
  
  // Behandelt das Stellen einer Frage an den Agenten
  const handleAskQuestion = () => {
    setShowResponse(false);
    setIsTyping(true);
  };

  // Scrollt nach jeder Nachricht
  useEffect(() => {
    scrollToBottom();
  }, [isTyping, showResponse]);

  const agents: Record<string, Agent> = {
    codeMaster: {
      id: 'codeMaster',
      name: 'CodeMaster',
      avatar: '/assets/agents/codemaster.svg',
      color: 'from-blue-500 to-indigo-600',
      specialty: 'Code-Generierung & -Optimierung',
      description: 'Automatisiertes Schreiben, Debuggen und Optimieren von Code in über 50 Programmiersprachen',
      demo: {
        question: 'Wie kann ich diese Funktion in React optimieren?',
        response: 'Ich analysiere deinen Code und optimiere ihn mit modernen React-Techniken...',
        code: `import React, { useState, useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }) {
  const [count, setCount] = useState(0);
  
  const processItems = (items) => {
    console.log('Processing items...');
    return items.map(item => ({
      ...item,
      processed: true
    }));
  };
  
  const processedItems = processItems(items);
  
  return (
    <div>
      <h2>Items: {processedItems.length}</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Render again ({count})
      </button>
      <ul>
        {processedItems.map((item, i) => (
          <li key={i}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}``
    <span class="text-gray-500">// Aufwändige Berechnung</span>
    <span class="text-purple-400">return</span> computeExpensiveValue(data);
  }, [data]);

  <span class="text-purple-400">if</span> (!data) {
    <span class="text-purple-400">return</span> <span class="text-blue-400">null</span>;
  }

  <span class="text-purple-400">return</span> (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{data.title}</h2>
      <p className="text-gray-300">{data.description}</p>
      <button 
        onClick={memoizedCallback}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Aktion ausführen
      </button>
    </div>
  );
}

export <span class="text-purple-400">default</span> <span class="text-blue-400">React.memo</span>(<span class="text-yellow-300">OptimizedComponent</span>);`
      }
    },
    marketingMind: {
      id: 'marketingMind',
      name: 'MarketingMind',
      avatar: '/assets/agents/marketing.svg',
      color: 'from-pink-500 to-rose-600',
      specialty: 'Content & Kampagnen',
      description: 'Erstellt ansprechende Marketinginhalte und optimiert Kampagnen für maximale Reichweite',
      demo: {
        question: 'Erstelle einen Social Media Post für unser neues Produkt',
        response: `🚀 **Neues Produkt-Update!** 🎉

Wir freuen uns, dir unser neues KI-Tool vorzustellen, das deine Arbeitsabläufe revolutionieren wird! 

✨ Automatisiert wiederkehrende Aufgaben
🤖 Intelligente Vorhersagen
💡 Einfache Integration

Bereit für die Zukunft? Jetzt testen! #KINeuheiten #Produktivität`
      }
    },
    dataAnalyst: {
      id: 'dataAnalyst',
      name: 'DataAnalyst',
      avatar: '/assets/analytics.svg',
      color: 'from-green-500 to-emerald-600',
      specialty: 'Datenanalyse & Insights',
      description: 'Analysiert komplexe Datensätze und liefert umsetzbare Erkenntnisse',
      demo: {
        question: 'Analysiere die Verkaufsdaten vom letzten Quartal',
        response: `🔍 **Zusammenfassung Q2 2024**\n\n• **Umsatzwachstum**: +24% gegenüber Q1\n• **Beste Produkte**: KI-Tools (+37%)\n• **Top-Markt**: Deutschland (+42%)\n• **Durchschn. Warenkorb**: €89,99 (+12%)\n\nEmpfehlung: Fokus auf den deutschen Markt ausbauen und KI-Tools bewerben.`
      }
    }
  };

  const handleAskQuestion = () => {
    setShowResponse(false);
    setIsTyping(true);
    
    // Nach einer Verzögerung die Antwort anzeigen
    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 2000); // Längere Verzögerung für bessere Sichtbarkeit
  };

  const changeAgent = (agentId: string) => {
    setActiveAgent(agentId);
    setShowResponse(false);
    setIsTyping(false);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden"
    >
      {/* Parallax Hintergrund-Elemente */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut"
              }
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 text-sm font-medium text-indigo-300 bg-indigo-900/30 rounded-full border border-indigo-700/50 backdrop-blur-sm mb-4">
            KI der nächsten Generation
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Erlebe die KI-Agenten in Aktion
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sieh dir an, wie unsere spezialisierten KI-Agenten komplexe Aufgaben meistern
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agenten-Auswahl */}
          <div className="space-y-4">
            {Object.entries(agents).map(([key, agent]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => changeAgent(key)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  activeAgent === key 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white mr-4`}>
                    <span className="text-2xl">
                      {key === 'codeMaster' ? '👨‍💻' : 
                       key === 'marketingMind' ? '📢' : '📊'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm opacity-80">{agent.specialty}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Demo-Chat */}
          <div className="lg:col-span-2 flex flex-col bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-auto text-sm text-gray-400">
                {agents[activeAgent].name} - Live Demo
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              {/* Demo-Bereich für die spezifische Interaktion */}
              <div className="flex-1 overflow-hidden">
                {activeAgent === 'codeMaster' && (
                  <CodeMasterDemo 
                    isActive={activeAgent === 'codeMaster'}
                    onComplete={() => {
                      // Optional: Callback nach Abschluss der Demo
                    }}
                  />
                )}
                
                {activeAgent === 'marketingMind' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: showResponse ? 1 : 0,
                      y: showResponse ? 0 : 10
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <PDFUploader isActive={showResponse && activeAgent === 'marketingMind'} />
                  </motion.div>
                )}
                
                {activeAgent === 'dataAnalyst' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: showResponse ? 1 : 0,
                      scale: showResponse ? 1 : 0.95
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <DataAnalysis isActive={showResponse && activeAgent === 'dataAnalyst'} />
                  </motion.div>
                )}
              </div>
              
              {/* Chat-Verlauf */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-start mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
                      <span>👤</span>
                    </div>
                    <div className="bg-gray-700 rounded-lg px-4 py-2 text-gray-200 max-w-[80%]">
                      {agents[activeAgent].demo.question}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
                      <span>🤖</span>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg px-4 py-2 text-gray-200 max-w-[80%]">
                      {isTyping ? (
                        <div className="flex space-x-1 py-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : showResponse ? (
                        <TypeAnimation
                          sequence={[agents[activeAgent].demo.response]}
                          wrapper="div"
                          cursor={false}
                          speed={60}
                          style={{ whiteSpace: 'pre-line' }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 pt-6 border-t border-gray-700"
                    >
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">MÖCHTEST DU MEHR SEHEN?</h4>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={handleAskQuestion}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Weitere Beispiele anzeigen
                        </button>
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Live Demo starten
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parallax Scrolling Effekt */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 to-transparent z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
    </section>
  );
};

export default AgentDemoSection;
