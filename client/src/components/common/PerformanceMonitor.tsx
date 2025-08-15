import { useEffect } from 'react';

// Typdefinitionen für Web Vitals
interface Metric {
  name: string;
  value: number;
  id?: string;
  delta?: number;
  entries?: any[];
  rating?: 'good' | 'needs-improvement' | 'poor';
}

const PerformanceMonitor = () => {
  useEffect(() => {
    // Web Vitals Messung
    const measureWebVitals = async () => {
      try {
        // Dynamischer Import für bessere Performance
        const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

        // Report-Funktion für Web Vitals
        const reportWebVitals = (() => {
          // Debug-Flag aus localStorage: setze localStorage.setItem('debug:vitals', '1') zum Aktivieren
          const debug =
            typeof window !== 'undefined' && localStorage.getItem('debug:vitals') === '1';
          // einfache Drosselung pro Metriktyp
          const lastLogAt: Record<string, number> = {};
          const minIntervalMs = 2500; // min. Abstand zwischen Logs pro Typ
          return (metric: Metric) => {
            if (!debug) return;
            const now = Date.now();
            const last = lastLogAt[metric.name] ?? 0;
            if (now - last < minIntervalMs) return;
            lastLogAt[metric.name] = now;

            // kompaktes Logging
            switch (metric.name) {
              case 'FCP':
                console.log(`[Vitals] FCP: ${Math.round(metric.value)}ms`);
                break;
              case 'LCP':
                console.log(`[Vitals] LCP: ${Math.round(metric.value)}ms`);
                break;
              case 'CLS':
                console.log(`[Vitals] CLS: ${metric.value}`);
                break;
              case 'INP':
                console.log(`[Vitals] INP: ${Math.round(metric.value)}ms`);
                break;
              case 'TTFB':
                console.log(`[Vitals] TTFB: ${Math.round(metric.value)}ms`);
                break;
              default:
                console.log(`[Vitals] ${metric.name}: ${Math.round(metric.value)}`);
                break;
            }
          };
        })();

        // Aktiviere alle Web Vitals
        onCLS(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
        onINP(reportWebVitals); // INP ersetzt FID in neueren Versionen
      } catch (error) {
        console.error('Fehler beim Laden von web-vitals:', error);
      }
    };

    // Resource Hints für besseres Ladeverhalten
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
    ];

    const links = preconnectLinks.map((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    });

    // Service Worker Registrierung: nur in Production und wenn sw.js existiert
    if (import.meta && (import.meta as any).env && (import.meta as any).env.PROD) {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
          try {
            const resp = await fetch('/sw.js', { method: 'HEAD' });
            if (!resp.ok) return; // sw.js nicht vorhanden
            await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registration successful');
          } catch (error) {
            console.error('ServiceWorker registration failed: ', error);
          }
        });
      }
    }

    // Starte die Messung
    measureWebVitals();

    // Cleanup-Funktion
    return () => {
      // Entferne die hinzugefügten Links
      links.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  // Diese Komponente rendert nichts (null)
  return null;
};

export default PerformanceMonitor;
