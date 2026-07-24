import { readContent } from "./content";

export type Video = { series: string; title: string; youtubeId: string };

// Videos live in the `videoSeries` CMS collection; pages pick the one they want by `series`.
// (Keep the series strings in sync with content/videoSeries.json.)
export async function getVideo(series: string): Promise<Video | undefined> {
  const all = await readContent<Video[]>("videoSeries");
  return all.find((v) => v.series === series);
}
