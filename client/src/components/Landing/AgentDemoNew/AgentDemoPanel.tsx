import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedAgentIcon } from '../AnimatedAgentIcon';

export interface AgentDemoPanelProps {
  command: string;
  output: string;
  autoStart?: boolean; // startet Autotypen, wenn true
  typingSpeedMs?: number; // Geschwindigkeit pro Zeichen
  className?: string;
}

/**
 * AgentDemoPanel
 * - Oben: automatisch getippter Befehl/Prompt
 * - Unten: Ausgabe, sobald Tippen fertig
 * - Minimaler, performanter Aufbau ohne externe Datenabhängigkeiten
 */
export const AgentDemoPanel: React.FC<AgentDemoPanelProps> = ({
  command,
  output,
  autoStart = false,
  typingSpeedMs = 28,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const timerRef = useRef<number | null>(null);
  const showOutputTimeoutRef = useRef<number | null>(null);

  // Start/Reset, wenn command oder autoStart wechselt
  useEffect(() => {
    if (!autoStart) return;
    // reset
    setTyped('');
    setShowOutput(false);
    setIsTyping(true);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (prefersReducedMotion) {
      // Kein Tippen animieren – direkt anzeigen
      setTyped(command);
      setIsTyping(false);
      setShowOutput(true);
      return;
    }

    let i = 0;
    timerRef.current = window.setInterval(
      () => {
        i += 1;
        setTyped(command.slice(0, i));
        if (i >= command.length) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsTyping(false);
          // kleine Verzögerung, dann Ausgabe
          showOutputTimeoutRef.current = window.setTimeout(() => {
            setShowOutput(true);
            showOutputTimeoutRef.current = null;
          }, 240);
        }
      },
      Math.max(typingSpeedMs, 8),
    );

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (showOutputTimeoutRef.current) {
        window.clearTimeout(showOutputTimeoutRef.current);
        showOutputTimeoutRef.current = null;
      }
    };
  }, [command, autoStart, typingSpeedMs, prefersReducedMotion]);

  const containerCls = useMemo(
    () => `w-full max-w-[900px] mx-auto px-2 ${className ?? ''}`,
    [className],
  );

  return (
    <div className={`relative ${containerCls}`}>
      {/* Animated Agent Icon */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: 'clamp(-28px, -6.5vw, -14px)' }}
      >
        <AnimatedAgentIcon size="lg" animate={showOutput} variant="plain" />
      </div>
      
      {/* Prompt-Zeile */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-[2px] mt-12">
        <div className="flex items-start gap-2">
          <div className="bg-white/8 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ring-1 ring-white/10">
            <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <motion.p
              className="text-[12px] leading-snug text-white/90"
              aria-live="polite"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="select-none text-white/60">Q:</span> <span>{typed}</span>
              {isTyping && !prefersReducedMotion && (
                <span
                  className="ml-[1px] inline-block h-[12px] w-[9px] translate-y-[1px] animate-pulse bg-white/80 align-middle"
                  aria-hidden
                >
                  {/* Cursor */}
                </span>
              )}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Ausgabe */}
      <motion.div
        className="mt-3 min-h-[88px] rounded-xl border border-white/10 bg-white/[0.03] p-3"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
        animate={{ opacity: showOutput ? 1 : 0.4, y: showOutput ? 0 : 2 }}
        transition={{ duration: 0.22 }}
        aria-live="polite"
      >
        {!showOutput ? (
          <div className="text-[12px] text-white/70">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:240ms]" />
            </span>
          </div>
        ) : (
          <p className="text-[12px] leading-snug text-white/90">
            <span className="select-none text-white/60">A:</span> {output}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AgentDemoPanel;
