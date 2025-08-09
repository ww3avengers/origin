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
        const reportWebVitals = (metric: Metric) => {
          // Sende Metriken an Ihren Analytics-Service
          console.log(metric);
          
          switch (metric.name) {
            case 'FCP':
              console.log(`First Contentful Paint: ${Math.round(metric.value)}ms`);
              break;
            case 'LCP':
              console.log(`Largest Contentful Paint: ${Math.round(metric.value)}ms`);
              break;
            case 'CLS':
              console.log(`Cumulative Layout Shift: ${metric.value}`);
              break;
            case 'FID': // FID ist veraltet, wird durch INP ersetzt
            case 'INP':
              console.log(`Interaction to Next Paint: ${Math.round(metric.value)}ms`);
              break;
            case 'TTFB':
              console.log(`Time to First Byte: ${Math.round(metric.value)}ms`);
              break;
            default:
              console.log(`${metric.name}: ${Math.round(metric.value)}`);
              break;
          }
        };

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

    const links = preconnectLinks.map(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    });

    // Service Worker Registrierung
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful');
          })
          .catch(error => {
            console.error('ServiceWorker registration failed: ', error);
          });
      });
    }

    // Starte die Messung
    measureWebVitals();

    // Cleanup-Funktion
    return () => {
      // Entferne die hinzugefügten Links
      links.forEach(link => {
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
