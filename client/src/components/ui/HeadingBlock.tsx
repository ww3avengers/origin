import React, { FC, PropsWithChildren } from 'react';
import { HEADING_SPACING } from '@/components/Landing/Sections/LandingSection';

export interface HeadingBlockProps {
  id?: string;
  align?: 'center' | 'left' | 'right';
  ariaLabel?: string;
  className?: string;
}

/**
 * HeadingBlock
 *
 * Standardisierter Wrapper für Abschnitts-Headings.
 * - Wendet zentrale vertikale Abstände über HEADING_SPACING an
 * - Optional zentriert/links/rechts ausrichten
 * - Kann mit zusätzlicher className erweitert werden
 */
const HeadingBlock: FC<PropsWithChildren<HeadingBlockProps>> = ({
  id,
  align = 'center',
  ariaLabel,
  className,
  children,
}) => {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const combined = `${HEADING_SPACING} ${alignClass}${className ? ` ${className}` : ''}`;

  return (
    <div id={id} aria-label={ariaLabel} className={combined}>
      {children}
    </div>
  );
};

export default HeadingBlock;
