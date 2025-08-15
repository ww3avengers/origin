import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '~/components/ui';
import { cn } from '~/utils';
import { Badge } from '~/components/ui/Badge';

type LayerCardProps = {
  iconKey: string;
  iconBg: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  link: string;
  linkText: string;
  className?: string;
};

const LayerCard: FC<LayerCardProps> = memo(
  ({
    iconKey,
    iconBg,
    number,
    title,
    subtitle,
    description,
    badges,
    link,
    linkText,
    className,
  }) => {
    const Icon = getIcon(iconKey);

    return (
      <motion.div
        className={cn(
          'relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm',
          'transition-all duration-300 hover:border-white/20 hover:shadow-lg',
          className,
        )}
        whileHover={{ y: -4 }}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
              'bg-gradient-to-br',
              iconBg,
            )}
          >
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>

          <div className="flex-1">
            <span className="text-xs font-medium text-white/60">{number}</span>
            <h3 className="mt-0.5 text-xl font-bold text-white">{title}</h3>
            <p className="mb-3 text-sm text-white/80">{subtitle}</p>

            <p className="mb-4 text-sm text-white/70">{description}</p>

            {badges?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge
                    key={badge}
                    size="sm"
                    tone="soft"
                    variant="system"
                    className="whitespace-nowrap py-1 sm:py-1"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            <a
              href={link}
              className="inline-flex items-center text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
              onClick={(e) => {
                if (link.startsWith('#')) {
                  e.preventDefault();
                  const target = document.querySelector(link);
                  target?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {linkText}
              <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    );
  },
);

LayerCard.displayName = 'LayerCard';

export default LayerCard;
