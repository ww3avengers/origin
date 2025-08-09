import { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'circInOut' | 'backIn' | 'backOut' | 'backInOut' | 'anticipate' | number[];

interface AnimationConfig {
  duration: number;
  delay: number;
  ease: AnimationEasing;
}

export interface BlobProps {
  size: string;
  color: string;
  opacity: number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  delay?: number;
  className?: string;
  animation: AnimationConfig;
}

export const Blob: FC<BlobProps> = ({
  size,
  color,
  opacity,
  top,
  right,
  bottom,
  left,
  delay = 0,
  className = '',
  animation,
}) => {
  const reducedMotion = useReducedMotion();
  
  const getPosition = (pos: string | number | undefined): string | number | undefined => {
    if (!pos) return undefined;
    return pos;
  };
  
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-r ${color} ${size} ${className}`}
      style={{
        top: getPosition(top),
        right: getPosition(right),
        bottom: getPosition(bottom),
        left: getPosition(left),
        opacity: reducedMotion ? opacity : 0,
        zIndex: -1,
      }}
      initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={reducedMotion ? {} : { 
        scale: 1, 
        opacity,
        transition: {
          duration: animation.duration,
          delay: animation.delay + (delay || 0),
          ease: animation.ease,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        }
      }}
    />
  );
};

export default Blob;
