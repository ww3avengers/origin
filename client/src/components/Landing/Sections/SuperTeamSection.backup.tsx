import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import LandingSection from './LandingSection';
import { SectionHeading } from '~/components/ui';
import React from 'react';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';

const avatarColors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#22d3ee'];

// i18n: use fully-qualified landing.* keys via useT()

const SuperTeamSection: FC = () => {
  const t = useT();

  const title = t('landing.metaphor.superteam_title');
  const subtitle = t('landing.metaphor.superteam_subtitle');
  const badge = t('landing.metaphor.superteam_badge');

  // A/B Variant (SSR-safe, persisted)
  const abVariant = getVariantForKey('superteam', 'base');

  // Reduced motion preference
  const prefersReduced = useReducedMotion?.() ?? false;

  // Motion variants aligned with AgentHeroSection
  const listVariants = prefersReduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06, ease: 'easeOut' } },
      };

  const itemVariants = prefersReduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
      };

  // Parallax references (align with AgentDemoSection)
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef as any, offset: ['start end', 'end start'] });
  // Parallax-Tuning: Heading etwas reduzierter, Visual minimal stärker für mehr Tiefe
  const headingY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] as any : [5, -5] as any);
  const visualY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] as any : [-8, 8] as any);

  // Responsive breakpoint detection (md: 768px)
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Subtle cursor-parallax tilt (preserves reduced motion)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltXSpring = useSpring(tiltX, { stiffness: 120, damping: 20, mass: 0.4 });
  const tiltYSpring = useSpring(tiltY, { stiffness: 120, damping: 20, mass: 0.4 });

  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width; // 0..1
    const cy = (e.clientY - rect.top) / rect.height; // 0..1
    const maxX = isMd ? 3 : 2; // rotateX range in deg
    const maxY = isMd ? 3 : 2; // rotateY range in deg
    // rotateX is driven by vertical movement (cy), rotateY by horizontal (cx)
    tiltX.set((0.5 - cy) * maxX * 2);
    tiltY.set((cx - 0.5) * maxY * 2);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Shared visual center for the entire diagram (rings, card, avatars)
  // Set to exact mathematical center per request
  const centerX = 50;
  const centerY = 50;

  const bullets: string[] = [
    t('landing.metaphor.bullets.1'),
    t('landing.metaphor.bullets.2'),
    t('landing.metaphor.bullets.3'),
    t('landing.metaphor.bullets.4'),
  ];

  // Deterministic pseudo-random helper (stable between renders)
  const lcg = (seed: number) => () => (seed = (seed * 48271) % 0x7fffffff) / 0x7fffffff;

  // Config (variant-driven)
  const agentCount = abVariant === 'alt' ? 8 : 6;
  const mcpCount = abVariant === 'alt' ? 7 : 5;
  const baseOuterRadiusStart = 43; // matches previous logic
  const baseOuterRadiusEnd = 34;

  // Precompute per-agent jitter and float settings
  const agentDynamics = useMemo(() => {
    const rnd = lcg(1337 + (abVariant === 'alt' ? 1 : 0));
    const ampBoost = abVariant === 'alt' ? 1.15 : 1;
    return Array.from({ length: agentCount }).map((_, i) => {
      const angleJitter = rnd() * 3 - 1.5; // ±1.5°
      const radiusJitter = rnd() * 2 - 1; // ±1 (percent points)
      const floatAmp = ((2 + rnd() * 2) * ampBoost) * 0.75; // refined: 1.5..3 px * boost
      const floatDelay = rnd() * 2; // 0..2s
      const floatDur = 4.5 + rnd() * 2.5; // 4.5..7s
      return { angleJitter, radiusJitter, floatAmp, floatDelay, floatDur };
    });
  }, [agentCount, abVariant]);

  // MCP nodes configuration (icons + positions + connections)
  const mcpNodes = useMemo(() => {
    const rnd = lcg(9001 + (abVariant === 'alt' ? 1 : 0));
    const ampBoost = abVariant === 'alt' ? 1.12 : 1;
    const types: Array<'brain' | 'note' | 'tool' | 'cloud' | 'db'> = ['brain', 'note', 'tool', 'cloud', 'db'];
    return Array.from({ length: mcpCount }).map((_, i) => {
      const baseAngle = (i / mcpCount) * 360 + 20 * rnd();
      const angleJitter = rnd() * 12 - 6; // ±6°
      const r = 56 + rnd() * 4; // 56..60
      const targetAgent = Math.floor(rnd() * agentCount);
      const floatAmp = ((3 + rnd() * 3) * ampBoost) * 0.75; // refined: ~2.25..4.5 px * boost
      const floatDur = 6 + rnd() * 3; // 6..9s
      const floatDelay = rnd() * 3; // 0..3s
      const type = types[i % types.length];
      return { angle: baseAngle + angleJitter, r, targetAgent, floatAmp, floatDur, floatDelay, type };
    });
  }, [mcpCount, agentCount, abVariant]);

  // MCP node icons
  const mcpIcon = (type: 'brain' | 'note' | 'tool' | 'cloud' | 'db') => {
    switch (type) {
      case 'brain':
        return (
          <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white">
            <path fill="currentColor" d="M9.5 5a3 3 0 0 0-3 3c-1.4.2-2.5 1.4-2.5 2.9 0 1 .5 1.9 1.2 2.4-.1.3-.2.6-.2.9 0 1.7 1.3 3 3 3h1V7a2 2 0 0 1 2-2h.5V5H9.5zM14.5 5a3 3 0 0 1 3 3c1.4.2 2.5 1.4 2.5 2.9 0 1-.5 1.9-1.2 2.4.1.3.2.6.2.9 0 1.7-1.3 3-3 3h-1V7a2 2 0 0 0-2-2H12V5h2.5z"/>
          </svg>
        );
      case 'note':
        return (
          <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white">
            <path fill="currentColor" d="M7 3h10a2 2 0 0 1 2 2v10l-4 4H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            <path fill="#0ea5e9" d="M15 15h4l-4 4v-4z"/>
            <rect x="8.5" y="7.5" width="7" height="1.4" rx="0.7" fill="#0ea5e9" opacity=".9"/>
            <rect x="8.5" y="10.2" width="6" height="1.2" rx="0.6" fill="#0ea5e9" opacity=".7"/>
          </svg>
        );
      case 'cloud':
        return (
          <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white">
            <path fill="currentColor" d="M6.5 18.5h10.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.8-1.2A3.8 3.8 0 0 0 6.5 18.5z"/>
          </svg>
        );
      case 'db':
        return (
          <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white">
            <ellipse cx="12" cy="6" rx="6.5" ry="2.5" fill="currentColor"/>
            <path fill="currentColor" d="M5.5 6v8c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6c0 1.4-2.9 2.5-6.5 2.5S5.5 7.4 5.5 6z"/>
          </svg>
        );
      case 'tool':
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white">
            <path fill="currentColor" d="M21 7.5l-4.2 4.2-2-2L19 5.5a5 5 0 0 0-6.4 6.2l-6 6a2 2 0 0 0 2.8 2.8l6-6A5 5 0 0 0 21 7.5z"/>
          </svg>
        );
    }
  };

  // Single robot head icon used for all orbit agents (slightly larger)
  const robotIcon = (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="w-8 h-8 md:w-9 md:h-9 text-black dark:text-white">
      <path fill="currentColor" d="M10.5 2.5h3v2h-3z"/>
      <rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor"/>
      <circle cx="9" cy="12" r="1.6" fill="#0ea5e9"/>
      <circle cx="15" cy="12" r="1.6" fill="#0ea5e9"/>
      <rect x="9" y="15" width="6" height="1.6" fill="#111827" opacity=".8"/>
    </svg>
  );

  // Distinct super-agent icon (shield + star badge) for the center
  const superIcon = (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="w-12 h-12 md:w-14 md:h-14 text-black dark:text-white">
      <defs>
        <linearGradient id="superGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      {/* shield */}
      <path d="M12 2.5l7 3v5.8c0 4.9-3.2 8.7-7 9.7-3.8-1-7-4.8-7-9.7V5.5l7-3z" fill="url(#superGradient)" opacity="0.22"/>
      {/* star */}
      <path fill="currentColor" d="M12 8.2l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4L12 8.2z"/>
      {/* glow ring */}
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#0ea5e9" strokeOpacity=".6" strokeWidth="0.8"/>
    </svg>
  );

  // Small uniform X-shift for icons only (move slightly left)
  const iconShiftX = -4; // in percentage points
  // Small uniform Y-shift for icons only (move slightly up)
  const iconShiftY = -4; // in percentage points

  // Impression tracking once on mount/variant
  useEffect(() => {
    track({ name: 'superteam_impression', props: { variant: abVariant } });
  }, [abVariant]);


  return (
    <LandingSection
      id="superteam"
      aria-label={title}
      className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-900"
      data-ai-section="superteam"
      data-ai-title="Super Team"
      ref={sectionRef}
      containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="relative z-10">
      {/* Decorative background layers (subtle, premium) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),rgba(255,255,255,0))] blur-2xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_110%,rgba(255,255,255,0.05),transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
        style={{ y: prefersReduced ? 0 : headingY as any, willChange: 'transform' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <span aria-hidden>★</span>
            <span>{badge}</span>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.44, ease: 'easeOut', delay: 0.08 }}
            >
              <SectionHeading title={title} subtitle={subtitle} align="left" />
            </motion.div>
            {/* Small legend like AgentDemoSection: Business / Agents / MAS */}
            <div className="mt-4 mb-2 flex flex-wrap gap-2" aria-label={t('landing.system.title')}>
              <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-blue-500/30 to-indigo-600/30">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden></span>
                {t('landing.system.layers.business.short')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-emerald-500/30 to-teal-600/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden></span>
                {t('landing.system.layers.agents.short')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-violet-500/30 to-fuchsia-600/30">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300" aria-hidden></span>
                {t('landing.system.layers.mas.short')}
              </span>
            </div>
            <motion.ul
              role="list"
              className="mt-6 space-y-3 text-gray-300"
              variants={listVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              {bullets.map((b, i) => (
                <motion.li key={i} className="flex items-start gap-3" variants={itemVariants} role="listitem">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400" />
                  <span>{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Visual: precise orbit layout with connection lines */}
          <motion.div
            className="relative w-full max-w-[360px] md:max-w-[420px] mx-auto"
            style={{
              willChange: 'transform',
              transformStyle: 'preserve-3d',
              transformPerspective: 800,
              rotateX: prefersReduced ? 0 : (tiltXSpring as any),
              rotateY: prefersReduced ? 0 : (tiltYSpring as any),
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            onMouseMove={!prefersReduced ? onTilt : undefined}
            onMouseLeave={!prefersReduced ? resetTilt : undefined}
          >
            <div className="relative pt-[100%]">{/* square aspect wrapper */}
              {/* Atmospheric depth fog overlay (subtle) */}
              <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ opacity: 0.18 }}>
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,0.14),rgba(99,102,241,0.06)_60%,transparent_100%)]" />
              </div>
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
                {...(!prefersReduced && {
                  animate: { opacity: [1, 0.96, 1], scale: [1, 1.01, 1] },
                  transition: { duration: 6, repeat: Infinity, repeatType: 'mirror' },
                })}
                style={{ y: prefersReduced ? 0 : visualY as any }}
              >
                <defs>
                  <radialGradient id="g" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={centerX} cy={centerY} r={46} fill="url(#g)" />
                <circle cx={centerX} cy={centerY} r={42} fill="none" stroke="#6366f1" strokeOpacity="0.25" strokeDasharray="2 3" />
                {/* final orbit where avatars will snap */}
                <circle cx={centerX} cy={centerY} r={34} fill="none" stroke="#6366f1" strokeOpacity="0.2" strokeDasharray="2 3" />
                <circle cx={centerX} cy={centerY} r={32} fill="none" stroke="#6366f1" strokeOpacity="0.14" strokeDasharray="2 3" />
                <circle cx={centerX} cy={centerY} r={22} fill="none" stroke="#6366f1" strokeOpacity="0.12" strokeDasharray="2 3" />
              </motion.svg>

            {/* Center super‑agent icon (exact center) */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
                style={{ left: `${centerX + iconShiftX}%`, top: `${centerY + iconShiftY}%` }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={!prefersReduced ? { scale: 1.03 } : undefined}
                onClick={() => track({ name: 'superteam_center_click', props: { variant: abVariant } })}
              >
                <div className="absolute -inset-1 rounded-2xl blur-2xl bg-indigo-500/30" aria-hidden />
                <div className="relative grid place-items-center">
                  <span className="sr-only">{t('landing.metaphor.super_agent_label')}</span>
                  {superIcon}
                </div>
              </motion.div>
            </div>

            {/* MCP links layer: lines from MCP nodes to selected agents */}
            {!prefersReduced && (
              <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="mcpLinkGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity=".38"/>
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity=".22"/>
                  </linearGradient>
                </defs>
                {mcpNodes.map((n, idx) => {
                  const aRad = ((n.angle - 90) * Math.PI) / 180;
                  const nx = centerX + n.r * Math.cos(aRad);
                  const ny = centerY + n.r * Math.sin(aRad);
                  const adyn = agentDynamics[n.targetAgent];
                  const agentAngle = ((n.targetAgent / agentCount) * 360 - 90 + adyn.angleJitter) * (Math.PI / 180);
                  const agentR = baseOuterRadiusEnd + adyn.radiusJitter;
                  const ax = centerX + agentR * Math.cos(agentAngle) + iconShiftX;
                  const ay = centerY + agentR * Math.sin(agentAngle) + iconShiftY;
                  // control point slightly toward center for subtle curve
                  const cx = (nx + ax) / 2 + (centerX - (nx + ax) / 2) * 0.14;
                  const cy = (ny + ay) / 2 + (centerY - (ny + ay) / 2) * 0.14;
                  return (
                    <motion.path
                      key={idx}
                      d={`M ${nx},${ny} Q ${cx},${cy} ${ax},${ay}`}
                      stroke="url(#mcpLinkGrad)"
                      strokeWidth="0.28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="0.8 1.6"
                      fill="none"
                      animate={{ strokeDashoffset: [-0, -4] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
                    />
                  );
                })}
              </svg>
            )}

            {/* MCP nodes */}
            {mcpNodes.map((n, idx) => {
              const aRad = ((n.angle - 90) * Math.PI) / 180;
              const nx = centerX + n.r * Math.cos(aRad);
              const ny = centerY + n.r * Math.sin(aRad);
              return (
                <motion.div
                  key={`mcp-${idx}`}
                  className="absolute"
                  style={{ left: `${nx}%`, top: `${ny}%`, transform: 'translate(-50%, -50%)' }}
                  {...(!prefersReduced && {
                    animate: { y: [0, n.floatAmp, 0, -n.floatAmp, 0], opacity: [1, 0.96, 1] },
                    transition: { duration: n.floatDur, delay: n.floatDelay, repeat: Infinity, ease: 'easeInOut' },
                  })}
                  whileHover={!prefersReduced ? { scale: 1.03 } : undefined}
                  onClick={() => track({ name: 'superteam_mcp_click', props: { variant: abVariant, type: n.type } })}
                  onMouseEnter={() => track({ name: 'superteam_mcp_hover', props: { variant: abVariant, type: n.type } })}
                  onFocus={() => track({ name: 'superteam_mcp_focus', props: { variant: abVariant, type: n.type } })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      track({ name: 'superteam_mcp_click', props: { variant: abVariant, type: n.type } });
                    }
                  }}
                  title={t(`landing.metaphor.mcp.${n.type}`, { defaultValue: n.type.toUpperCase() })}
                  aria-label={t(`landing.metaphor.mcp.${n.type}`, { defaultValue: `MCP node: ${n.type}` })}
                >
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-indigo-500/20 blur-md" aria-hidden />
                    {mcpIcon(n.type)}
                  </div>
                </motion.div>
              );
            })}

            {/* Avatars on outer orbit positioned with percentages (with slight jitter/float) */}
            {Array.from({ length: agentCount }).map((_, i) => {
              const dyn = agentDynamics[i];
              const angle = ((i / agentCount) * 360 - 90 + dyn.angleJitter) * (Math.PI / 180);
              const rStart = baseOuterRadiusStart + dyn.radiusJitter * 0.5;
              const rEnd = baseOuterRadiusEnd + dyn.radiusJitter;  // final orbit radius with jitter
              const xStart = centerX + rStart * Math.cos(angle);
              const yStart = centerY + rStart * Math.sin(angle);
              const xEnd = centerX + rEnd * Math.cos(angle);
              const yEnd = centerY + rEnd * Math.sin(angle);

              return (
                <div key={i} className="pointer-events-none">
                  {/* connection line */}
                  <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <defs>
                      <linearGradient id={`agentLinkGrad-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#93c5fd" stopOpacity=".28"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity=".18"/>
                      </linearGradient>
                    </defs>
                    {/* curve from center to avatar */}
                    <motion.path
                      d={`M ${centerX},${centerY} Q ${(centerX + xEnd + iconShiftX) / 2},${(centerY + yEnd + iconShiftY) / 2 - 2} ${xEnd + iconShiftX},${yEnd + iconShiftY}`}
                      stroke={`url(#agentLinkGrad-${i})`}
                      strokeWidth="0.26"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="0.8 1.6"
                      fill="none"
                      {...(!prefersReduced && { animate: { strokeDashoffset: [0, -4] }, transition: { duration: 3.2, repeat: Infinity, ease: 'linear' } })}
                    />
                  </svg>
                  {/* avatar */}
                  <motion.div
                    className="absolute grid place-items-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                    style={{ left: `${xStart + iconShiftX}%`, top: `${yStart + iconShiftY}%`, transform: 'translate(-50%, -50%)' }}
                    initial={{ opacity: 0, scale: 0.88, left: `${xStart + iconShiftX}%`, top: `${yStart + iconShiftY}%` }}
                    whileInView={{ opacity: 1, scale: 1, left: `${xEnd + iconShiftX}%`, top: `${yEnd + iconShiftY}%` }}
                    {...(!prefersReduced && {
                      animate: { scale: [1, 1.03, 1], x: [0, dyn.floatAmp, 0, -dyn.floatAmp, 0], y: [0, dyn.floatAmp, 0, -dyn.floatAmp, 0] },
                      transition: { duration: dyn.floatDur, delay: dyn.floatDelay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                      whileHover: { scale: 1.04 },
                      whileTap: { scale: 0.99 },
                    })}
                  >
                    {/* depth: subtle inner light behind icon */}
                    <div className="absolute -inset-3 rounded-full bg-cyan-400/10 blur-xl" aria-hidden />
                    <div className="absolute -inset-1 rounded-full bg-white/5 blur-md" aria-hidden />
                    {/* Icon as visual, label remains for a11y */}
                    <span className="sr-only">{t(`landing.metaphor.avatar.${i+1}`)}</span>
                    {robotIcon}
                  </motion.div>
                </div>
              );
            })}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Legend mirrored under visual for clarity on small screens */}
      <div className="mt-6 text-center md:hidden">
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-blue-500/30 to-indigo-600/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden></span>
            {t('landing.system.layers.business.short')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-emerald-500/30 to-teal-600/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden></span>
            {t('landing.system.layers.agents.short')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 bg-gradient-to-r from-violet-500/30 to-fuchsia-600/30">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300" aria-hidden></span>
            {t('landing.system.layers.mas.short')}
          </span>
        </div>
      </div>
    </div>
  </div>
</LandingSection>;

export default SuperTeamSection;
