import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBrandTitleProps {
  left?: string;
  right?: string;
  className?: string;
}

export const AnimatedBrandTitle: React.FC<AnimatedBrandTitleProps> = ({
  left = 'SIGMACODE',
  right = 'AI',
  className,
}) => {
  const full = `${left} ${right}`;
  return (
    <span
      aria-label={full}
      className={cn(
        'relative mx-auto w-fit font-extrabold leading-tight tracking-tight',
        'text-[clamp(2.75rem,6vw,5rem)]',
        className,
      )}
      style={{
        color: '#cfd8e3', // Grauer Text
        textShadow: '0 0 0.5px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.35)', // Grauer Rand
      }}
    >
      <span>{left}</span>
      <span> </span>
      <span>{right}</span>
    </span>
  );
};

export default AnimatedBrandTitle;
