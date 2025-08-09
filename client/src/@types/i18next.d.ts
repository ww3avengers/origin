import { defaultNS, resources } from '~/locales/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources.en & {
      landing: {
        hero: {
          title: string;
          subtitle: string;
          description: string;
          cta_primary: string;
          cta_secondary: string;
          image_alt: string;
          trusted_by: string;
          logos: {
            sap: string;
            microsoft: string;
            googleCloud: string;
          };
          cta: {
            primary: string;
            secondary: string;
            secondary_aria: string;
            groupLabel: string;
          };
        };
        features: {
          title: string;
          subtitle: string;
          cta: string;
          feature1: string;
          feature2: string;
          feature3: string;
          feature4: string;
          categories: {
            ai: string;
            collaboration: string;
            integration: string;
            security: string;
          };
        };
        faq: {
          title: string;
          subtitle: string;
          description: string;
          more_questions: string;
          contact_us: string;
          q1: string;
          a1: string;
          q2: string;
          a2: string;
          q3: string;
          a3: string;
          q4: string;
          a4: string;
          q5: string;
          a5: string;
          q6: string;
          a6: string;
          q7: string;
          a7: string;
        };
      };
      comparison: {
        title: string;
        subtitle: string;
        feature: string;
        solutions: {
          sigmacode: string;
          chatgpt: string;
        };
        features: {
          local_execution: string;
          privacy: string;
          open_source: string;
          customizable_models: string;
          code_analysis: string;
          offline_use: string;
          data_retention: string;
          api_access: string;
        };
        values: {
          [key: string]: {
            sigmacode: string | boolean;
            chatgpt: string | boolean;
          };
        };
      };
    };
    strictKeyChecks: true;
  }
}