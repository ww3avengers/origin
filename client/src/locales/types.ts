// Typen an die Package-Lokalisierungen anbinden (Single Source of Truth)
import type { Resources as PackageResources } from '../../../packages/client/src/locales/i18n';

// Sprache->Namespaces (z. B. { en: { translation, landing }, de: { ... } })
export type Resources = PackageResources;
// Namespaces-Shape extrahieren (z. B. { translation, landing })
export type NamespaceResources = PackageResources[keyof PackageResources];

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
    // i18next erwartet hier die NAMESPACE-Struktur, nicht die Sprachenwurzel
    resources: NamespaceResources;
  }
}
