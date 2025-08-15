import React from 'react';
import { Spinner } from '@librechat/client';
import { cn } from '~/utils';

export type InlineSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface InlineSpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: InlineSpinnerSize;
  ariaLabel?: string;
}

/*
 * Zentraler Inline-Loader für Buttons, Menüs und kompakte UI-Stellen.
 * Vereinheitlicht ARIA, Größen und Klassen – nutzt intern den bestehenden Spinner.
 */
const InlineSpinner = ({ size = 'sm', ariaLabel, className, ...rest }: InlineSpinnerProps) => {
  const sizeClass =
    size === 'xs' ? 'size-4' : size === 'md' ? 'size-6' : size === 'lg' ? 'size-8' : 'size-5';

  const ariaProps = ariaLabel ? { 'aria-label': ariaLabel } : {};

  return (
    <span
      role="status"
      aria-live="polite"
      {...ariaProps}
      className={cn('inline-flex', className)}
      {...rest}
    >
      <Spinner className={cn(sizeClass)} />
    </span>
  );
};

export default InlineSpinner;
