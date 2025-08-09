import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { motion, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';

// Hilfsfunktion für typsichere Übersetzungen mit Fallback
const safeT = (t: TFunction, key: string, fallback: string): string => {
  const translation = t(key as any);
  return typeof translation === 'string' ? translation : fallback;
};

type BillingType = 'monthly' | 'yearly';
type PlanType = 'community' | 'professional' | 'enterprise';

const PricingSection: FC = () => {
  const { t } = useTranslation();
  const [billingType, setBillingType] = useState<BillingType>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<PlanType | null>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const plans = {
    community: {
      title: safeT(t, 'landing.pricing.plans.community.title', 'Community'),
      price: {
        monthly: safeT(t, 'landing.pricing.plans.community.price.monthly', 'Kostenlos'),
        yearly: safeT(t, 'landing.pricing.plans.community.price.yearly', 'Kostenlos')
      },
      description: safeT(t, 'landing.pricing.plans.community.description', 'Open Source, selbst gehostet'),
      features: [
        safeT(t, 'landing.pricing.plans.community.features.1', 'Unbegrenzte Konversationen'),
        safeT(t, 'landing.pricing.plans.community.features.2', 'Multi-Modell-Support'),
        safeT(t, 'landing.pricing.plans.community.features.3', 'Lokale KI-Modelle'),
        safeT(t, 'landing.pricing.plans.community.features.4', 'Community-Support'),
        safeT(t, 'landing.pricing.plans.community.features.5', 'Self-Hosting'),
      ],
      cta: safeT(t, 'landing.pricing.plans.community.cta', 'GitHub klonen'),
      ctaLink: 'https://github.com/sigmacode-ai/sigmacode',
      popular: false,
      discount: '0%'
    },
    professional: {
      title: safeT(t, 'landing.pricing.plans.professional.title', 'Professional'),
      price: {
        monthly: safeT(t, 'landing.pricing.plans.professional.price.monthly', '19,99 €'),
        yearly: safeT(t, 'landing.pricing.plans.professional.price.yearly', '16,99 €')
      },
      description: safeT(t, 'landing.pricing.plans.professional.description', 'Managed Cloud-Hosting'),
      features: [
        safeT(t, 'landing.pricing.plans.professional.features.1', 'Alles aus Community'),
        safeT(t, 'landing.pricing.plans.professional.features.2', '100 Code-Interpreter Credits/Monat'),
        safeT(t, 'landing.pricing.plans.professional.features.3', 'Premium AI-Modell-Zugang'),
        safeT(t, 'landing.pricing.plans.professional.features.4', 'Web-Suche & Bildanalyse'),
        safeT(t, 'landing.pricing.plans.professional.features.5', 'Prioritäts-Support'),
        safeT(t, 'landing.pricing.plans.professional.features.6', 'Team-Kollaboration (bis 5 Nutzer)'),
      ],
      cta: safeT(t, 'landing.pricing.plans.professional.cta', 'Jetzt starten'),
      ctaLink: '/register?plan=professional',
      popular: true,
      discount: '15%'
    },
    enterprise: {
      title: safeT(t, 'landing.pricing.plans.enterprise.title', 'Enterprise'),
      price: {
        monthly: safeT(t, 'landing.pricing.plans.enterprise.price.monthly', '99,99 €'),
        yearly: safeT(t, 'landing.pricing.plans.enterprise.price.yearly', '79,99 €')
      },
      description: safeT(t, 'landing.pricing.plans.enterprise.description', 'Für Teams & Unternehmen'),
      features: [
        safeT(t, 'landing.pricing.plans.enterprise.features.1', 'Alles aus Professional'),
        safeT(t, 'landing.pricing.plans.enterprise.features.2', 'Unbegrenzte Code-Interpreter Credits'),
        safeT(t, 'landing.pricing.plans.enterprise.features.3', 'Eigene AI Assistenten & Agents'),
        safeT(t, 'landing.pricing.plans.enterprise.features.4', 'LDAP/SSO-Integration'),
        safeT(t, 'landing.pricing.plans.enterprise.features.5', 'Dedizierte Support-Manager'),
        safeT(t, 'landing.pricing.plans.enterprise.features.6', 'Eigene Deployment-Optionen'),
        safeT(t, 'landing.pricing.plans.enterprise.features.7', 'Unbegrenzte Team-Mitglieder'),
        safeT(t, 'landing.pricing.plans.enterprise.features.8', 'Custom Branding'),
      ],
      cta: safeT(t, 'landing.pricing.plans.enterprise.cta', 'Kontakt aufnehmen'),
      ctaLink: '/contact?plan=enterprise',
      popular: false,
      discount: '20%'
    }
  };

  const planKeys: PlanType[] = ['community', 'professional', 'enterprise'];
  
  // Animation variants
  const cardVariants = {
    default: { scale: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.3 } },
    hover: prefersReduced ? { scale: 1, y: 0, transition: { duration: 0 } } : { scale: 1.03, y: -10, transition: { duration: 0.3 } }
  };

  const handlePrimaryEnterprise = () => {
    const el = document.querySelector('#contact') as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.location.href = '/contact';
    }
  };

  const handleSecondaryEnterprise = () => {
    window.open('https://docs.sigmacode.ai/deployment/enterprise', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-900/30 rounded-full mb-4">
            {safeT(t, 'landing.pricing.subtitle', 'Preisgestaltung')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            {safeT(t, 'landing.pricing.title', 'Einfache und transparente Preise')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {safeT(t, 'landing.pricing.description', 'Wähle den Plan, der zu deinen Anforderungen passt. Alle Pläne bieten Zugang zur vollen SIGMACODE AI-Erfahrung.')}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-800/50 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingType('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                billingType === 'monthly' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {safeT(t, 'landing.pricing.billing.monthly', 'Monatlich')}
            </button>
            <button
              onClick={() => setBillingType('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                billingType === 'yearly' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {safeT(t, 'landing.pricing.billing.yearly', 'Jährlich')}
              <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planKeys.map((planKey, index) => {
            const plan = plans[planKey];
            const isHovered = hoveredPlan === planKey;
            const isProfessional = planKey === 'professional';
            
            return (
              <motion.div 
                key={planKey}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: baseDuration, delay: prefersReduced ? 0 : index * 0.1 + 0.3 }}
                variants={cardVariants}
                animate={isHovered ? 'hover' : 'default'}
                onMouseEnter={() => !prefersReduced && setHoveredPlan(planKey)}
                onMouseLeave={() => !prefersReduced && setHoveredPlan(null)}
                className={`relative ${
                  isProfessional 
                    ? 'bg-gradient-to-b from-indigo-900/50 to-purple-900/40 border-indigo-500/50' 
                    : 'bg-gray-800/50 border-gray-700/50'
                } backdrop-blur-sm rounded-2xl p-8 border shadow-lg ${
                  isProfessional ? 'shadow-indigo-500/20' : ''
                } flex flex-col h-full transform transition-all duration-300`}
              >
                {isProfessional && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium px-4 py-1 rounded-full shadow-lg">
                      {safeT(t, 'landing.pricing.most_popular', 'Beliebteste Wahl')}
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">
                      {billingType === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    {plan.price.monthly !== 'Kostenlos' && (
                      <span className="text-gray-400 mb-1">{safeT(t, 'landing.pricing.per_month', '/Monat')}</span>
                    )}
                  </div>
                  {billingType === 'yearly' && plan.price.monthly !== 'Kostenlos' && (
                    <div className="text-sm text-green-400 mt-2">
                      <span>{safeT(t, 'landing.pricing.save', 'Du sparst')} {plan.discount} {safeT(t, 'landing.pricing.with_yearly', 'mit jährlicher Zahlung')}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-8 grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-300 text-sm">{feature as string}</span>
                    </div>
                  ))}
                </div>
                
                <a
                  href={plan.ctaLink}
                  className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-all duration-300 ${
                    isProfessional
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  aria-label={`CTA ${plan.title}`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            );
          })}
        </div>
        
        {/* Enterprise Custom Quote */}
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.6 }}
          className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            {safeT(t, 'landing.pricing.enterprise_title', 'Benötigen Sie eine individuelle Lösung?')}
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            {safeT(t, 'landing.pricing.enterprise_description', 'Kontaktieren Sie uns für maßgeschneiderte Lösungen, individuelles Deployment und dedizierte Support-Optionen für größere Teams und Unternehmen.')}
          </p>
          <div className="flex justify-center">
            <HeroActions
              onPrimaryClick={handlePrimaryEnterprise}
              onSecondaryClick={handleSecondaryEnterprise}
              groupLabel={safeT(t, 'landing.cta.groupLabel', 'Pricing Aktionen')}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
