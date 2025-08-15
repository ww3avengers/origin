import React, { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useT } from '~/utils/i18n';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  easeOut,
  easeInOut,
  type MotionValue,
} from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading } from '~/components/ui';
import { Badge as UIBadge } from '~/components/ui/Badge';
import { Star } from 'lucide-react';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';
import { AnimatedAgentIcon } from '../AnimatedAgentIcon';
import {
  MCPBrainIcon,
  MCPNoteIcon,
  MCPCloudIcon,
  MCPDbIcon,
  MCPToolIcon,
} from '@/components/ui/icons';

/**
 * SuperTeamSection.variantV2 — DISTRIBUTED & DYNAMIC
 * --------------------------------------------------
 * Änderungen ggü. vorher:
 * - Agents deutlich gleichmäßiger verteilt (golden-angle innerhalb Sektoren)
 * - Mehr Dynamik: pro Agent ein Effekt-Typ (bob | lissajous | spin | tilt | pulse)
 * - Zwei Agenten-Orbits (äußerer/innerer) mit stärkerer Radius-Variation
 * - Center-Superagent exakt in der Mitte (50/50) mit Halo + Pulse-Ripple
 */

// Konfig: zentrale Konstanten
const CONFIG = {
  ORBIT: { outerStart: 48, outerEnd: 35 }, // etwas weiter auseinander für mehr Verteilung (Center-Icon größer)
  FOCUS_RING:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full',
} as const;

// CSS-Variablen-Helfer
type CSSVars = CSSProperties & { ['--accent-ring']?: string };

export interface SuperTeamSectionVariantV2Props {
  id?: string;
  agentCountBase?: number;
  mcpCountBase?: number;
  tiltStrengthMd?: number; // Grad
  tiltStrengthSm?: number; // Grad
  orbitSpeeds?: { outer: number; mid: number; inner: number; minor: number };
  accentRing?: string;
}

const SuperTeamSectionVariantV2: FC<SuperTeamSectionVariantV2Props> = ({
  id = 'superteam-v2',
  agentCountBase = 6,
  mcpCountBase = 5,
  tiltStrengthMd = 4,
  tiltStrengthSm = 2.5,
  orbitSpeeds = { outer: 70, mid: 55, inner: 85, minor: 48 },
  accentRing = '192 132 252',
}) => {
  const t = useT();
  const title = t('landing.metaphor.superteam_title');
  const subtitle = t('landing.metaphor.superteam_subtitle');
  const badge = t('landing.metaphor.superteam_badge');

  const abVariant = getVariantForKey('superteam_v2', 'base');
  const prefersReduced = useReducedMotion?.() ?? false;
  // Phasensteuerung: 'intro' → 'agents' → 'tools'
  const [phase, setPhase] = useState<'intro' | 'agents' | 'tools'>('intro');
  // Fokus/Zentral-Interaktion: wenn der zentrale Super-Agent fokussiert/hovered ist,
  // sollen umliegende Icons ausblenden und leicht bluren.
  const [centerFocus, setCenterFocus] = useState(false);
  const timersRef = useRef<number[]>([]);
  // Aktiver Agent für Flow-Animation zum Zentrum
  const [activeAgent, setActiveAgent] = useState<number | null>(null);

  // Anzahl der Agenten abhängig vom Variant früh definieren (für Effekte, die sie benötigen)
  const agentCount = abVariant === 'alt' ? Math.max(1, agentCountBase + 2) : agentCountBase;

  const fadeInUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { ...IN_VIEW_ONCE, amount: 0.5 },
    transition: { duration: 0.42, ease: easeOut, delay },
  });

  // Sequenzstart erfolgt beim Eintritt ins Viewport (onVisualEnter)

  // Scroll-Parallax
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef as any, offset: ['start end', 'end start'] });
  const headingY: MotionValue<number> = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [5, -5]);
  const visualY: MotionValue<number> = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [-8, 8]);

  // Breakpoint (md)
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    mq.addListener?.(update);
    return () => {
      mq.removeEventListener?.('change', update);
      mq.removeListener?.(update);
    };
  }, []);

  // Startet die Sequenz, wenn der Visual-Container in View kommt
  const onVisualEnter = () => {
    if (phase !== 'intro') return;
    // zeitliche Staffelung: Agents → Tools (inkl. Saugeffekt via toolFlyers)
    const t1 = window.setTimeout(() => setPhase('agents'), 400);
    const t2 = window.setTimeout(() => setPhase('tools'), 1600);
    timersRef.current.push(t1, t2);
  };
  useEffect(() => {
    return () => {
      // Cleanup aller Timer bei Unmount
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);
  // Center focus beeinflusst Dimmen/Blur der Umgebung (Side-Sweeps entfernt)

  // Auto-Loop: Agenten zyklisch zum Zentrum fliegen lassen (nur wenn Motion erlaubt)
  useEffect(() => {
    if (prefersReduced) return;
    // Starte die Auto-Sequenz erst nach Intro
    if (phase === 'intro') return;
    let cancelled = false;
    const schedule = () => {
      const delay = 1800 + Math.random() * 1200; // 1.8s..3.0s
      const id = window.setTimeout(() => {
        if (cancelled) return;
        // Nächsten Agent aktivieren (round-robin)
        // agentCount ist im Render-Kontext vorhanden (Array.from({ length: agentCount }))
        // Wir greifen hier auf den gleichen Wert zurück
        setActiveAgent((prev) => {
          const total = agentCount; // rely on in-scope variable
          if (!total || total <= 0) return null;
          const next = prev == null ? 0 : (prev + 1) % total;
          return next;
        });
        schedule();
      }, delay);
      timersRef.current.push(id);
    };
    schedule();
    return () => { cancelled = true; };
  }, [phase, prefersReduced, agentCount]);

  // Flow-Ende automatisch zurücksetzen, damit der nächste Agent fliegen kann
  useEffect(() => {
    if (prefersReduced) return;
    if (activeAgent == null) return;
    const id = window.setTimeout(() => setActiveAgent(null), 1800);
    timersRef.current.push(id);
    return () => { window.clearTimeout(id); };
  }, [activeAgent, prefersReduced]);

  // Cursor-Tilt
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltXSpring = useSpring(tiltX, { stiffness: 120, damping: 20, mass: 0.4 });
  const tiltYSpring = useSpring(tiltY, { stiffness: 120, damping: 20, mass: 0.4 });
  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width; // 0..1
    const cy = (e.clientY - rect.top) / rect.height; // 0..1
    const maxX = isMd ? tiltStrengthMd : tiltStrengthSm;
    const maxY = isMd ? tiltStrengthMd : tiltStrengthSm;
    tiltX.set((0.5 - cy) * maxX * 2);
    tiltY.set((cx - 0.5) * maxY * 2);
  };
  const resetTilt = () => { tiltX.set(0); tiltY.set(0); };

  // Center
  const centerX = 50;
  const centerY = 50;

  // Inhalte
  const bullets: string[] = [
    t('landing.metaphor.bullets.1'),
    t('landing.metaphor.bullets.2'),
    t('landing.metaphor.bullets.3'),
    t('landing.metaphor.bullets.4'),
  ];

  // Deterministic RNG
  const lcg = (seed: number) => () => (seed = (seed * 48271) % 0x7fffffff) / 0x7fffffff;
  const GOLDEN_ANGLE = 137.50776405003785; // für gleichmäßige Verteilung

  // Counts
  
  const mcpCount = abVariant === 'alt' ? Math.max(1, mcpCountBase + 2) : mcpCountBase;
  const baseOuterRadiusStart = CONFIG.ORBIT.outerStart;
  const baseOuterRadiusEnd = CONFIG.ORBIT.outerEnd;

  // Agent-Effekte
  type AgentEffect = 'bob' | 'lissajous' | 'spin' | 'tilt' | 'pulse';

  // Agent-Dynamik-Typisierung
  type AgentRing = 'outer' | 'inner';
  type AgentDynamic = {
    angleJitter: number;
    radiusJitter: number;
    floatAmp: number;
    floatDelay: number;
    floatDur: number;
    effect: AgentEffect;
    ring: AgentRing;
  };

  // Kategorien
  const CATS = ['business', 'agents', 'mas'] as const;
  type Category = typeof CATS[number];
  const SECTORS: Record<Category, [number, number]> = {
    business: [-80, 40], // verbreitert
    agents: [40, 180],
    mas: [180, 360],
  } as const;
  const CAT_STYLE: Record<Category, { gradFrom: string; gradTo: string; glow: string }> = {
    business: { gradFrom: '#93c5fd', gradTo: '#60a5fa', glow: 'rgba(147,197,253,0.16)' },
    agents: { gradFrom: '#34d399', gradTo: '#10b981', glow: 'rgba(16,185,129,0.16)' },
    mas: { gradFrom: '#38bdf8', gradTo: '#0ea5e9', glow: 'rgba(14,165,233,0.16)' },
  };

  const categoryForIndex = (i: number): Category => CATS[i % CATS.length];

  // Gleichmäßige Slots + golden-angle Verteilung innerhalb Sektoren
  const catSlotInfo = useMemo(() => {
    const totals: Record<Category, number> = { business: 0, agents: 0, mas: 0 };
    const info = Array.from({ length: agentCount }).map((_, i) => {
      const cat = categoryForIndex(i);
      totals[cat] += 1;
      return { cat, slot: 0 } as { cat: Category; slot: number };
    });
    const seen: Record<Category, number> = { business: 0, agents: 0, mas: 0 };
    for (let i = 0; i < info.length; i++) info[i].slot = seen[info[i].cat]++;
    return { info, totals } as const;
  }, [agentCount]);

  const angleInSector = (cat: Category, slot: number, total: number) => {
    const [a0, a1] = SECTORS[cat];
    const span = a1 - a0;
    const denom = Math.max(1, total);
    // Gleichmäßige Verteilung innerhalb des Sektors
    const frac = Math.min(1, Math.max(0, (slot + 0.5) / denom));
    return a0 + frac * span;
  };

  // Agent-Dynamik
  const agentDynamics = useMemo<AgentDynamic[]>(() => {
    const rnd = lcg(1337 + (abVariant === 'alt' ? 1 : 0));
    const effects: AgentEffect[] = ['bob', 'lissajous', 'spin', 'tilt', 'pulse'];
    return Array.from({ length: agentCount }).map((_, i) => {
      const radiusJitter = (rnd() * 6 - 3); // ±3 (deutlich stärker)
      const angleJitter = rnd() * 6 - 3; // ±3°
      const floatAmp = 2 + rnd() * 3; // 2..5
      const floatDelay = rnd() * 2;
      const floatDur = 4 + rnd() * 3; // 4..7
      const effect = effects[i % effects.length];
      const ring = rnd() > 0.45 ? 'outer' : 'inner'; // zwei mögliche Orbits
      return { angleJitter, radiusJitter, floatAmp, floatDelay, floatDur, effect, ring } as const;
    });
  }, [agentCount, abVariant]);

  // Tool-Flyer: periodische "Saugeffekt"-Transfers von Agent → Center
  const toolFlyers = useMemo(() => {
    const rnd = lcg(4242 + (abVariant === 'alt' ? 7 : 0));
    const count = Math.min(6, Math.max(3, Math.floor(agentCount * 0.8)));
    return Array.from({ length: count }).map((_, i) => {
      const agentIndex = Math.floor(rnd() * agentCount);
      const delay = 0.8 + rnd() * 2.4 + i * 0.2; // verteilt starten
      const dur = 1.8 + rnd() * 0.9; // 1.8..2.7s
      const curve = 0.16 + rnd() * 0.12; // Krümmung zur Mitte
      const type = (['tool', 'cloud', 'db', 'note', 'brain'] as const)[i % 5];
      return { agentIndex, delay, dur, curve, type } as const;
    });
  }, [agentCount, abVariant]);

  // MCP-Nodes
  const mcpNodes = useMemo(() => {
    const rnd = lcg(9001 + (abVariant === 'alt' ? 1 : 0));
    const types = ['brain', 'note', 'tool', 'cloud', 'db'] as const;
    return Array.from({ length: mcpCount }).map((_, i) => {
      const baseAngle = (i / mcpCount) * 360 + 20 * rnd();
      const angleJitter = rnd() * 12 - 6; // ±6°
      // Radius so wählen, dass die Nodes innerhalb des Viewports bleiben und Ränder symmetrisch wirken
      const r = 47 + rnd() * 2; // 47..49 (vorher 56..60)
      const targetAgent = Math.floor(rnd() * agentCount);
      const floatAmp = (3 + rnd() * 3) * 0.9; // ~2.7..5.4
      const floatDur = 6 + rnd() * 3; // 6..9
      const floatDelay = rnd() * 3; // 0..3
      const type = types[i % types.length];
      return { angle: baseAngle + angleJitter, r, targetAgent, floatAmp, floatDur, floatDelay, type } as const;
    });
  }, [mcpCount, agentCount, abVariant]);

  // Icons
  const mcpIcon = (type: 'brain' | 'note' | 'tool' | 'cloud' | 'db') => {
    const map = { brain: MCPBrainIcon, note: MCPNoteIcon, cloud: MCPCloudIcon, db: MCPDbIcon, tool: MCPToolIcon } as const;
    const Cmp = map[type] ?? MCPToolIcon;
    return <Cmp className="h-6 w-6 text-black dark:text-white md:h-7 md:w-7" />;
  };
  // Zentraler, größerer AI-Agent in der Mitte — nutzt nun die gleiche AnimatedAgentIcon-Komponente wie die Teamagent-Demo
  // (Größe und Animation konsistent für ein einheitliches visuelles Vokabular)

  // SVG-ID-Namespace
  const uid = useId();
  const ringGradId = (cat: Category) => `ringGrad-${cat}-${uid}`;
  const mcpLinkGradId = `mcpLinkGrad-${uid}`;
  const agentLinkGradId = (i: number) => `agentLinkGrad-${uid}-${i}`;

  // Track Impression
  useEffect(() => { track({ name: 'superteam_v2_impression', props: { variant: abVariant } }); }, [abVariant]);

  // Helper für Agent-Animation pro Effekt
  const agentAnimate = (dyn: AgentDynamic) => {
    switch (dyn.effect) {
      case 'bob':
        return { x: [0, dyn.floatAmp * 0.45, 0, -dyn.floatAmp * 0.45, 0], y: [0, dyn.floatAmp, 0, -dyn.floatAmp, 0] };
      case 'lissajous':
        return { x: [0, dyn.floatAmp * 0.9, 0, -dyn.floatAmp * 0.9, 0], y: [0, -dyn.floatAmp * 0.65, 0, dyn.floatAmp * 0.65, 0] };
      case 'spin':
        return { rotate: [0, 6, 0, -6, 0], x: [0, dyn.floatAmp * 0.5, 0, -dyn.floatAmp * 0.5, 0], y: [0, -dyn.floatAmp * 0.4, 0, dyn.floatAmp * 0.4, 0] };
      case 'tilt':
        return { rotateX: [0, 6, 0, -6, 0], rotateY: [0, -6, 0, 6, 0], x: [0, dyn.floatAmp * 0.4, 0, -dyn.floatAmp * 0.4, 0], y: [0, dyn.floatAmp * 0.45, 0, -dyn.floatAmp * 0.45, 0] };
      case 'pulse':
        return { scale: [1, 1.06, 1, 0.98, 1], x: [0, -dyn.floatAmp * 0.35, 0, dyn.floatAmp * 0.35, 0], y: [0, dyn.floatAmp * 0.35, 0, -dyn.floatAmp * 0.35, 0] };
      default:
        return { x: [0, dyn.floatAmp * 0.4, 0, -dyn.floatAmp * 0.4, 0], y: [0, dyn.floatAmp * 0.4, 0, -dyn.floatAmp * 0.4, 0] };
    }
  };

  return (
    <LandingSection
      id={id}
      aria-label={title}
      className="relative [&>div[aria-hidden]]:hidden"
      dataSection={id}
      data-ai-section={id}
      data-ai-title="Super Team V2"
      ref={sectionRef}
      containerClassName="relative mx-auto w-full max-w-7xl px-4 sm:px-6"
      divider="none"
      padding="none"
      style={{ '--accent-ring': accentRing } as CSSVars}
    >
      <div className="relative z-10">
        <motion.div {...fadeInUp(0)} style={{ y: prefersReduced ? 0 : (headingY as unknown as number), willChange: 'transform' }}>
          <motion.div {...fadeInUp(0)} className="text-center">
            <HeadingBlock align="center">
              <div className="mb-4 sm:mb-5 flex justify-center">
                <UIBadge
                  size="lg"
                  tone="soft"
                  variant="system"
                  className="whitespace-nowrap py-1 sm:py-1"
                  leadingIcon={<Star className="h-3.5 w-3.5" aria-hidden />}
                >
                  {badge}
                </UIBadge>
              </div>
            </HeadingBlock>
          </motion.div>

          <div className="mx-auto grid w-full max-w-none items-center gap-8 md:grid-cols-2">
            <div>
              <motion.div {...fadeInUp(0.08)} className="mt-4 sm:mt-5">
                <SectionHeading title={title} subtitle={subtitle} align="left" />
              </motion.div>

              {/* Mini-Legende */}
              <div className="mb-3 mt-4 flex flex-wrap gap-2" aria-label={t('landing.system.title')}>
                <span className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[clamp(0.7rem,1.1vw,0.8rem)] font-medium text-white/90 ring-1 ring-inset ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden></span>
                  {t('landing.system.layers.business.short')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[clamp(0.7rem,1.1vw,0.8rem)] font-medium text-white/90 ring-1 ring-inset ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden></span>
                  {t('landing.system.layers.agents.short')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[clamp(0.7rem,1.1vw,0.8rem)] font-medium text-white/90 ring-1 ring-inset ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-300" aria-hidden></span>
                  {t('landing.system.layers.mas.short')}
                </span>
              </div>

              <motion.ul role="list" className="mt-6 space-y-3.5 text-gray-300" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" whileInView="visible" viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}>
                {bullets.map((b, i) => (
                  <motion.li key={i} className="flex items-start gap-3 text-[clamp(0.95rem,1.35vw,1.15rem)] leading-relaxed" variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: easeOut } } }} role="listitem">
                    <span className="mt-1.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-400" />
                    <span className="text-balance">{b}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Visual */}
            <motion.div
              className="relative mx-auto w-full max-w-[600px] sm:max-w-[680px] border-0 before:hidden after:hidden"
              style={{
                willChange: 'transform',
                transformStyle: 'preserve-3d',
                perspective: 900,
                rotateX: prefersReduced ? 0 : (tiltXSpring as unknown as number),
                rotateY: prefersReduced ? 0 : (tiltYSpring as unknown as number),
              }}
              onViewportEnter={onVisualEnter}
            >
              <div className="relative overflow-hidden aspect-square border-0 ring-0">
                {/* SVG-Stage */}
                <motion.svg
                  className="absolute inset-0 h-full w-full z-0 pointer-events-none origin-center transform-gpu"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden
                  {...(!prefersReduced && { animate: { opacity: [1, 0.97, 1], scale: [1, 1.01, 1] }, transition: { duration: 10, repeat: Infinity, repeatType: 'mirror', ease: easeInOut } })}
                  style={{ y: prefersReduced ? 0 : (visualY as unknown as number), transformOrigin: '50% 50%', transformBox: 'fill-box' as unknown as CSSProperties['transformBox'] }}
                >
                  <defs>
                    {(['business', 'agents', 'mas'] as const).map((cat) => (
                      <linearGradient key={`ring-grad-${cat}`} id={ringGradId(cat)} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={CAT_STYLE[cat].gradFrom} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={CAT_STYLE[cat].gradTo} stopOpacity="0.9" />
                      </linearGradient>
                    ))}
                  </defs>

                  {[{ r: 44, cat: 'business' as const, speed: orbitSpeeds.outer, opacity: 0.26, dir: 1, dash: '1.8 2.4', width: 0.42 }, { r: 35.5, cat: 'agents' as const, speed: orbitSpeeds.mid, opacity: 0.22, dir: -1, dash: '2.2 3.0', width: 0.36 }, { r: 31, cat: 'mas' as const, speed: orbitSpeeds.inner, opacity: 0.19, dir: 1, dash: '1.4 2.0', width: 0.34 }, { r: 24, cat: 'business' as const, speed: orbitSpeeds.minor, opacity: 0.13, dir: -1, dash: '2.6 3.4', width: 0.3 }].map((ring, idx) => (
                    <motion.g key={`ring-${idx}`} transformOrigin="50% 50%" style={{ opacity: phase !== 'intro' ? 1 : 0 }} {...(!prefersReduced && { animate: { rotate: ring.dir > 0 ? 360 : -360 }, transition: { duration: ring.speed, ease: 'linear', repeat: Infinity } })}>
                      <motion.circle cx={centerX} cy={centerY} r={ring.r} fill="none" stroke={`url(#${ringGradId(ring.cat)})`} strokeOpacity={ring.opacity} strokeWidth={ring.width} strokeDasharray={ring.dash} {...(!prefersReduced && phase !== 'intro' && { animate: { opacity: [ring.opacity * 0.9, ring.opacity * 1.1, ring.opacity * 0.9] }, transition: { duration: ring.speed * 0.35, repeat: Infinity, ease: easeInOut } })} />
                    </motion.g>
                  ))}

                  {(['business','agents','mas'] as const).map((cat) => {
                    const [a0, a1] = SECTORS[cat];
                    const R = 35.5;
                    const p0 = { x: centerX + R * Math.cos(((a0 - 90) * Math.PI) / 180), y: centerY + R * Math.sin(((a0 - 90) * Math.PI) / 180) };
                    const p1 = { x: centerX + R * Math.cos(((a1 - 90) * Math.PI) / 180), y: centerY + R * Math.sin(((a1 - 90) * Math.PI) / 180) };
                    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
                    const { gradFrom } = CAT_STYLE[cat];
                    return (
                      <motion.path key={`sector-${cat}`} d={`M ${p0.x},${p0.y} A ${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y}`} stroke={gradFrom} strokeOpacity={phase !== 'intro' ? 0.14 : 0} strokeWidth={0.6} fill="none" {...(!prefersReduced && phase !== 'intro' && { animate: { opacity: [0.1, 0.18, 0.1] }, transition: { duration: 12, repeat: Infinity, ease: easeInOut } })} />
                    );
                  })}
                </motion.svg>

                {/* CENTER SUPER-AGENT (simplified, shared component) */}
                <div className="absolute inset-0 grid place-items-center">
                  <motion.button
                    type="button"
                    className={`relative z-40 ${CONFIG.FOCUS_RING} cursor-pointer`}
                    style={{ y: prefersReduced ? 0 : (visualY as unknown as number) }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={IN_VIEW_ONCE}
                    whileHover={!prefersReduced ? { scale: 1.04 } : undefined}
                    onMouseEnter={() => setCenterFocus(true)}
                    onMouseLeave={() => setCenterFocus(false)}
                    onFocus={() => setCenterFocus(true)}
                    onBlur={() => setCenterFocus(false)}
                    onClick={() => track({ name: 'superteam_v2_center_click', props: { variant: abVariant } })}
                    title={t('landing.metaphor.super_agent_label')}
                    aria-label={t('landing.metaphor.super_agent_label')}
                  >
                    {/* Subtle rotating ring to echo AgentDemo visuals */}
                    <motion.span
                      className="absolute -inset-6 rounded-full ring-1 ring-sky-300/25"
                      animate={!prefersReduced ? { rotate: 360 } : {}}
                      transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
                      aria-hidden
                    />

                    {/* Shared animated icon (plain variant to avoid gray background) */}
                    <AnimatedAgentIcon size="lg" animate interactive variant="plain" className="relative" />
                  </motion.button>
                </div>
              </div>
              {/* MCP-Nodes: erscheinen in der Tools-Phase */}
              {phase === 'tools' && mcpNodes.map((n, idx) => {
                const aRad = ((n.angle - 90) * Math.PI) / 180;
                const nx = centerX + n.r * Math.cos(aRad);
                const ny = centerY + n.r * Math.sin(aRad);
                return (
                  <motion.div
                    key={`mcp-${idx}`}
                    className={`absolute z-0 ${CONFIG.FOCUS_RING} cursor-pointer`}
                    style={{ left: `${nx}%`, top: `${ny}%`, transform: 'translate(-50%, -50%)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={
                      prefersReduced
                        ? { opacity: centerFocus ? 0.35 : 1, scale: centerFocus ? 0.96 : 1 }
                        : {
                            y: [0, n.floatAmp, 0, -n.floatAmp, 0],
                            opacity: centerFocus ? 0.35 : [0, 1, 0.96, 1],
                            scale: centerFocus ? 0.96 : 1,
                            filter: centerFocus ? 'blur(2px)' : 'blur(0px)'
                          }
                    }
                    transition={prefersReduced ? { duration: 0 } : { duration: n.floatDur, delay: n.floatDelay, repeat: Infinity, ease: easeInOut }}
                    whileHover={!prefersReduced ? { scale: 1.05 } : undefined}
                    onClick={() => track({ name: 'superteam_v2_mcp_click', props: { variant: abVariant, type: n.type } })}
                    onMouseEnter={() => track({ name: 'superteam_v2_mcp_hover', props: { variant: abVariant, type: n.type } })}
                    onFocus={() => track({ name: 'superteam_v2_mcp_focus', props: { variant: abVariant, type: n.type } })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); track({ name: 'superteam_v2_mcp_click', props: { variant: abVariant, type: n.type } }); } }}
                    title={t(`landing.metaphor.mcp.${n.type}`, { defaultValue: n.type.toUpperCase() })}
                    aria-label={t(`landing.metaphor.mcp.${n.type}`, { defaultValue: `MCP node: ${n.type}` })}
                  >
                    <div className="relative">
                      <motion.div className="absolute -inset-1 rounded-2xl bg-sky-400/25 blur-2xl" aria-hidden {...(!prefersReduced && { animate: { opacity: [0.22, 0.34, 0.22], scale: [1, 1.04, 1] }, transition: { duration: 8, repeat: Infinity, ease: easeInOut } })} />
                      {mcpIcon(n.type)}
                    </div>
                  </motion.div>
                );
              })}

              {/* Agents: verteilt & dynamisch */}
              {Array.from({ length: agentCount }).map((_, i) => {
                const dyn = agentDynamics[i];
                const { cat, slot } = catSlotInfo.info[i];
                const total = catSlotInfo.totals[cat];
                const baseDeg = angleInSector(cat, slot, total) + dyn.angleJitter;
                const aRad = ((baseDeg - 90) * Math.PI) / 180;
                const ringBaseStart = dyn.ring === 'outer' ? baseOuterRadiusStart : baseOuterRadiusStart - 4.5;
                const ringBaseEnd = dyn.ring === 'outer' ? baseOuterRadiusEnd : baseOuterRadiusEnd - 3.5;
                const rStart = ringBaseStart + dyn.radiusJitter * 0.4;
                const rEnd = ringBaseEnd + dyn.radiusJitter;
                const xStart = centerX + rStart * Math.cos(aRad);
                const yStart = centerY + rStart * Math.sin(aRad);
                const xEnd = centerX + rEnd * Math.cos(aRad);
                const yEnd = centerY + rEnd * Math.sin(aRad);
                const emergeDelay = 0.18 + i * 0.06 + dyn.floatDelay * 0.15;
                // Flow-Dauer abhängig von der Distanz zum Zentrum (feineres Timing)
                const dx = centerX - xEnd;
                const dy = centerY - yEnd;
                const dist = Math.hypot(dx, dy);
                const baseDur = 1.2;
                const flowDur = Math.max(1.0, Math.min(1.8, baseDur + (dist / baseOuterRadiusEnd) * 0.6));
                // Eleganter Kurvenflug: Kontrollpunkt über eine senkrechte Versetzung der Mittelposition
                const mx = (xEnd + centerX) / 2;
                const my = (yEnd + centerY) / 2;
                const vx = centerX - xEnd;
                const vy = centerY - yEnd;
                const vlen = Math.hypot(vx, vy) || 1;
                const nx = -vy / vlen; // normierter senkrechter Vektor x
                const ny = vx / vlen;  // normierter senkrechter Vektor y
                const bend = Math.min(8, Math.max(2, dist * 0.12)); // Biegung in Prozentpunkten
                const ctrlX = mx + nx * bend;
                const ctrlY = my + ny * bend;

                return (
                  <React.Fragment key={`agent-wrap-${i}`}>
                    <svg key={`agent-line-${i}`} className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                      <defs>
                        <linearGradient id={agentLinkGradId(i)} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CAT_STYLE[cat].gradFrom} stopOpacity=".30" />
                          <stop offset="100%" stopColor={CAT_STYLE[cat].gradTo} stopOpacity=".18" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d={`M ${centerX},${centerY} Q ${(centerX + xEnd) / 2},${(centerY + yEnd) / 2 - 2} ${xEnd},${yEnd}`}
                        stroke={`url(#${agentLinkGradId(i)})`}
                        strokeWidth="0.26"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0.8 1.6"
                        fill="none"
                        animate={
                          prefersReduced
                            ? { opacity: centerFocus ? 0.3 : 1 }
                            : { strokeDashoffset: [0, -4], opacity: centerFocus ? 0.3 : 1 }
                        }
                        transition={{ duration: 5.2, repeat: prefersReduced ? 0 : Infinity, ease: easeInOut }}
                      />
                    </svg>

                    <motion.div
                      key={`agent-${i}`}
                      className="absolute z-0 cursor-pointer"
                      style={{ transform: 'translate(-50%, -50%)' }}
                      initial={{ opacity: phase === 'intro' ? 0 : 1, scale: 0.88, left: `${centerX}%`, top: `${centerY}%` }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        left: phase === 'intro' ? `${centerX}%` : `${xEnd}%`,
                        top: phase === 'intro' ? `${centerY}%` : `${yEnd}%`,
                      }}
                      animate={
                        phase !== 'intro'
                          ? (activeAgent === i
                              ? {
                                  left: [`${xEnd}%`, `${ctrlX}%`, `${centerX}%`],
                                  top: [`${yEnd}%`, `${ctrlY}%`, `${centerY}%`],
                                  opacity: [1, 0.86, 0.8],
                                  scale: 0.86,
                                  filter: 'blur(0px)'
                                }
                              : {
                                  left: `${xEnd}%`,
                                  top: `${yEnd}%`,
                                  opacity: centerFocus ? 0.32 : 1,
                                  scale: centerFocus ? 0.96 : 1,
                                  filter: centerFocus ? 'blur(2px)' : 'blur(0px)'
                                }
                            )
                          : undefined
                      }
                      transition={activeAgent === i
                        ? { duration: flowDur, ease: [0.4, 0, 0.2, 1], opacity: { times: [0, 0.75, 1], duration: flowDur }, left: { times: [0, 0.55, 1], duration: flowDur }, top: { times: [0, 0.55, 1], duration: flowDur } }
                        : { duration: 0.9, delay: phase === 'intro' ? 0 : emergeDelay, ease: easeOut }
                      }
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => !prefersReduced && setActiveAgent(i)}
                      onFocus={() => !prefersReduced && setActiveAgent(i)}
                      onClick={() => { !prefersReduced && setActiveAgent(i); track({ name: 'superteam_v2_agent_click', props: { agentIndex: i, variant: abVariant } }); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          !prefersReduced && setActiveAgent(i);
                          track({ name: 'superteam_v2_agent_click', props: { agentIndex: i, variant: abVariant } });
                        }
                      }}
                      onAnimationComplete={() => {
                        if (activeAgent === i) {
                          setActiveAgent(null);
                        }
                      }}
                      title={t(`landing.metaphor.avatar.${i + 1}`)}
                      aria-label={t(`landing.metaphor.avatar.${i + 1}`)}
                    >
                      <motion.div
                        className="grid place-items-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                        animate={!prefersReduced
                          ? (activeAgent === i
                              ? { scale: [1, 0.95, 0.9, 0.92, 0.9], opacity: [1, 0.92, 0.88] }
                              : { ...agentAnimate(dyn), opacity: [1, 0.985, 1] }
                            )
                          : undefined}
                        transition={!prefersReduced && activeAgent !== i ? {
                            repeat: Infinity,
                            repeatType: 'mirror',
                            ease: easeInOut,
                            x: { duration: dyn.floatDur * 1.07, delay: dyn.floatDelay + 0.08, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            y: { duration: dyn.floatDur * 0.93, delay: dyn.floatDelay + 0.16, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            rotate: { duration: dyn.floatDur * 1.18, delay: dyn.floatDelay + 0.12, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            rotateX: { duration: dyn.floatDur * 1.12, delay: dyn.floatDelay + 0.1, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            rotateY: { duration: dyn.floatDur * 0.88, delay: dyn.floatDelay + 0.2, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            scale: { duration: dyn.floatDur * 0.82, delay: dyn.floatDelay + 0.06, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                            opacity: { duration: dyn.floatDur * 1.0, delay: dyn.floatDelay, repeat: Infinity, repeatType: 'mirror', ease: easeInOut },
                          } : (activeAgent === i ? {
                            ease: [0.4, 0, 0.2, 1],
                            scale: { duration: flowDur, times: [0, 0.55, 0.8, 0.92, 1], ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: flowDur, times: [0, 0.6, 1], ease: [0.4, 0, 0.2, 1] }
                          } : undefined)}
                        whileHover={activeAgent !== i ? { scale: 1.14 } : undefined}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* depth */}
                        <div className="absolute -inset-3 rounded-full blur-xl" style={{ backgroundColor: CAT_STYLE[cat].glow }} aria-hidden />
                        {activeAgent === i && (
                          <>
                            {/* Verstärkter, getönter Halo mit Gradient */}
                            <div
                              className="absolute -inset-5 rounded-full blur-[28px] opacity-70"
                              style={{ background: `radial-gradient(40% 40% at 50% 50%, ${CAT_STYLE[cat].glow} 0%, rgba(255,255,255,0.12) 60%, rgba(255,255,255,0) 100%)` }}
                              aria-hidden
                            />
                            {/* Kategorie-getönte Ping-Ringe */}
                            <div
                              className="absolute inset-0 rounded-full animate-ping"
                              style={{
                                animationDuration: `${flowDur}s`,
                                background: `radial-gradient(closest-side, ${CAT_STYLE[cat].glow}33 0%, ${CAT_STYLE[cat].glow}1a 55%, transparent 70%)`
                              }}
                              aria-hidden
                            />
                            <div
                              className="absolute inset-0 rounded-full animate-ping"
                              style={{
                                animationDuration: `${flowDur}s`,
                                animationDelay: '0.2s',
                                background: `radial-gradient(closest-side, ${CAT_STYLE[cat].glow}26 0%, ${CAT_STYLE[cat].glow}14 55%, transparent 70%)`
                              }}
                              aria-hidden
                            />
                          </>
                        )}
                        <span
                          className="absolute -inset-1 rounded-full ring-1 ring-white/10 backdrop-blur-[1.5px]"
                          aria-hidden
                        />
                        <span className="sr-only">{t(`landing.metaphor.avatar.${i + 1}`)}</span>
                        <AnimatedAgentIcon size="sm" animate={false} interactive={false} variant="plain" />
                      </motion.div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Untere Legende */}
        <div className="mt-12 md:mt-16 lg:mt-20 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-500/30 to-indigo-600/30 px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden></span>
              {t('landing.system.layers.business.short')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500/30 to-teal-600/30 px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden></span>
              {t('landing.system.layers.agents.short')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-500/30 to-cyan-500/30 px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300" aria-hidden></span>
              {t('landing.system.layers.mas.short')}
            </span>
          </div>
        </div>
      </div>
    </LandingSection>
  );
};

export default SuperTeamSectionVariantV2;
