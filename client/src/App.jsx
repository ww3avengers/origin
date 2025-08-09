import { memo, useMemo } from 'react';
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
  const queryClient = useMemo(() => new QueryClient({
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
  }), []);

  // Load theme from environment variables if available
  const envTheme = useMemo(() => getThemeFromEnv(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <LiveAnnouncer>
          <DndProvider backend={HTML5Backend}>
            <ThemeProvider initialTheme={envTheme?.theme} themeRGB={envTheme?.themeRGB}>
              <ToastProvider>
                <RadixToast.Provider>
                  <RouterProvider router={router} />
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
const App = () => (
  <AppContent />
);

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
