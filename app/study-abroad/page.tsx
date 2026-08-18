import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { getVisibleCountries } from "./data";
import { getVideo } from "../../lib/videos";
import { readContent } from "../../lib/content";
import { latestRecordedWebinar, type Webinar } from "../webinars/shared";
import { getWhatsAppUrl } from "../../lib/whatsapp";

export const metadata: Metadata = {
  title: "Study Abroad",
  description:
    "Explore study destinations — Australia, Japan, and China — with guidance from iStudentPlus counselors.",
};

export default async function StudyAbroadPage() {
  const COUNTRIES = await getVisibleCountries();
  const VIDEO = await getVideo("Study Info");
  // The webinar shown alongside it isn't pinned to one video: it's whichever finished webinar
  // has the newest recording, so it stays current as the team publishes more.
  const WEBINAR = await latestRecordedWebinar(await readContent<Webinar[]>("webinars"));
  const WHATSAPP_URL = await getWhatsAppUrl();
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Study Abroad
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Pick a destination, then let a <span className="text-accent">counselor</span> handle
              the paperwork.
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
                  href={`/study-abroad/${dest.slug}`}
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
                      alt={dest.imageLabel ? "" : `Study in ${dest.name}`}
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
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">Watch</div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  See it from <span className="text-accent">people who went</span>.
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
                        Rekaman webinar
                      </div>
                      <h3 className="mt-1.5 text-lg font-extrabold leading-snug">{WEBINAR.title}</h3>
                      <Link
                        href="/webinars"
                        className="mt-4 self-start rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.03]"
                      >
                        Lihat semua webinar →
                      </Link>
                    </div>
                  </div>
                )}
                {VIDEO && (
                  <div className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                    <YouTubeEmbed id={VIDEO.youtubeId} videoFile={VIDEO.videoFile} title={VIDEO.title} />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-accent">
                        Panduan destinasi
                      </div>
                      <h3 className="mt-1.5 text-lg font-extrabold leading-snug">
                        Study in Australia, China &amp; Japan
                      </h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                        A quick guide to our most-requested study destinations.
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
              Not sure which qualification fits your goal?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-[15px] leading-relaxed text-muted">
              Compare VET/Diploma, Bachelor, Master, PhD, and language-study pathways on the
              Courses &amp; Universities page.
            </p>
            <Link href="/courses" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              Browse Courses &amp; Universities
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Not sure which country fits? Ask a counselor.
              </h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
