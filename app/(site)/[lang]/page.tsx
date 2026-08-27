import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import ConsultationForm from "@/app/components/ConsultationForm";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import Media from "@/app/components/Media";
import { getVisibleCountries } from "@/lib/countries";
import { readContent } from "@/lib/content";
import { getVideo } from "@/lib/videos";
import { schedule, splitByDate, webinarThumbnail, type Webinar } from "@/lib/webinars";
import { getDictionary } from "@/lib/dictionary";
import { fmt, hasLocale, localePath, type Locale } from "@/lib/i18n";
import { anyMedia, type Media as MediaValue } from "@/lib/media";

type Stat = { value: string; label: string };
type Settings = { stats: Stat[]; heroTitle: string; heroSubtitle: string };
type HomeService = MediaValue & { name: string; description: string; href: string; bg: string };
type Testimonial = MediaValue & {
  name: string;
  photo: string;
  badge: string;
  loa: string[];
  more: string | null;
  quote: string;
};
type LanguageProgram = { id: string; name: string };

// Dates in the departure board's "SYNCED" stamp read in the visitor's language.
const SYNCED_LOCALE: Record<Locale, string> = { en: "en-GB", id: "id-ID" };

function StatusPill({ status, labels }: { status: string; labels: { open: string; seats: string } }) {
  const isOpen = status === "open";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
        isOpen ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {isOpen ? labels.open : labels.seats}
    </span>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const p = (path: string) => localePath(lang, path);

  const SETTINGS = await readContent<Settings>("settings", lang);
  const HOME_SERVICES = await readContent<HomeService[]>("homeServices", lang);
  const TESTIMONIALS = await readContent<Testimonial[]>("testimonials", lang);
  const LANGUAGE_PROGRAM_ITEMS = await readContent<LanguageProgram[]>("languagePrograms", lang);
  const { upcoming } = await splitByDate(await readContent<Webinar[]>("webinars", lang));
  const nextWebinar = upcoming[0];
  const nextWebinarThumb = nextWebinar ? webinarThumbnail(nextWebinar) : null;
  // Whatever the CMS lists as visible, in its own expertise order — the old hardcoded slug
  // list had UK and Canada in it, which are exactly the two the client wanted out of sight.
  const DESTINATIONS = await getVisibleCountries(lang);
  const STEPS_VIDEO = await getVideo("Step by Step", lang);
  // Decided once per grid, from the data: see the note on anyMedia in lib/media.ts.
  const servicesHaveMedia = anyMedia(HOME_SERVICES);
  const testimonialsHaveMedia = anyMedia(TESTIMONIALS);
  const LANGUAGE_PROGRAMS = LANGUAGE_PROGRAM_ITEMS.map((program) => ({
    name: program.name,
    href: p(`/language-programs#${program.id}`),
  }));
  const synced = new Date()
    .toLocaleDateString(SYNCED_LOCALE[lang], { day: "2-digit", month: "short" })
    .toUpperCase();

  return (
    <>
      <Header lang={lang} />

      <main>
        {/* Hero — reference: text left, student photo over organic shapes right */}
        <section className="pt-14">
          <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              {/* The hero title is CMS-editable text with one `**...**` span rendered in the
                  accent colour, so non-technical editors can change the wording (per language)
                  without touching code while keeping the highlighted phrase. */}
              <h1 className="mb-5.5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                <Marked text={SETTINGS.heroTitle} />
              </h1>
              <p className="mb-8 max-w-md text-[17px] leading-relaxed text-muted">
                {SETTINGS.heroSubtitle}
              </p>
              <div className="mb-9 flex items-center gap-3.5">
                <a href={p("/study-abroad")} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]">
                  {d.home.findCourse}
                </a>
                <a href="#consultation" className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:bg-paper-raise">
                  {d.home.bookFreeSession}
                </a>
              </div>
              <div className="flex gap-9 font-mono tabular-nums">
                {SETTINGS.stats.map((stat) => (
                  <div key={stat.label}>
                    <b className="block text-2xl font-extrabold text-ink">{stat.value}</b>
                    <span className="text-[12.5px] uppercase tracking-wide text-muted">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <div className="absolute -right-5 -top-6 h-36 w-36 rounded-full bg-accent/15" />
              <div className="absolute -bottom-8 -left-6 h-44 w-44 rounded-full bg-[#E8722C]/15" />
              <div className="relative flex items-end gap-3.5 sm:gap-4.5">
                <Image
                  src="/hero-male.jpg"
                  alt={d.home.heroImageAlt}
                  width={700}
                  height={900}
                  className="w-1/2 rounded-3xl object-cover shadow-xl shadow-ink/10"
                />
                <Image
                  src="/hero-female.jpg"
                  alt={d.home.heroImageAlt}
                  width={700}
                  height={900}
                  priority
                  className="w-1/2 translate-y-5 rounded-3xl object-cover shadow-xl shadow-ink/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Next webinar — only the nearest one, and nothing at all when there isn't one.
            An empty "no upcoming events" box on the home page reads worse than no box. */}
        {nextWebinar && (
          <section className="py-19 pb-0">
            <div className="mx-auto max-w-[1400px] px-7">
              <Link
                href={p("/webinars")}
                className="group flex flex-col gap-5 overflow-hidden rounded-3xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md sm:flex-row sm:items-center sm:gap-7 sm:p-7"
              >
                {/* Poster if one was uploaded, else the attached video's YouTube frame. A 16:9
                    box either way, so the row keeps its shape whichever one it gets. */}
                {nextWebinarThumb && (
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-paper-raise sm:w-64 lg:w-80">
                    <Image
                      src={nextWebinarThumb}
                      alt={nextWebinar.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                    {nextWebinar.status === "live" && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        {d.webinars.badgeLive}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-widest ${
                      nextWebinar.status === "live" ? "text-red-600" : "text-accent"
                    }`}
                  >
                    {nextWebinar.status === "live" ? d.home.nextWebinarLive : d.home.nextWebinarLabel}
                  </p>
                  <h3 className="mt-1.5 text-xl font-extrabold leading-snug">{nextWebinar.title}</h3>
                  {schedule(nextWebinar, lang, d.webinars) && (
                    <p className="mt-1 text-[13.5px] font-semibold text-muted">
                      {schedule(nextWebinar, lang, d.webinars)}
                    </p>
                  )}
                  {nextWebinar.description && (
                    <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
                      {nextWebinar.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-center text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform group-hover:scale-[1.03]">
                  {nextWebinar.status === "live" ? d.home.watchNow : d.home.viewAndRegister}
                </span>
              </Link>
            </div>
          </section>
        )}

        {STEPS_VIDEO && (
          <section className="py-19">
            <div className="mx-auto max-w-3xl px-7">
              <div className="reveal mb-8 text-center">
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.common.watch}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  <Marked text={d.home.stepsTitle} />
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                  {d.home.stepsSubtitle}
                </p>
              </div>
              <div className="reveal overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={STEPS_VIDEO.youtubeId} videoFile={STEPS_VIDEO.videoFile} title={STEPS_VIDEO.title} />
              </div>
            </div>
          </section>
        )}

        {/* Services — reference: pastel cards carousel */}
        <section className="py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 max-w-xl">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">{d.home.servicesTitle}</h2>
              <p className="text-[15.5px] leading-relaxed text-muted">{d.home.servicesSubtitle}</p>
            </div>
            {/* All four cards share one row at lg and the "know more" label is pinned to the
                bottom of each, so a picture on one card and not the next opens a visible gap
                under the other three. `reserve` keeps the box on every card once any of them
                has one — see lib/media.ts. */}
            <div className="reveal grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
              {HOME_SERVICES.map((service) => (
                <a
                  key={service.name}
                  href={p(service.href)}
                  className={`group flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-ink transition-transform hover:scale-[1.02] ${service.bg}`}
                >
                  <div>
                    <Media
                      media={service}
                      alt={service.name}
                      ratio="photo"
                      reserve={servicesHaveMedia}
                      placeholder={service.name}
                      zoomOnHover
                      rounded="rounded-xl"
                      className="mb-4"
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    />
                    <h4 className="mb-2 text-[16.5px] font-extrabold">{service.name}</h4>
                    <p className="mb-6 text-[13.5px] leading-relaxed opacity-70">{service.description}</p>
                  </div>
                  <span className="text-[13px] font-bold">{d.home.knowMore}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Journey — reference: vertical numbered timeline + visual right */}
        <section className="bg-paper-raise py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 text-center">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">{d.home.journeyTitle}</h2>
              <p className="mx-auto max-w-lg text-[15.5px] leading-relaxed text-muted">
                {d.home.journeySubtitle}
              </p>
            </div>

            <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div className="relative flex flex-col gap-2.5 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-px before:bg-line before:content-['']">
                {d.home.journeySteps.map((step, i) => (
                  <div
                    key={step.title}
                    className={`relative flex items-start gap-4 rounded-2xl px-3.5 py-3.5 ${
                      i === 0 ? "border border-accent/20 bg-accent/5" : ""
                    }`}
                  >
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold ${
                        i === 0 ? "bg-accent text-white" : "border border-line bg-card text-muted"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold">{step.title}</h4>
                      <p className="text-[13px] leading-relaxed text-muted">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Departure board */}
              <div className="rounded-2xl bg-ink px-5.5 pb-2.5 pt-5.5 font-mono text-white shadow-2xl shadow-ink/20">
                <div className="mb-1 flex items-baseline justify-between border-b border-white/20 pb-3.5">
                  <h3 className="text-[13px] font-bold uppercase tracking-widest">{d.home.departuresTitle}</h3>
                  <span className="text-xs opacity-70">{fmt(d.home.synced, { date: synced })}</span>
                </div>
                <div className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] gap-2.5 border-b border-white/25 py-2 text-[10.5px] uppercase tracking-wide opacity-55">
                  <span>{d.home.colCity}</span>
                  <span>{d.home.colProgram}</span>
                  <span>{d.home.colIntake}</span>
                  <span>{d.home.colStatus}</span>
                </div>
                {d.home.departures.map((row) => (
                  <div
                    key={row.city}
                    className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] items-center gap-2.5 border-b border-dashed border-white/15 py-3.5 text-[13.5px]"
                  >
                    <span className="font-bold">{row.city}</span>
                    <span className="opacity-75">{row.program}</span>
                    <span>{row.intake}</span>
                    <StatusPill
                      status={row.status}
                      labels={{ open: d.home.statusOpen, seats: d.home.statusSeats }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section id="destinations" className="py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.home.destinationsKicker}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">{d.home.destinationsTitle}</h2>
            </div>
            <div className="reveal grid gap-4.5 sm:grid-cols-2">
              {DESTINATIONS.map((dest) => (
                <a
                  key={dest.slug}
                  href={p(`/study-abroad/${dest.slug}`)}
                  className={`relative flex aspect-2/1 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-4.5 text-white transition-transform hover:scale-[1.02] ${dest.gradient}`}
                >
                  {dest.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dest.image}
                      alt={fmt(d.home.studyInAlt, { name: dest.name })}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {dest.imageLabel && (
                    <span className="relative text-xl font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                      {dest.imageLabel}
                    </span>
                  )}
                  {!dest.image && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                      <h4 className="relative text-lg font-bold">{dest.name}</h4>
                      <span className="relative text-xs opacity-85">{dest.cities}</span>
                    </>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Language programs */}
        <section className="py-19 pt-0">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.home.languageKicker}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">{d.home.languageTitle}</h2>
              </div>
              <a href={p("/language-programs")} className="text-sm font-semibold text-accent hover:underline">
                {d.home.seeAllPrograms}
              </a>
            </div>
            <div className="reveal grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {LANGUAGE_PROGRAMS.map((program) => (
                <a
                  key={program.name}
                  href={program.href}
                  className="rounded-xl border border-line bg-card px-5 py-4.5 font-bold transition-colors hover:border-accent/40"
                >
                  {program.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials — reference: avatar + badge + LoA list */}
        <section className="bg-sky-ink py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 text-center">
              <h2 className="mb-2 text-3xl font-extrabold tracking-tight">
                <Marked text={d.home.testimonialsTitle} />
              </h2>
              <p className="text-[15.5px] text-muted">{d.home.testimonialsSubtitle}</p>
            </div>
            <div className="reveal grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col overflow-hidden rounded-3xl bg-card p-6.5 shadow-sm">
                  {/* Bleeds to the card edge: -m-6.5 cancels the padding, mb-5 puts it back
                      under the block. Reserved across the row so the three cards stay level. */}
                  {testimonialsHaveMedia && (
                    <div className="-mx-6.5 -mt-6.5 mb-5">
                      <Media
                        media={t}
                        alt={t.name}
                        ratio="wide"
                        reserve
                        placeholder={t.name}
                        rounded="rounded-none"
                        sizes="(min-width: 1024px) 32vw, 92vw"
                      />
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-3.5">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      width={82}
                      height={82}
                      loading="eager"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-[15px] font-extrabold">{t.name}</div>
                      <span className="inline-block rounded-full bg-[#FDF3C7] px-2.5 py-0.5 text-[10.5px] font-bold">
                        {t.badge}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="mb-1.5 text-[13px] font-extrabold text-accent">
                      {d.home.lettersOfAcceptance}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {t.loa.map((uni) => (
                        <li key={uni} className="flex gap-2 text-[13px] font-semibold">
                          <span className="text-emerald-600">✓</span>
                          {uni}
                        </li>
                      ))}
                    </ul>
                    {t.more && <div className="mt-1 pl-5 text-[12.5px] text-muted">{t.more}</div>}
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-muted">{t.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Free consultation form */}
        <section id="consultation" className="scroll-mt-20 py-19">
          <div className="reveal mx-auto max-w-3xl px-7">
            <div className="mb-8 text-center">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.home.consultationKicker}
              </div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">{d.home.consultationTitle}</h2>
              <p className="mx-auto max-w-lg text-[15.5px] leading-relaxed text-muted">
                {d.home.consultationSubtitle}
              </p>
            </div>
            <ConsultationForm
              lang={lang}
              copy={d.forms.consultation}
              fallbackError={d.common.somethingWentWrong}
            />
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
