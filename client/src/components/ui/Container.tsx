import React, { PropsWithChildren, HTMLAttributes } from 'react';
import { cn } from '~/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
  /**
   * Optionaler, moderner Rahmen (Apple/Notion-Style):
   * abgerundet, dezente Border, leichter Shadow, semitransparenter Hintergrund
   */
  framed?: boolean;
  /**
   * Entfernt horizontales Padding vollständig (full-bleed bis zum Rahmen/Viewport)
   */
  bleed?: boolean;
}

/**
 * Einheitlicher Seiten-Container für fixe Maximalbreite + responsive Padding.
 * - Max-Breite bewusst konservativ gehalten, um große Screens zu zähmen
 * - Konsistente Side-Paddings über Breakpoints hinweg
 * - Kann als anderer Tag gerendert werden (as)
 */
const Container = ({
  as,
  className,
  children,
  framed = false,
  bleed = false,
  ...rest
}: PropsWithChildren<ContainerProps>) => {
  const Tag: any = as || 'div';
  return (
    <Tag
      className={cn(
        // Breite & Zentrierung
        'relative mx-auto w-full',
        // Fixe, moderne Max-Breite (ca. 1200px) mit leichtem Spielraum darüber
        // Screen-abhängige Varianten, um auf sehr großen Displays nicht zu breit zu werden
        '3xl:max-w-[1320px] max-w-[1200px] 2xl:max-w-[1280px]',
        // Minimales Seiten-Padding auf Mobile (2 = 0.5rem/8px) für maximale Ausnutzung der Bildschirmbreite
        !bleed && 'px-2 sm:px-6 lg:px-8',
        // Optionaler Rahmen-Stil
        framed && [
          'rounded-2xl border',
          'border-black/5 dark:border-white/10',
          'shadow-sm shadow-black/5 dark:shadow-black/20',
        ],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Container;
