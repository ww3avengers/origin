import React, { FC, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Bot,
  FileText,
  Database,
  Cloud,
  BookOpen,
  ShieldCheck,
  Mail,
  Search,
  CreditCard,
  Code,
  FlaskConical,
  Server as ServerIcon,
  Cpu,
  Globe,
  Zap,
  HardDrive,
  KeyRound,
} from 'lucide-react';
import { BrandAgent } from '~/components/Icons/brand/BrandIcons';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';
import { useT } from '~/utils/i18n';
import { Badge } from '~/components/ui/Badge';

/** ==================================
 *  Constants & helpers (de-duplicated)
 *  ================================== */

type ToolId =
  | 'api'
  | 'db'
  | 'kb'
  | 'auth'
  | 'queue'
  | 'cache'
  | 'search'
  | 'mail'
  | 'payment'
  | 'pdf'
  | 'code'
  | 'test'
  | 'storage'
  | 'secrets';

type ServerId =
  | 'mcpA'
  | 'mcpB'
  | 'mcpC'
  | 'mcpD'
  | 'vector'
  | 'funcs'
  | 'billing'
  | 'logsS'
  | 'cacheS'
  | 'llm'
  | 'gateway'
  | 'monitor'
  | 'authS'
  | 'queueS';

interface Token {
  id: string;
  tool: ToolId;
  from: ServerId;
  /** absolute spawn X in px (relative to container) */
  sX?: number;
  /** absolute spawn Y in px (relative to container) */
  sY?: number;
  /** precomputed curved path in percent (stable per token) */
  pathPct?: { midLeft1: number; midTop1: number; midLeft2: number; midTop2: number };
  /** stable per-token depth value to avoid re-randomization */
  rDepth?: number;
  /** precomputed duration (s) and delay (s) for this token */
  duration?: number;
  delay?: number;
}

const EASING = [0.22, 1, 0.36, 1] as const;
const T = { badge: 0.35 } as const;
const R = { ring: 42 } as const;

const clampPct = (v: number) => Math.max(3.5, Math.min(96.5, v));

const computeCurvedPathPct = (
  sLeftPct: number,
  sTopPct: number,
  rngLocal: () => number,
) => {
  const eL = 50;
  const eT = 50;
  const dx = eL - sLeftPct;
  const dy = eT - sTopPct;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const o1 = 9.5 + (rngLocal() * 2.0 - 1.0);
  const o2 = 5.0 + (rngLocal() * 1.6 - 0.8);
  const m1L = sLeftPct + dx * 0.26 + nx * o1;
  const m1T = sTopPct + dy * 0.26 + ny * o1;
  const m2L = sLeftPct + dx * 0.7 + nx * o2;
  const m2T = sTopPct + dy * 0.7 + ny * o2;
  return {
    midLeft1: clampPct(m1L),
    midTop1: clampPct(m1T),
    midLeft2: clampPct(m2L),
    midTop2: clampPct(m2T),
  } as const;
};

const toolsPalette: Record<
  ToolId,
  { Icon: React.ComponentType<{ className?: string }>; glow: string }
> = {
  api: { Icon: Cloud, glow: 'rgba(56, 189, 248, 0.45)' },
  db: { Icon: Database, glow: 'rgba(99, 102, 241, 0.40)' },
  kb: { Icon: BookOpen, glow: 'rgba(52, 211, 153, 0.38)' },
  auth: { Icon: ShieldCheck, glow: 'rgba(251, 191, 36, 0.40)' },
  queue: { Icon: ServerIcon, glow: 'rgba(244, 114, 182, 0.38)' },
  cache: { Icon: Zap, glow: 'rgba(34, 197, 94, 0.38)' },
  search: { Icon: Search, glow: 'rgba(56, 189, 248, 0.40)' },
  mail: { Icon: Mail, glow: 'rgba(251, 146, 60, 0.38)' },
  payment: { Icon: CreditCard, glow: 'rgba(99, 102, 241, 0.40)' },
  pdf: { Icon: FileText, glow: 'rgba(248, 113, 113, 0.42)' },
  code: { Icon: Code, glow: 'rgba(147, 197, 253, 0.42)' },
  test: { Icon: FlaskConical, glow: 'rgba(163, 230, 53, 0.38)' },
  storage: { Icon: HardDrive, glow: 'rgba(192, 132, 252, 0.40)' },
  secrets: { Icon: KeyRound, glow: 'rgba(244, 63, 94, 0.42)' },
};

/** ================================
 *  Responsive server badge layout
 *  ================================ */

type ServerLayout = 'sm' | 'md' | 'lg';

type ServerSpec = Record<
  ServerId,
  { left: string; top: string; label: string; Icon?: React.ComponentType<{ className?: string }> }
>;

const serverBaseLg: ServerSpec = {
  mcpA: { left: '10%', top: '14%', label: 'MCP‑A', Icon: Cpu },
  mcpB: { left: '76%', top: '24%', label: 'MCP‑B', Icon: Cpu },
  mcpC: { left: '16%', top: '82%', label: 'MCP‑C', Icon: Cpu },
  mcpD: { left: '80%', top: '82%', label: 'MCP‑D', Icon: Cpu },
  vector: { left: '8%', top: '50%', label: 'VectorDB', Icon: Database },
  funcs: { left: '82%', top: '50%', label: 'Functions', Icon: ServerIcon },
  billing: { left: '50%', top: '8%', label: 'Billing', Icon: CreditCard },
  logsS: { left: '50%', top: '90%', label: 'Logs', Icon: FileText },
  cacheS: { left: '18%', top: '28%', label: 'Cache', Icon: Zap },
  llm: { left: '74%', top: '72%', label: 'LLM', Icon: Globe },
  gateway: { left: '16%', top: '8%', label: 'Gateway', Icon: Globe },
  monitor: { left: '78%', top: '8%', label: 'Monitor', Icon: ServerIcon },
  authS: { left: '6%', top: '36%', label: 'AuthSrv', Icon: ShieldCheck },
  queueS: { left: '88%', top: '36%', label: 'Queue', Icon: ServerIcon },
};

const applyOverrides = (
  base: ServerSpec,
  overrides: Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>>,
) => {
  const out: ServerSpec = { ...base } as ServerSpec;
  for (const k in overrides) {
    const id = k as ServerId;
    out[id] = { ...out[id], ...(overrides[id] as any) };
  }
  return out;
};

const normalizeLeftRange = (
  ids: ServerId[],
  specPartials: Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>>,
  leftMin: number,
  leftMax: number,
) => {
  let minL = Infinity;
  let maxL = -Infinity;
  const numericLeft: Record<ServerId, number> = {} as any;
  for (const id of ids) {
    const v = specPartials[id]?.left as string | undefined;
    if (!v) continue;
    const n = parseFloat(v);
    numericLeft[id] = n;
    if (!Number.isNaN(n)) {
      if (n < minL) minL = n;
      if (n > maxL) maxL = n;
    }
  }
  const span = Math.max(0.0001, maxL - minL);
  const targetSpan = Math.max(0, leftMax - leftMin);
  const out: Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>> = {};
  for (const id of ids) {
    const base = specPartials[id] || {};
    const n = numericLeft[id];
    const mapped = leftMin + ((n - minL) / span) * targetSpan;
    out[id] = { ...base, left: `${mapped}%` } as any;
  }
  return out;
};

const polarRing = (
  ids: ServerId[],
  opts: { cx: number; cy: number; rx: number; ry?: number; startDeg?: number; clamp?: { leftMin?: number; leftMax?: number; topMin?: number; topMax?: number } },
): Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>> => {
  const { cx, cy, rx, ry = rx, startDeg = -90, clamp = { leftMin: 6, leftMax: 94, topMin: 6, topMax: 94 } } = opts;
  const n = ids.length;
  const out: Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>> = {};
  for (let i = 0; i < n; i++) {
    const angle = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    let left = cx + rx * Math.cos(angle);
    let top = cy + ry * Math.sin(angle);
    if (clamp.leftMin !== undefined) left = Math.max(clamp.leftMin, left);
    if (clamp.leftMax !== undefined) left = Math.min(clamp.leftMax, left);
    if (clamp.topMin !== undefined) top = Math.max(clamp.topMin, top);
    if (clamp.topMax !== undefined) top = Math.min(clamp.topMax, top);
    const id = ids[i];
    out[id] = { left: `${left}%`, top: `${top}%` } as any;
  }
  return out;
};

const badgeConfigs = {
  lg: {
    badges: ['gateway', 'authS', 'vector', 'llm', 'funcs', 'cacheS', 'logsS', 'monitor'] as ServerId[],
    ring: { cx: 50, cy: 50, rx: 42, ry: 30, startDeg: -90, clamp: { leftMin: 7, leftMax: 93, topMin: 6, topMax: 94 } },
  },
  md: {
    badges: ['gateway', 'authS', 'vector', 'llm', 'funcs', 'cacheS', 'logsS'] as ServerId[],
    ring: { cx: 50, cy: 50, rx: 40, ry: 28, startDeg: -90, clamp: { leftMin: 8, leftMax: 92, topMin: 8, topMax: 92 } },
  },
  sm: {
    badges: ['gateway', 'authS', 'vector', 'llm', 'funcs'] as ServerId[],
    ring: { cx: 50, cy: 50, rx: 40, ry: 22, startDeg: -90, clamp: { leftMin: 9, leftMax: 91, topMin: 12, topMax: 88 } },
  },
};

const serverLayouts: Record<ServerLayout, ServerSpec> = {
  lg: (() => {
    const ring = polarRing(badgeConfigs.lg.badges, badgeConfigs.lg.ring);
    const norm = normalizeLeftRange(
      badgeConfigs.lg.badges,
      ring,
      badgeConfigs.lg.ring.clamp?.leftMin ?? 5,
      badgeConfigs.lg.ring.clamp?.leftMax ?? 95,
    );
    return applyOverrides(serverBaseLg, { ...norm });
  })(),
  md: (() => {
    const ring = polarRing(badgeConfigs.md.badges, badgeConfigs.md.ring);
    const norm = normalizeLeftRange(
      badgeConfigs.md.badges,
      ring,
      badgeConfigs.md.ring.clamp?.leftMin ?? 6,
      badgeConfigs.md.ring.clamp?.leftMax ?? 94,
    );
    return applyOverrides(serverBaseLg, { ...norm });
  })(),
  sm: (() => {
    const ring = polarRing(badgeConfigs.sm.badges, badgeConfigs.sm.ring);
    const norm = normalizeLeftRange(
      badgeConfigs.sm.badges,
      ring,
      badgeConfigs.sm.ring.clamp?.leftMin ?? 8,
      badgeConfigs.sm.ring.clamp?.leftMax ?? 92,
    );
    return applyOverrides(serverBaseLg, { ...norm });
  })(),
};

/** ================================
 *  FPS monitor (for dynamic spawn tuning)
 *  ================================ */
function useFPS(): number {
  const [fps, setFps] = React.useState(60);
  React.useEffect(() => {
    let last = performance.now();
    let frames = 0;
    let rafId: number;
    const loop = (now: number) => {
      frames++;
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return fps;
}

/** ================================
 *  Component
 *  ================================ */

export interface AgentVisualDemoProps {
  isActive?: boolean;
  className?: string;
  onComplete?: () => void;
  visualOnly?: boolean;
  visualOnlyLoop?: boolean;
  maxTokens?: number;
  density?: 'low' | 'medium' | 'high';
  palette?: 'cool' | 'warm' | 'mixed';
  spawnMinMs?: number;
  spawnMaxMs?: number;
  demoSeed?: number;
  brandMode?: 'lucide' | 'brand' | 'mixed';
  forceMotion?: boolean;
  asmEnabled?: boolean;
  showArrows?: boolean;
  retryRate?: number;
  asmExtended?: boolean;
  spawnWhenHidden?: boolean;
  /** Drehe die zentrale Agent-Icon-Fläche kontinuierlich */
  centerRotate?: boolean;
}

const AgentVisualDemo: FC<AgentVisualDemoProps> = ({
  isActive = true,
  className,
  onComplete,
  visualOnly = false,
  visualOnlyLoop = true,
  maxTokens,
  density = 'medium',
  palette = 'mixed',
  spawnMinMs = 1200,
  spawnMaxMs = 2000,
  demoSeed,
  brandMode = 'brand',
  forceMotion = false,
  asmEnabled = true,
  showArrows = true,
  retryRate = 0.12,
  asmExtended = true,
  spawnWhenHidden = false,
  centerRotate = true,
}) => {
  const t = useT();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const motionOff = prefersReducedMotion && !forceMotion;
  const fps = useFPS();
  // smooth out reactions to FPS by reading from a ref instead of effect deps
  const fpsRef = useRef(fps);
  useEffect(() => {
    fpsRef.current = fps;
  }, [fps]);
  // particle budget adapts to FPS to avoid jank
  const particleCount = useMemo(() => (fps >= 55 ? 12 : fps >= 40 ? 10 : 6), [fps]);

  /** ======= layout ======= */
  const [layout, setLayout] = useState<ServerLayout>('lg');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Partial<Record<ServerId, HTMLDivElement | null>>>({});
  const [edgeNormalizedLefts, setEdgeNormalizedLefts] = useState<Partial<Record<ServerId, string>>>({});
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const pick = (): ServerLayout => (window.innerWidth < 420 ? 'sm' : window.innerWidth < 768 ? 'md' : 'lg');
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setLayout(pick());
        raf = 0;
      });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const servers = useMemo(() => {
    const base = serverLayouts[layout];
    if (typeof window === 'undefined') return base;
    const el = containerRef.current as HTMLElement | null;
    if (!el) return base;
    const cs = window.getComputedStyle(el);
    const padL = parseFloat(cs.paddingLeft || '0') || 0;
    const padR = parseFloat(cs.paddingRight || '0') || 0;
    const w = el.clientWidth || 0;
    if (w <= 0) return base;
    const gutterPx = Math.max(padL, padR);
    const leftMinPct = (gutterPx / w) * 100;
    const leftMaxPct = 100 - leftMinPct;
    const ids = (badgeConfigs[layout] as any).badges as ServerId[];
    const partials: Partial<Record<ServerId, Partial<ServerSpec[ServerId]>>> = {};
    ids.forEach((id) => {
      const v = (base as any)[id];
      if (v) partials[id] = { left: v.left, top: v.top } as any;
    });
    const norm = normalizeLeftRange(ids, partials, leftMinPct, leftMaxPct);
    const composed: ServerSpec = { ...(base as any) };
    ids.forEach((id) => {
      const n = norm[id]?.left as string | undefined;
      if (n) composed[id] = { ...(composed[id] as any), left: n } as any;
    });
    return composed;
  }, [layout]);

  const recalcEdgeNormalized = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    const padL = parseFloat(cs.paddingLeft || '0') || 0;
    const padR = parseFloat(cs.paddingRight || '0') || 0;
    const w = el.clientWidth || 0;
    const h = el.clientHeight || 0;
    if (w <= 0 || h <= 0) return;

    setContainerSize({ w, h });

    const gutterPx = Math.max(padL, padR);
    const leftMinPct = (gutterPx / w) * 100;
    const leftMaxPct = 100 - leftMinPct;

    const ids = Object.keys(servers) as ServerId[];
    if (!ids.length) return;

    let minEdge = Infinity;
    let maxEdge = -Infinity;
    const centers: Record<ServerId, number> = {} as any;
    const widthsPct: Record<ServerId, number> = {} as any;

    for (const id of ids) {
      const centerStr = (servers as any)[id]?.left as string | undefined;
      if (!centerStr) continue;
      const c = parseFloat(centerStr);
      centers[id] = c;
      const pill = pillRefs.current[id];
      const wp = pill ? ((pill.offsetWidth || 0) / w) * 100 : 0;
      widthsPct[id] = wp;
      const leftEdge = c - wp / 2;
      const rightEdge = c + wp / 2;
      if (leftEdge < minEdge) minEdge = leftEdge;
      if (rightEdge > maxEdge) maxEdge = rightEdge;
    }

    const span = Math.max(0.0001, maxEdge - minEdge);
    const target = Math.max(0, leftMaxPct - leftMinPct);
    const out: Partial<Record<ServerId, string>> = {};
    for (const id of ids) {
      const c = centers[id];
      if (typeof c !== 'number') continue;
      const mappedCenter = leftMinPct + ((c - minEdge) / span) * target;
      out[id] = `${mappedCenter}%`;
    }
    setEdgeNormalizedLefts(out);
  }, [servers]);

  useEffect(() => {
    recalcEdgeNormalized();
    const el = containerRef.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(() => recalcEdgeNormalized());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcEdgeNormalized]);

  const centerScale = useMemo(() => (layout === 'sm' ? 1.06 : layout === 'md' ? 1.1 : 1.12), [layout]);

  /** ======= i18n labels ======= */
  const serverT = useCallback(
    (key: string, def: string) => t(`landing.agentDemo.visual.servers.${key}` as any, { defaultValue: def } as any),
    [t],
  );

  const serverLabels = useMemo(
    () => ({
      mcpA: serverT('mcpA', 'MCP‑A'),
      mcpB: serverT('mcpB', 'MCP‑B'),
      mcpC: serverT('mcpC', 'MCP‑C'),
      mcpD: serverT('mcpD', 'MCP‑D'),
      vector: serverT('vector', 'VectorDB'),
      funcs: serverT('funcs', 'Functions'),
      billing: serverT('billing', 'Billing'),
      logsS: serverT('logs', 'Logs'),
      cacheS: serverT('cache', 'Cache'),
      llm: serverT('llm', 'LLM'),
      gateway: serverT('gateway', 'Gateway'),
      monitor: serverT('monitor', 'Monitor'),
      authS: serverT('auth', 'AuthSrv'),
      queueS: serverT('queue', 'Queue'),
    }) as const,
    [serverT],
  );

  const serversLocalized = useMemo(() => {
    const base = serverLayouts[layout];
    const entries = Object.entries(base).map(([k, v]) => {
      const id = k as ServerId;
      const label = (serverLabels as any)[id] ?? v.label;
      return [k, { ...v, label } as typeof v];
    });
    return Object.fromEntries(entries) as typeof base;
  }, [layout, serverLabels]);

  /** ======= visibility ======= */
  const [isVisible, setIsVisible] = useState(true);
  const ringGradId = useId();
  const ringGlowId = useId();

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver((entries) => setIsVisible(!!entries[0]?.isIntersecting), {
      threshold: 0.1,
      rootMargin: '50px',
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  /** ======= parallax ======= */
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 32, mass: 0.6 });
  const amp = useMemo(() => (layout === 'sm' ? 0.55 : layout === 'md' ? 0.75 : 0.9), [layout]);
  const yFarPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, 5 * amp]);
  const yMidPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, -3.5 * amp]);
  const yNearPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, 3 * amp]);
  const xFarPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, -2.5 * amp]);
  const xMidPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, 1.8 * amp]);
  const xNearPills = useTransform(smooth, [0, 1], motionOff ? [0, 0] : [0, -1.2 * amp]);

  /** ======= deterministic RNG ======= */
  const rng = useMemo(() => {
    if (typeof demoSeed !== 'number') return Math.random;
    let t0 = (demoSeed >>> 0) + 0x6d2b79f5;
    return () => {
      t0 |= 0;
      t0 = (t0 + 0x6d2b79f5) | 0;
      let r = Math.imul(t0 ^ (t0 >>> 15), 1 | t0);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }, [demoSeed]);

  /** ======= tokens ======= */
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pulse, setPulse] = useState(false);
  const [burst, setBurst] = useState(false);
  const [absorbColor, setAbsorbColor] = useState<string>('rgba(255,255,255,0.9)');
  const caughtIdsRef = useRef<Set<string>>(new Set());
  // Track a soft TTL per token to guarantee cleanup if animation callbacks are skipped
  const tokenTTLRef = useRef<Map<string, number>>(new Map());
  const [liveStatus, setLiveStatus] = useState('');
  const idCounter = useRef(0);
  const nextId = useCallback(() => `t_${Date.now().toString(36)}_${(idCounter.current++).toString(36)}`,[ ]);

  const maxVisible = useMemo(() => {
    if (typeof maxTokens === 'number' && maxTokens > 0) return maxTokens;
    // Dichte-Defaults: low=3, medium=6, high=9
    return density === 'low' ? 3 : density === 'high' ? 9 : 6;
  }, [density, maxTokens]);

  useEffect(() => {
    if (tokens.length === 0) caughtIdsRef.current.clear();
  }, [tokens.length]);

  // Periodic pruning of expired tokens (safety net in case animation callbacks don't fire)
  useEffect(() => {
    if (!isActive) return;
    const iv = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      setTokens((prev) => {
        const next = prev.filter((t) => {
          const exp = tokenTTLRef.current.get(t.id);
          const ok = exp == null || exp > now;
          if (!ok) {
            changed = true;
            tokenTTLRef.current.delete(t.id);
          }
          return ok;
        });
        return next;
      });
      if (changed) {
        // also clear caught set for fully drained cases
        if (tokenTTLRef.current.size === 0) caughtIdsRef.current.clear();
      }
    }, 1000);
    return () => window.clearInterval(iv);
  }, [isActive]);

  const toolKeys = useMemo(() => (
    ['api','db','kb','auth','queue','cache','search','mail','payment','pdf','code','test','storage','secrets'] as ToolId[]
  ), []);
  const serverKeys = useMemo(() => Object.keys(servers) as ServerId[], [servers]);

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    let timeoutId: number | null = null;

    // Dynamic spawn factor: accounts for reduced motion and smoothed FPS (via ref)
    const currentFps = fpsRef.current;
    const spawnFactor = motionOff ? 1.6 : (currentFps >= 55 ? 1 : currentFps >= 40 ? 1.3 : 1.8);

    // Auto-Defaults je nach Dichte, nur wenn keine benutzerdefinierten Spawn-Props gesetzt sind
    const hasCustomSpawn = !(spawnMinMs === 1200 && spawnMaxMs === 2000);
    const [rawMin, rawMax] = hasCustomSpawn
      ? [spawnMinMs, spawnMaxMs]
      : (
          density === 'low'
            ? [700, 1100] // schneller, aber moderat
            : density === 'high'
            ? [240, 520]  // sehr schnell und dicht
            : [360, 700]  // medium
        );

    const minBase = Math.max(180, Math.min(rawMin, rawMax)) * spawnFactor;
    const maxBase = Math.max(minBase + 1, Math.max(rawMin, rawMax) * spawnFactor);

    const loop = () => {
      if (cancelled) return;
      const min = Math.round(minBase);
      const max = Math.round(maxBase);
      const delay = min + rng() * (max - min);
      const tick = () => {
        const visualAllowed = !visualOnly || visualOnlyLoop;
        const visAllowed = spawnWhenHidden || (!document.hidden && isVisible);
        if (!cancelled && visualAllowed && visAllowed) {
          setTokens((prev) => {
            if (prev.length >= maxVisible) return prev;
            const tool = toolKeys[Math.floor(rng() * toolKeys.length)];
            const from = serverKeys[Math.floor(rng() * serverKeys.length)];
            const id = nextId();
            // compute path control points in percent space for stability
            const sLeftStr = (edgeNormalizedLefts as any)[from] ?? (servers as any)[from]?.left;
            const sTopStr = (servers as any)[from]?.top;
            const sLeftPct = typeof sLeftStr === 'string' ? parseFloat(sLeftStr) : 50;
            const sTopPct = typeof sTopStr === 'string' ? parseFloat(sTopStr) : 50;
            const pathPct = computeCurvedPathPct(sLeftPct, sTopPct, rng);
            // stable depth per token
            const rDepth = rand01FromId(id, 1);
            // fps-adaptive duration/delay (seconds)
            const currentFps2 = fpsRef.current;
            const baseDur = motionOff ? 1.1 : (currentFps2 >= 55 ? 3.2 : currentFps2 >= 40 ? 3.8 : 4.6);
            const duration = baseDur + rng() * 0.6;
            const tDelay = rng() * 0.05;
            // TTL aligned to this token's flight time (+ buffer)
            tokenTTLRef.current.set(id, Date.now() + Math.ceil((tDelay + duration) * 1000) + 800);
            // try to compute precise spawn position based on current pill DOM position (accounts for parallax/transforms)
            let sX: number | undefined;
            let sY: number | undefined;
            try {
              const cont = containerRef.current;
              const pill = pillRefs.current[from] as HTMLDivElement | null | undefined;
              if (cont && pill) {
                const cb = cont.getBoundingClientRect();
                const pb = pill.getBoundingClientRect();
                sX = pb.left + pb.width / 2 - cb.left;
                sY = pb.top + pb.height / 2 - cb.top;
              }
            } catch {}
            return [...prev, { id, tool, from, sX, sY, pathPct, rDepth, duration, delay: tDelay }];
          });
        }
        if (!cancelled) loop();
      };
      timeoutId = window.setTimeout(tick, delay);
    };

    loop();
    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [isActive, visualOnly, visualOnlyLoop, isVisible, maxVisible, rng, spawnMinMs, spawnMaxMs, servers, edgeNormalizedLefts, spawnWhenHidden, toolKeys, serverKeys, nextId, motionOff, density]);

  const handleCatch = useCallback((id: string, tool?: ToolId) => {
    if (caughtIdsRef.current.has(id)) return;
    caughtIdsRef.current.add(id);
    tokenTTLRef.current.delete(id);
    setTokens((prev) => prev.filter((t) => t.id !== id));
    if (!motionOff) {
      setPulse(true);
      setBurst(true);
      if (tool) setAbsorbColor(toolsPalette[tool]?.glow ?? 'rgba(255,255,255,0.9)');
      window.setTimeout(() => setPulse(false), 300);
      window.setTimeout(() => setBurst(false), 480);
    } else {
      setLiveStatus(t('landing.agentDemo.visual.live_catch'));
      window.setTimeout(() => setLiveStatus(''), 250);
    }
  }, [motionOff, t]);

  const rand01FromId = useCallback((id: string, salt = 0) => {
    let h = 2166136261 ^ salt;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 13;
    h = Math.imul(h, 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }, []);

  /** ======= step / logs / done ======= */
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  /** ======= ASM ======= */
  const asmStates = useMemo(() => {
    const tAsm = (key: string, def: string) => t(`agentDemo.asm.${key}` as any, { defaultValue: t(`landing.agentDemo.asm.${key}` as any, { defaultValue: def } as any) as any } as any);
    const base = [tAsm('perception','perception'), tAsm('plan','plan'), tAsm('act','act'), tAsm('review','review'), tAsm('learn','learn')] as const;
    if (!asmExtended) return base;
    return [tAsm('perception','perception'), tAsm('observe','observe'), tAsm('analyze','analyze'), tAsm('plan','plan'), tAsm('act','act'), tAsm('execute','execute'), tAsm('review','review'), tAsm('validate','validate'), tAsm('optimize','optimize'), tAsm('learn','learn')] as const;
  }, [t, asmExtended]);
  const [asmStep, setAsmStep] = useState(0);

  const variant = useMemo(() => (visualOnly ? 'base' : getVariantForKey('agentdemo', 'base')), [visualOnly]);
  const dragEnabled = !motionOff && variant === 'base';

  const pdfControls = useAnimation();
  const apiControls = useAnimation();
  const kbControls = useAnimation();
  const dbControls = useAnimation();

  const agentRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const keyPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;
    keyPosRef.current = { x: 0, y: 0 };
    if (!motionOff) pdfControls.start({ x: 0, y: 0, opacity: 1 });
  }, [isActive, motionOff, pdfControls]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!isActive || motionOff || variant !== 'base') return;
    const move = 16;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const p = keyPosRef.current;
      if (e.key === 'ArrowUp') p.y -= move;
      if (e.key === 'ArrowDown') p.y += move;
      if (e.key === 'ArrowLeft') p.x -= move;
      if (e.key === 'ArrowRight') p.x += move;
      pdfControls.start({ x: p.x, y: p.y, transition: { duration: 0.15 } });
      track({ name: 'agentdemo_key_move', props: { variant } });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trySnap();
      track({ name: 'agentdemo_key_snap_try', props: { variant } });
    }
  };

  const L = useMemo(() => ({
    steps: {
      s1: t('landing.agentDemo.steps.s1'),
      s2: t('landing.agentDemo.steps.s2'),
      s3: t('landing.agentDemo.steps.s3'),
      s4: t('landing.agentDemo.steps.s4'),
      s5: t('landing.agentDemo.steps.s5'),
      ok: t('landing.agentDemo.steps.ok'),
    },
  }), [t]);

  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!isActive) return;
    if (visualOnly) return;

    const { s1, s2, s3, s4, s5, ok } = L.steps;
    setStep(0);
    setLogs([]);
    setDone(false);
    track({ name: 'agentdemo_start', props: { variant } });

    const schedule = [
      { t: 0, s: 1, l: `$ [1/5] ${s1}` },
      { t: 1200, s: 2, l: `$ [2/5] ${s2}` },
      { t: 2800, s: 3, l: `$ [3/5] ${s3}` },
      { t: 4800, s: 4, l: `$ [4/5] ${s4}` },
      { t: 6800, s: 5, l: `$ [5/5] ${s5}` },
      { t: 8800, s: 5, l: `$ ${ok}` },
    ];

    const timers = schedule.map(({ t, s, l }) => window.setTimeout(() => {
      setStep(s);
      setLogs((prev) => [...prev, l]);
      if (s === 5 && /bestanden|passed|ok/i.test(l)) {
        setDone(true);
        track({ name: 'agentdemo_done', props: { variant } });
        onCompleteRef.current?.();
      }
    }, t));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [isActive, visualOnly, variant, L.steps]);

  // removed legacy reviewBlink effect (no visual usage)

  useEffect(() => {
    if (!asmEnabled) return;
    if (visualOnly) {
      let stop = false; let i = 0;
      const tick = () => { if (stop) return; setAsmStep(i % asmStates.length); i += 1; window.setTimeout(tick, motionOff ? 1200 : 1600); };
      tick();
      return () => { stop = true; };
    }
    setAsmStep(Math.max(0, Math.min(5, step)));
  }, [asmEnabled, visualOnly, step, asmStates.length, motionOff]);

  /** ======= visualOnly sequence controls ======= */
  useEffect(() => {
    if (!isActive || motionOff || variant === 'alt' || !visualOnly || !isVisible) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const resetStart = async () => {
      await Promise.all([
        pdfControls.start({ x: -160, y: -120, opacity: 0, scale: 0.95, rotate: 0, transition: { duration: 0 } }),
        apiControls.start({ x: 160, y: -120, opacity: 0, scale: 0.95, rotate: 0, transition: { duration: 0 } }),
        kbControls.start({ x: -180, y: 120, opacity: 0, scale: 0.95, rotate: 0, transition: { duration: 0 } }),
        dbControls.start({ x: 180, y: 140, opacity: 0, scale: 0.95, rotate: 0, transition: { duration: 0 } }),
      ]);
    };

    const runOnce = async () => {
      const easing: any = EASING;

      await pdfControls.start({
        opacity: 1,
        x: [-160, -60, -10, -2],
        y: [-120, -58, -14, -2],
        rotate: [0, 8, 3, 0],
        scale: [0.94, 1.02, 1.03, 0.9],
        transition: { duration: 1.26, ease: easing },
      });
      setBurst(true);
      window.setTimeout(() => setBurst(false), 600);
      track({ name: 'agentdemo_snap', props: { token: 'pdf', variant: 'base' } });

      await Promise.all([
        apiControls.start({
          opacity: 1, x: [160, 64, 12, -2], y: [-120, -64, -10, -2], rotate: [0, -8, -3, 0], scale: [0.94, 1.02, 1.03, 0.9],
          transition: { duration: 1.2, ease: easing, delay: 0.06 },
        }).then(() => track({ name: 'agentdemo_snap', props: { token: 'api', variant: 'base' } })),
        kbControls.start({
          opacity: 1, x: [-180, -82, -16, -2], y: [120, 54, 8, -2], rotate: [0, 6, 2, 0], scale: [0.94, 1.02, 1.03, 0.9],
          transition: { duration: 1.24, ease: easing, delay: 0.12 },
        }).then(() => track({ name: 'agentdemo_snap', props: { token: 'kb', variant: 'base' } })),
      ]);

      await dbControls.start({
        opacity: 1, x: [180, 84, 10, -2], y: [140, 62, 6, -2], rotate: [0, -7, -2, 0], scale: [0.94, 1.02, 1.03, 0.9],
        transition: { duration: 1.16, ease: easing, delay: 0.18 },
      });
      track({ name: 'agentdemo_snap', props: { token: 'db', variant: 'base' } });

      if (visualOnlyLoop) {
        await Promise.all([
          pdfControls.start({ opacity: 0, transition: { duration: 0.28 } }),
          apiControls.start({ opacity: 0, transition: { duration: 0.28 } }),
          kbControls.start({ opacity: 0, transition: { duration: 0.28 } }),
          dbControls.start({ opacity: 0, transition: { duration: 0.28 } }),
        ]);
      }
      setStep(3);
    };

    (async () => {
      await resetStart();
      await runOnce();
      if (!visualOnlyLoop) return;
      while (!cancelled) {
        await sleep(2400);
        await resetStart();
        await runOnce();
      }
    })();

    return () => { cancelled = true; };
  }, [isActive, motionOff, visualOnly, visualOnlyLoop, isVisible, variant, pdfControls, apiControls, kbControls, dbControls]);

  const trySnap = useCallback(() => {
    if (!agentRef.current || !pdfRef.current) return;
    try {
      const agentBox = agentRef.current.getBoundingClientRect();
      const pdfBox = pdfRef.current.getBoundingClientRect();
      const ax = agentBox.left + agentBox.width / 2;
      const ay = agentBox.top + agentBox.height / 2;
      const px = pdfBox.left + pdfBox.width / 2;
      const py = pdfBox.top + pdfBox.height / 2;
      const dist = Math.hypot(ax - px, ay - py);
      if (dist < Math.max(agentBox.width, agentBox.height) * 0.7) {
        pdfControls.start({ x: -2, y: -2, scale: 0.86, opacity: 0.0, transition: { duration: 0.32, ease: 'easeOut' } });
        setBurst(true);
        track({ name: 'agentdemo_snap', props: { variant } });
        window.setTimeout(() => setBurst(false), 700);
      }
    } catch { /* noop */ }
  }, [variant, pdfControls]);

  // removed onTokenDragEnd (no draggable elements)

  const progress = Math.max(0, Math.min(1, (step - 1) / 4));
  const progressNow = Math.round(progress * 100);
  const progressText = t('landing.agentDemo.labels.progressText', { current: Math.max(0, Math.min(5, step)), total: 5 } as any);

  /** ========================= render ========================= */
  return (
    <div
      ref={containerRef}
      className={`relative h-full min-h-[360px] w-full overflow-visible rounded-2xl bg-transparent md:min-h-[420px] lg:min-h-[480px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))] focus-visible:ring-offset-0 ${className ?? ''}`}
      role="region"
      aria-label={t('landing.agentDemo.visual.title')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ isolation: 'isolate' }}
      data-section="agent-visual-demo"
    >
      <div className="absolute inset-0 z-10">
        {/* Agent Node (center) */}
        <div ref={agentRef} className="absolute left-1/2 top-1/2 z-[40] -translate-x-1/2 -translate-y-1/2 select-none" aria-label={t('landing.agentDemo.visual.agent_label')}>
          <div className="relative" style={{ transform: `scale(${centerScale})` }}>
            <motion.div
              className="relative z-20 flex size-24 items-center justify-center md:size-28"
              aria-hidden
              animate={!motionOff && isVisible && centerRotate ? { rotate: [0, 360] } : undefined}
              transition={!motionOff && isVisible && centerRotate ? { duration: 28, ease: 'linear', repeat: Infinity } : undefined}
              style={{ willChange: 'transform' }}
            >
              {brandMode === 'lucide' ? (
                <Bot className="h-10 w-10 text-sky-200 md:h-11 md:w-11" />
              ) : (
                <BrandAgent className="h-10 w-10 text-sky-200 md:h-11 md:w-11" />
              )}
            </motion.div>

            {/* Absorb FX */}
            <AnimatePresence>
              {!motionOff && (pulse || burst) && (
                <motion.div key="absorb-fx" className="pointer-events-none absolute inset-0 z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden>
                  {/* primary inner ring */}
                  <motion.div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ boxShadow: `0 0 0 2px ${absorbColor}66 inset` }} initial={{ scale: 0.7, opacity: 0.35 }} animate={{ scale: 1.25, opacity: 0 }} transition={{ duration: 0.45, ease: EASING as any }} />
                  {/* soft radial glow */}
                  <motion.div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${absorbColor}66, transparent 60%)` }} initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.38, ease: EASING as any }} />
                  {/* secondary outer ring wave */}
                  <motion.div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ boxShadow: `0 0 0 2px ${absorbColor}44 inset` }} initial={{ scale: 0.8, opacity: 0.25 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.6, ease: EASING as any }} />
                  {/* center flash */}
                  <motion.div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen" style={{ backgroundColor: absorbColor }} initial={{ scale: 0.8, opacity: 0.35 }} animate={{ scale: 1.25, opacity: 0 }} transition={{ duration: 0.28, ease: EASING as any }} />
                  {Array.from({ length: particleCount }).map((_, p) => (
                    <motion.span
                      key={`p-${p}`}
                      className="absolute h-1 w-1 rounded-full"
                      style={{ left: '50%', top: '50%', backgroundColor: absorbColor }}
                      initial={{ x: 0, y: 0, opacity: 0.9 }}
                      animate={{
                        x: Math.cos((p / Math.max(1, particleCount)) * Math.PI * 2) * 22,
                        y: Math.sin((p / Math.max(1, particleCount)) * Math.PI * 2) * 22,
                        opacity: 0,
                        scale: 0.9,
                      }}
                      transition={{ duration: 0.46, ease: EASING as any }}
                      aria-hidden
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress ring */}
            <div className="absolute inset-0 -m-2 flex items-center justify-center" role="progressbar" aria-label={t('landing.agentDemo.visual.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressNow} aria-valuetext={progressText}>
              <motion.svg className="h-24 w-24 -rotate-90 md:h-28 md:w-28" viewBox="0 0 100 100" aria-hidden style={{ willChange: 'transform' }} animate={!motionOff && isVisible ? { rotate: [0, 180, 360] } : undefined} transition={!motionOff && isVisible ? { duration: 18, ease: EASING as any, repeat: Infinity } : undefined}>
                <defs>
                  <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={`rgb(var(--rgb-brand-purple))`} stopOpacity={0.9} />
                    <stop offset="100%" stopColor="rgba(56,189,248,1)" stopOpacity={0.9} />
                  </linearGradient>
                  <filter id={ringGlowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <motion.circle
                  cx="50" cy="50" r="42" className="fill-none" stroke={`url(#${ringGradId})`} strokeWidth={6} strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 - 264 * progress} filter={`url(#${ringGlowId})`}
                  animate={motionOff ? undefined : { strokeDashoffset: 264 - 264 * progress, strokeWidth: burst ? 6.6 : 6 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                {!motionOff && (
                  <motion.circle cx="50" cy="50" r="42" className="fill-none" stroke={`url(#${ringGradId})`} strokeWidth={8} strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 - 264 * progress} filter={`url(#${ringGlowId})`} initial={{ opacity: 0 }} animate={{ opacity: burst ? 0.45 : 0 }} transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }} />
                )}
              </motion.svg>
              <span className="sr-only">{progressText}</span>
            </div>

            {/* ASM ring */}
            {asmEnabled && (
              <div className="absolute inset-0 -m-2" aria-hidden>
                {showArrows && (
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                    {Array.from({ length: asmStates.length }).map((_, idx) => {
                      const a1 = (idx / asmStates.length) * Math.PI * 2 - Math.PI / 2;
                      const a2 = (((idx + 1) % asmStates.length) / asmStates.length) * Math.PI * 2 - Math.PI / 2;
                      const r = 38;
                      const x1 = 50 + Math.cos(a1) * r;
                      const y1 = 50 + Math.sin(a1) * r;
                      const x2 = 50 + Math.cos(a2) * r;
                      const y2 = 50 + Math.sin(a2) * r;
                      const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
                      const active = idx === asmStep;
                      return (
                        <motion.path key={`arc-${idx}`} d={d} fill="none" stroke={active ? 'rgba(var(--accent-ring),0.55)' : 'rgba(255,255,255,0.12)'} strokeWidth={active ? 1.6 : 1} strokeLinecap="round" initial={false} animate={!motionOff && active ? { pathLength: [0.2, 1] } : { pathLength: 1 }} transition={{ duration: 0.9, ease: EASING as any }} />
                      );
                    })}
                  </svg>
                )}

                {/* State badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2" style={{ transform: `translate(-50%, calc(-50% + ${R.ring + 32}px))` }}>
                  <AnimatePresence mode="wait">
                    {(() => {
                      const idx = asmStep;
                      const isReview = idx === 3;
                      return (
                        <motion.div key={`asm-active-${idx}`} initial={{ opacity: 0, y: 6, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.985 }} transition={{ duration: T.badge, ease: 'easeOut' }} aria-live="polite">
                          <div className="relative">
                            <Badge size="xs" variant={isReview ? 'danger' : 'info'} tone="soft" className="whitespace-nowrap py-1" aria-current="true">
                              {asmStates[idx]}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Server pills */}
        {Object.entries(serversLocalized).map(([id, pos], i) => (
          <motion.div
            key={id}
            className="absolute z-20 select-none will-change-transform"
            style={{ left: edgeNormalizedLefts[id as ServerId] ?? pos.left, top: pos.top, y: i % 3 === 0 ? yFarPills : i % 3 === 1 ? yMidPills : yNearPills, x: i % 3 === 0 ? xFarPills : i % 3 === 1 ? xMidPills : xNearPills }}
            role="note"
            title={(pos as any).label}
            initial={false}
          >
            <div className="-translate-x-1/2 -translate-y-1/2" ref={(node) => { pillRefs.current[id as ServerId] = node; }}>
              <Badge size="xs" variant="neutral" tone="soft" leadingIcon={pos.Icon ? (<pos.Icon className="h-3.5 w-3.5 text-[rgb(var(--accent-ring))]/90" aria-hidden />) : undefined} className="gap-1.5 transition-colors ring-1 ring-white/10 hover:bg-white/5 hover:ring-white/20">
                {(pos as any).label}
              </Badge>
            </div>
          </motion.div>
        ))}

        {/* Controlled tokens (visualOnly) */}
        {visualOnly && (
          [
            { key: 'pdf', refEl: pdfRef, controls: pdfControls, initial: { x: -160, y: -120 }, Icon: toolsPalette.pdf.Icon },
            { key: 'api', refEl: undefined, controls: apiControls, initial: { x: 160, y: -120 }, Icon: toolsPalette.api.Icon },
            { key: 'kb', refEl: undefined, controls: kbControls, initial: { x: -180, y: 120 }, Icon: toolsPalette.kb.Icon },
            { key: 'db', refEl: undefined, controls: dbControls, initial: { x: 180, y: 140 }, Icon: toolsPalette.db.Icon },
          ].map(({ key, refEl, controls, initial, Icon }) => (
            <motion.div key={`ctrl-${key}`} ref={refEl as any} className="absolute left-1/2 top-1/2 z-30 will-change-transform" initial={{ opacity: 0, x: initial.x, y: initial.y, scale: 0.95, rotate: 0 }} animate={controls} aria-hidden>
              <div className="-translate-x-1/2 -translate-y-1/2">
                <Icon className="h-6 w-6 text-white" aria-hidden />
              </div>
            </motion.div>
          ))
        )}

        {/* Free-fly tokens (transform-based path for perf) */}
        <AnimatePresence initial={false}>
          {tokens.map((token) => {
            const S = servers[token.from];
            if (!S) return null;
            const TP = toolsPalette[token.tool];

            const sLeftStr = edgeNormalizedLefts[token.from] ?? S.left;
            const sL = parseFloat(sLeftStr);
            const sT = parseFloat(S.top);

            // container size is required for px path
            const { w, h } = containerSize;
            if (!w || !h) return null;

            const x0 = token.sX ?? (sL / 100) * w;
            const y0 = token.sY ?? (sT / 100) * h;

            const pathPct = token.pathPct ?? computeCurvedPathPct(sL, sT, rng);

            // slight deterministic noise
            const n1x = (rand01FromId(token.id, 2) - 0.5) * 16;
            const n1y = (rand01FromId(token.id, 3) - 0.5) * 10;
            const n2x = (rand01FromId(token.id, 4) - 0.5) * 16;
            const n2y = (rand01FromId(token.id, 5) - 0.5) * 10;

            const x1 = (pathPct.midLeft1 / 100) * w + n1x;
            const y1 = (pathPct.midTop1 / 100) * h + n1y;
            const x2 = (pathPct.midLeft2 / 100) * w + n2x;
            const y2 = (pathPct.midTop2 / 100) * h + n2y;
            const xEnd = 0.5 * w;
            const yEnd = 0.5 * h;

            // Shorter, FPS-adaptive flight duration with smaller random delay
            const currentFps2 = fpsRef.current;
            const baseDur = motionOff ? 1.1 : (currentFps2 >= 55 ? 3.2 : currentFps2 >= 40 ? 3.8 : 4.6);
            const duration = baseDur + rng() * 0.6;
            const delay = rng() * 0.05;

            const rDepth = token.rDepth ?? rand01FromId(token.id, 1);
            const depthScale = 0.92 + rDepth * 0.16; // 0.92..1.08
            const blurPx = (1 - rDepth) * 1.2;
            const zIdx = 30 + Math.round(rDepth * 8);

            return (
              <motion.div
                key={token.id}
                className="pointer-events-none absolute will-change-transform"
                style={{ left: 0, top: 0, zIndex: zIdx }}
                initial={{ opacity: 0, scale: 0.86 * depthScale, rotate: -4, x: x0, y: y0 }}
                animate={motionOff ? {
                  opacity: [0, 1, 0],
                  x: [x0, xEnd],
                  y: [y0, yEnd],
                  transition: { duration: 1.1, ease: EASING as any, times: [0, 1] },
                } : {
                  opacity: [0, 1, 1, 0],
                  x: [x0, x1, x2, xEnd],
                  y: [y0, y1, y2, yEnd],
                  scale: [0.9 * depthScale, 1.05 * depthScale, 0.99 * depthScale, 0.78 * depthScale],
                  rotate: [-3, -0.6, 0.25, 0],
                  transition: { duration: token.duration ?? duration, delay: token.delay ?? delay, ease: [EASING as any, EASING as any, [0.16, 1, 0.3, 1] as any] as any, times: [0, 0.58, 0.88, 1] as any },
                }}
                onAnimationComplete={() => handleCatch(token.id, token.tool)}
                aria-hidden
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2 will-change-transform">
                  <span
                    className="inline-block"
                    style={{
                      filter:
                        fps >= 40
                          ? `blur(${blurPx.toFixed(2)}px) drop-shadow(0 0 6px ${TP.glow})`
                          : `blur(${(blurPx * 0.6).toFixed(2)}px)`,
                    }}
                  >
                    <TP.Icon className="relative h-6 w-6 text-white" aria-hidden />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {motionOff && (
          <div className="sr-only" role="status" aria-live="polite">{liveStatus}</div>
        )}
      </div>
    </div>
  );
};

export default AgentVisualDemo;
