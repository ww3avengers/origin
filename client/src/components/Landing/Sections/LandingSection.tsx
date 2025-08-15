import { FC, PropsWithChildren, HTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cn } from '~/utils';
import { Section } from '~/components/ui/Section';

// Einheitlicher In-View-Margin für alle Landing-Sections (oben früher, unten später)
export const IN_VIEW_MARGIN = '-100px 0px -80px 0px';
export const IN_VIEW_ONCE = { once: true as const, margin: IN_VIEW_MARGIN };
/**
 * Zentrale Utility für Heading-Wrapper-Abstände in Landing-Sections.
 * Nutzung: className={`${HEADING_SPACING} text-center`}
 */
export const HEADING_SPACING = 'mt-10 mb-12 md:mb-14 lg:mb-16';

interface LandingSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'data-section'> {
  id?: string;
  containerClassName?: string;
  bleed?: boolean;
  framed?: boolean;
  'aria-label'?: string;
  'data-section'?: string;
  className?: string;
  dataSection?: string;
  ariaLabel?: string;
  /** Reicht die Padding-Stufe an `Section` durch (default: 'lg') */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Optionale Divider-Position, Standard: bottom */
  divider?: 'none' | 'top' | 'bottom' | 'both';
  /** Subtiler Top-Glow mit Brand-Purple als radialer Hintergrund */
  accentTopGlow?: boolean;
}

/**
 * Einheitlicher Section-Wrapper für die Landingpage.
 * - Konsistente vertikale Abstände
 * - Einheitlicher Container (max-width, paddings)
 * - A11y via aria-label optional
 */
const LandingSection = forwardRef<HTMLElement, PropsWithChildren<LandingSectionProps>>(
  (props, ref) => {
    const {
      id,
      className,
      containerClassName,
      ariaLabel,
      bleed = false,
      framed = false,
      dataSection,
      padding = 'lg',
      children,
      // explizit das Attribut 'data-section' auslesen und zu dataSection mappen
      ['data-section']: dataSectionAttr,
      divider = 'bottom',
      accentTopGlow = false,
      ...rest
    } = props as LandingSectionProps & { ['data-section']?: string };

    const resolvedDataSection = dataSectionAttr || dataSection;
    // Interne Ref, um das tatsächliche DOM-Element zu inspizieren und mit forwarded ref zu mergen
    const innerRef = useRef<HTMLElement | null>(null);
    const setRefs = (node: HTMLElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref && 'current' in (ref as any)) (ref as any).current = node;
    };
    // Dev-Only: tatsächliche computed position loggen
    useEffect(() => {
      if (process.env.NODE_ENV !== 'development') return;
      const el = innerRef.current;
      if (!el) return;
      const pos = window.getComputedStyle(el).position;
      if (!['relative', 'absolute', 'fixed', 'sticky'].includes(pos)) {
        // Präzisere Diagnose, falls ein Ancestor die Position beeinflusst
        // eslint-disable-next-line no-console
        console.warn('[LandingSection] Non-positioned target detected:', {
          id,
          dataSection: resolvedDataSection,
          position: pos,
          className,
        });
      }
    }, [id, resolvedDataSection, className]);
    // Sicherstellen, dass die Scroll-Targets für Framer Motion NICHT static positioniert sind.
    // Merge eventuell übergebene style-Props mit position: 'relative'.
    const mergedStyle = {
      position: 'relative' as const,
      ...(rest as any)?.style,
    };
    return (
      <Section
        id={id}
        ref={setRefs as any}
        aria-label={ariaLabel}
        role={ariaLabel ? 'region' : undefined}
        className={cn(
          'relative overflow-x-clip',
          accentTopGlow && 'bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(var(--rgb-brand-purple),0.05),transparent)]',
          className,
        )}
        data-section={resolvedDataSection}
        padding={padding}
        bleed={bleed}
        framed={framed}
        divider={divider}
        innerClassName={cn('', containerClassName)}
        style={mergedStyle}
        {...(rest as any)}
      >
        {children}
      </Section>
    );
  },
);

export default LandingSection;
