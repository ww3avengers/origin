import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface GradientHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
  '2xl': 'text-6xl',
  '3xl': 'text-7xl',
  '4xl': 'text-8xl',
  '5xl': 'text-9xl',
  '6xl': 'text-[6rem]',
  '7xl': 'text-[7rem]',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const GradientHeading = forwardRef<HTMLHeadingElement, GradientHeadingProps>(
  ({
    as: Tag = 'h1',
    size = '4xl',
    weight = 'bold',
    className,
    children,
    ...props
  }, ref) => {
    return (
      <div className="inline-block relative group">
        <Tag
          ref={ref}
          className={cn(
            'font-sans tracking-tight text-transparent bg-clip-text',
            'bg-gradient-to-r from-white via-blue-50 to-blue-300',
            'relative z-10',
            sizeClasses[size],
            weightClasses[weight],
            className
          )}
          style={{
            textShadow: '0 0 8px rgba(147, 197, 253, 0.5)', // Subtiler Leuchteffekt
          }}
          {...props}
        >
          {children}
          {/* Shine Effect - nur auf dem Text */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-blue-200/60 opacity-0 group-hover:opacity-100"
            style={{
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'blur(0.5px)',
              display: 'inline',
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
            }}
            initial={{ x: '-100%' }}
            whileHover={{
              x: '100%',
              transition: { 
                duration: 1.2, 
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0.5
              },
            }}
          />
        </Tag>
      </div>
    );
  }
);

GradientHeading.displayName = 'GradientHeading';

export default GradientHeading;
