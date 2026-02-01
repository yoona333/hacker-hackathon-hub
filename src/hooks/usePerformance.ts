import { useState, useEffect } from 'react';

/**
 * Performance optimization hook
 * Detects device performance and provides settings
 */
export function usePerformance() {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    // Detect low performance devices
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;
    // Check connection speed (if available)
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';

    // Mark as low performance if:
    // - Less than 4 CPU cores
    // - Less than 4GB RAM
    // - Slow connection (2g or 3g)
    const lowPerf = cores < 4 || memory < 4 || ['2g', '3g'].includes(effectiveType);
    setIsLowPerformance(lowPerf);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    isLowPerformance,
    reduceMotion,
    enable3D: !isLowPerformance && !reduceMotion,
  };
}
