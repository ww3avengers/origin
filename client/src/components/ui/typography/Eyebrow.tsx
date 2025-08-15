import React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Eyebrow/Overline: kleine, dezente Meta-Zeile über dem Titel
 */
export const Eyebrow: React.FC<EyebrowProps> = ({ className, children, ...rest }) => {
  return (
    <p className={cn('text-xs uppercase tracking-widest text-white/60', className)} {...rest}>
      {children}
    </p>
  );
};

export default Eyebrow;
