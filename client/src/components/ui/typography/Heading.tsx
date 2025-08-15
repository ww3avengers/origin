import React from 'react';
import { cn } from '@/lib/utils';

export type HeadingSize = 'h1' | 'h2' | 'h3';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3';
  size?: HeadingSize;
}

/**
 * Einheitliche Heading-Komponente für Landing-Sections
 * - h1/h2/h3 mit konsistenter Skala und Abständen
 */
export const Heading: React.FC<HeadingProps> = ({
  as,
  size = 'h2',
  className,
  children,
  ...rest
}) => {
  const Tag = (as ?? size) as 'h1' | 'h2' | 'h3';
  const base = 'font-semibold text-white tracking-tight';
  const map: Record<HeadingSize, string> = {
    h1: 'text-4xl md:text-5xl leading-tight',
    h2: 'text-3xl md:text-4xl leading-tight',
    h3: 'text-2xl md:text-3xl leading-snug',
  };
  return (
    <Tag className={cn(base, map[size], className)} {...rest}>
      {children}
    </Tag>
  );
};

export default Heading;
