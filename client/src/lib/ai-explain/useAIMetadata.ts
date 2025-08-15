import { useEffect } from 'react';
import type { ComponentDoc } from './types';
import { registerSection } from './registry';

export function useAIMetadata(doc: ComponentDoc) {
  useEffect(() => {
    registerSection(doc);
  }, [doc.file, doc.section.id]);
}
