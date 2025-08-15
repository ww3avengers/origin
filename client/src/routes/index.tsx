import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import {
  Login,
  VerifyEmail,
  Registration,
  ResetPassword,
  ApiErrorWatcher,
  TwoFactorScreen,
  RequestPasswordReset,
} from '~/components/Auth';
import LandingPage from '~/components/Landing/LandingPage';
const Blog = lazy(() => import('~/components/Marketing/Blog'));
const BlogPost = lazy(() => import('~/components/Marketing/BlogPost'));
const Careers = lazy(() => import('~/components/Marketing/Careers'));
const Pricing = lazy(() => import('~/components/Marketing/Pricing'));
const Status = lazy(() => import('~/components/Marketing/Status'));
const Changelog = lazy(() => import('~/components/Marketing/Changelog'));
const About = lazy(() => import('~/components/Marketing/About'));
// Fallback-Stubs: Falls Marketing/Docs & Marketing/Api (noch) nicht existieren
// verhindern diese Lazy-Stubs Build-Fehler, bis echte Seiten verfügbar sind.
const Docs = lazy(async () => ({ default: () => <div /> }));
const Api = lazy(async () => ({ default: () => <div /> }));
const AtlasPage = lazy(() => import('~/features/atlas/AtlasPage'));
import Privacy from '~/components/Legal/Privacy';
import Terms from '~/components/Legal/Terms';
import Imprint from '~/components/Legal/Imprint';
import Contact from '~/components/Legal/Contact';
import { OAuthSuccess, OAuthError } from '~/components/OAuth';
import { AuthContextProvider } from '~/hooks/AuthContext';
import RouteErrorBoundary from './RouteErrorBoundary';
import StartupLayout from './Layouts/Startup';
import LoginLayout from './Layouts/Login';
import dashboardRoutes from './Dashboard';
import ShareRoute from './ShareRoute';
import ChatRoute from './ChatRoute';
import Search from './Search';
import Root from './Root';
import RequireAdmin from './RequireAdmin';
import { subscriptionRoutes } from '~/features/subscription';
import { referralRoutes } from '~/features/referral/routes';
import AnalyticsDashboard from '~/features/analytics/AnalyticsDashboard';
import BotDashboard from '~/features/analytics/BotDashboard';
import AdminSettings from '~/features/analytics/AdminSettings';
import LangLayout from './LangLayout';

const RedirectToDe: React.FC = () => {
  const loc = useLocation();
  return <Navigate to={`/de${loc.pathname}${loc.search}${loc.hash}`} replace={true} />;
};

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  // Language-prefixed routes: /de/* and /en/* render the same public pages
  {
    path: '/:lng',
    element: <LangLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'blog',
        element: (
          <Suspense fallback={null}>
            <Blog />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'blog/:slug',
        element: (
          <Suspense fallback={null}>
            <BlogPost />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'careers',
        element: (
          <Suspense fallback={null}>
            <Careers />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'status',
        element: (
          <Suspense fallback={null}>
            <Status />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'changelog',
        element: (
          <Suspense fallback={null}>
            <Changelog />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={null}>
            <About />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'pricing',
        element: (
          <Suspense fallback={null}>
            <Pricing />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'docs',
        element: (
          <Suspense fallback={null}>
            <Docs />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'docs/api',
        element: (
          <Suspense fallback={null}>
            <Api />
          </Suspense>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      { path: 'privacy', element: <Privacy />, errorElement: <RouteErrorBoundary /> },
      { path: 'terms', element: <Terms />, errorElement: <RouteErrorBoundary /> },
      { path: 'imprint', element: <Imprint />, errorElement: <RouteErrorBoundary /> },
      { path: 'contact', element: <Contact />, errorElement: <RouteErrorBoundary /> },
      {
        path: 'share/:shareId',
        element: <ShareRoute />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'oauth',
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'success', element: <OAuthSuccess /> },
          { path: 'error', element: <OAuthError /> },
        ],
      },
    ],
  },
  // Public routes (without prefix)
  {
    path: '/',
    element: <Navigate to="/de" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/blog',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/blog/:slug',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/careers',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/status',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/changelog',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/about',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/pricing',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/docs',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/docs/api',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/privacy',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/terms',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/imprint',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/contact',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/share/:shareId',
    element: <RedirectToDe />,
    errorElement: <RouteErrorBoundary />,
  },
  // Legacy chat aliases -> redirect to new app chat routes
  {
    path: '/c',
    element: <Navigate to="/app/c/new" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/c/new',
    element: <Navigate to="/app/c/new" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/c/:conversationId',
    element: <Navigate to="/app/c/:conversationId" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/oauth',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'success',
        element: <OAuthSuccess />,
      },
      {
        path: 'error',
        element: <OAuthError />,
      },
    ],
  },
  // Auth routes
  {
    element: (
      <AuthContextProvider>
        <StartupLayout />
      </AuthContextProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/auth/register',
        element: <Registration />,
      },
      {
        path: '/auth/forgot-password',
        element: <RequestPasswordReset />,
      },
      {
        path: '/auth/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/auth/verify',
        element: <VerifyEmail />,
      },
      {
        path: '/login',
        element: <LoginLayout />,
        children: [
          {
            index: true,
            element: <Login />,
          },
          {
            path: '2fa',
            element: <TwoFactorScreen />,
          },
        ],
      },
    ],
  },
  // Protected routes
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      dashboardRoutes,
      {
        path: '/dashboard',
        element: <Navigate to="/d/prompts" replace={true} />,
      },
      ...referralRoutes,
      {
        path: '/app',
        element: <Root />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/c/new" replace={true} />,
          },
          {
            path: 'c/:conversationId?',
            element: <ChatRoute />,
          },
          {
            path: 'search',
            element: <Search />,
          },
          {
            path: 'analytics',
            element: <AnalyticsDashboard />,
          },
          {
            path: 'analytics/bots',
            element: (
              <RequireAdmin>
                <BotDashboard />
              </RequireAdmin>
            ),
          },
          {
            path: 'analytics/admin',
            element: (
              <RequireAdmin>
                <AnalyticsDashboard />
              </RequireAdmin>
            ),
          },
          {
            path: 'analytics/admin/settings',
            element: (
              <RequireAdmin>
                <AdminSettings />
              </RequireAdmin>
            ),
          },
          {
            // gated below via feature flag
          },
          ...(import.meta.env.VITE_FEATURE_ATLAS
            ? [
                {
                  path: 'atlas',
                  element: (
                    <RequireAdmin>
                      <Suspense fallback={null}>
                        <AtlasPage />
                      </Suspense>
                    </RequireAdmin>
                  ),
                },
              ]
            : []),
        ],
      },
    ],
  },
]);
