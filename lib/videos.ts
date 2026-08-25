import { readContent } from "./content";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

export type Video = { series: string; title: string; youtubeId?: string | null; videoFile?: string | null };

// Videos live in the `videoSeries` CMS collection; pages pick the one they want by `series`.
// (Keep the series strings in sync with content/videoSeries.json.)
export async function getVideo(
  series: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<Video | undefined> {
  const all = await readContent<Video[]>("videoSeries", locale);
  return all.find((v) => v.series === series);
}
