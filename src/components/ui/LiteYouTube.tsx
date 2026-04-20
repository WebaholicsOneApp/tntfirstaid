"use client";

import { useState } from "react";

export function LiteYouTube({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play ${title}`}
      className="group/play absolute inset-0 block h-full w-full cursor-pointer appearance-none border-0 p-0"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, rgba(227,24,55,0.3) 0%, rgba(10,10,10,0.92) 62%, rgba(10,10,10,1) 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="animate-video-play-ping bg-primary-500/55 pointer-events-none absolute inset-0 rounded-full" />
          <span className="bg-primary-500 relative inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover/play:scale-110">
            <svg
              className="ml-1 h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
    </button>
  );
}
