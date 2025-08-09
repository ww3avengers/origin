import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { motion, useScroll, useTransform } from 'framer-motion';

// Typsichere Übersetzungsfunktion
const safeT = (t: TFunction, key: string, fallback: string): string => {
  const translation = t(key as any);
  return typeof translation === 'string' ? translation : fallback;
};

interface SecurityFeatureProps {
  title: string;
  description: string;
  icon: JSX.Element;
  delay: number;
}

const SecurityFeature: FC<SecurityFeatureProps> = ({ title, description, icon, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="flex items-start gap-4 bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-xl p-5 hover:bg-gray-700/40 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
};

const SecuritySection: FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const securityFeatures = [
    {
      title: safeT(t, 'landing.security.features.selfhosting.title', 'Self-Hosting & Datenkontrolle'),
      description: safeT(t, 'landing.security.features.selfhosting.description', 'Behalte die volle Kontrolle über deine Daten mit Self-Hosting-Optionen oder wähle unsere sichere Cloud-Lösung.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
      )
    },
    {
      title: safeT(t, 'landing.security.features.authentication.title', 'Sichere Authentifizierung'),
      description: safeT(t, 'landing.security.features.authentication.description', 'OAuth2, LDAP, E-Mail-Login und 2FA für maximale Sicherheit und einfache Integration in bestehende Systeme.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: safeT(t, 'landing.security.features.user_management.title', 'Multi-User & Rechtemanagement'),
      description: safeT(t, 'landing.security.features.user_management.description', 'Verwaltung von Benutzerrollen und -rechten für Teams jeder Größe mit detailliertem Zugriffsmanagement.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: safeT(t, 'landing.security.features.isolation.title', 'Sichere Code-Ausführung'),
      description: safeT(t, 'landing.security.features.isolation.description', 'Vollständig isolierte Sandbox-Umgebung für die sichere Ausführung von Code ohne Sicherheitsbedenken.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: safeT(t, 'landing.security.features.compliance.title', 'Compliance & Datenschutz'),
      description: safeT(t, 'landing.security.features.compliance.description', 'Entwickelt mit Fokus auf Datenschutz-Standards und einfacher Konfiguration für unternehmensspezifische Anforderungen.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: safeT(t, 'landing.security.features.monitoring.title', 'Monitoring & Moderation'),
      description: safeT(t, 'landing.security.features.monitoring.description', 'Überwachung von Token-Nutzung, Benutzeraktivitäten und integrierte Moderationswerkzeuge.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden bg-gray-900">
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute top-20 right-0 w-1/3 h-1/2 bg-indigo-900/20 rounded-full filter blur-3xl"
        style={{ y: y1, opacity }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-1/4 h-1/3 bg-purple-900/20 rounded-full filter blur-3xl"
        style={{ y: y2, opacity }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-900/30 rounded-full mb-4">
            {safeT(t, 'landing.security.subtitle', 'Sicherheit & Kontrolle')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            {safeT(t, 'landing.security.title', 'Deine Daten. Deine Kontrolle.')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {safeT(t, 'landing.security.description', 'SIGMACODE AI wurde mit Fokus auf Datenschutz, Sicherheit und maximale Kontrolle entwickelt.')}
          </p>
        </motion.div>

        {/* Split Screen Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Security Features */}
          <div className="space-y-4">
            {securityFeatures.map((feature, index) => (
              <SecurityFeature
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={index * 0.1}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 pt-4 border-t border-gray-700"
            >
              <a 
                href="https://docs.sigmacode.ai/security"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/20"
              >
                <span className="whitespace-nowrap">
                  {safeT(t, 'landing.security.learn_more', 'Mehr über unsere Sicherheitsmaßnahmen erfahren')}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Visual Security Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
              {/* Security Shield Illustration */}
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Security Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">100%</div>
                  <div className="text-gray-400 text-sm">{safeT(t, 'landing.security.stats.open_source', 'Open Source')}</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">OAuth2</div>
                  <div className="text-gray-400 text-sm">{safeT(t, 'landing.security.stats.auth', 'Authentication')}</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">2FA</div>
                  <div className="text-gray-400 text-sm">{safeT(t, 'landing.security.stats.two_factor', 'Zwei-Faktor')}</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">LDAP</div>
                  <div className="text-gray-400 text-sm">{safeT(t, 'landing.security.stats.directory', 'Directory')}</div>
                </div>
              </div>

              {/* Security Features List */}
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {safeT(t, 'landing.security.features.data_privacy', 'Datenschutzkonforme Speicherung')}
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {safeT(t, 'landing.security.features.role_based', 'Rollenbasiertes Zugriffsmanagement')}
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {safeT(t, 'landing.security.features.audit', 'Audit-Logs für alle Aktivitäten')}
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {safeT(t, 'landing.security.features.content_filter', 'Integrierbarer Content-Filter')}
                </li>
              </ul>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-600/10 rounded-full filter blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-600/10 rounded-full filter blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
