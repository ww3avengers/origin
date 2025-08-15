import React from 'react';
import { cn } from '@/lib/utils';

export interface SubheadingProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Subheading: konsistenter Untertitel unter h2/h3
 */
export const Subheading: React.FC<SubheadingProps> = ({ className, children, ...rest }) => {
  return (
    <p className={cn('text-lg leading-relaxed text-white/85 md:text-[18px]', className)} {...rest}>
      {children}
    </p>
  );
};

export default Subheading;
