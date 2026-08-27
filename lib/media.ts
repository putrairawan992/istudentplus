/**
 * The media trio every CMS record can carry: a still, a YouTube video, or an uploaded clip.
 *
 * Before this, only seven of the fifteen collections had anywhere to put a picture and only two
 * could hold a video, so "add a photo to this service card" meant a code change every time. The
 * trio is the same three field names everywhere — the CMS editor already renders an upload box
 * for `image`/`videoFile` and a YouTube box for `youtubeId` purely from those names, and
 * `<Media>` renders whichever one is filled. Adding a picture to anything is now a CMS edit.
 */
export type Media = {
  image?: string | null;
  /** A YouTube video ID. The CMS accepts a pasted watch/share URL and stores the ID. */
  youtubeId?: string | null;
  /** A clip uploaded through the CMS instead of published on YouTube. */
  videoFile?: string | null;
};

/** The keys, blank — merged into a collection's field model so every entry offers all three. */
export const MEDIA_FIELDS: { image: string; youtubeId: string; videoFile: string } = {
  image: "",
  youtubeId: "",
  videoFile: "",
};

export const MEDIA_KEYS = Object.keys(MEDIA_FIELDS) as (keyof Media)[];

/** Whether anything was actually filled in. An empty string is not a video. */
export function hasMedia(m: Media | null | undefined): boolean {
  return !!m && MEDIA_KEYS.some((k) => typeof m[k] === "string" && (m[k] as string).trim() !== "");
}

/**
 * Which of the three to render, in the order a person would expect: a video they took the
 * trouble to attach beats a still, and an uploaded file beats a YouTube ID because uploading
 * one is the more deliberate act. Returns null when nothing is filled — the caller renders
 * no block at all rather than an empty box.
 */
export function pickMedia(m: Media | null | undefined):
  | { kind: "videoFile" | "youtubeId" | "image"; src: string }
  | null {
  if (!m) return null;
  const val = (k: keyof Media) => {
    const v = m[k];
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  const file = val("videoFile");
  if (file) return { kind: "videoFile", src: file };
  const yt = val("youtubeId");
  if (yt) return { kind: "youtubeId", src: yt };
  const img = val("image");
  if (img) return { kind: "image", src: img };
  return null;
}

/**
 * Whether a whole list has any media at all — the switch for the all-or-nothing rule below.
 *
 * Most of the site's cards sit in stretch grids where four items share one row. Give one of
 * them a picture and the others none, and that row grows to the tallest card while the rest
 * get a gap between their text and their footer. So a grid either shows the media box on every
 * card (with a neutral placeholder where the client hasn't filled one in yet) or on none —
 * decided once per grid by this, from the data, with nothing for anyone to remember.
 */
export function anyMedia(items: readonly (Media | null | undefined)[]): boolean {
  return items.some(hasMedia);
}
