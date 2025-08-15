import type { PropsWithChildren } from 'react';

// Minimal No-Op Shim for CI builds where react-helmet-async cannot be resolved
// Provides compatible exports used in the app: HelmetProvider and Helmet

export function HelmetProvider({ children }: PropsWithChildren<{}>) {
  return <>{children}</>;
}

export function Helmet({ children }: PropsWithChildren<Record<string, unknown>>) {
  // Ignore all props; just render children to avoid breaking layouts
  return <>{children}</>;
}
