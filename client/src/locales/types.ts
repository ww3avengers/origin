// Definiere die Schnittstelle für die Übersetzungen (abgeleitet aus JSON-Dateien)
export interface Resources {
  translation: typeof import('./en/translation.json');
  landing: typeof import('./en/landing.json');
}

// Hilfstypen für die Verwendung in Komponenten
export type FeatureItem = {
  id: string;
  icon: React.ReactNode;
  titleKey: `features.items.${number}.title`;
  descriptionKey: `features.items.${number}.description`;
};

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: Resources;
  }
}
