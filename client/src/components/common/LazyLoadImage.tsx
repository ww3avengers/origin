import { FC, useState, useEffect } from 'react';
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

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.addEventListener('load', handleLoad);
    
    // Lazy load with Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      });
    });

    const current = img;
    observer.observe(current);

    return () => {
      current.removeEventListener('load', handleLoad);
      observer.disconnect();
    };
  }, [src]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0.5 }}
      transition={{ duration: 0.5 }}
      className={`${className} transition-opacity duration-300 ${
        !isLoaded ? 'bg-gray-700 animate-pulse' : ''
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
        className={`w-full h-full object-cover ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
};

export default LazyLoadImage;
