import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";
import { SITE_URL as siteUrl } from "../../lib/site";
import LeadForm from "../components/LeadForm";
import {
  groupByTheme,
  replayOf,
  schedule,
  splitByDate,
  webinarThumbnail,
  type Webinar,
  type WebinarStatus,
  type WebinarWithStatus,
} from "./shared";

export const metadata: Metadata = {
  title: "Webinar",
  description: "Webinar gratis seputar kuliah di luar negeri, beasiswa, dan persiapan bahasa.",
};

const BADGE: Record<WebinarStatus, { label: string; className: string }> = {
  upcoming: { label: "Akan datang", className: "bg-accent/10 text-accent-ink" },
  live: { label: "● Sedang berlangsung", className: "bg-red-600 text-white" },
  past: { label: "Sudah lewat", className: "bg-paper-raise text-muted" },
};

function WebinarCard({ webinar }: { webinar: WebinarWithStatus }) {
  const when = schedule(webinar);
  const status = webinar.status;
  const replay = replayOf(webinar);
  // While the stream is on, the player is the point of the page. Afterwards the replay takes
  // that spot — that's what people come back for. Otherwise, the poster.
  const player =
    status === "live" && webinar.liveYoutubeId
      ? { id: webinar.liveYoutubeId, videoFile: null }
      : status === "past" && (replay.youtubeId || replay.videoFile)
        ? { id: replay.youtubeId, videoFile: replay.videoFile }
        : null;

  const poster = webinarThumbnail(webinar);
  // A session that is on right now is the page: it keeps the full-width, poster-on-top layout.
  // Everything else is a compact row — poster beside the text, several visible without
  // scrolling, which is what the client asked for after scrolling past one poster at a time.
  const isLive = status === "live";

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line bg-card ${isLive ? "lg:col-span-2" : ""}`}
    >
      <div className={isLive ? "" : "sm:flex sm:items-start"}>
        <div className={isLive ? "" : "sm:w-60 sm:shrink-0 lg:w-64"}>
          {player ? (
            <YouTubeEmbed id={player.id} videoFile={player.videoFile} title={webinar.title} />
          ) : (
            poster && (
              // 16:9 so one poster fits everywhere: this card, the homepage banner, and a
              // YouTube thumbnail if the session is streamed.
              <div className="relative aspect-video">
                <Image
                  src={poster}
                  alt={webinar.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 256px"
                />
              </div>
            )
          )}
        </div>
        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
            <span className={`rounded-full px-2.5 py-1 ${BADGE[status].className}`}>{BADGE[status].label}</span>
            {webinar.platform && <span className="text-muted">{webinar.platform}</span>}
          </div>
          <h3 className="mt-2.5 text-[17px] font-extrabold leading-snug">{webinar.title}</h3>
          {when && <p className="mt-1 text-[12.5px] font-semibold text-muted">{when}</p>}
          {webinar.speaker && <p className="mt-0.5 text-[12.5px] text-muted">Pembicara: {webinar.speaker}</p>}
          {webinar.description && (
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
              {webinar.description}
            </p>
          )}

          {status === "past" ? (
            !player && <p className="mt-4 text-[13px] text-muted">Rekaman belum tersedia.</p>
          ) : player ? (
            // The stream is already playing above; asking them to register now helps nobody.
            <p className="mt-4 text-[13px] font-semibold text-muted">Sesi sedang berlangsung — tonton di atas.</p>
          ) : (
            <LeadForm source="webinar" subjectKey="webinar" subject={webinar.title} />
          )}
        </div>
      </div>
    </article>
  );
}

// One theme = one block, so the two Childcare sessions read as a pair instead of two unrelated
// posters. Themes come from the CMS; anything untagged lands in "Lainnya".
function ThemedGroups({ webinars }: { webinars: WebinarWithStatus[] }) {
  const groups = groupByTheme(webinars);
  return (
    <div className="flex flex-col gap-8">
      {groups.map(([theme, items]) => (
        <div key={theme}>
          {/* A single group with no real theme needs no label above it. */}
          {!(groups.length === 1 && theme === "Lainnya") && (
            <h3 className="mb-3 text-[13px] font-extrabold text-ink">
              {theme}
              <span className="ml-2 text-[12px] font-semibold text-muted">{items.length} sesi</span>
            </h3>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((w) => (
              <WebinarCard key={w.title} webinar={w} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// GEO/SEO: one schema.org Event per dated webinar, so search/AI engines can surface it
// directly (date, format, organizer) instead of only the page's plain text.
function eventJsonLd(w: WebinarWithStatus) {
  if (!w.date) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: w.title,
    description: w.description,
    startDate: w.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: `${siteUrl}/webinars` },
    image: w.image ? [w.image] : undefined,
    performer: w.speaker ? { "@type": "Person", name: w.speaker } : undefined,
    organizer: { "@type": "Organization", name: "iStudentPlus", url: siteUrl },
  };
}

export default async function WebinarsPage() {
  const webinars = await readContent<Webinar[]>("webinars");
  const { upcoming, past } = await splitByDate(webinars);
  const events = [...upcoming, ...past].map(eventJsonLd).filter(Boolean);

  return (
    <>
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(events) }}
        />
      )}
      <Header />
      <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-7 sm:py-14">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Webinar</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Sesi online gratis seputar kuliah di luar negeri, beasiswa, dan persiapan bahasa. Daftar
          dengan email — link acaranya kami kirim sebelum hari-H.
        </p>

        <section className="mt-8">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">Akan datang</h2>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
              Belum ada jadwal baru. Cek lagi nanti, atau lihat rekaman di bawah.
            </p>
          ) : (
            <ThemedGroups webinars={upcoming} />
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">Sudah lewat</h2>
            <ThemedGroups webinars={past} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
