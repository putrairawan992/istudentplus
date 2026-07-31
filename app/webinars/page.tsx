import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";
import RegisterForm from "./RegisterForm";
import {
  replayOf,
  schedule,
  splitByDate,
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

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      {player ? (
        <YouTubeEmbed id={player.id} videoFile={player.videoFile} title={webinar.title} />
      ) : (
        webinar.image && (
          <div className="relative aspect-[16/7]">
            <Image src={webinar.image} alt={webinar.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" />
          </div>
        )
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
          <span className={`rounded-full px-2.5 py-1 ${BADGE[status].className}`}>{BADGE[status].label}</span>
          {webinar.platform && <span className="text-muted">{webinar.platform}</span>}
        </div>
        <h3 className="mt-2.5 text-lg font-extrabold leading-snug">{webinar.title}</h3>
        {when && <p className="mt-1 text-[13px] font-semibold text-muted">{when}</p>}
        {webinar.speaker && <p className="mt-0.5 text-[13px] text-muted">Pembicara: {webinar.speaker}</p>}
        {webinar.description && (
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{webinar.description}</p>
        )}

        {status === "past" ? (
          !player && <p className="mt-4 text-[13px] text-muted">Rekaman belum tersedia.</p>
        ) : player ? (
          // The stream is already playing above; asking them to register now helps nobody.
          <p className="mt-4 text-[13px] font-semibold text-muted">Sesi sedang berlangsung — tonton di atas.</p>
        ) : (
          <RegisterForm webinar={webinar.title} />
        )}
      </div>
    </article>
  );
}

export default async function WebinarsPage() {
  const webinars = await readContent<Webinar[]>("webinars");
  const { upcoming, past } = await splitByDate(webinars);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-7 sm:py-14">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Webinar</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
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
            <div className="flex flex-col gap-5">
              {upcoming.map((w) => (
                <WebinarCard key={w.title} webinar={w} />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">Sudah lewat</h2>
            <div className="flex flex-col gap-5">
              {past.map((w) => (
                <WebinarCard key={w.title} webinar={w} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
