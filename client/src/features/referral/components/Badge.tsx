import React from 'react';
import { Badge as UIBadge, type UIBadgeProps } from '~/components/ui/Badge';

type BadgeProps = Omit<UIBadgeProps, 'children'> & { children: React.ReactNode };

// Thin wrapper to keep existing imports working while unifying design
const Badge: React.FC<BadgeProps> = ({ children, size = 'sm', variant = 'brand', tone = 'soft', ...rest }) => {
  return (
    <UIBadge size={size} variant={variant} tone={tone} {...rest}>
      {children}
    </UIBadge>
  );
};

export default Badge;
