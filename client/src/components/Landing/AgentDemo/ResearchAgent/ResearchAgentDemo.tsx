import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { Globe, MousePointerClick, Search } from 'lucide-react';
import { AdSearchCard } from './AdSearchCard';
import { researchAd } from '@/config/promotions';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';

export interface ResearchAgentDemoProps {
  isActive: boolean;
  onComplete?: () => void;
  compact?: boolean; // wenn true, kleinere Darstellung (für Chat-ToolDock)
  disableTelemetry?: boolean; // wenn true, keine Analytics/A-B/Frequency-Cap
}

/**
 * Simuliert einen kleinen Browser mit URL-Eingabe, Suchfeld, Ergebnisliste
 * und animiertem Cursor. Für Demo-Zwecke wird clientseitig getaktet.
 */
const ResearchAgentDemo = ({
  isActive,
  onComplete,
  compact,
  disableTelemetry,
}: ResearchAgentDemoProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const t = useT();

  const [step, setStep] = useState<number>(0);
  const [url, setUrl] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [adImpressed, setAdImpressed] = useState(false);

  type CursorPos = { x: number | string; y: number };
  const [cursor, setCursor] = useState<CursorPos>({ x: 40, y: 56 });
  const timersRef = useRef<number[]>([]);
  // keep stable reference of onComplete to avoid effect restarts due to changing identity
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const totalDuration = 5200; // ~5.2s
  const phases = useMemo(
    () => [
      {
        at: 0,
        action: () => {
          setStep(0);
          setUrl('https://www.google.com');
          setProgress(8);
          setCursor({ x: 120, y: 28 });
        },
      },
      {
        at: 600,
        action: () => {
          setStep(1);
          setProgress(18);
          setCursor({ x: 180, y: 28 });
        },
      },
      {
        at: 1200,
        action: () => {
          setStep(2);
          setQuery('sigmacode buch ausbruch aus der matrix');
          setProgress(36);
          setCursor({ x: 140, y: 86 });
        },
      },
      {
        at: 1800,
        action: () => {
          setStep(3);
          setProgress(56);
          setCursor({ x: 220, y: 86 });
        },
      },
      {
        at: 2600,
        action: () => {
          setStep(4);
          setProgress(72);
          setCursor({ x: 10, y: 140 });
        },
      },
      {
        at: 3400,
        action: () => {
          setStep(5);
          setProgress(86);
          setCursor({ x: 10, y: 174 });
        },
      },
      {
        at: 4800,
        action: () => {
          setStep(6);
          setProgress(100);
        },
      },
    ],
    [],
  );

  // Timer Management
  useEffect(() => {
    if (!isActive) {
      // Reset state when inactive
      setStep(0);
      setUrl('');
      setQuery('');
      setProgress(0);
      setCursor({ x: 40, y: 56 });
      return;
    }

    // Clear existing timers
    const clearAllTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    clearAllTimers();

    // Set up phase timers
    phases.forEach(({ at, action }) => {
      const timerId = window.setTimeout(action, at);
      timersRef.current.push(timerId);
    });

    // Set completion timer
    const completionTimerId = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, totalDuration + 100);
    timersRef.current.push(completionTimerId);

    // Cleanup function
    return clearAllTimers;
  }, [isActive, phases]);

  // A/B Variant & Frequency Cap
  const abVariant = useMemo(
    () => (disableTelemetry ? 'alt' : getVariantForKey('researchAd', 'base')),
    [disableTelemetry],
  );
  const freqKey = 'researchAd.seen';
  const seenAlready = useMemo(() => {
    if (disableTelemetry) return false;
    if (researchAd.force) return false;
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem(freqKey) === '1';
    } catch {
      return true;
    }
  }, [disableTelemetry]);

  const canShowAd =
    researchAd.force ||
    (isActive && step >= 3 && researchAd.enabled && abVariant === 'alt' && !seenAlready);

  useEffect(() => {
    if (canShowAd && !adImpressed) {
      setAdImpressed(true);
      if (!disableTelemetry && !researchAd.force) {
        try {
          sessionStorage.setItem(freqKey, '1');
        } catch {}
      }
      if (!disableTelemetry) {
        track({ name: 'researchAd_impression', props: { variant: abVariant } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShowAd, disableTelemetry]);

  if (!isActive) return null;

  const size = compact ? { w: 380, h: 220 } : { w: 560, h: 340 };
  const addressPH = t('landing.agentDemo.research.address');
  const searchPH = t('landing.agentDemo.research.search');
  const adBadge = t('landing.agentDemo.researchAd.badge');
  const adCta = researchAd.ctaLabel;

  const isSafeHttpUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };
  const adHref = isSafeHttpUrl(researchAd.ctaHref) ? researchAd.ctaHref : '#';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gray-700 bg-gray-900 ${compact ? 'shadow-md' : 'shadow-lg'}`}
      style={{ width: size.w, maxWidth: '100%' }}
      aria-label={t('landing.agentDemo.research.title')}
    >
      {/* Browser-Kopfzeile */}
      <div className="flex items-center border-b border-gray-700 bg-gray-800 px-3 py-2">
        <div className="mr-3 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <Globe className="mr-2 h-4 w-4 text-gray-300" />
        <div className="flex-1">
          <div className="truncate rounded-md border border-gray-700 bg-gray-900/80 px-2 py-1 text-xs text-gray-300">
            {url || addressPH}
          </div>
        </div>
      </div>

      {/* Inhalt */}
      <div className="relative overflow-y-auto" style={{ height: size.h - 70 }}>
        <div className="space-y-3 p-3">
          {/* Suchfeld */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300">
              <span className="inline-flex items-center gap-1">
                <Search className="h-3.5 w-3.5 text-gray-400" />
                {query || searchPH}
              </span>
            </div>
            <button className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white opacity-90">
              {t('landing.agentDemo.research.go')}
            </button>
          </div>

          {/* Ergebnisse (Mock) */}
          <div className="space-y-3 text-xs">
            <div className="group rounded-lg border border-gray-800 bg-gray-800/60 p-3 transition-colors hover:border-gray-600">
              <div className="font-medium text-blue-300 transition-colors group-hover:text-blue-200">
                SIGMACODE – Ausbruch aus der Matrix (Buch)
              </div>
              <div className="mt-1 text-[0.8em] leading-snug text-gray-400">
                Frameworks für Persönlichkeitsentwicklung & KI-Produktivität, 2025+
              </div>
              <div className="mt-0.5 text-[0.7em] text-gray-500 opacity-80">
                https://sigmacode.ai/book
              </div>
            </div>
            {canShowAd && (
              <AdSearchCard
                imageSrc={researchAd.image}
                imageAlt={researchAd.imageAlt}
                headline={researchAd.headline}
                description={researchAd.desc}
                siteHost={researchAd.siteHost}
                ctaLabel={adCta}
                ctaHref={adHref}
                badgeLabel={adBadge}
                reducedMotion={!!prefersReducedMotion}
                onImpression={undefined}
                onClick={() => {
                  if (!disableTelemetry)
                    track({ name: 'researchAd_click', props: { variant: abVariant } });
                }}
              />
            )}
            <div className="group rounded-lg border border-gray-800 bg-gray-800/60 p-3 transition-colors hover:border-gray-600">
              <div className="font-medium text-blue-300 transition-colors group-hover:text-blue-200">
                Vergleich: Dev Agents 2025
              </div>
              <div className="mt-1 text-[0.8em] leading-snug text-gray-400">
                Benchmarks, Streaming, Tool-Docks, Sicherheit
              </div>
              <div className="mt-0.5 text-[0.7em] text-gray-500 opacity-80">
                https://example.com/dev-agents
              </div>
            </div>
            <div className="group rounded-lg border border-gray-800 bg-gray-800/60 p-3 transition-colors hover:border-gray-600">
              <div className="font-medium text-blue-300 transition-colors group-hover:text-blue-200">
                Best Practices: UX für AI-Chat
              </div>
              <div className="mt-1 text-[0.8em] leading-snug text-gray-400">
                Token-Streaming, Live-Previews, Accessibility
              </div>
              <div className="mt-0.5 text-[0.7em] text-gray-500 opacity-80">
                https://example.com/ux-ai-chat
              </div>
            </div>
          </div>
        </div>

        {/* Mauszeiger mit responsiver Positionierung */}
        {!prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute z-10"
            style={{
              left: 0,
              top: 0,
              x: cursor.x,
              y: cursor.y,
              // Responsive Anpassung für kleine Bildschirme
              transform: `translate(${
                typeof cursor.x === 'number' ? `${Math.min(cursor.x, size.w - 40)}px` : cursor.x
              }, ${cursor.y}px)`,
            }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 14,
              restDelta: 0.1,
            }}
          >
            <div className="relative">
              <MousePointerClick className="h-5 w-5 text-white drop-shadow" />
              {step === 5 && (
                <motion.div
                  className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-900/60 px-3 py-2">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400">{t('landing.agentDemo.research.running')}</div>
          <div
            className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-gray-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={t('landing.agentDemo.research.progress_aria')}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            />
          </div>
          <div className="w-10 text-right text-[11px] tabular-nums text-gray-400">{progress}%</div>
        </div>
      </div>
    </div>
  );
};

export default ResearchAgentDemo;
