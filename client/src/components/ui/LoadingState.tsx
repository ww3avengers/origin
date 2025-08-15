import React from 'react';
import { Spinner } from '@librechat/client';
import { cn } from '~/utils';

export type LoadingStateProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: React.AriaRole;
};

/**
 * Zentraler Loading-State mit optionalem Label und Fullscreen-Zentrierung.
 * Nutzt den globalen Spinner aus @librechat/client.
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  label,
  size = 'md',
  className,
  fullScreen = false,
  role = 'status',
  'aria-live': ariaLive = 'polite',
}) => {
  const wrapper = fullScreen
    ? 'flex h-screen items-center justify-center'
    : 'inline-flex items-center justify-center';

  const spinnerSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div className={cn(wrapper, className)} aria-live={ariaLive} role={role}>
      <Spinner className={cn('text-text-primary', spinnerSize)} />
      {label ? <span className="ml-2 text-text-primary">{label}</span> : null}
    </div>
  );
};

export default LoadingState;
