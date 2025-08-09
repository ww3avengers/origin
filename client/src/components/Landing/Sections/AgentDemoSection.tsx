import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import CodeMasterDemo from '../AgentDemo/CodeMaster/CodeMasterDemo.fixed';
import { PDFUploader } from '../AgentDemo/PDFUploader';
import { DataAnalysis } from '../AgentDemo/DataAnalysis';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  specialty: string;
  description: string;
  demo: {
    question: string;
    response: string;
  };
}

const AgentDemoSection = () => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeAgent, setActiveAgent] = useState<string>('codeMaster');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Intersection Observer für zukünftige Verwendung
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Kein automatisches Starten der Frage mehr
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

  // Scrollt nur, wenn der Benutzer interagiert hat
  useEffect(() => {
    if (hasAnimated) {
      scrollToBottom();
    }
  }, [isTyping, showResponse, hasAnimated]);

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
      },
    },
    marketingMind: {
      id: 'marketingMind',
      name: 'MarketingMind',
      avatar: '/assets/agents/marketingmind.svg',
      color: 'from-purple-500 to-pink-600',
      specialty: 'Content-Erstellung & Kampagnen',
      description: 'Erstellt ansprechende Marketinginhalte und optimiert Kampagnen für maximale Reichweite',
      demo: {
        question: 'Erstelle einen Social Media Post für unser neues Produkt',
        response: 'Hier ist ein ansprechender Social Media Post für dein neues Produkt...',
      },
    },
    dataAnalyst: {
      id: 'dataAnalyst',
      name: 'DataAnalyst',
      avatar: '/assets/agents/dataanalyst.svg',
      color: 'from-green-500 to-teal-600',
      specialty: 'Datenanalyse & Visualisierung',
      description: 'Analysiert komplexe Datensätze und erstellt verständliche Visualisierungen',
      demo: {
        question: 'Analysiere diese Verkaufsdaten und zeige wichtige Trends',
        response: 'Ich habe die Verkaufsdaten analysiert und folgende Trends identifiziert...',
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden"
    >
      {/* Parallax Hintergrund-Elemente */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 80 + 40,
                height: Math.random() * 80 + 40,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 80 - 40, 0],
                x: [0, Math.random() * 80 - 40, 0],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{
                duration: Math.random() * 16 + 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-100 mb-6">
            Unsere KI-Agenten in Aktion
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Entdecke, wie unsere spezialisierten KI-Agenten dir bei deinen täglichen Aufgaben helfen können.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agenten-Auswahl */}
          <div className="space-y-4">
            {Object.entries(agents).map(([key, agent]) => (
              <motion.button
                key={key}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                onClick={() => {
                  setActiveAgent(key);
                  handleAskQuestion();
                }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  activeAgent === key
                    ? 'bg-gradient-to-r ' + agent.color + ' shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800 hover:bg-gray-700/80'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mr-4">
                    <img src={agent.avatar} alt={agent.name} className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-300">{agent.specialty}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Demo-Bereich */}
          <div className="lg:col-span-2 flex flex-col bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-sm text-gray-400">
                {agents[activeAgent].name} - {agents[activeAgent].specialty}
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
                  <div className="p-6">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Social Media Post Generator
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <p className="text-gray-300 text-sm mb-2">Thema:</p>
                          <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Worüber soll der Post handeln?"
                          />
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <p className="text-gray-300 text-sm mb-2">Plattform:</p>
                          <select className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Twitter</option>
                            <option>LinkedIn</option>
                            <option>Instagram</option>
                            <option>Facebook</option>
                          </select>
                        </div>
                        <button 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
                          onClick={handleAskQuestion}
                        >
                          Post generieren
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeAgent === 'dataAnalyst' && (
                  <div className="p-6">
                    <DataAnalysis isActive={true} />
                  </div>
                )}
              </div>

              {/* Chat-Interface */}
              <div className="border-t border-gray-700 bg-gray-900 p-4">
                <div className="max-h-40 overflow-y-auto mb-4 space-y-3" style={{ minHeight: '100px' }}>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
                      Q
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-sm text-white">
                      {agents[activeAgent].demo.question}
                    </div>
                  </div>

                  {isTyping && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
                        A
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 flex space-x-1">
                        {!prefersReducedMotion ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </>
                        ) : (
                          <span>Antwort wird generiert …</span>
                        )}
                      </div>
                    </div>
                  )}

                  {showResponse && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
                        A
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                        {prefersReducedMotion ? (
                          <span>{agents[activeAgent].demo.response}</span>
                        ) : (
                          <TypeAnimation
                            sequence={[agents[activeAgent].demo.response]}
                            wrapper="span"
                            cursor={false}
                            speed={65}
                            style={{ display: 'inline-block' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Stelle eine Frage..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTyping) {
                        handleAskQuestion();
                      }
                    }}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={isTyping}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Senden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parallax Scrolling Effekt */}
      {prefersReducedMotion ? (
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 to-transparent z-20 pointer-events-none"
        />
      ) : (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 to-transparent z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      )}
    </section>
  );
};

export default AgentDemoSection;
