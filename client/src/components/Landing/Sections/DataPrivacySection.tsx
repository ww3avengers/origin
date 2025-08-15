import { FC, useEffect, useMemo, useRef } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import { ShieldCheck, Trash2, Lock, CloudOff, CheckCircle2 } from 'lucide-react';
import { Badge as UIBadge } from '@/components/ui/Badge';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';

// Hinweis: Ehemalige StatBadge entfernt – vereinheitlichte Badge-Optik über PromoBadge

const DataPrivacySection: FC = () => {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const baseDuration = reduceMotion ? 0 : 0.4;
  const sectionRef = useRef<HTMLElement>(null);
  const abVariant = getVariantForKey('landing', 'base');

  const items: { id: string; icon: React.ReactNode; title: string; description: string }[] = useMemo(
    () => [
      {
        id: 'session_only',
        icon: <Lock className="h-5 w-5" aria-hidden />,
        title: t('landing:dataprivacy.items.session_only.title'),
        description: t('landing:dataprivacy.items.session_only.description'),
      },
      {
        id: 'delete_forever',
        icon: <Trash2 className="h-5 w-5" aria-hidden />,
        title: t('landing:dataprivacy.items.delete_forever.title'),
        description: t('landing:dataprivacy.items.delete_forever.description'),
      },
      {
        id: 'no_training',
        icon: <CloudOff className="h-5 w-5" aria-hidden />,
        title: t('landing:dataprivacy.items.no_training.title'),
        description: t('landing:dataprivacy.items.no_training.description'),
      },
      {
        id: 'self_hosting',
        icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
        title: t('landing:dataprivacy.items.self_hosting.title'),
        description: t('landing:dataprivacy.items.self_hosting.description'),
      },
    ],
    [t],
  );

  // Einheitliche grüne Nuancen für alle Items (Emerald)
  // Hinweis: Bewusst zentral gehalten, falls spätere Feinabstimmung gewünscht ist.

  // Fire a single impression event when section becomes visible
  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;
    let fired = false;
    const el = sectionRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!fired && e.isIntersecting && e.intersectionRatio >= 0.5) {
          fired = true;
          track({
            name: 'dataprivacy_impression',
            props: { path: window.location.pathname, variant: abVariant },
          });
          io.unobserve(el);
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [abVariant]);

  return (
    <LandingSection
      id="data-privacy"
      ariaLabel={t('landing:dataprivacy.aria')}
      className="relative overflow-hidden"
      dataSection="data-privacy"
      data-ai-section="data-privacy"
      ref={sectionRef}
      divider="none"
      accentTopGlow
    >
      {/* Clean background (no gradient) */}

      {/* Set green accent ring for hero-like badge hues */}
      <div className="mx-auto max-w-4xl text-center" style={{ ['--accent-ring' as any]: '16 185 129' }}>
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={IN_VIEW_ONCE}
          transition={{ duration: baseDuration }}
          className="flex flex-col items-center justify-center gap-3"
        >
          <UIBadge
            size="sm"
            tone="soft"
            variant="dataprivacy"
            leadingIcon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
          >
            {t('landing:dataprivacy.badge')}
          </UIBadge>
          <motion.h2
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW_ONCE}
            transition={{ duration: baseDuration, delay: reduceMotion ? 0 : 0.05 }}
            className="text-balance text-2xl font-semibold tracking-tight text-white md:text-3xl"
            id="data-privacy-title"
          >
            {t('landing:dataprivacy.title')}
          </motion.h2>
        </motion.div>
      </div>

      <ul
        className="mx-auto mt-6 grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2"
        aria-labelledby="data-privacy-title"
      >
        {items.map((it, i) => (
          <motion.li
            key={it.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW_ONCE}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : i * 0.05 }}
            className="group flex h-full flex-col rounded-2xl border border-emerald-400/20 bg-transparent p-4 sm:p-5 transition will-change-transform bg-gradient-to-b from-emerald-400/10 to-transparent hover:border-emerald-400/30 hover:shadow-[0_10px_26px_rgba(16,185,129,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
            tabIndex={0}
            onMouseEnter={() =>
              track({
                name: 'dataprivacy_item_hover',
                props: { id: it.id, idx: i, variant: abVariant },
              })
            }
            onFocus={() =>
              track({
                name: 'dataprivacy_item_focus',
                props: { id: it.id, idx: i, variant: abVariant },
              })
            }
          >
            <div className="mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)] sm:mb-3 sm:h-9 sm:w-9">
              {it.icon}
            </div>
            <h3 className="text-base font-semibold text-white">{it.title}</h3>
            <p className="mt-1 text-sm text-gray-200">{it.description}</p>
          </motion.li>
        ))}
      </ul>

      {/* Kompakte Checkliste unter den Karten – gleiche Punkte, edles Emerald */}
      <div className="mx-auto mt-6 max-w-6xl px-0 sm:mt-8">
        <ul className="grid grid-cols-1 gap-3 text-sm leading-relaxed sm:grid-cols-2 sm:gap-4 lg:gap-5" role="list">
          {items.map((it) => (
            <li key={`dp-bp-${it.id}`} className="flex items-start gap-2 py-1.5 text-left leading-snug text-gray-200" role="listitem">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
              <span className="min-w-0 flex-1 break-words">{it.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-6 sm:mt-8 max-w-3xl text-center text-sm text-gray-400">
        {t('landing:dataprivacy.disclaimer')}
      </div>
    </LandingSection>
  );
};

export default DataPrivacySection;
