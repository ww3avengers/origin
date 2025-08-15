import { cn } from '~/utils';
import { forwardRef, ReactNode } from 'react';
import Container from './Container';

// Define the base props that don't include data attributes
type BaseSectionProps = Omit<React.HTMLAttributes<HTMLElement>, 'as'> & {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'default' | 'muted' | 'primary' | 'secondary' | 'dark';
  /** optional Klassen für den inneren Container */
  innerClassName?: string;
  /** reicht an Container durch (vereinheitlichte Max-Breite/Padding) */
  bleed?: boolean;
  /** reicht an Container durch (optional gerahmter Stil) */
  framed?: boolean;
  /** optionale Trennlinie oben/unten */
  divider?: 'none' | 'top' | 'bottom' | 'both';
};

// Define the data section props separately
type DataSectionProps = {
  'data-section'?: string;
  dataSection?: string;
};

// Create a type that excludes the data props from the base props
type SectionProps = Omit<BaseSectionProps, 'data-section' | 'dataSection'> &
  (
    | {
        'data-section'?: string;
        dataSection?: never;
      }
    | {
        'data-section'?: never;
        dataSection?: string;
      }
  );

/**
 * Zentrale Section-Komponente für konsistente Abstände und Layouts
 * @example
 * <Section id="features" dataSection="Features" ariaLabel="Features">
 *   <h2>Unsere Features</h2>
 *   <p>Entdecke unsere Funktionen</p>
 * </Section>
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    id,
    children,
    className,
    as: Component = 'section',
    padding = 'lg',
    background = 'default',
    innerClassName,
    bleed = false,
    framed = false,
    'data-section': dataSectionProp,
    dataSection,
    'aria-label': ariaLabelProp,
    divider = 'none',
    ...restProps
  }: SectionProps,
  ref,
) {
  // Extract any remaining props that should be spread
  const { 'aria-label': _, ...props } = restProps as any;
  const paddingClasses = {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-20',
    xl: 'py-20 md:py-24',
    '2xl': 'py-24 md:py-32',
  };

  const backgroundClasses = {
    default: 'bg-transparent',
    muted: 'bg-gray-50 dark:bg-gray-800/50',
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20',
    dark: 'bg-gray-900 text-white',
  };

  // Avoid enormous union literal types in cn() by widening to string
  const padClass: string = paddingClasses[padding] as string;
  const bgClass: string = backgroundClasses[background] as string;
  const sectionClassName: string = cn(
    'relative w-full overflow-hidden',
    padClass,
    bgClass,
    className as string,
  ) as string;
  const hasTop: boolean = divider === 'top' || divider === 'both';
  const hasBottom: boolean = divider === 'bottom' || divider === 'both';
  // Precompute attributes to avoid complex unions in JSX
  const ariaLabelVal: string | undefined = ariaLabelProp as string | undefined;
  const dataSectionVal: string | undefined = (dataSectionProp || dataSection) as string | undefined;
  const spreadHtmlProps = props as React.HTMLAttributes<HTMLElement>;

  // Precompute divider nodes to further simplify JSX
  const topDivider: React.ReactNode = hasTop ? (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px" aria-hidden>
      <div className="3xl:max-w-[1320px] mx-auto h-[0.5px] w-full max-w-[1200px] bg-gradient-to-r from-transparent via-neutral-200/55 to-transparent dark:via-neutral-700/55 2xl:max-w-[1280px]" />
    </div>
  ) : null;
  const bottomDivider: React.ReactNode = hasBottom ? (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px" aria-hidden>
      <div className="3xl:max-w-[1320px] mx-auto h-[0.5px] w-full max-w-[1200px] bg-gradient-to-r from-transparent via-neutral-200/55 to-transparent dark:via-neutral-700/55 2xl:max-w-[1280px]" />
    </div>
  ) : null;
  // Precompute container class to avoid cn() union inflation
  // Also, if framed and a divider is rendered at top/bottom, disable that border side to avoid double lines
  const containerClass: string | undefined = (() => {
    const classes: string[] = [];
    // Ensure content sits above hairline dividers
    classes.push('relative z-[1]');
    if (innerClassName) classes.push(innerClassName as string);
    if (framed && hasTop) classes.push('border-t-0');
    if (framed && hasBottom) classes.push('border-b-0');
    return classes.length ? classes.join(' ') : undefined;
  })();
  // Precompute component props and narrow polymorphic Component to any to avoid union blowup
  const Comp = Component as any;
  const componentProps: any = {
    id,
    ref: ref as any,
    className: sectionClassName,
    'aria-label': ariaLabelVal,
    'data-section': dataSectionVal,
    style: { position: 'relative', ...(spreadHtmlProps as any)?.style },
    ...spreadHtmlProps,
  };

  return (
    <Comp {...componentProps}>
      <Container bleed={bleed} framed={framed} className={containerClass}>
        {children}
      </Container>
      {/* Optional: Hairline Divider(s) exakt an Container-Ausrichtung angelehnt */}
      {topDivider}
      {bottomDivider}
    </Comp>
  );
});
