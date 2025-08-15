import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { Database, Eraser, Sigma, BarChart2, Lightbulb } from 'lucide-react';

interface DataAnalysisProps {
  isActive: boolean;
}

export const DataAnalysis = ({ isActive }: DataAnalysisProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const t = useT();

  type Step = { id: number; label: string; duration: number; logs: string[] };
  const steps: Step[] = useMemo(
    () => [
      {
        id: 1,
        label: t('landing.agentDemo.data.steps.load'),
        duration: 1200,
        logs: [t('landing.agentDemo.data.logs.fetch'), t('landing.agentDemo.data.logs.rows')],
      },
      {
        id: 2,
        label: t('landing.agentDemo.data.steps.clean'),
        duration: 1400,
        logs: [t('landing.agentDemo.data.logs.nulls'), t('landing.agentDemo.data.logs.normalize')],
      },
      {
        id: 3,
        label: t('landing.agentDemo.data.steps.aggregate'),
        duration: 1600,
        logs: [t('landing.agentDemo.data.logs.groupby'), t('landing.agentDemo.data.logs.metrics')],
      },
      {
        id: 4,
        label: t('landing.agentDemo.data.steps.visualize'),
        duration: 1500,
        logs: [t('landing.agentDemo.data.logs.render'), t('landing.agentDemo.data.logs.done')],
      },
      {
        id: 5,
        label: t('landing.agentDemo.data.steps.insights'),
        duration: 900,
        logs: [t('landing.agentDemo.data.logs.summary')],
      },
    ],
    [t],
  );

  const totalDuration = useMemo(() => steps.reduce((a, s) => a + s.duration, 0), [steps]);

  const timersRef = useRef<number[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [chartStep, setChartStep] = useState(0);

  // Reset and drive pipeline when active
  useEffect(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    if (!isActive) return;

    setActiveStepIndex(0);
    setProgress(0);
    setLogLines([]);
    setChartStep(0);

    let acc = 0;
    steps.forEach((s, idx) => {
      const startAt = acc;
      const endAt = acc + s.duration;

      // Schedule logs
      const perLog = s.duration / Math.max(1, s.logs.length);
      s.logs.forEach((line, i) => {
        const tmr = window.setTimeout(
          () => {
            setLogLines((prev) => [...prev, `[${s.id}/${steps.length}] ${line}`]);
          },
          startAt + i * perLog,
        );
        timersRef.current.push(tmr);
      });

      // Mark step active
      const ts = window.setTimeout(() => setActiveStepIndex(idx), startAt);
      timersRef.current.push(ts);

      // Advance small chart showcase slowly
      const tc = window.setTimeout(
        () => setChartStep(idx % 4),
        startAt + Math.min(400, s.duration - 200),
      );
      timersRef.current.push(tc);

      // Update progress
      const tp = window.setTimeout(() => {
        const p = Math.round((endAt / totalDuration) * 100);
        setProgress((prev) => (p > prev ? p : prev));
      }, endAt);
      timersRef.current.push(tp);

      acc = endAt;
    });

    // finalize
    const done = window.setTimeout(() => setProgress(100), totalDuration + 50);
    timersRef.current.push(done);

    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, [isActive, steps, totalDuration]);

  const renderChart = () => {
    const charts = [
      // Balkendiagramm
      <div key="bar" className="flex h-32 items-end space-x-1">
        {[30, 50, 75, 90, 60, 40].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <motion.div
              className="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            <div className="mt-1 text-[8px] text-gray-400">Q{i + 1}</div>
          </div>
        ))}
      </div>,

      // Liniendiagramm
      <div key="line" className="relative h-32">
        <svg viewBox="0 0 200 80" className="h-full w-full">
          <path
            d="M10,60 L40,40 L70,50 L100,20 L130,40 L160,10 L190,30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0"
          />
          <circle cx="10" cy="60" r="3" fill="#3b82f6" />
          <circle cx="40" cy="40" r="3" fill="#3b82f6" />
          <circle cx="70" cy="50" r="3" fill="#3b82f6" />
          <circle cx="100" cy="20" r="3" fill="#3b82f6" />
          <circle cx="130" cy="40" r="3" fill="#3b82f6" />
          <circle cx="160" cy="10" r="3" fill="#3b82f6" />
          <circle cx="190" cy="30" r="3" fill="#3b82f6" />
        </svg>
      </div>,

      // Tortendiagramm
      <div key="pie" className="relative h-32">
        <svg viewBox="0 0 100 100" className="mx-auto h-32 w-32">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="20" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="20"
            strokeDasharray="251.2"
            strokeDashoffset="125.6"
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 125.6 }}
            transition={{ duration: 1 }}
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-300 text-xs"
          >
            50%
          </text>
        </svg>
      </div>,

      // Heatmap
      <div key="heatmap" className="grid grid-cols-5 gap-1 p-2">
        {Array(25)
          .fill(0)
          .map((_, i) => {
            const intensity = Math.floor(Math.random() * 5);
            const colors = [
              'bg-gray-700',
              'bg-blue-300',
              'bg-blue-400',
              'bg-blue-500',
              'bg-blue-600',
            ];
            return (
              <motion.div
                key={i}
                className={`aspect-square w-full ${colors[intensity]} rounded-sm`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              />
            );
          })}
      </div>,
    ];

    return charts[chartStep % charts.length];
  };

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] rounded-lg bg-gray-900">
      {/* Steps header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h4 className="text-sm font-medium text-gray-200">{t('landing.agentDemo.data.title')}</h4>
        <ol className="hidden items-center gap-3 text-xs md:flex">
          {steps.map((s, idx) => {
            const state =
              idx < activeStepIndex ? 'done' : idx === activeStepIndex ? 'active' : 'idle';
            const Icon = [Database, Eraser, Sigma, BarChart2, Lightbulb][idx] ?? Database;
            return (
              <li key={s.id} className="flex min-h-10 items-center gap-2">
                <Icon
                  className={`h-4 w-4 ${
                    state === 'done'
                      ? 'text-emerald-500'
                      : state === 'active'
                        ? 'text-blue-400'
                        : 'text-gray-500'
                  }`}
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

      {/* Chart + logs */}
      <div className="grid grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-2">
        <div>
          <div className="h-32">{renderChart()}</div>
          <div className="mt-2 text-xs text-gray-400">
            {
              [
                t('landing.agentDemo.data.labels.qreport'),
                t('landing.agentDemo.data.labels.revenue'),
                t('landing.agentDemo.data.labels.market'),
                t('landing.agentDemo.data.labels.ctr'),
              ][chartStep % 4]
            }
          </div>
        </div>
        <div>
          <div
            className="max-h-[160px] overflow-y-auto pr-1 font-mono text-xs leading-relaxed md:max-h-[200px]"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {logLines.length === 0 ? (
              <div className="text-gray-500">{t('landing.agentDemo.data.logs.start')}</div>
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

      {/* Footer progress: fixed height to align with buttons */}
      <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div
              className={`h-2 w-2 rounded-full ${prefersReducedMotion ? 'bg-emerald-600' : 'animate-pulse bg-emerald-500'}`}
              aria-hidden
            />
            <span>{t('landing.agentDemo.data.running')}</span>
          </div>
          <div
            className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-gray-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={t('landing.agentDemo.data.progressAria')}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
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
