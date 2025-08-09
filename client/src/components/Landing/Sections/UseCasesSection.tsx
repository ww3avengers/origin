import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { TFunction } from 'i18next';
import HeroActions from './HeroActions';

// Hilfsfunktion für typsichere Übersetzungen mit Fallback
const safeT = (t: TFunction, key: string, fallback: string): string => {
  const translation = t(key as any);
  return typeof translation === 'string' ? translation : fallback;
};

type TargetAudienceTab = 'social' | 'business' | 'developers' | 'creators';

const UseCasesSection: FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TargetAudienceTab>('social');
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const tabData = {
    social: {
      title: safeT(t, 'landing.target.social.title', 'Social Media Profis'),
      description: safeT(t, 'landing.target.social.description', 'Erstelle ansprechende Inhalte und verwalte deine Präsenz effizient.'),
      features: [
        safeT(t, 'landing.target.social.features.1', 'Content-Kalender erstellen & verwalten'),
        safeT(t, 'landing.target.social.features.2', 'Automatisierte Post-Erstellung für alle Plattformen'),
        safeT(t, 'landing.target.social.features.3', 'Hashtag-Strategien entwickeln'),
        safeT(t, 'landing.target.social.features.4', 'Engagement steigern durch KI-optimierte Inhalte'),
        safeT(t, 'landing.target.social.features.5', 'Mehrsprachige Inhalte generieren')
      ],
      image: '/assets/social-dashboard.webp',
      icon: '📱',
      color: 'from-pink-500 to-rose-500'
    },
    business: {
      title: safeT(t, 'landing.target.business.title', 'Unternehmen & Agenturen'),
      description: safeT(t, 'landing.target.business.description', 'Automatisiere deine Unternehmensprozesse und steigere die Produktivität.'),
      features: [
        safeT(t, 'landing.target.business.features.1', 'Automatisierter Kundenservice'),
        safeT(t, 'landing.target.business.features.2', 'Interne Wissensdatenbanken durchsuchen'),
        safeT(t, 'landing.target.business.features.3', 'Markenkonforme Inhalte erstellen'),
        safeT(t, 'landing.target.business.features.4', 'Datenanalyse und Reporting'),
        safeT(t, 'landing.target.business.features.5', 'Skalierbare KI-Lösungen')
      ],
      image: '/assets/business-dashboard.webp',
      icon: '🏢',
      color: 'from-blue-500 to-indigo-600'
    },
    developers: {
      title: safeT(t, 'landing.target.developers.title', 'Entwickler & Tech-Teams'),
      description: safeT(t, 'landing.target.developers.description', 'Integriere KI nahtlos in deine Entwicklungsumgebung.'),
      features: [
        safeT(t, 'landing.target.developers.features.1', 'Code-Generierung & -Optimierung'),
        safeT(t, 'landing.target.developers.features.2', 'Technische Dokumentation erstellen'),
        safeT(t, 'landing.target.developers.features.3', 'API-Integrationen vereinfachen'),
        safeT(t, 'landing.target.developers.features.4', 'Bugfixing & Code-Review'),
        safeT(t, 'landing.target.developers.features.5', 'Eigene KI-Assistenten entwickeln')
      ],
      image: '/assets/developer-dashboard.webp',
      icon: '💻',
      color: 'from-emerald-500 to-teal-600'
    },
    creators: {
      title: safeT(t, 'landing.target.creators.title', 'Content Creator & Kreative'),
      description: safeT(t, 'landing.target.creators.description', 'Erwecke deine kreativen Projekte mit KI zum Leben.'),
      features: [
        safeT(t, 'landing.target.creators.features.1', 'Ideenfindung & Konzeptentwicklung'),
        safeT(t, 'landing.target.creators.features.2', 'Bild- und Videobeschreibungen generieren'),
        safeT(t, 'landing.target.creators.features.3', 'Social Media Inhalte planen'),
        safeT(t, 'landing.target.creators.features.4', 'Mehrsprachige Übersetzungen'),
        safeT(t, 'landing.target.creators.features.5', 'Kreatives Schreiben & Storytelling')
      ],
      image: '/assets/creator-dashboard.webp',
      icon: '🎨',
      color: 'from-purple-500 to-fuchsia-600'
    }
  };

  const tabVariants = {
    active: {
      opacity: 1,
      y: 0,
      transition: { duration: baseDuration }
    },
    inactive: {
      opacity: prefersReduced ? 0 : 0,
      y: prefersReduced ? 0 : 20,
      transition: { duration: baseDuration }
    }
  };

  const handlePrimaryClick = () => {
    const el = document.querySelector('#contact') as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.location.href = '/contact';
    }
  };

  const handleSecondaryClick = () => {
    window.open('https://github.com/sigmacode-ai/sigmacode', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-sm font-medium text-indigo-300 bg-indigo-900/30 rounded-full border border-indigo-700/50 backdrop-blur-sm mb-4">
            {safeT(t, 'landing.target.subtitle', 'Für jede Zielgruppe die passende Lösung')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400">
            {safeT(t, 'landing.target.title', 'Ihre Zielgruppe, unsere Expertise')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {safeT(t, 'landing.target.description', 'Entdecken Sie, wie Sigmacode AI speziell auf die Bedürfnisse Ihrer Zielgruppe zugeschnitten ist.')}
          </p>
          <div className="mt-8 flex justify-center">
            <HeroActions
              onPrimaryClick={handlePrimaryClick}
              onSecondaryClick={handleSecondaryClick}
              groupLabel={safeT(t, 'landing.cta.groupLabel', 'Use Cases Aktionen')}
            />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
            {(Object.keys(tabData) as Array<keyof typeof tabData>).map((tab) => (
              <button
                key={tab}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 ${
                  activeTab === tab 
                    ? `bg-gradient-to-br ${tabData[tab].color} text-white shadow-lg scale-105` 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="text-3xl mb-1">{tabData[tab].icon}</span>
                <span className="text-xs font-medium mt-1">{tabData[tab].title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto relative">
          {(Object.keys(tabData) as Array<keyof typeof tabData>).map((tab) => (
            <motion.div
              key={tab}
              className="grid md:grid-cols-2 gap-12 items-center"
              initial="inactive"
              animate={activeTab === tab ? "active" : "inactive"}
              variants={tabVariants}
              style={{ display: activeTab === tab ? 'grid' : 'none' }}
            >
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="text-4xl">{tabData[tab].icon}</span>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {tabData[tab].title}
                  </h3>
                </div>
                <p className="text-lg text-gray-300 mb-8 pl-2 border-l-4 border-indigo-500/50 pl-4">
                  {tabData[tab].description}
                </p>
                <ul className="space-y-4">
                  {tabData[tab].features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${tabData[tab].color} flex items-center justify-center text-white`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className={`relative rounded-2xl overflow-hidden shadow-2xl shadow-${tabData[tab].color.split(' ')[1]}/20 border border-gray-700`}>
                  <div className="absolute inset-0 bg-gradient-to-tl from-indigo-700/20 to-transparent z-10"></div>
                  <img
                    src={tabData[tab].image}
                    alt={tabData[tab].title}
                    className="w-full h-auto"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    width={1200}
                    height={750}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/default-dashboard.webp"; // Fallback-Bild
                      if (!target.src.includes('default-dashboard')) {
                        target.src = "/assets/logo.svg"; // Zweiter Fallback
                        target.className = "w-1/2 h-auto object-contain mx-auto my-10 p-10";
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;

