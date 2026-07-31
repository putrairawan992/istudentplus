import { connection } from "next/server";

export type Webinar = {
  title: string;
  date?: string;
  durationMinutes?: number;
  speaker?: string;
  platform?: string;
  description?: string;
  image?: string;
  // Recording keys follow the blog's convention so the CMS gives the same widgets and
  // <YouTubeEmbed> handles both cases: a YouTube link, or a video uploaded through the CMS.
  recordingYoutubeId?: string | null;
  recordingVideoFile?: string | null;
};

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

// Upcoming vs past comes from the date itself, so nobody has to remember to flip a flag in the
// CMS after an event. Undated entries count as upcoming. connection() keeps this out of the
// prerender — the answer depends on when the page is requested, not when it was built.
export async function splitByDate(webinars: Webinar[]) {
  await connection();
  const now = Date.now();
  const isPast = (w: Webinar) => {
    const t = w.date ? new Date(w.date).getTime() : NaN;
    return !Number.isNaN(t) && t < now;
  };
  return {
    upcoming: webinars.filter((w) => !isPast(w)).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")),
    past: webinars.filter(isPast).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
  };
}
