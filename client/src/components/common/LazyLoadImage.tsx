import { FC, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LazyLoadImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholderSrc?: string;
}

const LazyLoadImage: FC<LazyLoadImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderSrc = '/placeholder.svg',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let observer: IntersectionObserver | null = null;
    let img: HTMLImageElement | null = null;
    let cancelled = false;

    const el = containerRef.current;
    if (!el) return;

    const handleLoad = () => {
      if (cancelled) return;
      setImageSrc(src);
      setIsLoaded(true);
    };

    const startLoading = () => {
      // Nur beim Eintreten in Viewport starten
      img = new Image();
      img.addEventListener('load', handleLoad);
      img.src = src;
    };

    try {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            startLoading();
            observer?.disconnect();
            observer = null;
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(el);
    } catch {
      // Fallback: wenn IO nicht verfügbar, sofort laden
      startLoading();
    }

    return () => {
      cancelled = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (img) {
        img.removeEventListener('load', handleLoad);
        img = null;
      }
    };
  }, [src]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0.5 }}
      transition={{ duration: 0.5 }}
      className={`${className} transition-opacity duration-300 ${
        !isLoaded ? 'animate-pulse bg-gray-700' : ''
      }`}
      style={{
        width,
        height,
        backgroundImage: `url(${placeholderSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`h-full w-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
};

export default LazyLoadImage;
