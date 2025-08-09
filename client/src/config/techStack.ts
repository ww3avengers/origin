// Tech-Stack Konfiguration für die TechStackSection

export type TechItem = {
  name: string;
  icon: string;
};

export type TechCategory = {
  category: string;
  items: TechItem[];
  bgClass: string;
};

export const techStackConfig: TechCategory[] = [
  {
    category: 'Frontend',
    items: [
      { name: 'React', icon: '/assets/icons/react.svg' },
      { name: 'TailwindCSS', icon: '/assets/icons/tailwind.svg' },
      { name: 'TypeScript', icon: '/assets/icons/typescript.svg' },
      { name: 'Framer Motion', icon: '/assets/icons/framer.svg' }
    ],
    bgClass: 'from-blue-600/20 to-cyan-600/20'
  },
  {
    category: 'Backend',
    items: [
      { name: 'Node.js', icon: '/assets/icons/nodejs.svg' },
      { name: 'Express', icon: '/assets/icons/express.svg' },
      { name: 'MongoDB', icon: '/assets/icons/mongodb.svg' },
      { name: 'Redis', icon: '/assets/icons/redis.svg' }
    ],
    bgClass: 'from-green-600/20 to-emerald-600/20'
  },
  {
    category: 'KI-Integration',
    items: [
      { name: 'OpenAI', icon: '/assets/icons/openai.svg' },
      { name: 'Anthropic', icon: '/assets/icons/anthropic.svg' },
      { name: 'Google AI', icon: '/assets/icons/googleai.svg' },
      { name: 'Ollama', icon: '/assets/icons/ollama.svg' }
    ],
    bgClass: 'from-purple-600/20 to-indigo-600/20'
  },
  {
    category: 'Deployment',
    items: [
      { name: 'Docker', icon: '/assets/icons/docker.svg' },
      { name: 'Kubernetes', icon: '/assets/icons/kubernetes.svg' },
      { name: 'Vercel', icon: '/assets/icons/vercel.svg' },
      { name: 'Railway', icon: '/assets/icons/railway.svg' }
    ],
    bgClass: 'from-red-600/20 to-orange-600/20'
  }
];

// Features für die Tech-Stack-Sektion
import { ReactNode } from 'react';
import { ModularArchitecture } from '../components/Icons/ModularArchitecture';
import { HighPerformance } from '../components/Icons/HighPerformance';
import { EasyScalability } from '../components/Icons/EasyScalability';
import { FlexibleDeployment } from '../components/Icons/FlexibleDeployment';

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const techFeatures: Feature[] = [
  {
    title: 'Modulare Architektur',
    description: 'Eine saubere, erweiterbare Architektur, die sich an Ihre Anforderungen anpassen lässt.',
    icon: ModularArchitecture
  },
  {
    title: 'Höchste Leistung',
    description: 'Optimiert für Geschwindigkeit und Effizienz, auch bei hoher Auslastung.',
    icon: HighPerformance
  },
  {
    title: 'Einfache Skalierbarkeit',
    description: 'Horizontale Skalierung für wachsende Anforderungen und Nutzerzahlen.',
    icon: EasyScalability
  },
  {
    title: 'Flexibles Deployment',
    description: 'Bereitstellung in der Cloud, On-Premise oder hybriden Umgebungen möglich.',
    icon: FlexibleDeployment
  }
];
