"use client";

import { useInView } from "~/hooks/useInView";

type Animation =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "slide-left-far"
  | "slide-right-far";

interface AnimateInProps {
  animation?: Animation;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

const initialStyles: Record<Animation, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-in": "opacity-0",
  "slide-left": "opacity-0 -translate-x-12",
  "slide-right": "opacity-0 translate-x-12",
  "slide-left-far": "opacity-0 -translate-x-24",
  "slide-right-far": "opacity-0 translate-x-24",
};

export default function AnimateIn({
  animation = "fade-up",
  delay = 0,
  duration = 700,
  children,
  className = "",
}: AnimateInProps) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isInView ? "translate-x-0 translate-y-0 opacity-100" : initialStyles[animation]} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
