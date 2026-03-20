'use client';

import { useInView } from '~/hooks/useInView';

export default function AnimatedDivider() {
  const { ref, isInView } = useInView({ threshold: 0.5 });

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
      <hr
        className="border-0 h-px bg-primary-500/40 transition-transform duration-600 ease-out origin-center"
        style={{ transform: isInView ? 'scaleX(1)' : 'scaleX(0)' }}
      />
    </div>
  );
}
