import { FC, memo, useMemo } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import SectionHeading from '../SectionHeading';
import { Shield, CheckCircle2 } from 'lucide-react';
import { track } from '@/lib/analytics/track';
import i18n from '~/locales/i18n';

const SecuritySection: FC = () => {
  const t = useT();
  const reduceMotion = useReducedMotion() ?? false;

  // Emblem ohne Scroll-/Parallaxeffekte, statischer Emerald-Glow

  // Features werden als kompakte Checkliste in der großen Karte dargestellt

  const lngOverride = useMemo(() => {
    if (typeof window === 'undefined') return undefined as undefined | 'de' | 'en';
    const m = (window.location.pathname || '/').match(/^\/(de|en)(?=\/|$)/);
    return (m?.[1] as 'de' | 'en' | undefined) || undefined;
  }, []);

  const sectionTitle = t('landing:security.title', lngOverride ? { lng: lngOverride } : undefined);

  // Runtime-sichere i18n-Auflösung (verhindert sichtbare Platzhalter wie "security.badge")
  const resolveI18n = (key: string) => {
    const primary = t(key, lngOverride ? { lng: lngOverride } : undefined);
    // Wenn ein Punkt enthalten ist, ist es sehr wahrscheinlich ein nicht aufgelöster Key
    if (primary.includes('.')) {
      const fallbackLng = lngOverride === 'de' ? 'en' : 'de';
      const secondary = t(key, { lng: fallbackLng });
      if (!secondary.includes('.')) return secondary;
      // Letzter Fallback für kritische UI-Strings
      switch (key) {
        case 'landing:security.badge':
          return lngOverride === 'de' ? 'Sicherheit & Kontrolle' : 'Security & Control';
        case 'landing:security.title':
          return lngOverride === 'de' ? 'Deine Daten. Deine Kontrolle.' : 'Your data. Your control.';
        case 'landing:security.subtitle':
          return lngOverride === 'de' ? 'Sicherheit & Kontrolle' : 'Security & Control';
        case 'landing:security.description':
          return lngOverride === 'de'
            ? 'Privacy by Design, Self‑Hosting, RBAC, Audit‑Logs – standardmäßig integriert.'
            : 'Privacy by design, self‑hosting, RBAC, audit logs – built in.';
        case 'landing:security.icon_label':
          return lngOverride === 'de' ? 'Sicherheits‑Schild' : 'Security shield';
        default:
          return primary;
      }
    }
    return primary;
  };

  return (
    <LandingSection
      className="relative overflow-hidden bg-transparent"
      bleed={false}
      ariaLabel={sectionTitle}
      aria-labelledby="security-heading"
      aria-describedby="security-desc"
      dataSection="security"
      data-ai-section="security"
      data-ai-title={sectionTitle}
      containerClassName="relative z-10"
      divider="none"
      accentTopGlow
    >
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 480px' }}
        className={`text-center`}
      >
        <HeadingBlock align="center">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              titleId="security-heading"
              title={resolveI18n('landing:security.title')}
              subtitle={resolveI18n('landing:security.subtitle')}
              align="center"
              badge={resolveI18n('landing:security.badge')}
              badgeClassName="whitespace-nowrap py-1 sm:py-1"
              badgeVariant="security"
              badgeTone="soft"
              badgeLeadingIcon={<Shield className="h-3.5 w-3.5" aria-hidden />}
            />
            <p id="security-desc" className="mt-6 text-xl text-gray-300">
              {resolveI18n('landing:security.description')}
            </p>
          </div>
        </HeadingBlock>
      </motion.div>

      {process.env.NODE_ENV === 'development' && (
        <span style={{ display: 'none' }} data-testid="security-i18n-debug">
          {(() => {
            try {
              const current = (i18n?.language || '').toString();
              const deBadge = t('landing:security.badge', { lng: 'de' });
              const enBadge = t('landing:security.badge', { lng: 'en' });
              // eslint-disable-next-line no-console
              console.info('[Security][i18n-debug]', { current, lngOverride, deBadge, enBadge });
            } catch {}
            return null as any;
          })()}
        </span>
      )}

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 720px' }}
        className="relative mx-auto max-w-6xl xl:max-w-7xl"
      >
        <div
          className="relative rounded-3xl border border-emerald-400/20 bg-transparent p-5 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-b from-emerald-400/10 to-transparent hover:border-emerald-400/30 hover:shadow-[0_10px_26px_rgba(16,185,129,0.18)] transition-colors"
        >
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Linke Spalte: Shield + Stats */}
            <div className="lg:col-span-5 xl:col-span-4">
              {/* Security Shield Illustration */}
              <div className="mb-6 flex justify-center sm:mb-8 lg:justify-center">
                <div
                  className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32"
                  aria-hidden
                >
                  {/* Außenring mit edlem Emerald-Glow */}
                  <div className="absolute inset-0 rounded-full ring-1 ring-emerald-400/30 shadow-[0_0_32px_rgba(16,185,129,0.35)]" />
                  {/* Statistisches Emerald-Rim-Light */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.10) 45%, rgba(0,0,0,0) 70%)',
                    }}
                  />
                  {/* Innere dunkle Fläche mit feinem Ring */}
                  <div className="absolute inset-2 flex items-center justify-center rounded-full bg-gray-900/92 ring-1 ring-emerald-400/25">
                    <span className="sr-only">{resolveI18n('landing:security.icon_label')}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-emerald-200 drop-shadow-[0_0_10px_rgba(16,185,129,0.55)] sm:h-14 sm:w-14 md:h-16 md:w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Security Stats */}
              <div className="-mx-1 w-full pb-2">
                <div className="grid grid-cols-2 gap-2 px-1 md:gap-3">
                  <div
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-center transition-colors hover:border-emerald-400/30 hover:shadow-[0_6px_18px_rgba(16,185,129,0.16)] sm:p-3"
                    aria-label={`${t('landing.security.stats.open_source')}: 100%`}
                    role="button"
                    tabIndex={0}
                    data-ai-element="security_stat"
                    data-ai-label="Open Source"
                    onClick={() => track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'open_source' } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'open_source' } });
                      }
                    }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-lg md:text-xl">
                      100%
                    </div>
                    <div className="xs:text-[11px] whitespace-nowrap text-[10px] leading-snug tracking-tight text-gray-400 sm:text-xs md:text-xs">
                      {t('landing.security.stats.open_source')}
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-center transition-colors hover:border-emerald-400/30 hover:shadow-[0_6px_18px_rgba(16,185,129,0.16)] sm:p-3"
                    aria-label={`${t('landing.security.stats.auth')}: OAuth2`}
                    title={t('landing.security.stats.auth_title')}
                    role="button"
                    tabIndex={0}
                    data-ai-element="security_stat"
                    data-ai-label="OAuth2"
                    onClick={() => track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'oauth2' } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'oauth2' } });
                      }
                    }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-lg md:text-xl">
                      OAuth2
                    </div>
                    <div className="xs:text-[11px] whitespace-nowrap text-[10px] leading-snug tracking-tight text-gray-200 sm:text-xs md:text-xs">
                      {t('landing.security.stats.auth')}
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-center transition-colors hover:border-emerald-400/30 hover:shadow-[0_6px_18px_rgba(16,185,129,0.16)] sm:p-3"
                    aria-label={`${t('landing.security.stats.two_factor')}: 2FA`}
                    title={t('landing.security.stats.two_factor_title')}
                    role="button"
                    tabIndex={0}
                    data-ai-element="security_stat"
                    data-ai-label="2FA"
                    onClick={() => track({ name: 'landing_security_stat_click', props: { section: 'security', stat: '2fa' } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        track({ name: 'landing_security_stat_click', props: { section: 'security', stat: '2fa' } });
                      }
                    }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-lg md:text-xl">
                      2FA
                    </div>
                    <div className="xs:text-[11px] whitespace-nowrap text-[10px] leading-snug tracking-tight text-gray-200 sm:text-xs md:text-xs">
                      {t('landing.security.stats.two_factor')}
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-center transition-colors hover:border-emerald-400/30 hover:shadow-[0_6px_18px_rgba(16,185,129,0.16)] sm:p-3"
                    aria-label={`${t('landing.security.stats.directory')}: LDAP`}
                    title={t('landing.security.stats.directory_title')}
                    role="button"
                    tabIndex={0}
                    data-ai-element="security_stat"
                    data-ai-label="LDAP"
                    onClick={() => track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'ldap' } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        track({ name: 'landing_security_stat_click', props: { section: 'security', stat: 'ldap' } });
                      }
                    }}
                  >
                    <div className="mb-0.5 whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-lg md:text-xl">
                      LDAP
                    </div>
                    <div className="xs:text-[11px] whitespace-nowrap text-[10px] leading-snug tracking-tight text-gray-200 sm:text-xs md:text-xs">
                      {t('landing.security.stats.directory')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalte: Checkliste + CTA */}
            <div className="mt-8 flex flex-col items-center pt-6 text-left md:mt-0 md:items-start md:pt-0 lg:col-span-7 xl:col-span-8">
              {/* Security Features Checklist (kompakt) */}
              <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={{ ...IN_VIEW_ONCE, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                  },
                }}
                className="grid grid-cols-1 justify-items-start gap-3 text-sm leading-relaxed sm:grid-cols-2 sm:gap-4 sm:text-[0.95rem] lg:gap-5 xl:grid-cols-3"
                role="list"
              >
                {/* Bereits vorhandene Punkte */}
                <motion.li
                  className="flex items-start gap-2 py-2 text-left leading-snug text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.data_privacy')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2 py-2 text-left leading-snug text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.role_based')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2 py-2 text-left leading-snug text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.audit')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2 py-2 text-left leading-snug text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.content_filter')}
                  </span>
                </motion.li>

                {/* Ehemalige Karten-Inhalte als Checkpoints */}
                <motion.li
                  className="flex items-start gap-2 py-2 text-left leading-snug text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none shrink-0 text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.selfhosting.title')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2.5 py-2 text-left text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.authentication.title')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2.5 py-2 text-left text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.user_management.title')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2.5 py-2 text-left text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.isolation.title')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2.5 py-2 text-left text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.compliance.title')}
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-start gap-2.5 py-2 text-left text-gray-200"
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  role="listitem"
                >
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" aria-hidden />
                  <span className="min-w-0 flex-1 break-words">
                    {t('landing.security.features.monitoring.title')}
                  </span>
                </motion.li>
              </motion.ul>

              {/* CTA: Mehr zu Sicherheitsmaßnahmen */}
              <div className="mt-6">
                <a
                  href="#dataprivacy"
                  className="text-sm font-medium text-gray-200 underline decoration-emerald-400/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:rounded-sm"
                  data-ai-element="cta_security"
                  data-ai-label={t('landing.security.learn_more')}
                  onClick={() =>
                    track({ name: 'landing_security_cta_click', props: { section: 'security', target: 'dataprivacy' } })
                  }
                >
                  {t('landing.security.learn_more')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </LandingSection>
  );
};

export default memo(SecuritySection);
