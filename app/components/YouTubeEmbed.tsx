"use client";

import { useState } from "react";

type Props = { id?: string | null; videoFile?: string | null; title: string };

// Thumbnail facade: shows the YouTube poster and only loads the (heavy) iframe player on click.
// Keeps the Blog page light while still playing inline. A self-hosted `videoFile` (uploaded
// through the CMS instead of referencing YouTube) skips the facade — native <video> is light
// enough on its own — and takes priority when both are set.
export default function YouTubeEmbed({ id, videoFile, title }: Props) {
  const [play, setPlay] = useState(false);

  if (videoFile) {
    return (
      <video src={videoFile} controls preload="metadata" className="aspect-video w-full bg-ink">
        Your browser does not support video playback.
      </video>
    );
  }

  if (!id) return null;

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
