import { FC, ReactNode } from 'react';
import { cn } from '~/utils';
import { Badge as UIBadge } from '~/components/ui/Badge';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  badgeClassName?: string;
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
  /** Optional id applied to the title <h2> for aria-labelledby references */
  titleId?: string;
  /** Optional variant for the badge to match section theme */
  badgeVariant?: import('~/components/ui/Badge').BadgeVariant;
  /** Optional tone for the badge */
  badgeTone?: import('~/components/ui/Badge').BadgeTone;
  /** Optional leading icon for the badge */
  badgeLeadingIcon?: ReactNode;
};

const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  className,
  titleClassName,
  subtitleClassName,
  badgeClassName,
  align = 'center',
  children,
  titleId,
  badgeVariant = 'system',
  badgeTone = 'soft',
  badgeLeadingIcon,
}) => {
  const alignment = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  return (
    <div className={cn('mx-auto flex max-w-4xl flex-col', alignment, className)}>
      {badge && (
        <UIBadge
          className={cn('mb-3 self-center', badgeClassName)}
          size="sm"
          variant={badgeVariant}
          tone={badgeTone}
          leadingIcon={badgeLeadingIcon}
        >
          {badge}
        </UIBadge>
      )}

      <h2
        id={titleId}
        className={cn(
          'text-3xl font-bold text-white sm:text-4xl',
          'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent',
          'drop-shadow-sm',
          titleClassName,
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p className={cn('mt-3 max-w-3xl text-lg text-gray-300', 'sm:text-xl', subtitleClassName)}>
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
};

export default SectionHeading;
