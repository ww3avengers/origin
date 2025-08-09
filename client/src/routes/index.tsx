import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
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
import { subscriptionRoutes } from '~/features/subscription';
import { referralRoutes } from '~/features/referral/routes';

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/share/:shareId',
    element: <ShareRoute />,
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
    element: <StartupLayout />,
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
        ],
      },
    ],
  },
]);
