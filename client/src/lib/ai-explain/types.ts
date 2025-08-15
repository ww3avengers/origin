// Explainability Types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointVariant {
  layout: 'stack' | 'grid' | 'row' | 'hidden' | 'custom';
  notes?: string;
}

export interface SectionMeta {
  id: string; // unique within the page/app
  title: string;
  description: string;
  actions?: string[];
  props?: Record<string, unknown>;
  breakpoints?: Partial<Record<Breakpoint, BreakpointVariant>>;
}

export interface ComponentDoc {
  file: string; // source path for traceability
  section: SectionMeta;
}

export interface VisibleSection {
  id: string;
  title?: string;
  el: HTMLElement;
}
