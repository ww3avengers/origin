import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

type ComparisonTranslationKey =
  // Feature-Namen
  | 'comparison.features.local_execution'
  | 'comparison.features.privacy'
  | 'comparison.features.open_source'
  | 'comparison.features.customizable_models'
  | 'comparison.features.code_analysis'
  | 'comparison.features.offline_use'
  | 'comparison.features.data_retention'
  | 'comparison.features.api_access'
  
  // Beschreibungen
  | 'comparison.descriptions.local_execution'
  | 'comparison.descriptions.privacy'
  | 'comparison.descriptions.open_source'
  | 'comparison.descriptions.customizable_models'
  | 'comparison.descriptions.code_analysis'
  | 'comparison.descriptions.offline_use'
  | 'comparison.descriptions.data_retention'
  | 'comparison.descriptions.api_access'
  
  // Werte für SIGMACODE
  | 'comparison.values.local_execution.sigmacode'
  | 'comparison.values.privacy.sigmacode'
  | 'comparison.values.open_source.sigmacode'
  | 'comparison.values.customizable_models.sigmacode'
  | 'comparison.values.code_analysis.sigmacode'
  | 'comparison.values.offline_use.sigmacode'
  | 'comparison.values.data_retention.sigmacode'
  | 'comparison.values.api_access.sigmacode'
  
  // Werte für ChatGPT
  | 'comparison.values.local_execution.chatgpt'
  | 'comparison.values.privacy.chatgpt'
  | 'comparison.values.open_source.chatgpt'
  | 'comparison.values.customizable_models.chatgpt'
  | 'comparison.values.code_analysis.chatgpt'
  | 'comparison.values.offline_use.chatgpt'
  | 'comparison.values.data_retention.chatgpt'
  | 'comparison.values.api_access.chatgpt'
  
  // UI Texte
  | 'landing.comparison.badge'
  | 'landing.comparison.title'
  | 'landing.comparison.subtitle'
  | 'landing.comparison.features'
  | 'landing.comparison.sigmacode_tagline'
  | 'landing.comparison.chatgpt_tagline'
  | 'landing.comparison.cta'
  | 'landing.comparison.visit_chatgpt'
  
  // Zusätzliche Flexibilität für zukünftige Erweiterungen
  | (string & {});

// Simple utility function to concatenate class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type ComparisonFeature = {
  id: string;
  feature: string;
  description: string;
  sigmacode: string | boolean;
  chatgpt: string | boolean;
  highlight?: boolean;
  icon?: string;
};

const ComparisonSection: FC = () => {
  const { t } = useTranslation();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Helper function to safely get translations with fallback
  const getTranslation = (key: string, fallback: string = ''): string => {
    try {
      // Type assertion to handle dynamic keys
      const translation = (t as any)(key, { ns: 'translation', defaultValue: fallback });
      return typeof translation === 'string' ? translation : fallback;
    } catch (error) {
      console.error(`Translation error for key ${key}:`, error);
      return fallback;
    }
  };

  const toggleFeature = (id: string) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  // Features for comparison
  const features: ComparisonFeature[] = [
    {
      id: 'local_execution',
      feature: getTranslation('comparison.features.local_execution', 'Lokale Ausführung'),
      description: getTranslation('comparison.descriptions.local_execution', 'Lokale Verarbeitung ohne Cloud-Abhängigkeit'),
      sigmacode: getTranslation('comparison.values.local_execution.sigmacode', 'Vollständig lokal'),
      chatgpt: getTranslation('comparison.values.local_execution.chatgpt', 'Cloud-basiert'),
      highlight: true,
      icon: '🏢',
    },
    {
      id: 'privacy',
      feature: getTranslation('comparison.features.privacy', 'Datenschutz'),
      description: getTranslation('comparison.descriptions.privacy', 'Volle Kontrolle über Ihre Daten'),
      sigmacode: getTranslation('comparison.values.privacy.sigmacode', 'Volle Kontrolle'),
      chatgpt: getTranslation('comparison.values.privacy.chatgpt', 'Eingeschränkt'),
      highlight: true,
      icon: '🔒',
    },
    {
      id: 'open_source',
      feature: getTranslation('comparison.features.open_source', 'Open Source'),
      description: getTranslation('comparison.descriptions.open_source', 'Vollständige Transparenz und Anpassbarkeit'),
      sigmacode: getTranslation('comparison.values.open_source.sigmacode', 'Vollständig quelloffen'),
      chatgpt: getTranslation('comparison.values.open_source.chatgpt', 'Geschlossen'),
      highlight: true,
      icon: '📦',
    },
    {
      id: 'customizable_models',
      feature: getTranslation('comparison.features.customizable_models', 'Anpassbare Modelle'),
      description: getTranslation('comparison.descriptions.customizable_models', 'Anpassung an spezifische Anforderungen'),
      sigmacode: getTranslation('comparison.values.customizable_models.sigmacode', 'Vollständig anpassbar'),
      chatgpt: getTranslation('comparison.values.customizable_models.chatgpt', 'Eingeschränkt'),
      icon: '⚙️',
    },
    {
      id: 'code_analysis',
      feature: getTranslation('comparison.features.code_analysis', 'Code-Analyse'),
      description: getTranslation('comparison.descriptions.code_analysis', 'Integrierte Analyse-Tools für Entwickler'),
      sigmacode: getTranslation('comparison.values.code_analysis.sigmacode', 'Integriert'),
      chatgpt: getTranslation('comparison.values.code_analysis.chatgpt', 'Externe Tools erforderlich'),
      icon: '💻',
    },
    {
      id: 'offline_use',
      feature: getTranslation('comparison.features.offline_use', 'Offline-Nutzung'),
      description: getTranslation('comparison.descriptions.offline_use', 'Funktionalität ohne Internetverbindung'),
      sigmacode: getTranslation('comparison.values.offline_use.sigmacode', 'Vollständig offline nutzbar'),
      chatgpt: getTranslation('comparison.values.offline_use.chatgpt', 'Internetverbindung erforderlich'),
      icon: '📴',
    },
    {
      id: 'data_retention',
      feature: getTranslation('comparison.features.data_retention', 'Datenaufbewahrung'),
      description: getTranslation('comparison.descriptions.data_retention', 'Kontrolle über Ihre Daten'),
      sigmacode: getTranslation('comparison.values.data_retention.sigmacode', 'Keine Datenspeicherung'),
      chatgpt: getTranslation('comparison.values.data_retention.chatgpt', 'Eingeschränkte Kontrolle'),
      icon: '🗄️',
    },
    {
      id: 'api_access',
      feature: getTranslation('comparison.features.api_access', 'API-Zugriff'),
      description: getTranslation('comparison.descriptions.api_access', 'Flexible Integration in bestehende Systeme'),
      sigmacode: getTranslation('comparison.values.api_access.sigmacode', 'Vollständiger Zugriff'),
      chatgpt: getTranslation('comparison.values.api_access.chatgpt', 'Eingeschränkt'),
      icon: '🔌',
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const renderValue = (value: string | boolean, isPositive: boolean = true) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      );
    }
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      )}>
        {value}
      </span>
    );
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            {getTranslation('landing.comparison.badge', 'Vergleich')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {getTranslation('landing.comparison.title', 'Vergleich mit anderen Lösungen')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {getTranslation('landing.comparison.subtitle', 'Warum SIGMACODE AI die bessere Wahl für Sie ist')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature List */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {getTranslation('landing.comparison.features', 'Features')}
            </h3>
            <div className="space-y-4">
              {features.map((feature) => (
                <motion.div
                  key={`feature-${feature.id}`}
                  variants={item}
                  className={cn(
                    'p-4 rounded-lg transition-colors cursor-pointer',
                    expandedFeature === feature.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    feature.highlight ? 'border-l-4 border-blue-500' : ''
                  )}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{feature.icon}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {feature.feature}
                      </h4>
                    </div>
                    {expandedFeature === feature.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedFeature === feature.id && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-sm text-gray-600 dark:text-gray-400 overflow-hidden"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SIGMACODE AI Column */}
          <div className="relative">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">SIGMACODE AI</h3>
                    <div className="bg-white/20 rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm mb-6">
                    {getTranslation('landing.comparison.sigmacode_tagline', 'Die moderne KI-Lösung für Unternehmen')}
                  </p>
                  <div className="space-y-4">
                    {features.map((feature) => (
                      <div key={`sigmacode-${feature.id}`} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {renderValue(feature.sigmacode, true)}
                        </div>
                        <p className="ml-3 text-sm text-blue-100">
                          {typeof feature.sigmacode === 'string' ? feature.sigmacode : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <a
                      href="#contact"
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    >
                      {getTranslation('landing.comparison.cta', 'Jetzt starten')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ChatGPT Column */}
          <div className="relative">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">ChatGPT</h3>
                    <div className="bg-white/20 rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm mb-6">
                    {getTranslation('landing.comparison.chatgpt_tagline', 'Allgemeine KI-Unterhaltung')}
                  </p>
                  <div className="space-y-4">
                    {features.map((feature) => (
                      <div key={`chatgpt-${feature.id}`} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {renderValue(feature.chatgpt, false)}
                        </div>
                        <p className="ml-3 text-sm text-gray-200">
                          {typeof feature.chatgpt === 'string' ? feature.chatgpt : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <a
                      href="https://chat.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-100 hover:bg-white transition-colors"
                    >
                      {getTranslation('landing.comparison.visit_chatgpt', 'Zu ChatGPT')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;