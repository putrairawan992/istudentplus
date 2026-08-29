import Image from "next/image";
import YouTubeEmbed from "./YouTubeEmbed";
import { pickMedia, type Media as MediaValue } from "@/lib/media";

/**
 * One renderer for the image / YouTube / uploaded-clip trio any CMS record can now carry.
 *
 * Every variant fills its container's width and holds a fixed aspect ratio, which is what keeps
 * a grid honest: cards where the client filled in a picture and cards where she didn't still
 * line up, because the block is either its full declared height or absent entirely — never a
 * half-height sliver that drags one card out of alignment.
 */

/** Ratios named after the slot rather than the fraction, so the specs and the markup agree. */
export const RATIO = {
  /** 16:9 — video, webinar posters. */
  wide: "aspect-video",
  /** 2:1 — wide banners across the top of a card. */
  banner: "aspect-[2/1]",
  /** 3:2 — article and section photography. */
  photo: "aspect-[3/2]",
  /** 1:1 — portraits. */
  square: "aspect-square",
} as const;

export type Ratio = keyof typeof RATIO;

// next/image only accepts hosts declared in next.config.ts. The CMS field invites a pasted URL,
// so anything else renders through a plain <img> instead of throwing at request time and taking
// the whole page down — a bad paste should cost an unoptimised image, not a 500.
function isOptimisable(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return true; // relative — served by us
  try {
    const h = new URL(src).hostname;
    return h === "i.ytimg.com" || /(^|\.)istudentplus\.com$/i.test(h);
  } catch {
    return false;
  }
}

export default function Media({
  media,
  alt,
  ratio = "photo",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  rounded = "rounded-xl",
  className = "",
  priority = false,
  zoomOnHover = false,
  reserve = false,
  placeholder,
}: {
  media: MediaValue | null | undefined;
  /** Describes the picture for a screen reader — usually the card's own title. */
  alt: string;
  ratio?: Ratio;
  /** Match this to the grid the card sits in, or the browser downloads a needlessly big file. */
  sizes?: string;
  rounded?: string;
  className?: string;
  priority?: boolean;
  /** Set on cards that are themselves links, so the picture answers the hover like the title does. */
  zoomOnHover?: boolean;
  /**
   * Keep the box even when this record has no media — pass `anyMedia(list)` so a grid is
   * all-boxes or no-boxes and its rows stay level. See lib/media.ts.
   */
  reserve?: boolean;
  /** What the reserved-but-empty box says. Falls back to the site mark. */
  placeholder?: string;
}) {
  const picked = pickMedia(media);

  if (!picked) {
    if (!reserve) return null;
    // Deliberately quiet: this is a slot the client hasn't filled yet, not an error, and it
    // sits next to real photos. A label reads as intentional where a grey rectangle reads broken.
    return (
      <div className={`flex w-full items-center justify-center overflow-hidden bg-paper-raise ${RATIO[ratio]} ${rounded} ${className}`}>
        <span className="px-4 text-center text-[11px] font-bold uppercase leading-tight tracking-wide text-muted">
          {placeholder ?? "iStudentPlus"}
        </span>
      </div>
    );
  }

  const frame = `relative w-full overflow-hidden bg-paper-raise ${RATIO[ratio]} ${rounded} ${className}`;

  // Both video variants are handled by YouTubeEmbed, which already does the click-to-load
  // facade and the native <video> fallback. It renders its own 16:9 box, so the frame here
  // only carries the corners and the background.
  if (picked.kind !== "image") {
    return (
      <div className={`w-full overflow-hidden bg-ink ${rounded} ${className}`}>
        <YouTubeEmbed
          id={picked.kind === "youtubeId" ? picked.src : null}
          videoFile={picked.kind === "videoFile" ? picked.src : null}
          title={alt}
        />
      </div>
    );
  }

  const zoom = zoomOnHover ? "transition-transform duration-300 group-hover:scale-[1.04]" : "";

  return (
    <div className={frame}>
      {isOptimisable(picked.src) ? (
        <Image src={picked.src} alt={alt} fill sizes={sizes} priority={priority}
          className={`object-cover ${zoom}`} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- host not in next.config remotePatterns */
        <img src={picked.src} alt={alt} loading={priority ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover ${zoom}`} />
      )}
    </div>
  );
}
