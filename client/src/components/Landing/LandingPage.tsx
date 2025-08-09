import { FC, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Meta from '@/components/Seo/Meta';
import ChatbotWidget from '@/components/ChatbotWidget';
import HeroSection from './Sections/HeroSection';
import AgentHeroSection from './Sections/AgentHeroSection';
import AgentDemoSection from './Sections/AgentDemoSection';
import AgentUSPSection from './Sections/AgentUSPSection';
import FeaturesSection from './Sections/FeaturesSection';
import UseCasesSection from './Sections/UseCasesSection';
import SecuritySection from './Sections/SecuritySection';
import PricingSection from './Sections/PricingSection';
import TechStackSection from './Sections/TechStackSection';
import ComparisonSection from './Sections/ComparisonSection';
import FAQSection from './Sections/FAQSection';
import CTASection from './Sections/CTASection';
import SocialProofSection from './Sections/SocialProofSection';

const LandingPage: FC = () => {
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const scrollToDemo = useCallback(() => {
    const demoSection = document.getElementById('agent-demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    } else {
      // Fallback: setze Hash für Browser-Scroll
      window.location.hash = '#agent-demo';
    }
  }, [prefersReduced]);

  return (
    <>
      {/* Meta nutzt i18n Defaults (site.*) aus Meta-Komponente, keine harten Strings */}
      <Meta />
      {/* Skip-Link für Screenreader/Keyboard-User */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Zum Inhalt springen
      </a>
      <main
        id="main-content"
        role="main"
        aria-label="Landingpage Hauptinhalt"
        className="landing-page min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
      >
      {/* Erste Hero-Section: Hauptprodukt/Chatbot */}
      <HeroSection />
      
      {/* Zweite Hero-Section: Autonome KI-Agenten */}
      <div className="relative z-10">
        <AgentHeroSection onLearnMore={scrollToDemo} />
      </div>
      
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: baseDuration }}
        viewport={{ once: true }}
        id="agent-demo"
      >
        <AgentDemoSection />
      </motion.div>
      
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: baseDuration }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <AgentUSPSection />
      </motion.div>
      
      <FeaturesSection />
      <UseCasesSection />
      <SocialProofSection />
      <SecuritySection />
      <TechStackSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      {/* Globales Chatbot-Widget: fixiert unten rechts */}
      <ChatbotWidget />
    </main>
      </>
  );
};

export default LandingPage;
