import {
  Shield,
  ListChecks,
  Network,
  Building2,
  Code2,
  Paintbrush,
  ShoppingCart,
  Rocket,
  Stethoscope,
  CreditCard,
  Scale,
  Briefcase,
  Bot,
  Orbit,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type IconComponent = ComponentType<LucideProps>;

export const IconRegistry: Record<string, IconComponent> = {
  // system layers
  business: Briefcase,
  agents: Bot,
  mas: Orbit,

  // use cases
  developers: Code2,
  creators: Paintbrush,
  ecommerce: ShoppingCart,
  saas: Rocket,
  healthcare: Stethoscope,
  fintech: CreditCard,
  legal: Scale,
  // keep a generic company icon for business tab as well
  company: Building2,

  // enterprise trust bullets
  sla: Shield,
  sso: Network,
  onprem: Building2,
  dpa: Scale,
  audit: ListChecks,
  support: Briefcase,
};

export const getIcon = (key: keyof typeof IconRegistry): IconComponent => {
  return IconRegistry[key] ?? Shield;
};

export type IconKey = keyof typeof IconRegistry;

// --- Custom SVG Icons used across Landing visuals (SuperTeamSection, etc.) ---
// Note: We keep these as standalone React components instead of adding to IconRegistry,
// since they are not lucide icons and have bespoke SVG paths.

type SvgProps = Omit<LucideProps, 'ref'>;

export const RobotIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
    className={className}
    {...rest}
  >
    <path fill={color} d="M10.5 2.5h3v2h-3z" />
    <rect x="4" y="6" width="16" height="12" rx="3" fill={color} />
    <circle cx="9" cy="12" r="1.6" fill="#0ea5e9" />
    <circle cx="15" cy="12" r="1.6" fill="#0ea5e9" />
    <rect x="9" y="15" width="6" height="1.6" fill="#111827" opacity=".8" />
  </svg>
);

export const SuperAgentIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
    className={className}
    {...rest}
  >
    <defs>
      <linearGradient id="superGradient" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.5l7 3v5.8c0 4.9-3.2 8.7-7 9.7-3.8-1-7-4.8-7-9.7V5.5l7-3z"
      fill="url(#superGradient)"
      opacity="0.22"
    />
    <path
      fill={color}
      d="M12 8.2l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4L12 8.2z"
    />
    <circle
      cx="12"
      cy="12"
      r="6.5"
      fill="none"
      stroke="#0ea5e9"
      strokeOpacity=".6"
      strokeWidth="0.8"
    />
  </svg>
);

export const MCPBrainIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
    <path
      fill={color}
      d="M9.5 5a3 3 0 0 0-3 3c-1.4.2-2.5 1.4-2.5 2.9 0 1 .5 1.9 1.2 2.4-.1.3-.2.6-.2.9 0 1.7 1.3 3 3 3h1V7a2 2 0 0 1 2-2h.5V5H9.5zM14.5 5a3 3 0 0 1 3 3c1.4.2 2.5 1.4 2.5 2.9 0 1-.5 1.9-1.2 2.4.1.3.2.6.2.9 0 1.7-1.3 3-3 3h-1V7a2 2 0 0 0-2-2H12V5h2.5z"
    />
  </svg>
);

export const MCPNoteIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
    <path fill={color} d="M7 3h10a2 2 0 0 1 2 2v10l-4 4H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path fill="#0ea5e9" d="M15 15h4l-4 4v-4z" />
    <rect x="8.5" y="7.5" width="7" height="1.4" rx="0.7" fill="#0ea5e9" opacity=".9" />
    <rect x="8.5" y="10.2" width="6" height="1.2" rx="0.6" fill="#0ea5e9" opacity=".7" />
  </svg>
);

export const MCPCloudIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
    <path fill={color} d="M6.5 18.5h10.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.8-1.2A3.8 3.8 0 0 0 6.5 18.5z" />
  </svg>
);

export const MCPDbIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
    <ellipse cx="12" cy="6" rx="6.5" ry="2.5" fill={color} />
    <path fill={color} d="M5.5 6v8c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6c0 1.4-2.9 2.5-6.5 2.5S5.5 7.4 5.5 6z" />
  </svg>
);

export const MCPToolIcon = ({ className, color = 'currentColor', ...rest }: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
    <path fill={color} d="M21 7.5l-4.2 4.2-2-2L19 5.5a5 5 0 0 0-6.4 6.2l-6 6a2 2 0 0 0 2.8 2.8l6-6A5 5 0 0 0 21 7.5z" />
  </svg>
);
