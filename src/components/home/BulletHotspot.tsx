"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TooltipDirection = "left" | "right" | "above";

interface BulletHotspotProps {
  title: string;
  description: string;
  direction: TooltipDirection;
  style: React.CSSProperties;
  isActive: boolean;
  onToggle: () => void;
  /** Staggered entrance delay in ms */
  entranceDelay?: number;
}

const directionClasses: Record<TooltipDirection, string> = {
  right: "left-full ml-4 top-1/2 -translate-y-1/2",
  left: "right-full mr-4 top-1/2 -translate-y-1/2",
  above: "bottom-full mb-4 left-1/2 -translate-x-1/2",
};

export default function BulletHotspot({
  title,
  description,
  direction,
  style,
  isActive,
  onToggle,
  entranceDelay = 0,
}: BulletHotspotProps) {
  const [hovered, setHovered] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const showTooltip = hovered || isActive;

  const handleMouseEnter = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setHovered(true), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(false);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggle();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isActive, onToggle]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  return (
    <div
      className="animate-hotspot-pop-in absolute"
      style={{ ...style, animationDelay: `${entranceDelay}ms` }}
    >
      {/* Pulsing ring */}
      <span
        className="animate-hotspot-pulse bg-primary-500 absolute inset-0 rounded-full"
        style={{ animationDelay: `${entranceDelay}ms` }}
      />

      {/* Hotspot button */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Learn about ${title}`}
        aria-expanded={showTooltip}
        className="bg-primary-500 text-secondary-900 focus-visible:ring-primary-300 relative z-10 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full text-lg font-bold shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={onToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        +
      </button>

      {/* Tooltip — desktop only (hidden on mobile, content shown below image instead) */}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-20 hidden w-[300px] transition-all duration-300 lg:block ${directionClasses[direction]} ${showTooltip ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <div className="border-primary-500 rounded-lg border-t-2 bg-white p-5 shadow-xl">
          <h4 className="text-primary-700 mb-2 text-sm font-bold tracking-[0.15em] uppercase">
            {title}
          </h4>
          <p className="text-secondary-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
