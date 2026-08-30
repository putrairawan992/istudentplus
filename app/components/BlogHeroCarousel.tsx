"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/i18n";

const AUTOPLAY_MS = 5000;

/**
 * Where each slide starts, measured rather than assumed.
 *
 * The obvious `index * clientWidth` is wrong the moment the strip has a gap between slides:
 * with `gap-4` the pitch is 16px wider than a slide, so the target lands between two snap
 * points and `snap-mandatory` immediately drags the strip back where it was — arrows and
 * autoplay both looked dead.
 */
function slideOffsets(track: HTMLElement): number[] {
  const first = track.firstElementChild as HTMLElement | null;
  if (!first) return [];
  return Array.from(track.children, (c) => (c as HTMLElement).offsetLeft - first.offsetLeft);
}

/** Which slide the strip is currently parked on. */
function nearestSlide(track: HTMLElement): number {
  const offsets = slideOffsets(track);
  if (offsets.length === 0) return 0;
  let best = 0;
  for (let i = 1; i < offsets.length; i++) {
    if (Math.abs(offsets[i] - track.scrollLeft) < Math.abs(offsets[best] - track.scrollLeft)) best = i;
  }
  return best;
}

/**
 * The slider shell around the hero slides. Scrolling is still the browser's — CSS scroll-snap
 * on a horizontally scrollable strip — so a swipe, a trackpad and a keyboard all work whether
 * or not this hydrates. What the client component adds is the arrows, the live dots, and the
 * 5-second advance.
 *
 * Autoplay stops as soon as it would fight the reader: on hover, on keyboard focus inside the
 * strip, while the tab is in the background, after a manual scroll or arrow press, and
 * entirely for anyone who asked for reduced motion. A carousel that moves the paragraph
 * someone is reading is worse than one that never moves.
 *
 * Slides arrive as `children` so they stay server-rendered — the article images and text never
 * reach the browser bundle.
 */
export default function BlogHeroCarousel({
  children,
  count,
  labels,
}: {
  children: React.ReactNode;
  count: number;
  labels: { prevStory: string; nextStory: string; goToStory: string };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Set once the reader takes over: they've chosen a slide, so stop moving it under them.
  const [taken, setTaken] = useState(false);

  const scrollTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const offsets = slideOffsets(track);
    if (offsets[next] === undefined) return;
    track.scrollTo({ left: offsets[next], behavior: "smooth" });
  }, []);

  const go = useCallback(
    (next: number) => {
      setTaken(true);
      scrollTo((next + count) % count);
    },
    [count, scrollTo]
  );

  // Which slide is in view. Reading it off the scroll position keeps the dots honest whether
  // the slide changed by arrow, by swipe, or by autoplay.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(nearestSlide(track)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || paused || taken) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = () => {
      if (document.hidden) return; // a background tab shouldn't burn through the slides
      const track = trackRef.current;
      if (!track) return;
      const offsets = slideOffsets(track);
      const next = (nearestSlide(track) + 1) % count;
      if (offsets[next] !== undefined) track.scrollTo({ left: offsets[next], behavior: "smooth" });
    };
    const timer = setInterval(tick, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, taken]);

  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-line bg-card/90 text-ink shadow-sm backdrop-blur transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          // A drag or a swipe counts as taking over, same as pressing an arrow.
          onPointerDown={() => setTaken(true)}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label={labels.prevStory}
              onClick={() => go(index - 1)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${arrow}`}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={labels.nextStory}
              onClick={() => go(index + 1)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${arrow}`}
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={fmt(labels.goToStory, { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-accent" : "w-6 bg-line hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
