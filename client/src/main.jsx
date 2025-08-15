import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import './locales/i18n';
import App from './App';
import './style.css';
import './mobile.css';
import { ApiErrorBoundaryProvider } from './hooks/ApiErrorBoundaryContext';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/copy-tex.js';
import { HelmetProvider } from 'react-helmet-async';
import { init as initAnalytics, trackVitals } from 'oprojekte-analytics-sdk';
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals';

const container = document.getElementById('root');
// Entferne das Blocking-Loading-Overlay, damit React-Inhalt sichtbar wird
const loading = document.getElementById('loading-container');
if (loading && loading.parentElement === container) {
  try {
    loading.remove();

    console.log('[Bootstrap] Removed #loading-container');
  } catch {
    // Fallback: ausblenden
    loading.style.display = 'none';
  }
}

const root = createRoot(container);

// Analytics & Web Vitals nur in Production aktivieren
if (import.meta && import.meta.env && import.meta.env.PROD) {
  // Initialize Analytics SDK (Consent kann hier dynamisch gemacht werden)
  initAnalytics({
    consent: () => true,
    endpointBase: '/api/analytics/ingest',
  });

  // Web Vitals erfassen und via SDK senden
  try {
    const send = (metric) => {
      try {
        trackVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          navigationType: metric.navigationType,
        });
      } catch (e) {
        console.debug('[Analytics] trackVitals failed', e);
      }
    };
    onCLS(send);
    onLCP(send);
    onINP(send);
    onTTFB(send);
  } catch (e) {
    console.debug('[Analytics] web-vitals unavailable', e);
  }
}

root.render(
  <ApiErrorBoundaryProvider>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ApiErrorBoundaryProvider>,
);
