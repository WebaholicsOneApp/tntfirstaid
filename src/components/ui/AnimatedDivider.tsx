"use client";

import { useInView } from "~/hooks/useInView";

export default function AnimatedDivider() {
  const { ref, isInView } = useInView({ threshold: 0.5 });

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
      <hr
        className="bg-primary-500/40 h-px origin-center border-0 transition-transform duration-600 ease-out"
        style={{ transform: isInView ? "scaleX(1)" : "scaleX(0)" }}
      />
    </div>
  );
}
