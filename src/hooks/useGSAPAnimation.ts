'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook to detect prefers-reduced-motion.
 * When true, all GSAP animations should be skipped and content shown immediately.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that provides a GSAP context scoped to a container ref.
 * Automatically cleans up animations on unmount.
 * Skips animations if user prefers reduced motion.
 */
export function useGSAPContext<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {}, containerRef.current);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return { containerRef, prefersReducedMotion, gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
