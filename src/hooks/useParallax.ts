'use client';

import { useEffect, useRef, useState } from 'react';

export function useParallax(factor = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Disable on mobile or reduced motion
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = ref.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            setOffset((center - viewCenter) * factor);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);

  return {
    ref,
    style: { transform: `translateY(${offset}px)` } as React.CSSProperties,
  };
}
