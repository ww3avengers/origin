import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { ClipboardList, Sparkles, FilePenLine, Search, Wand2 } from 'lucide-react';

export interface MarketingMindDemoProps {
  isActive: boolean;
  onComplete?: () => void;
}

const MarketingMindDemo = ({ isActive, onComplete }: MarketingMindDemoProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const t = useT();

  type Step = { id: number; label: string; duration: number; logs: string[] };
  const steps: Step[] = useMemo(
    () => [
      {
        id: 1,
        label: t('landing.agentDemo.marketing.steps.brief'),
        duration: 1000,
        logs: [
          t('landing.agentDemo.marketing.logs.parseBrief'),
          t('landing.agentDemo.marketing.logs.goals'),
        ],
      },
      {
        id: 2,
        label: t('landing.agentDemo.marketing.steps.tone'),
        duration: 1200,
        logs: [
          t('landing.agentDemo.marketing.logs.tone'),
          t('landing.agentDemo.marketing.logs.hooks'),
        ],
      },
      {
        id: 3,
        label: t('landing.agentDemo.marketing.steps.draft'),
        duration: 1600,
        logs: [
          t('landing.agentDemo.marketing.logs.draft'),
          t('landing.agentDemo.marketing.logs.variants'),
        ],
      },
      {
        id: 4,
        label: t('landing.agentDemo.marketing.steps.seo'),
        duration: 1400,
        logs: [
          t('landing.agentDemo.marketing.logs.keywords'),
          t('landing.agentDemo.marketing.logs.hashtags'),
        ],
      },
      {
        id: 5,
        label: t('landing.agentDemo.marketing.steps.polish'),
        duration: 1000,
        logs: [
          t('landing.agentDemo.marketing.logs.readability'),
          t('landing.agentDemo.marketing.logs.final'),
        ],
      },
    ],
    [t],
  );

  const totalDuration = useMemo(() => steps.reduce((a, s) => a + s.duration, 0), [steps]);

  const timersRef = useRef<number[]>([]);
  // Track if the pipeline has already been started to avoid re-starting on parent re-renders
  const startedRef = useRef(false);
  // Keep a stable reference to onComplete to avoid effect restarts due to changing function identity
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [previewVariant, setPreviewVariant] = useState(0);

  useEffect(() => {
    // clear timers first
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    // If not active, ensure we reset started flag and exit
    if (!isActive) {
      startedRef.current = false;
      return;
    }
    // If already started and still active, do not re-initialize timers
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    setActiveStepIndex(0);
    setProgress(0);
    setLogLines([]);
    setPreviewVariant(0);

    let acc = 0;
    steps.forEach((s, idx) => {
      const startAt = acc;
      const endAt = acc + s.duration;

      const perLog = s.duration / Math.max(1, s.logs.length);
      s.logs.forEach((line, i) => {
        const tm = window.setTimeout(
          () => {
            setLogLines((prev) => [...prev, `[${s.id}/${steps.length}] ${line}`]);
          },
          startAt + i * perLog,
        );
        timersRef.current.push(tm);
      });

      const ts = window.setTimeout(() => setActiveStepIndex(idx), startAt);
      timersRef.current.push(ts);

      const tv = window.setTimeout(
        () => setPreviewVariant((v) => (v + 1) % 2),
        startAt + Math.min(500, s.duration - 200),
      );
      timersRef.current.push(tv);

      const tp = window.setTimeout(() => {
        const p = Math.round((endAt / totalDuration) * 100);
        setProgress((prev) => (p > prev ? p : prev));
      }, endAt);
      timersRef.current.push(tp);

      acc = endAt;
    });

    const done = window.setTimeout(() => {
      setProgress(100);
      // Use stable ref to avoid dependency churn
      onCompleteRef.current?.();
    }, totalDuration + 60);
    timersRef.current.push(done);

    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
      // Allow a fresh start next time it becomes active
      startedRef.current = false;
    };
  }, [isActive, steps, totalDuration]);

  const previewTexts = [
    t('landing.agentDemo.marketing.preview.v1'),
    t('landing.agentDemo.marketing.preview.v2'),
  ];

  return (
    <div className="grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-100">
          {t('landing.agentDemo.marketing.title')}
        </h3>
        <ol className="hidden items-center gap-3 text-xs md:flex">
          {steps.map((s, idx) => {
            const state =
              idx < activeStepIndex ? 'done' : idx === activeStepIndex ? 'active' : 'idle';
            const Icon =
              [ClipboardList, Sparkles, FilePenLine, Search, Wand2][idx] ?? ClipboardList;
            return (
              <li key={s.id} className="flex min-h-10 items-center gap-2">
                <Icon
                  className={`h-4 w-4 ${state === 'done' ? 'text-emerald-500' : state === 'active' ? 'text-[rgb(var(--accent))]' : 'text-gray-500'}`}
                  aria-hidden
                />
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

      {/* Body */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {/* Preview */}
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-3">
          <div className="mb-2 text-[11px] text-gray-400">
            {t('landing.agentDemo.marketing.preview.label')}
          </div>
          <div className="min-h-[120px] whitespace-pre-line rounded-md bg-gray-900 p-3 text-sm text-gray-100">
            {previewTexts[previewVariant]}
          </div>
        </div>

        {/* Logs */}
        <div>
          <div
            className="max-h-[180px] overflow-y-auto pr-1 font-mono text-xs leading-relaxed md:max-h-[220px]"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {logLines.length === 0 ? (
              <div className="text-gray-500">{t('landing.agentDemo.marketing.logs.start')}</div>
            ) : (
              logLines.map((line, i) => (
                <div key={i} className="text-gray-300">
                  <span className="text-gray-500">$</span> {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer: fixed height for alignment */}
      <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div
              className={`h-2 w-2 rounded-full ${prefersReducedMotion ? 'bg-[rgb(var(--accent))]' : 'animate-pulse bg-[rgb(var(--accent))]'}`}
              aria-hidden
            />
            <span>{t('landing.agentDemo.marketing.running')}</span>
          </div>
          <div
            className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-gray-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={t('landing.agentDemo.marketing.progressAria')}
          >
            <motion.div
              className="h-full bg-[rgb(var(--accent))]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            />
          </div>
          <div className="w-10 text-right text-xs tabular-nums text-gray-400">{progress}%</div>
        </div>
      </div>
    </div>
  );
};

export default MarketingMindDemo;
