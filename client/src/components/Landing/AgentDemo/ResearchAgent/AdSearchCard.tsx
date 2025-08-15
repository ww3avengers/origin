import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export interface AdSearchCardProps {
  imageSrc?: string;
  imageAlt?: string;
  headline: string;
  description: string;
  siteHost: string;
  ctaLabel: string;
  ctaHref: string;
  badgeLabel: string;
  onImpression?: () => void;
  onClick?: () => void;
  reducedMotion?: boolean;
}

/**
 * Dezent gestaltete Anzeige-Karte im Stil eines Suchergebnisses.
 * Visuell an die vorhandenen Ergebnis-Karten angepasst.
 */
export const AdSearchCard: React.FC<AdSearchCardProps> = ({
  imageSrc,
  imageAlt = 'Werbung',
  headline,
  description,
  siteHost,
  ctaLabel,
  ctaHref,
  badgeLabel,
  onImpression,
  onClick,
  reducedMotion,
}) => {
  React.useEffect(() => {
    onImpression?.();
  }, [onImpression]);

  const Card = reducedMotion ? 'div' : motion.div;
  const [hideImg, setHideImg] = React.useState(false);

  return (
    <Card
      className="group relative rounded-md border border-gray-800 bg-gray-800/60 p-2 focus-within:ring-1 focus-within:ring-cyan-400/50"
      initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reducedMotion ? undefined : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      role="article"
      aria-label={headline}
    >
      {/* Badge "Anzeige" */}
      <div className="mb-1">
        <span className="inline-flex items-center gap-1 rounded-sm border border-yellow-400/30 bg-yellow-400/10 px-1.5 py-[2px] text-[10px] text-yellow-300">
          {badgeLabel}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 font-medium text-blue-300">{headline}</div>
          <div className="line-clamp-2 text-gray-400">{description}</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-[11px] text-gray-500">{siteHost}</div>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 focus:outline-none"
            >
              {ctaLabel}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {imageSrc && !hideImg ? (
          <div className="shrink-0 self-start overflow-hidden rounded-sm border border-gray-700 bg-gray-900/50">
            <img
              src={imageSrc}
              alt={imageAlt}
              width={64}
              height={64}
              loading="lazy"
              className="h-16 w-16 object-cover"
              onError={() => setHideImg(true)}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default AdSearchCard;
