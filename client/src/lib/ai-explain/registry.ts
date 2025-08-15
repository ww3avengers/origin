import type { ComponentDoc } from './types';

const registry = new Map<string, ComponentDoc>();

export const registerSection = (doc: ComponentDoc) => {
  registry.set(doc.section.id, doc);
};

export const getSection = (id: string) => registry.get(id);
export const getAllSections = () => Array.from(registry.values());
export const clearRegistry = () => registry.clear();

// For debugging in console
// @ts-ignore
if (typeof window !== 'undefined') (window as any).__AI_EXPLAIN_REGISTRY__ = registry;
