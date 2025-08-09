import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { motion, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';

// Hilfsfunktion für typsichere Übersetzungen mit Fallback
const safeT = (t: TFunction, key: string, fallback: string): string => {
  const translation = t(key as any);
  return typeof translation === 'string' ? translation : fallback;
};

const CTASection: FC = () => {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const handlePrimary = useCallback(() => {
    window.location.assign('/register');
  }, []);

  const handleSecondary = useCallback(() => {
    window.open('https://github.com/sigmacode-ai/sigmacode', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Hintergrund-Elemente */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
      <div className="absolute inset-0 opacity-25 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.15),transparent_40%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-indigo-500/20 shadow-xl shadow-indigo-500/10 p-8 md:p-12 text-center">
          <motion.div 
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration }}
            className="mb-8"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-900/30 rounded-full mb-4">
              {safeT(t, 'landing.cta.subtitle', 'Bereit für den nächsten Schritt?')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {safeT(t, 'landing.cta.title', 'Erlebe die Zukunft der KI mit SIGMACODE AI')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {safeT(t, 'landing.cta.description', 'Starte noch heute mit SIGMACODE AI und entdecke, wie moderne KI-Tools deine Produktivität und Kreativität auf ein neues Level heben können.')}
            </p>
          </motion.div>

          {/* Action Buttons (centralized) */}
          <motion.div 
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.2 }}
            className="flex justify-center mb-12"
          >
            <HeroActions 
              onPrimaryClick={handlePrimary} 
              onSecondaryClick={handleSecondary}
              groupLabel={safeT(t, 'landing.cta.group_label', 'Hauptaktionen – Jetzt starten oder GitHub öffnen')}
            />
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">
                  {safeT(t, 'landing.cta.features.open_source.title', 'Open Source')}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {safeT(t, 'landing.cta.features.open_source.description', '100% transparenter Code, den du anpassen und erweitern kannst.')}
              </p>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">
                  {safeT(t, 'landing.cta.features.privacy.title', 'Datenschutz')}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {safeT(t, 'landing.cta.features.privacy.description', 'Self-Hosting für maximale Kontrolle über deine Daten.')}
              </p>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">
                  {safeT(t, 'landing.cta.features.performance.title', 'Performance')}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {safeT(t, 'landing.cta.features.performance.description', 'Optimiert für Geschwindigkeit und Skalierbarkeit.')}
              </p>
            </div>
          </motion.div>

          {/* User Stats */}
          <motion.div 
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.6 }}
            className="flex flex-wrap justify-center gap-x-16 gap-y-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">3,500+</div>
              <div className="text-gray-400 text-sm">{safeT(t, 'landing.cta.stats.github_stars', 'GitHub Stars')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">15,000+</div>
              <div className="text-gray-400 text-sm">{safeT(t, 'landing.cta.stats.active_users', 'Aktive Nutzer')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-gray-400 text-sm">{safeT(t, 'landing.cta.stats.contributors', 'Mitwirkende')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-gray-400 text-sm">{safeT(t, 'landing.cta.stats.conversations', 'Konversationen')}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
