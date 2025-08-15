import { lazy, Suspense } from 'react';
import { RouteObject, Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { PLANS } from './types/subscription';
import AuthLayout from './components/AuthLayout';
import { Spinner } from '@librechat/client';

// Lazy load components for better performance
const CheckoutForm = lazy(() => import('./components/CheckoutForm'));
const SubscriptionSuccess = lazy(() => import('./components/SubscriptionSuccess'));
const SubscriptionDashboard = lazy(() => import('./components/SubscriptionDashboard'));

// Loading component for route suspense
const RouteLoading = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex items-center justify-center" aria-live="polite" aria-busy="true">
      <Spinner className="h-8 w-8 text-primary" />
      <span className="sr-only">Wird geladen…</span>
    </div>
  </div>
);

// Error boundary for route components
const RouteErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="p-6 text-center">
    <h2 className="mb-2 text-xl font-semibold">Etwas ist schiefgelaufen</h2>
    <p className="mb-4 text-muted-foreground">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
    >
      Erneut versuchen
    </button>
  </div>
);

// Wrapper component to provide AuthLayout props
const BillingLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthLayout title="Abrechnung" subtitle="Verwalte dein Abonnement">
    {children}
  </AuthLayout>
);

export const subscriptionRoutes: RouteObject[] = [
  {
    path: '/billing',
    element: (
      <BillingLayout>
        <Outlet />
      </BillingLayout>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <ErrorBoundary fallbackRender={RouteErrorFallback}>
              <SubscriptionDashboard />
            </ErrorBoundary>
          </Suspense>
        ),
      },
      {
        path: 'upgrade',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <ErrorBoundary fallbackRender={RouteErrorFallback}>
              <CheckoutForm defaultPlan="pro" />
            </ErrorBoundary>
          </Suspense>
        ),
      },
      {
        path: 'upgrade/:plan',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <ErrorBoundary fallbackRender={RouteErrorFallback}>
              <CheckoutForm />
            </ErrorBoundary>
          </Suspense>
        ),
      },
      {
        path: 'success',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <ErrorBoundary fallbackRender={RouteErrorFallback}>
              <SubscriptionSuccess />
            </ErrorBoundary>
          </Suspense>
        ),
      },
    ],
  },
];
