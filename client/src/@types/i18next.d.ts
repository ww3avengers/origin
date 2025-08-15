import { defaultNS, resources } from '~/locales/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources.en & {
      agent: {
        run: {
          active: string;
          finished: string;
        };
        step: {
          pending: string;
          running: string;
          done: string;
          failed: string;
          canceled: string;
        };
        panel: {
          title: string;
          empty: string;
        };
        actions?: {
          copy?: string;
          retry?: string;
          cancel?: string;
          expandDetails?: string;
        };
      };
      landing: {
        hero: {
          title: string;
          subtitle: {
            line1: string;
            line2?: string;
            highlight: string;
          };
          description: string;
          image_alt: string;
          trustedBy: string;
          logos: {
            sap: string;
            microsoft: string;
            googleCloud: string;
            openai: string;
            grok: string;
          };
          cta: {
            primary: string;
            secondary: string;
            secondaryAria: string;
          };
        };
        features: {
          title: string;
          subtitle: string;
          cta: string;
          categories: {
            all?: string;
            code?: string;
            analytics?: string;
            ai: string;
            collaboration: string;
            integration: string;
            security: string;
          };
          ai?: { title: string; description: string };
          security?: { title: string; description: string };
          collaboration?: { title: string; description: string };
          integration?: { title: string; description: string };
          code?: { title: string; description: string };
          analytics?: { title: string; description: string };
        };
        faq: {
          title: string;
          subtitle: string;
          description: string;
          more_questions: string;
          contact_us: string;
          q1?: string;
          a1?: string;
          q2?: string;
          a2?: string;
          q3?: string;
          a3?: string;
          q4?: string;
          a4?: string;
          q5?: string;
          a5?: string;
          q6?: string;
          a6?: string;
          q7?: string;
          a7?: string;
        };
      };
      comparison: {
        title: string;
        subtitle: string;
        features?: string;
        solutions: {
          sigmacode: string;
          chatgpt: string;
        };
        featuresList?: {
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
