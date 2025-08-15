import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { Search, Package, Code2, CheckCircle2, ClipboardCheck } from 'lucide-react';

// Static step templates to decouple scheduling logic from translation function stability.
type StepTemplate = {
  id: number;
  duration: number;
  labelKey: string;
  logKeys: string[];
};

const STEP_TEMPLATES: StepTemplate[] = [
  {
    id: 1,
    duration: 1200,
    labelKey: 'landing.agentDemo.code.steps.analyze',
    logKeys: [
      'landing.agentDemo.code.logs.scan',
      'landing.agentDemo.code.logs.stack',
      'landing.agentDemo.code.logs.ts',
    ],
  },
  {
    id: 2,
    duration: 1200,
    labelKey: 'landing.agentDemo.code.steps.deps',
    logKeys: [
      'landing.agentDemo.code.logs.deps',
      'landing.agentDemo.code.logs.libs',
      'landing.agentDemo.code.logs.audit',
    ],
  },
  {
    id: 3,
    duration: 1800,
    labelKey: 'landing.agentDemo.code.steps.generate',
    logKeys: [
      'landing.agentDemo.code.logs.gen',
      'landing.agentDemo.code.logs.refactor',
      'landing.agentDemo.code.logs.clean',
    ],
  },
  {
    id: 4,
    duration: 1400,
    labelKey: 'landing.agentDemo.code.steps.quality',
    logKeys: ['landing.agentDemo.code.logs.lint', 'landing.agentDemo.code.logs.tests'],
  },
  {
    id: 5,
    duration: 900,
    labelKey: 'landing.agentDemo.code.steps.summary',
    logKeys: ['landing.agentDemo.code.logs.summary', 'landing.agentDemo.code.logs.ok'],
  },
];

const TOTAL_DURATION = STEP_TEMPLATES.reduce((acc, s) => acc + s.duration, 0);

interface CodeMasterDemoProps {
  isActive: boolean;
  onComplete?: () => void;
}

const CodeMasterDemo: React.FC<CodeMasterDemoProps> = ({ isActive, onComplete }) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const t = useT();

  // Step pipeline model (~7–9s) – translated only for rendering
  type Step = { id: number; label: string; duration: number; logs: string[] };
  const steps: Step[] = useMemo(
    () =>
      STEP_TEMPLATES.map((tpl) => ({
        id: tpl.id,
        duration: tpl.duration,
        label: t(tpl.labelKey),
        logs: tpl.logKeys.map((k) => t(k)),
      })),
    [t],
  );

  // Local state
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);

  // Reset and schedule only on activation change. Avoid depending on translated steps to prevent re-trigger loops.
  useEffect(() => {
    // clear timers
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (!isActive) return;

    setActiveStepIndex(0);
    setProgress(0);
    setLogLines([]);

    // schedule steps
    // Take a stable snapshot of translated content at activation time
    const stepSnapshot = STEP_TEMPLATES.map((tpl) => ({
      id: tpl.id,
      duration: tpl.duration,
      logs: tpl.logKeys.map((k) => t(k)),
    }));

    let acc = 0;
    stepSnapshot.forEach((step, idx) => {
      const startAt = acc;
      const endAt = acc + step.duration;

      // push logs within the step
      const perLog = step.duration / Math.max(1, step.logs.length);
      step.logs.forEach((line, i) => {
        const timerId = window.setTimeout(
          () => {
            setLogLines((prev) => [...prev, `[${step.id}/${stepSnapshot.length}] ${line}`]);
          },
          startAt + i * perLog,
        );
        timersRef.current.push(timerId);
      });

      // mark step active
      const ts = window.setTimeout(() => setActiveStepIndex(idx), startAt);
      timersRef.current.push(ts);

      // update progress smoothly across total time
      const tp = window.setTimeout(() => {
        const p = Math.round((endAt / TOTAL_DURATION) * 100);
        setProgress((prev) => (p > prev ? p : prev));
      }, endAt);
      timersRef.current.push(tp);

      acc = endAt;
    });

    // completion callback
    const done = window.setTimeout(() => {
      setProgress(100);
      if (onComplete) onComplete();
    }, TOTAL_DURATION + 50);
    timersRef.current.push(done);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [isActive, onComplete]);

  // Keep mounted even when inactive to avoid remount flashes in the hero section.
  // We simply render the shell; scheduler effect already early-returns when inactive.

  return (
    <div
      className={`grid h-full grid-rows-[auto_1fr_auto] overflow-hidden rounded-xl border border-gray-700 bg-gray-900 ${isActive ? '' : 'pointer-events-none opacity-0'}`}
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-100">{t('landing.agentDemo.code.title')}</h3>
        <div className="text-xs text-gray-400">~9s</div>
      </div>

      {/* Body */}
      <div className="grid flex-1 grid-rows-[auto_1fr]">
        {/* Steps */}
        <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-3">
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-5">
            {steps.map((s, idx) => {
              const state =
                idx < activeStepIndex ? 'done' : idx === activeStepIndex ? 'active' : 'idle';
              return (
                <li key={s.id} className="flex min-h-10 items-center gap-2 text-xs">
                  {(() => {
                    const Icon =
                      [Search, Package, Code2, CheckCircle2, ClipboardCheck][idx] ?? Search;
                    return (
                      <Icon
                        className={`h-4 w-4 ${state === 'done' ? 'text-emerald-500' : state === 'active' ? 'text-blue-400' : 'text-gray-500'}`}
                        aria-hidden
                      />
                    );
                  })()}
                  <span
                    className={`truncate ${state === 'idle' ? 'text-gray-500' : 'text-gray-200'}`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Terminal logs */}
        <div className="overflow-hidden p-4">
          <div className="max-h-[260px] overflow-y-auto pr-1 md:max-h-[320px]">
            <div
              className="space-y-1 font-mono text-xs leading-relaxed"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {logLines.length === 0
                ? null
                : logLines.map((line, i) => (
                    <div key={i} className="text-gray-300">
                      <span className="text-gray-500">$</span> {line}
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Footer: progress and mini status (fixed height) */}
        <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div
                className={`h-2 w-2 rounded-full ${prefersReducedMotion ? 'bg-emerald-600' : 'animate-pulse bg-emerald-500'}`}
                aria-hidden
              />
              <span>{t('landing.agentDemo.code.running')}</span>
            </div>
            <div
              className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-gray-800"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Agent progress"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              />
            </div>
            <div className="w-10 text-right text-xs tabular-nums text-gray-400">{progress}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeMasterDemo;
