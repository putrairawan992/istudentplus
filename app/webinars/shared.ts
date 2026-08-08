import { connection } from "next/server";

export type Webinar = {
  title: string;
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

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function schedule(w: Webinar) {
  if (!w.date) return null;
  const d = new Date(w.date);
  if (Number.isNaN(d.getTime())) return null;
  const duration = w.durationMinutes ? ` · ${w.durationMinutes} menit` : "";
  return `${dateFmt.format(d)} WIB${duration}`;
}

// The replay: an explicit recording if one was uploaded, otherwise the live stream's own ID.
export function replayOf(w: Webinar) {
  return {
    youtubeId: w.recordingYoutubeId || w.liveYoutubeId || null,
    videoFile: w.recordingVideoFile || null,
  };
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
