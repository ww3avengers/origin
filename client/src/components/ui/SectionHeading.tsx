import { FC, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  id?: string;
  /** Controls typography scale */
  size?: 'sm' | 'md' | 'lg';
  /** Subtle tone reduces contrast for a more discreet look */
  tone?: 'default' | 'subtle';
}

export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
  className,
  id,
  size = 'md',
  tone = 'default',
}) => {
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  return (
    <div className={`mx-auto ${align === 'center' ? 'text-center' : ''} ${className || ''}`}>
      <motion.h2
        className={`bg-clip-text font-bold tracking-tight text-transparent ${
          tone === 'subtle'
            ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-400 dark:via-gray-300 dark:to-gray-400'
            : 'bg-gradient-to-r from-white via-blue-50 to-blue-100 dark:from-blue-50 dark:via-blue-100 dark:to-blue-200'
        } ${align === 'left' ? 'text-left' : 'text-center'}`}
        style={{
          fontSize:
            size === 'sm'
              ? 'clamp(1.1rem, 2.2vw, 1.6rem)'
              : size === 'lg'
                ? 'clamp(1.75rem, 4vw, 2.5rem)'
                : 'clamp(1.5rem, 3.5vw, 2.25rem)',
          lineHeight: '1.2',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: baseDuration }}
        id={id}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className={`mx-auto mt-5 max-w-3xl bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-lg text-transparent dark:from-gray-400 dark:via-gray-300 dark:to-gray-400 ${
            align === 'left' ? 'text-left' : 'text-center'
          }`}
          style={{
            fontSize:
              size === 'sm'
                ? 'clamp(0.9rem, 1.3vw, 1rem)'
                : size === 'lg'
                  ? 'clamp(1.05rem, 1.8vw, 1.2rem)'
                  : 'clamp(1rem, 1.6vw, 1.125rem)',
            lineHeight: 1.65,
          }}
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.1 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeading;
