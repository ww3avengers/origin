import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '~/hooks/AuthContext';
import { SystemRoles } from 'librechat-data-provider';

/**
 * Schützt Admin-Routen. Wenn der Nutzer kein Admin ist, wird auf /app umgeleitet.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, roles } = useAuthContext();
  const location = useLocation();

  const isAdmin = Boolean(roles?.[SystemRoles.ADMIN]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
