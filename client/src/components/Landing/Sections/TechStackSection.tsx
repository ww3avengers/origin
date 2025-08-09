import { FC, useRef, lazy, Suspense, useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion, useScroll, useTransform, MotionValue, useMotionValue } from 'framer-motion';
import { techStackConfig, techFeatures, TechCategory, TechItem } from '../../../config/techStack';

// Erweiterter TechCategory-Typ mit ID
interface ExtendedTechCategory extends Omit<TechCategory, 'category' | 'items'> {
  id: string;
  category: string;
  items: Array<{
    name: string;
    icon: string;
  }>;
}

// Erweiterter TechCategory-Typ mit ID
interface ExtendedTechCategory extends Omit<TechCategory, 'category' | 'items'> {
  id: string;
  category: string;
  items: Array<{
    name: string;
    icon: string;
  }>;
}

type TechStackVisualizationProps = {
  y1: MotionValue<number>;
  y2: MotionValue<number>;
  y3: MotionValue<number>;
};

type TranslatedFeature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

// Lazy Load für die Visualisierungskomponente
const TechStackVisualization = lazy(() => import('./TechStackVisualization'));

// Definiere alle möglichen Übersetzungsschlüssel
type TranslationKey = 
  // Hauptüberschriften
  | 'landing.techstack.title'
  | 'landing.techstack.subtitle'
  | 'landing.techstack.description'
  | 'landing.techstack.deployment_guide'
  
  // Kategorien (dynamisch)
  | `landing.techstack.${number}.title`
  
  // Features (dynamisch)
  | `landing.techstack.features.${number}.title`
  | `landing.techstack.features.${number}.description`;

/**
 * Sicherer Wrapper um die t-Funktion von i18next
 * @param t Die Übersetzungsfunktion von useTranslation()
 * @param key Der Übersetzungsschlüssel
 * @param fallback Fallback-Text, falls die Übersetzung fehlschlägt
 * @returns Die übersetzte Zeichenkette oder den Fallback-Text
 */
const safeT = (t: TFunction, key: TranslationKey, fallback: string): string => {
  try {
    // Type Assertion, da wir sicher sind, dass der Schlüssel gültig ist
    const result = t(key as any);
    return typeof result === 'string' && result !== key ? result : fallback;
  } catch (error) {
    console.warn(`Übersetzungsfehler für Schlüssel "${key}":`, error);
    return fallback;
  }
};

// Animation Varianten
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const TechStackSection: FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // MotionValue für Scroll-Animationen
  const scrollYProgress = useMotionValue(0);
  
  // Client-seitiges Setup
  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window === 'undefined') return;
    
    setIsMounted(true);
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Container-Styles setzen
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // Scroll-Animation initialisieren und direkt zuweisen
    const { scrollYProgress } = useScroll({
      target: scrollContainerRef,
      offset: ["start end", "end start"],
      layoutEffect: true
    });
    
    // Aktualisiere den scrollYProgress-Wert
    scrollYProgress.on('change', (latest) => {
      scrollYProgress.set(latest);
    });
    
    // Cleanup
    return () => {
      container.style.position = '';
      container.style.overflow = '';
    };
  }, []);
  
  // Scroll-Animationen
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  
  // Übersetzungen memoisieren
  const translations = useMemo(() => ({
    title: safeT(t, 'landing.techstack.title', 'Gebaut mit modernster Technologie'),
    subtitle: safeT(t, 'landing.techstack.subtitle', 'Technologie-Stack'),
    description: safeT(t, 'landing.techstack.description', 'SIGMACODE AI nutzt eine flexible, modulare Architektur für maximale Leistung und Anpassbarkeit.'),
    deploymentGuide: safeT(t, 'landing.techstack.deployment_guide', 'Deployment-Guide ansehen'),
  }), [t]);

  // Tech-Stack mit Übersetzungen und Validierung
  const validatedTechStack = useMemo(() => 
    (techStackConfig || []).map((category, index) => {
      if (!category || !category.items || !Array.isArray(category.items)) {
        console.warn(`Ungültige Kategorie in techStackConfig an Index ${index}:`, category);
        return {
          id: `invalid-${index}`,
          category: 'Ungültige Kategorie',
          items: [],
          bgClass: 'from-gray-700/20 to-gray-800/20'
        };
      }
      
      const translatedCategory = safeT(t, `landing.techstack.${index}.title`, category.category || 'Unbenannte Kategorie');
      return {
        ...category,
        id: `category-${index}`,
        category: translatedCategory,
        items: (category.items || []).filter((item): item is TechItem => 
          item && typeof item === 'object' && 'name' in item && 'icon' in item
        )
      };
    }).filter(Boolean), // Entferne null/undefined Einträge
    [t]
  );

  // Varianten für Animationen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Features mit Übersetzungen und Validierung
  const translatedFeatures = useMemo(() => 
    (techFeatures || []).map((feature, index) => {
      if (!feature) return null;
      
      const IconComponent = feature?.icon;
      return {
        id: `feature-${index}`,
        title: safeT(t, `landing.techstack.features.${index}.title`, feature?.title || ''),
        description: safeT(t, `landing.techstack.features.${index}.description`, feature?.description || ''),
        icon: IconComponent ? <IconComponent className="h-6 w-6" /> : null
      };
    }).filter(Boolean), // Entferne null/undefined Einträge
    [t]
  ) as TranslatedFeature[];

  // Bild-Fallback-Handler mit TypeScript-Typen und sicherer DOM-Manipulation
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    
    // Füge einen Platzhalter hinzu, falls das Bild nicht geladen werden kann
    const container = target.parentElement;
    if (container && !container.querySelector('.image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400';
      
      // Erstelle das SVG-Element sicher
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'h-5 w-5');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('stroke', 'currentColor');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z');
      
      svg.appendChild(path);
      placeholder.appendChild(svg);
      container.appendChild(placeholder);
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-16 sm:py-24 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden"
      aria-label="Technologie-Stack"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span 
            variants={itemVariants}
            className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-indigo-400 bg-indigo-900/30 rounded-full mb-3 sm:mb-4"
          >
            {translations.subtitle}
          </motion.span>
          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          >
            {translations.title}
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {translations.description}
          </motion.p>
        </motion.div>

        {/* Tech Stack Visualization mit Lazy Loading */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
          <Suspense fallback={
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Lade Visualisierung...</div>
            </div>
          }>
            <TechStackVisualization y1={y1} y2={y2} y3={y3} />
          </Suspense>
          
          {/* Features Liste */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 sm:space-y-6"
          >
            {translatedFeatures.map((feature) => (
              <motion.div 
                key={feature.id}
                variants={itemVariants}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/20 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center text-indigo-400">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack Kategorien mit validierten Daten */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 sm:mt-16"
        >
          {validatedTechStack.map((category, index) => (
            <motion.div
              key={category.id || `category-${index}`}
              variants={itemVariants}
              className={`bg-gradient-to-br ${category.bgClass || 'from-gray-700/20 to-gray-800/20'} backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-colors duration-300`}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
                {category.category || 'Unbenannte Kategorie'}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {category.items?.map((item, idx) => (
                  <div 
                    key={`${item?.name || 'item'}-${idx}`} 
                    className="flex flex-col items-center bg-gray-800/30 backdrop-blur-sm p-2 sm:p-3 rounded-lg hover:bg-gray-700/40 transition-colors duration-200"
                  >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 mb-1 sm:mb-2 flex items-center justify-center">
                      {item?.icon ? (
                        <img 
                          src={item.icon} 
                          alt={item.name || 'Technologie-Icon'} 
                          className="max-h-full max-w-full"
                          loading="lazy"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-center text-gray-200">{item?.name || 'Unbenannt'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Deployment CTA */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-12 sm:mt-16 text-center"
        >
          <a 
            href="https://docs.sigmacode.ai/deployment"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Zum Deployment Guide"
          >
            <span className="text-sm sm:text-base font-medium">
              {translations.deploymentGuide}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
