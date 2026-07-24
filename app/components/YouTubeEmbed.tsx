"use client";

import { useState } from "react";

// Thumbnail facade: shows the YouTube poster and only loads the (heavy) iframe player on click.
// Keeps the Blog page light while still playing inline.
export default function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      aria-label={`Play video: ${title}`}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-ink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube poster, no next/image config needed */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-ink/20 transition-colors group-hover:bg-ink/10" />
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-lg transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
