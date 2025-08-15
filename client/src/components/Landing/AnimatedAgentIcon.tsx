import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RobotIcon } from '~/components/ui/icons';

interface AnimatedAgentIconProps {
  /**
   * Size of the icon in pixels
   * @default 64 for medium, 80 for large
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show the pulsing animation
   * @default true
   */
  animate?: boolean;
  /**
   * Whether to show the hover effects
   * @default true
   */
  interactive?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Visual variant. 'plain' removes gray background and decorative glows.
   * @default 'default'
   */
  variant?: 'default' | 'plain';
  /**
   * Callback when the icon is clicked
   */
  onClick?: () => void;
  /** Enable subtle breathing (scale) animation */
  breath?: boolean;
  /** Enable subtle micro-drift (x/y) animation */
  drift?: boolean;
  /** Show a soft focus/hover glow without solid background */
  focusGlow?: boolean;
  /** Interval between hover sweeps in ms */
  sweepIntervalMs?: number;
  /** Breathing scale range, e.g. [0.985, 1.015] */
  breathScale?: [number, number];
  /** Drift amplitude in px */
  driftPx?: number;
}

/**
 * AnimatedAgentIcon
 * A reusable animated agent icon with hover and focus effects
 * Used in both SuperTeamSection and AgentDemoSection for consistent look and feel
 */
export const AnimatedAgentIcon: React.FC<AnimatedAgentIconProps> = ({
  size = 'md',
  animate = true,
  interactive = true,
  className = '',
  variant = 'default',
  onClick,
  breath = true,
  drift = true,
  focusGlow = true,
  sweepIntervalMs = 4500,
  breathScale = [0.985, 1.015],
  driftPx = 2,
}) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isHovered, setIsHovered] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const isPlain = variant === 'plain';
  
  // Responsive Size mapping using CSS clamp for viewport-adaptive sizing
  // Tuned for mobile (iPhone X and up) to look balanced
  const sizeMap = {
    sm: { icon: 'clamp(44px, 7.5vw, 60px)', padding: 'clamp(10px, 1.8vw, 14px)' },
    md: { icon: 'clamp(56px, 9.5vw, 88px)', padding: 'clamp(12px, 2.2vw, 16px)' },
    lg: { icon: 'clamp(64px, 11vw, 104px)', padding: 'clamp(14px, 2.6vw, 20px)' },
  } as const;
  const { icon: iconSize, padding: paddingSize } = sizeMap[size];
  
  // Trigger sweep animation on hover
  useEffect(() => {
    if (!interactive || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      if (isHovered) {
        setSweepKey(prev => prev + 1);
      }
    }, Math.max(sweepIntervalMs, 1500));
    
    return () => clearInterval(interval);
  }, [isHovered, interactive, prefersReducedMotion, sweepIntervalMs]);

  return (
    <motion.div
      className={`relative ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onHoverStart={() => interactive && setIsHovered(true)}
      onHoverEnd={() => interactive && setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onClick}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      initial={false}
      aria-label="AI Agent"
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      animate={!prefersReducedMotion ? {
        scale: breath ? [1, breathScale[1], 1, breathScale[0], 1] : 1,
        x: drift ? [0, driftPx, 0, -driftPx, 0] : 0,
        y: drift ? [0, Math.max(1, driftPx - 1), 0, -Math.max(1, driftPx - 1), 0] : 0,
      } : undefined}
      transition={!prefersReducedMotion ? {
        scale: breath ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined,
        x: drift ? { duration: 14, repeat: Infinity, ease: 'easeInOut' } : undefined,
        y: drift ? { duration: 16, repeat: Infinity, ease: 'easeInOut' } : undefined,
      } : undefined}
    >
      {/* Outer glow (keine graue Fläche; nur Farbe/Opacity) */}
      {!isPlain && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"
          initial={false}
          animate={{
            scale: isHovered && !prefersReducedMotion ? 1.05 : 1,
            opacity: isHovered && !prefersReducedMotion ? 0.8 : 0.4,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}
      
      {/* Middle glow */}
      {!isPlain && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15"
          initial={false}
          animate={{
            scale: isHovered && !prefersReducedMotion ? 1.1 : 0.9,
            opacity: isHovered && !prefersReducedMotion ? 0.6 : 0.3,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}

      {/* Focus glow (auch in plain-Variante) */}
      {focusGlow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.20) 0%, rgba(99,102,241,0.00) 70%)'
          }}
          initial={false}
          animate={{
            opacity: (isHovered || isFocused) && !prefersReducedMotion ? 0.35 : 0.15,
            scale: (isHovered || isFocused) && !prefersReducedMotion ? 1.06 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-hidden
        />
      )}
      
      {/* Inner container */}
      <motion.div 
        className={`relative flex items-center justify-center rounded-full ${isPlain ? 'bg-transparent shadow-none p-0' : 'bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg p-[var(--pad)]'}`}
        style={{
          // Use CSS variables to compute container size from icon and padding
          ['--icon' as any]: iconSize,
          ['--pad' as any]: paddingSize,
          width: isPlain ? 'var(--icon)' : 'calc(var(--icon) + var(--pad) * 2)',
          height: isPlain ? 'var(--icon)' : 'calc(var(--icon) + var(--pad) * 2)',
        }}
        initial={false}
        animate={{
          scale: isHovered && !prefersReducedMotion ? 1.02 : 1,
          rotate: isHovered && !prefersReducedMotion ? 2 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Inner glow */}
        {!isPlain && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10"
            initial={false}
            animate={{
              opacity: isHovered && !prefersReducedMotion ? 1 : 0.7,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        
        {/* Ripple effect */}
        {animate && !prefersReducedMotion && !isPlain && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-white/5"
            animate={{
              scale: [1, 1.2, 1.4],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeOut',
            }}
          />
        )}
        
        {/* Side sweeps (on hover) */}
        {interactive && !prefersReducedMotion && isHovered && (
          <>
            <motion.span
              key={`sweep-l-${sweepKey}`}
              className="absolute left-[14%] top-1/2 -translate-y-1/2 h-0.5 w-[24%] rounded-full bg-gradient-to-r from-transparent via-sky-300/90 to-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 1, 0], x: [-10, -2, 10] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              aria-hidden
            />
            <motion.span
              key={`sweep-r-${sweepKey}`}
              className="absolute right-[14%] top-1/2 -translate-y-1/2 h-0.5 w-[24%] rounded-full bg-gradient-to-l from-transparent via-sky-300/90 to-transparent"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: [0, 1, 0], x: [10, 2, -10] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              aria-hidden
            />
          </>
        )}
        
        {/* The actual icon */}
        <RobotIcon 
          className={`text-white ${interactive ? 'group-hover:scale-105' : ''} transition-transform duration-200`}
          style={{
            width: 'var(--icon)',
            height: 'var(--icon)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedAgentIcon;
