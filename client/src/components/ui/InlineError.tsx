import React from 'react';
import { cn } from '~/utils';

export type InlineErrorProps = {
  message?: React.ReactNode;
  className?: string;
  role?: 'alert' | 'status';
  variant?: 'subtle' | 'solid';
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  ariaLabel?: string;
  children?: React.ReactNode;
};

/**
 * InlineError: ARIA-konforme Fehlermeldung für konsistente UI.
 * - Varianten: subtle (Standard, dezent), solid (prominenter)
 * - Optionales Icon & Dismiss-Button
 */
const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className,
  role = 'alert',
  variant = 'subtle',
  icon,
  dismissible = false,
  onDismiss,
  ariaLabel,
  children,
}) => {
  const base =
    variant === 'solid'
      ? 'rounded border border-red-500/30 bg-red-500/15 text-red-200'
      : 'rounded border border-red-400/40 bg-red-500/10 text-red-200';

  return (
    <div
      className={cn('relative px-4 py-3 text-sm', base, className)}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-2">
        {icon ? (
          <span className="mt-0.5 shrink-0" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {message ? <div className="break-words">{message}</div> : null}
          {children}
        </div>
        {dismissible ? (
          <button
            type="button"
            onClick={onDismiss}
            className="-mr-1 ml-auto inline-flex rounded p-1 text-red-300 hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/40"
            aria-label={ariaLabel ?? 'Dismiss error'}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default InlineError;
