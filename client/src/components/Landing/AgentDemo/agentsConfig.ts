import React from 'react';

// Typen für die Registry
export type AgentId =
  | 'researchAgent'
  | 'marketingMind'
  | 'codeMaster'
  | 'dataAnalyst'
  | 'opsAgent'
  | 'asmAgent';

export interface AgentMeta {
  id: AgentId;
  avatar: string;
  color: string; // tailwind gradient tokens, e.g. 'from-blue-500 to-indigo-600'
  // i18n key roots, z. B. 'landing.agentDemo.agents.codeMaster.*'
  i18n: {
    name: string;
    specialty: string;
    description: string;
    demoQ: string;
    demoA: string;
  };
}

export interface AgentRegistryEntry extends AgentMeta {
  // Lazy geladene Demo-Komponente, die mindestens die Prop isActive akzeptiert
  // Optional können Wrapper genutzt werden, um weitere Props zu setzen
  loader?: () => Promise<{ default: React.ComponentType<any> }>; // optional, um Fallback zu erlauben
}

// Registry-Einträge: Meta + Lazy-Loader
export const agentsRegistry: Record<AgentId, AgentRegistryEntry> = {
  codeMaster: {
    id: 'codeMaster',
    avatar: '/assets/agents/codemaster.svg',
    color: 'from-blue-500 to-indigo-600',
    i18n: {
      name: 'landing.agentDemo.agents.codeMaster.name',
      specialty: 'landing.agentDemo.agents.codeMaster.specialty',
      description: 'landing.agentDemo.agents.codeMaster.description',
      demoQ: 'landing.agentDemo.agents.codeMaster.demo.question',
      demoA: 'landing.agentDemo.agents.codeMaster.demo.response',
    },
    loader: () => import('./CodeMaster/CodeMasterDemo.fixed'),
  },
  marketingMind: {
    id: 'marketingMind',
    avatar: '/assets/agents/marketingmind.svg',
    color: 'from-sky-500 to-cyan-600',
    i18n: {
      name: 'landing.agentDemo.agents.marketingMind.name',
      specialty: 'landing.agentDemo.agents.marketingMind.specialty',
      description: 'landing.agentDemo.agents.marketingMind.description',
      demoQ: 'landing.agentDemo.agents.marketingMind.demo.question',
      demoA: 'landing.agentDemo.agents.marketingMind.demo.response',
    },
    loader: () => import('./MarketingMind/MarketingMindDemo'),
  },
  dataAnalyst: {
    id: 'dataAnalyst',
    avatar: '/assets/agents/dataanalyst.svg',
    color: 'from-green-500 to-teal-600',
    i18n: {
      name: 'landing.agentDemo.agents.dataAnalyst.name',
      specialty: 'landing.agentDemo.agents.dataAnalyst.specialty',
      description: 'landing.agentDemo.agents.dataAnalyst.description',
      demoQ: 'landing.agentDemo.agents.dataAnalyst.demo.question',
      demoA: 'landing.agentDemo.agents.dataAnalyst.demo.response',
    },
    loader: () => import('./DataAnalysis').then((m) => ({ default: m.DataAnalysis })),
  },
  researchAgent: {
    id: 'researchAgent',
    avatar: '/assets/agents/researcher.svg',
    color: 'from-cyan-500 to-blue-600',
    i18n: {
      name: 'landing.agentDemo.agents.researchAgent.name',
      specialty: 'landing.agentDemo.agents.researchAgent.specialty',
      description: 'landing.agentDemo.agents.researchAgent.description',
      demoQ: 'landing.agentDemo.agents.researchAgent.demo.question',
      demoA: 'landing.agentDemo.agents.researchAgent.demo.response',
    },
    loader: () => import('./ResearchAgent/ResearchAgentDemo'),
  },
  opsAgent: {
    id: 'opsAgent',
    avatar: '/assets/agents/dataanalyst.svg',
    color: 'from-amber-500 to-orange-600',
    i18n: {
      name: 'landing.agentDemo.agents.opsAgent.name',
      specialty: 'landing.agentDemo.agents.opsAgent.specialty',
      description: 'landing.agentDemo.agents.opsAgent.description',
      demoQ: 'landing.agentDemo.agents.opsAgent.demo.question',
      demoA: 'landing.agentDemo.agents.opsAgent.demo.response',
    },
    // noch kein dedizierter Loader vorhanden – fällt auf generisches Panel zurück
  },
  asmAgent: {
    id: 'asmAgent',
    avatar: '/assets/agents/asm.svg',
    color: 'from-sky-500 to-cyan-600',
    i18n: {
      name: 'landing.agentDemo.agents.asmAgent.name',
      specialty: 'landing.agentDemo.agents.asmAgent.specialty',
      description: 'landing.agentDemo.agents.asmAgent.description',
      demoQ: 'landing.agentDemo.agents.asmAgent.demo.question',
      demoA: 'landing.agentDemo.agents.asmAgent.demo.response',
    },
    // ASM-Demo kann später per Lazy-Loader ergänzt werden, z. B.:
    // loader: () => import('./ASM/ASMDemo'),
  },
};

export function getAgentIds(): AgentId[] {
  return Object.keys(agentsRegistry) as AgentId[];
}
