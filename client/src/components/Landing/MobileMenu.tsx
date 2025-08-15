import React from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { track } from '~/lib/analytics/track';
import { tString } from '@/locales/helpers';

export type NavItem = {
  to: string;
  key: string;
  label: string;
  match: boolean;
};

type MobileMenuProps = {
  open: boolean;
  items: NavItem[];
  baseDuration: number;
  prefersReduced: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  t: (key: string, opts?: any) => string;
  onClose: () => void;
  onPrefetch: (e: React.SyntheticEvent | Event) => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  items,
  baseDuration,
  prefersReduced,
  menuRef,
  t,
  onClose,
  onPrefetch,
}) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={false}
        animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: baseDuration }}
        className="fixed inset-0 z-30 bg-black/90 md:hidden"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Menu Panel */}
      <motion.nav
        id="mobile-menu"
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={{ open: { y: 0, opacity: 1 }, closed: { y: -12, opacity: 0 } }}
        transition={{ duration: baseDuration, ease: 'easeOut' }}
        className="fixed inset-x-0 top-14 z-50 md:hidden"
        aria-label={tString(t, 'landing:nav.primary')}
      >
        <div
          ref={menuRef}
          className="relative max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain rounded-b-xl border border-white/10 bg-slate-950/90 px-4 py-4 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-75 backdrop-contrast-125 supports-[backdrop-filter]:bg-slate-950/70 sm:px-6"
          onPointerEnter={onPrefetch}
          onMouseOver={onPrefetch}
          onFocusCapture={onPrefetch}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
          <h2 className="sr-only" id="mobile-menu-heading">{tString(t, 'landing:nav.primary')}</h2>
          <div className="flex flex-col gap-1" role="menu" aria-labelledby="mobile-menu-heading">
            {items.map((item) => (
              <motion.div
                key={`m-wrap-${item.key}`}
                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReduced ? 0 : -6 }}
                transition={{ duration: baseDuration, ease: 'easeOut' }}
              >
                <RouterLink
                  key={`m-${item.key}`}
                  to={item.to}
                  onClick={() => {
                    track({ name: 'nav_click', props: { key: item.key, to: item.to, viewport: 'mobile' } });
                    onClose();
                  }}
                  className={`flex items-center justify-between rounded-md px-3 py-3 text-base leading-tight tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${item.match ? 'bg-foreground/10 text-foreground' : 'text-foreground hover:bg-foreground/10'}`}
                  aria-current={item.match ? 'page' : undefined}
                  data-ai-element="nav_link"
                  data-ai-label={item.key}
                  role="menuitem"
                >
                  <span className="overflow-hidden text-ellipsis pr-3">{item.label}</span>
                  {item.match && (
                    <span aria-hidden className="ml-2 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-[var(--brand-grad-from)] to-[var(--brand-grad-to)] shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
                  )}
                </RouterLink>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 border-t border-border/60 pt-3">
            <RouterLink
              to="/app/c/new"
              className="btn-brand inline-flex w-full items-center justify-center px-3 py-2 text-base leading-tight tracking-tight"
              aria-label={tString(t, 'landing:nav.chatAria')}
              data-ai-element="cta_chat"
              data-ai-label={tString(t, 'landing:nav.chat')}
              onClick={() => {
                track({ name: 'cta_click', props: { key: 'chat', location: 'topnav_mobile' } });
                onClose();
              }}
            >
              {t('landing:nav.aiChat', { defaultValue: 'AI Chat' })}
            </RouterLink>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default MobileMenu;
