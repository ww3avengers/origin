import { useEffect, useState } from 'react';

interface AnimationMetrics {
  startTime: number;
  firstFrameTime: number | null;
  fps: number[];
  frameCount: number;
  lastFrameTime: number;
}

export const useAnimationPerformance = (enabled = true) => {
  const [metrics, setMetrics] = useState<AnimationMetrics>({
    startTime: 0,
    firstFrameTime: null,
    fps: [],
    frameCount: 0,
    lastFrameTime: 0,
  });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsValues: number[] = [];
    let firstFrameTime: number | null = null;
    const startTime = performance.now();
    // Throttle state updates to at most ~5 Hz (every 200ms)
    const UPDATE_INTERVAL_MS = 200;
    let lastUpdateEmit = startTime;
    // Pause loop when tab is hidden to avoid unnecessary work
    let paused = document.hidden;

    const measure = (time: number) => {
      if (paused) {
        // Skip updates while hidden but keep the loop alive to resume quickly
        animationFrameId = requestAnimationFrame(measure);
        return;
      }

      frameCount++;

      // Calculate FPS
      const delta = (time - lastTime) / 1000;
      const fps = 1 / Math.max(delta, 1e-6);

      // Filter out extreme values and cap array length to avoid memory growth
      if (fps > 0 && fps < 200) {
        fpsValues.push(fps);
        if (fpsValues.length > 120) fpsValues.shift();
      }

      // Record first frame time
      if (frameCount === 1) {
        firstFrameTime = time - startTime;
      }

      // Throttle emitting state updates
      if (time - lastUpdateEmit >= UPDATE_INTERVAL_MS) {
        lastUpdateEmit = time;
        setMetrics({
          startTime,
          firstFrameTime,
          fps: [...fpsValues],
          frameCount,
          lastFrameTime: time,
        });
      }

      lastTime = time;
      animationFrameId = requestAnimationFrame(measure);
    };

    animationFrameId = requestAnimationFrame(measure);

    // Log metrics after 3 seconds
    const logMetrics = setTimeout(() => {
      const avgFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
      const minFps = Math.min(...fpsValues);

      console.group('Animation Performance Metrics');
      console.log('First frame rendered after:', firstFrameTime?.toFixed(2), 'ms');
      console.log('Average FPS:', avgFps.toFixed(2));
      console.log('Minimum FPS:', minFps.toFixed(2));
      console.log('Frames rendered:', frameCount);
      console.groupEnd();

      // Only show warning if performance is below threshold
      if (minFps < 30 || avgFps < 50) {
        console.warn('Animation performance could be improved. Consider optimizing animations.');
      }
    }, 3000);

    const handleVisibility = () => {
      paused = document.hidden;
      // When resuming, reset lastTime to prevent an outlier FPS spike
      if (!paused) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
      clearTimeout(logMetrics);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);

  return metrics;
};

// Optimize animations for better performance
export const optimizeAnimations = () => {
  if (typeof window === 'undefined') return;

  // Use will-change for animated elements
  const animatedElements = document.querySelectorAll('[class*="animate-"]');

  animatedElements.forEach((el) => {
    // Only optimize if not already optimized
    if (!el.getAttribute('data-optimized')) {
      // Add will-change for better performance
      const style = window.getComputedStyle(el);
      const currentWillChange = style.willChange || '';
      const hasTransform = style.transform !== 'none' || currentWillChange.includes('transform');
      const hasOpacity = style.opacity !== '1' || currentWillChange.includes('opacity');

      const properties: string[] = [];
      if (hasTransform) properties.push('transform');
      if (hasOpacity) properties.push('opacity');

      if (properties.length > 0) {
        (el as HTMLElement).style.willChange = properties.join(', ');
      }

      // Mark as optimized
      el.setAttribute('data-optimized', 'true');
    }
  });
};

// Hook to optimize animations when component mounts
export const useOptimizeAnimations = () => {
  useEffect(() => {
    // Initial optimization
    optimizeAnimations();

    // Re-optimize on window resize as new elements might appear
    const handleResize = () => {
      optimizeAnimations();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};
