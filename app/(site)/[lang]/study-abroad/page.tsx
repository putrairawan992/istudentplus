import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import { getVisibleCountries } from "@/lib/countries";
import { getVideo } from "@/lib/videos";
import { readContent } from "@/lib/content";
import { latestRecordedWebinar, type Webinar } from "@/lib/webinars";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale, localePath } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/study-abroad">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.studyAbroad.title,
    description: d.meta.studyAbroad.description,
    alternates: alternatesFor(lang, "/study-abroad"),
  };
}

export default async function StudyAbroadPage({ params }: PageProps<"/[lang]/study-abroad">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const p = (path: string) => localePath(lang, path);

  const COUNTRIES = await getVisibleCountries(lang);
  const VIDEO = await getVideo("Study Info", lang);
  // The webinar shown alongside it isn't pinned to one video: it's whichever finished webinar
  // has the newest recording, so it stays current as the team publishes more.
  const WEBINAR = await latestRecordedWebinar(await readContent<Webinar[]>("webinars", lang));
  const WHATSAPP_URL = await getWhatsAppUrl();

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.studyAbroad.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.studyAbroad.title} />
            </h1>
          </div>
        </section>

        {/* Destinations come before the videos: someone landing here is picking a country,
            and the videos are supporting material for that choice. */}
        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {COUNTRIES.map((dest) => (
                <Link
                  key={dest.slug}
                  href={p(`/study-abroad/${dest.slug}`)}
                  className={`relative flex aspect-2/1 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-4 text-white transition-transform hover:scale-[1.02] ${dest.gradient}`}
                >
                  {/* One render path for every card: photo (if any) + a label rendered in the
                      page's own type. `imageLabel` is left empty for the photos that still have
                      their caption baked into the bitmap — filling it in would print the name
                      twice. Those files need reshooting at 1200×600 without text; see
                      docs/HISTORY.md §37. */}
                  {dest.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dest.image}
                      alt={dest.imageLabel ? "" : fmt(d.studyAbroad.studyInAlt, { name: dest.name })}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {(dest.imageLabel || !dest.image) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                      <h3 className="relative text-lg font-bold">{dest.imageLabel || dest.name}</h3>
                      {!dest.image && <span className="relative text-xs opacity-85">{dest.cities}</span>}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {(VIDEO || WEBINAR) && (
          <section className="bg-paper-raise py-16">
            <div className="mx-auto max-w-[1400px] px-7">
              <div className="mb-9 text-center">
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.common.watch}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  <Marked text={d.studyAbroad.watchTitle} />
                </h2>
              </div>
              {/* Two videos side by side: a real webinar on the left, the destinations guide on
                  the right. Falls back to a single centred column if either one is missing. */}
              <div
                className={`mx-auto grid gap-6 ${VIDEO && WEBINAR ? "lg:grid-cols-2" : "max-w-3xl"}`}
              >
                {WEBINAR && (
                  <div className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                    <YouTubeEmbed
                      id={WEBINAR.recordingYoutubeId}
                      videoFile={WEBINAR.recordingVideoFile}
                      title={WEBINAR.title}
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
                        {d.studyAbroad.webinarReplayKicker}
                      </div>
                      <h3 className="mt-1.5 text-lg font-extrabold leading-snug">{WEBINAR.title}</h3>
                      <Link
                        href={p("/webinars")}
                        className="mt-4 self-start rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.03]"
                      >
                        {d.studyAbroad.seeAllWebinars}
                      </Link>
                    </div>
                  </div>
                )}
                {VIDEO && (
                  <div className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                    <YouTubeEmbed id={VIDEO.youtubeId} videoFile={VIDEO.videoFile} title={VIDEO.title} />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
                        {d.studyAbroad.destinationGuideKicker}
                      </div>
                      <h3 className="mt-1.5 text-lg font-extrabold leading-snug">
                        {d.studyAbroad.destinationGuideTitle}
                      </h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                        {d.studyAbroad.destinationGuideBody}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7 text-center">
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight">
              {d.studyAbroad.qualificationTitle}
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-[15px] leading-relaxed text-muted">
              {d.studyAbroad.qualificationBody}
            </p>
            <Link href={p("/courses")} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              {d.common.browseCoursesUniversities}
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">{d.studyAbroad.ctaTitle}</h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                {d.common.chatOnWhatsApp}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
