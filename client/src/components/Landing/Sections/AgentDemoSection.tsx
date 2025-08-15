import React, { useEffect, useMemo, useState, useCallback, useRef, Suspense } from 'react';
import LandingSection from './LandingSection';
import { SectionHeader } from '@/components/ui/typography/SectionHeader';
import { useT } from '~/utils/i18n';
// removed SectionHeading in favor of SectionHeader
import { getIcon, type IconKey } from '~/components/ui/icons';
import AgentDemoPanel from '../AgentDemoNew/AgentDemoPanel';
import { agentsRegistry, type AgentId } from '../AgentDemo/agentsConfig';
import { track } from '~/lib/analytics/track';
import { Badge } from '~/components/ui/Badge';
import { Briefcase, Users, Star } from 'lucide-react';

interface ResolvedAgent {
  id: AgentId;
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

const AgentDemoSection: React.FC = () => {
  const t = useT();

  const [activeAgent, setActiveAgent] = useState<AgentId>('codeMaster');
  const [runKey, setRunKey] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const impressionSentRef = useRef<boolean>(false);
  const [vhPx, setVhPx] = useState<number | null>(null);
  const vvDebounceRef = useRef<number | null>(null);

  // Agents aus Registry + i18n auflösen (Single Source of Truth)
  const agents: Record<AgentId, ResolvedAgent> = useMemo(() => {
    const entries = Object.entries(agentsRegistry) as [AgentId, typeof agentsRegistry[AgentId]][];
    const resolved: Partial<Record<AgentId, ResolvedAgent>> = {};
    for (const [id, meta] of entries) {
      resolved[id] = {
        id,
        name: t(meta.i18n.name),
        avatar: meta.avatar,
        color: meta.color,
        specialty: t(meta.i18n.specialty),
        description: t(meta.i18n.description),
        demo: {
          question: t(meta.i18n.demoQ),
          response: t(meta.i18n.demoA),
        },
      };
    }
    return resolved as Record<AgentId, ResolvedAgent>;
  }, [t]);

  const agentKeys = useMemo(() => Object.keys(agents) as AgentId[], [agents]);

  // Persistenz: aktiven Agenten aus localStorage lesen/schreiben
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agentDemo.active');
      if (saved && saved in agents) setActiveAgent(saved as AgentId);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State-of-the-art Mobile-Viewport-Höhe via visualViewport (Fallback: innerHeight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => {
      const vv = (window as any).visualViewport;
      const h = Math.round(vv?.height ?? window.innerHeight);
      setVhPx(h);
    };
    const calcVh = () => {
      if (vvDebounceRef.current) window.clearTimeout(vvDebounceRef.current);
      vvDebounceRef.current = window.setTimeout(run, 80);
    };
    calcVh();
    window.addEventListener('resize', calcVh);
    window.addEventListener('orientationchange', calcVh);
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    vv?.addEventListener('resize', calcVh);
    return () => {
      window.removeEventListener('resize', calcVh);
      window.removeEventListener('orientationchange', calcVh);
      vv?.removeEventListener('resize', calcVh);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('agentDemo.active', activeAgent);
    } catch {}
  }, [activeAgent]);

  // Impression Tracking via IntersectionObserver (einmalig)
  useEffect(() => {
    if (!sectionRef.current || impressionSentRef.current) return;
    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !impressionSentRef.current) {
            impressionSentRef.current = true;
            try {
              track({ name: 'agent_demo_impression', props: { visibleRatio: entry.intersectionRatio } });
            } catch {}
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAskQuestion = useCallback(() => {
    setRunKey((k) => k + 1);
    try {
      track({ name: 'agent_demo_start', props: { agent: activeAgent } });
    } catch {}
  }, [activeAgent]);

  const sectionTitle = t('landing.agentDemo.title');
  const sectionDescription = t('landing.agentDemo.description');

  return (
    <LandingSection
      id="agent-demo"
      aria-label={sectionTitle}
      className="relative mt-[80px] px-4 py-0 sm:px-4 sm:py-0"
      padding="none"
      divider="none"
      dataSection="agent-demo"
      data-ai-section="agent-demo"
      data-ai-title="Agent Demo"
      ref={sectionRef}
      containerClassName="relative mx-auto max-w-none sm:max-w-7xl"
      accentTopGlow
    >
      {/* Mini-Übersicht */}
      <div className="hidden sm:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12 md:mb-16 lg:mb-20">
        {(
          [
            { key: 'business', bg: 'from-blue-500 to-indigo-600' },
            { key: 'agents', bg: 'from-emerald-500 to-teal-600' },
            { key: 'mas', bg: 'from-sky-500 to-cyan-600' },
          ] as const
        ).map((l) => {
          const shortTitle = t(`landing.system.layers.${l.key}.short`);
          const desc = t(`landing.system.layers.${l.key}.desc`);
          const hintRaw = t(`landing.system.layers.${l.key}.hint`);
          const hint =
            hintRaw && !hintRaw.toLowerCase().startsWith(shortTitle.toLowerCase()) ? hintRaw : '';
          const badges = t(`landing.system.layers.${l.key}.badges`, {
            returnObjects: true,
          } as any) as unknown as string[] | undefined;
          const Icon = getIcon(l.key as IconKey);
          // Badge-Variant & Icon pro Layer bestimmen
          const badgeVariant: import('~/components/ui/Badge').BadgeVariant =
            l.key === 'business' ? 'info' : l.key === 'agents' ? 'agent' : 'system';
          const LeadingIcon = l.key === 'business' ? Briefcase : l.key === 'agents' ? Users : Star;

          return (
            <div
              key={`mini-${l.key}`}
              className="relative h-full overflow-hidden rounded-2xl border border-white/10 p-5 transition-colors"
              role="region"
              aria-label={shortTitle}
            >
              <div className="mb-3 flex h-10 items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-white/90" strokeWidth={1.5} />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <h3 className="truncate text-[clamp(0.82rem,1.2vw,0.98rem)] font-semibold leading-none text-white">
                    {shortTitle}
                  </h3>
                  {hint && (
                    <p className="truncate text-[clamp(0.66rem,1.05vw,0.76rem)] leading-tight text-gray-200/85">
                      {hint}
                    </p>
                  )}
                </div>
              </div>
              <p className="mb-3 line-clamp-3 text-[clamp(0.7rem,1.1vw,0.85rem)] leading-relaxed text-gray-200/90">
                {desc}
              </p>
              {Array.isArray(badges) && badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {badges.map((b, i) => (
                    <Badge
                      key={`${l.key}-chip-${i}`}
                      size="sm"
                      tone="soft"
                      variant={badgeVariant}
                      className="whitespace-nowrap py-1 sm:py-1"
                      leadingIcon={<LeadingIcon className="h-3.5 w-3.5" aria-hidden />}
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Überschrift */}
      <div className={"text-center mt-0 mb-6 sm:mb-8 lg:mb-10"}>
        <SectionHeader
          align="center"
          size="h2"
          title={sectionTitle}
          subtitle={sectionDescription}
          className="mx-auto max-w-4xl"
        />
      </div>

      {/* Mobile: horizontale Agenten-Auswahl */}
      <div
        role="tablist"
        aria-label={sectionTitle}
        aria-orientation="horizontal"
        className="sm:hidden -mx-4 mb-4 overflow-x-auto pb-2 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none]"
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          const keys = agentKeys;
          const idx = keys.indexOf(activeAgent);
          if (e.key === 'ArrowRight') {
            const next = keys[(idx + 1) % keys.length];
            setActiveAgent(next);
            try { track({ name: 'agent_demo_select', props: { agent: next } }); } catch {}
            setTimeout(() => handleAskQuestion(), 250);
            e.preventDefault();
          } else if (e.key === 'ArrowLeft') {
            const prev = keys[(idx - 1 + keys.length) % keys.length];
            setActiveAgent(prev);
            try { track({ name: 'agent_demo_select', props: { agent: prev } }); } catch {}
            setTimeout(() => handleAskQuestion(), 250);
            e.preventDefault();
          }
        }}
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div className="flex gap-2 px-4 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]">
          {agentKeys.map((agentId) => (
            <button
              key={`m-${agentId}`}
              type="button"
              onClick={() => {
                setActiveAgent(agentId);
                try { track({ name: 'agent_demo_select', props: { agent: agentId } }); } catch {}
                setTimeout(() => handleAskQuestion(), 250);
              }}
              role="tab"
              id={`agent-tab-m-${agentId}`}
              aria-selected={activeAgent === agentId}
              aria-controls={`agent-panel-${agentId}`}
              aria-label={agents[agentId].name}
              tabIndex={activeAgent === agentId ? 0 : -1}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs ring-1 transition-all duration-200 ${
                activeAgent === agentId
                  ? 'bg-white/[0.10] text-white ring-white/30 shadow-sm shadow-sky-400/15'
                  : 'bg-white/[0.04] text-white/90 ring-white/15'
              }`}
            >
              <img src={agents[agentId].avatar} alt="" className="h-4 w-4 rounded" loading="lazy" />
              <span className="whitespace-nowrap">{agents[agentId].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Linke Liste + Rechte Demo */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Linke Spalte: Agentenliste */}
        <div
          role="tablist"
          aria-label={sectionTitle}
          aria-orientation="vertical"
          tabIndex={0}
          className="hidden sm:block space-y-3"
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            const keys = agentKeys;
            const idx = keys.indexOf(activeAgent);
            if (e.key === 'ArrowDown') {
              const next = keys[(idx + 1) % keys.length];
              setActiveAgent(next);
              try {
                track({ name: 'agent_demo_select', props: { agent: next } });
              } catch {}
              setTimeout(() => handleAskQuestion(), 250);
              e.preventDefault();
            } else if (e.key === 'ArrowUp') {
              const prev = keys[(idx - 1 + keys.length) % keys.length];
              setActiveAgent(prev);
              try {
                track({ name: 'agent_demo_select', props: { agent: prev } });
              } catch {}
              setTimeout(() => handleAskQuestion(), 250);
              e.preventDefault();
            } else if (e.key === 'Home') {
              const first = keys[0];
              setActiveAgent(first);
              try {
                track({ name: 'agent_demo_select', props: { agent: first } });
              } catch {}
              setTimeout(() => handleAskQuestion(), 250);
              e.preventDefault();
            } else if (e.key === 'End') {
              const last = keys[keys.length - 1];
              setActiveAgent(last);
              try {
                track({ name: 'agent_demo_select', props: { agent: last } });
              } catch {}
              setTimeout(() => handleAskQuestion(), 250);
              e.preventDefault();
            }
          }}
        >
          {agentKeys.map((agentId) => (
            <button
              key={agentId}
              type="button"
              onClick={() => {
                setActiveAgent(agentId);
                try {
                  track({ name: 'agent_demo_select', props: { agent: agentId } });
                } catch {}
                setTimeout(() => handleAskQuestion(), 300);
              }}
              role="tab"
              id={`agent-tab-${agentId}`}
              aria-selected={activeAgent === agentId}
              aria-controls={`agent-panel-${agentId}`}
              aria-label={agents[agentId].name}
              tabIndex={activeAgent === agentId ? 0 : -1}
              className={`group relative flex h-[4.5rem] w-full items-center rounded-2xl px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))] focus-visible:ring-offset-0 ${
                activeAgent === agentId
                  ? 'bg-white/[0.06] text-white shadow-md shadow-sky-400/20 ring-1 ring-white/20'
                  : 'ring-white/12 text-white ring-1 hover:bg-white/[0.045] hover:ring-white/20 hover:shadow-sm hover:shadow-sky-400/15'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            >
              <div className="relative z-10 flex w-full items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/15">
                  <img
                    src={agents[agentId].avatar}
                    alt={agents[agentId].name}
                    className="h-5 w-5"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="min-w-0">
                  <h3
                    className={`truncate text-[clamp(0.95rem,1.22vw,1.06rem)] font-semibold leading-tight tracking-[-0.01em] ${activeAgent === agentId ? 'text-white' : 'text-white/90'}`}
                  >
                    {agents[agentId].name}
                  </h3>
                  <p
                    className={`truncate text-[clamp(0.69rem,1.02vw,0.8rem)] leading-snug ${activeAgent === agentId ? 'text-slate-100/85' : 'text-slate-200/80'}`}
                  >
                    {agents[agentId].specialty}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Rechte Spalte: Demo */}
        <div className="relative lg:col-span-2">
          <div
            className="relative mt-2 sm:mt-0 flex flex-col overflow-hidden bg-transparent w-full h-auto sm:rounded-2xl min-h-[280px] sm:min-h-[300px] aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] sm:max-h-[min(85svh,640px)] transition-[height,width,padding] duration-300 ease-out"
            role="tabpanel"
            id={`agent-panel-${activeAgent}`}
            aria-labelledby={`agent-tab-${activeAgent}`}
            style={{
              paddingLeft: 'calc(env(safe-area-inset-left) + 8px)',
              paddingRight: 'calc(env(safe-area-inset-right) + 8px)',
              paddingTop: 'calc(env(safe-area-inset-top) + 0px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 0px)',
              height: undefined,
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              {(() => {
                const entry = agentsRegistry[activeAgent];
                const Loader = entry?.loader ? React.lazy(entry.loader) : null;
                if (!Loader) {
                  return (
                    <AgentDemoPanel
                      key={`${activeAgent}-${runKey}`}
                      command={agents[activeAgent].demo.question}
                      output={agents[activeAgent].demo.response}
                      autoStart
                      typingSpeedMs={28}
                    />
                  );
                }
                return (
                  <Suspense
                    fallback={
                      <AgentDemoPanel
                        key={`fb-${activeAgent}-${runKey}`}
                        command={agents[activeAgent].demo.question}
                        output={agents[activeAgent].demo.response}
                        autoStart
                        typingSpeedMs={28}
                      />
                    }
                  >
                    <div className="mx-auto w-full h-full max-w-none sm:max-w-[900px] px-0 sm:px-2">
                      <Loader isActive key={`${activeAgent}-${runKey}`} />
                    </div>
                  </Suspense>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
};

export default AgentDemoSection;
