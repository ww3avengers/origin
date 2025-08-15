import React from 'react';

export type BrandIconProps = {
  className?: string;
  title?: string;
};

// Design: minimalistische, weiche Formen mit subtilen Verläufen.
// Alle Icons nutzen currentColor und optionale Gradients für Tailwind-gefärbte Container.

export const BrandCore: React.FC<BrandIconProps> = ({ className, title = 'Core AI' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <defs>
      <radialGradient id="coreG" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
        <stop offset="70%" stopColor="currentColor" stopOpacity="0.5" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="6.5" fill="url(#coreG)" />
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.25" />
  </svg>
);

// AI Agent Icon: minimalistischer Avatar mit sanftem Glow
export const BrandAgent: React.FC<BrandIconProps> = ({ className, title = 'AI Agent' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <defs>
      <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="blur" />
      </filter>
    </defs>
    {/* No background/frame to keep icon ultra-clean */}
    {/* Eyes */}
    <circle cx="9.5" cy="11" r="0.9" fill="currentColor" />
    <circle cx="14.5" cy="11" r="0.9" fill="currentColor" />
    {/* Mouth/visor */}
    <path
      d="M9 14c1.1 0 2 .7 3 .7s1.9-.7 3-.7"
      stroke="currentColor"
      strokeOpacity="0.7"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Small antenna */}
    <path d="M12 5.2v-1.2" stroke="currentColor" strokeLinecap="round" />
    <circle cx="12" cy="3.5" r="0.6" fill="currentColor" />
  </svg>
);

export const BrandVector: React.FC<BrandIconProps> = ({ className, title = 'Vector DB' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <path
      d="M5 7.5c0-1 3-2.5 7-2.5s7 1.5 7 2.5v9c0 1-3 2.5-7 2.5s-7-1.5-7-2.5v-9Z"
      stroke="currentColor"
      strokeOpacity="0.9"
    />
    <path d="M5 10c0 1 3 2 7 2s7-1 7-2" stroke="currentColor" strokeOpacity="0.6" />
    <path d="M5 13c0 1 3 2 7 2s7-1 7-2" stroke="currentColor" strokeOpacity="0.4" />
  </svg>
);

export const BrandCache: React.FC<BrandIconProps> = ({ className, title = 'Cache' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <rect x="4.5" y="5.5" width="15" height="13" rx="3.5" stroke="currentColor" />
    <path d="M7 9.5h10" stroke="currentColor" strokeOpacity="0.8" />
    <path d="M7 12.5h7" stroke="currentColor" strokeOpacity="0.6" />
    <path d="M7 15.5h5" stroke="currentColor" strokeOpacity="0.4" />
  </svg>
);

export const BrandLLM: React.FC<BrandIconProps> = ({ className, title = 'LLM' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <path
      d="M12 3.5c-4.694 0-8.5 3.806-8.5 8.5s3.806 8.5 8.5 8.5 8.5-3.806 8.5-8.5-3.806-8.5-8.5-8.5Z"
      stroke="currentColor"
    />
    <path d="M7.5 12h9" stroke="currentColor" strokeOpacity="0.7" />
    <path d="M12 7.5v9" stroke="currentColor" strokeOpacity="0.7" />
  </svg>
);

export const BrandFunc: React.FC<BrandIconProps> = ({ className, title = 'Functions' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <path
      d="M7.5 6.5h9l-6 5 6 6h-9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BrandBilling: React.FC<BrandIconProps> = ({ className, title = 'Billing' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <rect x="4.5" y="6.5" width="15" height="11" rx="2.5" stroke="currentColor" />
    <path d="M6 10h12" stroke="currentColor" />
    <circle cx="9" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
  </svg>
);

export const BrandTool: React.FC<BrandIconProps> = ({ className, title = 'Tool' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <path
      d="M6 12c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z"
      stroke="currentColor"
    />
    <path d="M10 10.5h4v3h-4z" stroke="currentColor" />
  </svg>
);

// Sigma-Icon: minimalistische, geometrische Sigma-Form
export const BrandSigma: React.FC<BrandIconProps & { gradient?: boolean }> = ({
  className,
  title = 'Sigma',
  gradient = false,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>{title}</title>
    <defs>
      <filter id="sigmaGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
      </filter>
      <linearGradient
        id="sigmaGradient"
        x1="0"
        y1="0"
        x2="24"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#6366F1" /> {/* indigo-500 */}
        <stop offset="50%" stopColor="#60A5FA" /> {/* blue-400 */}
        <stop offset="100%" stopColor="#22D3EE" /> {/* cyan-400 */}
      </linearGradient>
    </defs>
    {/* Glow layer */}
    <path
      d="M17.5 5.5H7.2l5.3 6.5-5.3 6.5H17.5v-3H12l3.8-4.6L12 8.5h5.5v-3Z"
      stroke={gradient ? 'url(#sigmaGradient)' : 'currentColor'}
      strokeOpacity={gradient ? 0.45 : 0.35}
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      filter="url(#sigmaGlow)"
    />
    {/* Main stroke */}
    <path
      d="M17.5 5.5H7.2l5.3 6.5-5.3 6.5H17.5v-3H12l3.8-4.6L12 8.5h5.5v-3Z"
      stroke={gradient ? 'url(#sigmaGradient)' : 'currentColor'}
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const BRAND_ICON_MAP = {
  core: BrandCore,
  vector: BrandVector,
  cache: BrandCache,
  llm: BrandLLM,
  func: BrandFunc,
  billing: BrandBilling,
  tool: BrandTool,
  sigma: BrandSigma,
  agent: BrandAgent,
};

export type BrandIconKey = keyof typeof BRAND_ICON_MAP;

export default BRAND_ICON_MAP;
