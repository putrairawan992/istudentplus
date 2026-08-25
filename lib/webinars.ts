import { connection } from "next/server";
import { fmt, type Locale } from "./i18n";

export type Webinar = {
  title: string;
  /** Groups the listing so related sessions sit together instead of forcing a scroll past one
      full-width poster at a time. Editable in the CMS; untagged entries fall into the dictionary's "other" bucket. */
  theme?: string;
  date?: string;
  durationMinutes?: number;
  speaker?: string;
  platform?: string;
  description?: string;
  image?: string;
  // A YouTube Live stream is an ordinary video ID, so the same widget covers it. Once the
  // stream ends that ID becomes the replay, which is why it falls back to being the recording.
  liveYoutubeId?: string | null;
  // Recording keys follow the blog's convention so the CMS gives the same widgets and
  // <YouTubeEmbed> handles both cases: a YouTube link, or a video uploaded through the CMS.
  recordingYoutubeId?: string | null;
  recordingVideoFile?: string | null;
};

export type WebinarStatus = "upcoming" | "live" | "past";
export type WebinarWithStatus = Webinar & { status: WebinarStatus };

// Assumed length for an entry with no duration filled in, so a live session doesn't get
// filed as "past" the minute it starts.
const DEFAULT_MINUTES = 90;

// The sessions run in Jakarta whichever language you read the page in, so the timezone is
// fixed and only the language of the date changes.
const DATE_FMT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }),
  id: new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }),
};

/** `copy` is the dictionary's `webinars` slice — it carries the "{count} min" and timezone
    wording, which is all the difference between the two locales here. */
export function schedule(
  w: Webinar,
  locale: Locale,
  copy: { minutes: string; timezone: string }
) {
  if (!w.date) return null;
  const d = new Date(w.date);
  if (Number.isNaN(d.getTime())) return null;
  const duration = w.durationMinutes
    ? ` · ${fmt(copy.minutes, { count: w.durationMinutes })}`
    : "";
  return `${DATE_FMT[locale].format(d)} ${copy.timezone}${duration}`;
}

// The replay: an explicit recording if one was uploaded, otherwise the live stream's own ID.
export function replayOf(w: Webinar) {
  return {
    youtubeId: w.recordingYoutubeId || w.liveYoutubeId || null,
    videoFile: w.recordingVideoFile || null,
  };
}

/**
 * The most recent finished webinar that has a recording to play. Used to feature a real
 * webinar elsewhere on the site without hardcoding a video id — as the team adds webinars
 * through the CMS, whatever is featured follows along on its own.
 */
export async function latestRecordedWebinar(webinars: Webinar[]): Promise<WebinarWithStatus | null> {
  const { past } = await splitByDate(webinars); // already newest-first
  return past.find((w) => w.recordingYoutubeId || w.recordingVideoFile) ?? null;
}

/**
 * A 16:9 still to represent the webinar. Prefers the uploaded poster; falls back to the
 * YouTube poster frame of whichever video is attached, so a session that has a stream or a
 * recording still gets a banner without anyone designing artwork for it. Null means the
 * entry genuinely has no visual and callers should render text only.
 */
export function webinarThumbnail(w: Webinar): string | null {
  if (w.image) return w.image;
  const videoId = w.liveYoutubeId || w.recordingYoutubeId;
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

/**
 * Groups a list by its `theme`, preserving the order the list already came in (so the
 * newest-first / soonest-first sorting survives) and keeping untagged entries last.
 */
export function groupByTheme(webinars: WebinarWithStatus[], otherLabel: string) {
  const groups = new Map<string, WebinarWithStatus[]>();
  for (const w of webinars) {
    const key = w.theme?.trim() || otherLabel;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(w);
  }
  return [...groups].sort(([a], [b]) =>
    a === otherLabel ? 1 : b === otherLabel ? -1 : 0
  );
}

// Status comes from the date itself, so nobody has to remember to flip a flag in the CMS
// after an event. Undated entries count as upcoming. connection() keeps this out of the
// prerender — the answer depends on when the page is requested, not when it was built.
export async function splitByDate(webinars: Webinar[]) {
  await connection();
  const now = Date.now();

  const withStatus: WebinarWithStatus[] = webinars.map((w) => {
    const start = w.date ? new Date(w.date).getTime() : NaN;
    if (Number.isNaN(start)) return { ...w, status: "upcoming" };
    const end = start + (w.durationMinutes ?? DEFAULT_MINUTES) * 60_000;
    return { ...w, status: now < start ? "upcoming" : now <= end ? "live" : "past" };
  });

  const byDate = (a: Webinar, b: Webinar) => (a.date ?? "").localeCompare(b.date ?? "");
  return {
    // A session in progress belongs at the top, not buried under future dates.
    upcoming: withStatus
      .filter((w) => w.status !== "past")
      .sort((a, b) => (a.status === b.status ? byDate(a, b) : a.status === "live" ? -1 : 1)),
    past: withStatus.filter((w) => w.status === "past").sort((a, b) => byDate(b, a)),
  };
}
