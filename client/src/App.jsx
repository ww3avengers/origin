import { memo, useMemo, useEffect, useRef } from 'react';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { RouterProvider } from 'react-router-dom';
import * as RadixToast from '@radix-ui/react-toast';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toast, ThemeProvider, ToastProvider } from '@librechat/client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ScreenshotProvider, useApiErrorBoundary } from './hooks';
import { getThemeFromEnv } from './utils/getThemeFromEnv';
import { LiveAnnouncer } from '~/a11y';
import { router } from './routes';
import PerformanceMonitor from './components/common/PerformanceMonitor';

// Memoized AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  const { setError } = useApiErrorBoundary();

  // Memoize queryClient to prevent recreation on every render
  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error?.response?.status === 401) {
              setError(error);
            }
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 Minuten
            cacheTime: 15 * 60 * 1000, // 15 Minuten
          },
        },
      }),
    [],
  );

  // Load theme from environment variables if available
  const envTheme = useMemo(() => getThemeFromEnv(), []);

  console.log('[App] Rendering AppContent');
  if (typeof window !== 'undefined') {
    window.__appRendering = (window.__appRendering || 0) + 1;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <LiveAnnouncer>
          <DndProvider backend={HTML5Backend}>
            <ThemeProvider initialTheme={envTheme?.theme} themeRGB={envTheme?.themeRGB}>
              <ToastProvider>
                <RadixToast.Provider>
                  <RouterProvider router={router} future={{ v7_startTransition: true }} />
                  <Toast />
                  {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                  )}
                  <PerformanceMonitor />
                </RadixToast.Provider>
              </ToastProvider>
            </ThemeProvider>
          </DndProvider>
        </LiveAnnouncer>
      </RecoilRoot>
    </QueryClientProvider>
  );
});

// Main App Component
const App = () => {
  // Nur einmal beim Mount loggen (StrictMode/HMR-safe)
  const didLogRef = useRef(false);
  useEffect(() => {
    // Dev-only: capture stack for Framer Motion scroll container warning
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if (!(window).__FM_WARN_PATCHED__) {
        (window).__FM_WARN_PATCHED__ = true;
        const originalWarn = console.warn;
        console.warn = function (...args) {
          try {
            const msg = String(args?.[0] ?? '');
            if (
              msg.includes('Please ensure that the container has a non-static position')
            ) {
              const stack = new Error('[FM warn stack]').stack;
              originalWarn.apply(console, [
                ...args,
                '\n[Captured Stacktrace to locate source of Framer Motion warning]:',
                stack,
              ]);
              return;
            }
          } catch {}
          return originalWarn.apply(console, args);
        };
      }
    }
    // Dev-only: audit scrollable containers that are still position: static
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // run after paint
      setTimeout(() => {
        try {
          const offenders = [];
          const all = document.querySelectorAll('*');
          all.forEach((el) => {
            const cs = window.getComputedStyle(el);
            if (!cs) return;
            const oy = cs.overflowY;
            const ox = cs.overflowX;
            const isScrollableY = oy === 'auto' || oy === 'scroll' || oy === 'overlay';
            const isScrollableX = ox === 'auto' || ox === 'scroll' || ox === 'overlay';
            if ((isScrollableY || isScrollableX) && cs.position === 'static') {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || undefined,
                className: el.className || undefined,
                overflowY: oy,
                overflowX: ox,
                position: cs.position,
              });
            }
          });
          if (offenders.length) {
            console.warn('[Scroll Audit] Found scrollable elements with static position:', offenders.slice(0, 20));
          } else {
            console.log('[Scroll Audit] No static-position scroll containers detected');
          }
        } catch (e) {
          // noop
        }
      }, 0);
    }
    if (!didLogRef.current) {
      console.log('[App] App component mounted');
      didLogRef.current = true;
    }
  }, []);
  return <AppContent />;
};

// Memoized Audio Component to prevent unnecessary re-renders
const SilentAudio = memo(() => (
  <iframe
    src="/assets/silence.mp3"
    allow="autoplay"
    id="audio"
    title="audio-silence"
    style={{
      display: 'none',
      position: 'absolute',
      visibility: 'hidden',
    }}
    aria-hidden="true"
  />
));

// Root Component
export default () => (
  <ScreenshotProvider>
    <App />
    <SilentAudio />
  </ScreenshotProvider>
);
