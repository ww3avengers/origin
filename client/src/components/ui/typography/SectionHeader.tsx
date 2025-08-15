import React from 'react';
import { cn } from '@/lib/utils';
import { Heading, type HeadingSize } from './Heading';
import { Eyebrow } from './Eyebrow';
import { Subheading } from './Subheading';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right';
  size?: Extract<HeadingSize, 'h2' | 'h3'>;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Einheitlicher Header-Block für Sections
 * - Eyebrow (optional)
 * - H2/H3 Titel
 * - Subheading (optional)
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  align = 'center',
  size = 'h2',
  eyebrow,
  title,
  subtitle,
  className,
  ...rest
}) => {
  const alignCls =
    align === 'center'
      ? 'text-center items-center'
      : align === 'right'
        ? 'text-right items-end'
        : 'text-left items-start';
  return (
    <div className={cn('mx-auto flex w-full max-w-4xl flex-col', alignCls, className)} {...rest}>
      {eyebrow ? (
        <Eyebrow className={cn('mb-2', align !== 'left' && 'mx-auto')}>{eyebrow}</Eyebrow>
      ) : null}
      <Heading size={size} as={size} className={cn('text-white', align !== 'left' && 'mx-auto')}>
        {title}
      </Heading>
      {subtitle ? (
        <Subheading className={cn('mt-2 md:mt-3', align !== 'left' && 'mx-auto')}>
          {subtitle}
        </Subheading>
      ) : null}
    </div>
  );
};

export default SectionHeader;
