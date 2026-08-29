import Image from "next/image";
import Marked from "./Marked";
import LeadForm from "./LeadForm";
import { scheduleParts, webinarThumbnail, type WebinarWithStatus } from "@/lib/webinars";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

type Copy = Dictionary["webinars"];

/**
 * The page header, and — when there is one — the next session presented the way a webinar
 * landing page presents its single event: the poster behind a dark panel, the date, time and
 * platform as labelled rows rather than a run-on sentence, the speaker credited, and the
 * registration form sitting beside it instead of hidden behind a "Daftar gratis" button
 * three cards down.
 *
 * Adapted from the reference the client sent (dribbble.com/shots/26955782), not copied: that
 * is a one-event page in someone else's warm palette, and this one still has to introduce a
 * list. The structure carries over; the colours stay iStudentPlus.
 */
function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 text-[15px] leading-none">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-white/55">
          {label}
        </div>
        <div className="text-[13.5px] font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

export default function WebinarHero({
  featured,
  lang,
  copy,
  leadLabels,
  hasPast,
}: {
  /** The next session to promote, or null when nothing is scheduled. */
  featured: WebinarWithStatus | null;
  lang: Locale;
  copy: Copy;
  leadLabels: Dictionary["forms"]["webinarLead"];
  hasPast: boolean;
}) {
  const when = featured ? scheduleParts(featured, lang, copy) : null;
  const poster = featured ? webinarThumbnail(featured) : null;
  const isLive = featured?.status === "live";

  return (
    <section className="px-5 pt-10 sm:px-7 sm:pt-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
            {copy.heroKicker}
          </div>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            <Marked text={copy.heroTitle} />
          </h1>
          <p className="mx-auto max-w-xl text-[16.5px] leading-relaxed text-muted">
            {copy.heroSubtitle}
          </p>
          {/* Nothing scheduled is not an empty state here — the archive is the offer. */}
          {!featured && hasPast && (
            <a
              href="#past"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              {copy.browseReplays}
            </a>
          )}
        </div>

        {featured && (
          <div className="mt-10 overflow-hidden rounded-3xl bg-ink text-white shadow-xl shadow-ink/15">
            <div className="grid lg:grid-cols-[1.35fr_1fr]">
              <div className="relative flex flex-col justify-end p-7 sm:p-9">
                {poster && (
                  <>
                    <Image
                      src={poster}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 700px, 100vw"
                      className="object-cover"
                    />
                    {/* The posters are busy — text on top of one is unreadable without this. */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/90 to-ink/70" />
                  </>
                )}
                <div className="relative">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        isLive ? "bg-red-600 text-white" : "bg-accent text-white"
                      }`}
                    >
                      {isLive ? copy.badgeLive : copy.nextSession}
                    </span>
                  </div>
                  <h2 className="max-w-xl text-2xl font-extrabold leading-tight text-balance sm:text-3xl">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/70">
                      {featured.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                    {when && <MetaRow icon="📅" label={copy.dateLabel} value={when.date} />}
                    {when && (
                      <MetaRow
                        icon="⏰"
                        label={copy.timeLabel}
                        value={when.duration ? `${when.time} · ${when.duration}` : when.time}
                      />
                    )}
                    {featured.platform && (
                      <MetaRow icon="💻" label={copy.platformLabel} value={featured.platform} />
                    )}
                  </div>

                  {featured.speaker && (
                    <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                      <span className="text-[10.5px] font-bold uppercase tracking-widest text-white/55">
                        {copy.featuring}
                      </span>
                      <span className="text-[13.5px] font-semibold">{featured.speaker}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* The registration panel the reference puts beside the headline. A session that
                  is already streaming doesn't get one — it gets a link to go and watch. */}
              <div className="border-t border-white/10 bg-white/5 p-7 sm:p-9 lg:border-l lg:border-t-0">
                <h3 className="text-lg font-extrabold">
                  {isLive ? copy.liveNow : copy.registerHeading}
                </h3>
                {!isLive && (
                  <>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">
                      {copy.registerNote}
                    </p>
                    <div className="[&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/50">
                      <LeadForm
                        source="webinar"
                        subjectKey="webinar"
                        subject={featured.title}
                        lang={lang}
                        labels={leadLabels}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
