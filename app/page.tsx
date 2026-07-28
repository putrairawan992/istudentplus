import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsultationForm from "./components/ConsultationForm";
import YouTubeEmbed from "./components/YouTubeEmbed";
import { getCountries } from "./study-abroad/data";
import { readContent } from "../lib/content";
import { getVideo } from "../lib/videos";

type Stat = { value: string; label: string };
type HomeService = { name: string; description: string; href: string; bg: string };
type Testimonial = {
  name: string;
  photo: string;
  badge: string;
  loa: string[];
  more: string | null;
  quote: string;
};
type LanguageProgram = { id: string; name: string };

const DEPARTURES = [
  { city: "Melbourne", program: "VET + Bachelor", intake: "Feb", status: "Open" as const },
  { city: "Toronto", program: "Undergraduate", intake: "Sep", status: "3 Seats" as const },
  { city: "Osaka", program: "Language School", intake: "Apr", status: "Open" as const },
  { city: "London", program: "Postgraduate", intake: "Sep", status: "Open" as const },
  { city: "Beijing", program: "Language + University", intake: "Mar", status: "Open" as const },
];

const JOURNEY_STEPS = [
  { title: "Personal Assessment", description: "Explore your study goals, country preference, and career path." },
  { title: "Document & Finance Check", description: "Review academic and financial readiness." },
  { title: "Admission Process", description: "Apply and secure offers from partner universities." },
  { title: "Visa & Immigration", description: "Full support for a smooth application process." },
  { title: "Pre-Departure Prep", description: "Orientation, accommodation, and travel guidance." },
  { title: "Enrollment Abroad", description: "Begin your study journey with confidence." },
];

function StatusPill({ status }: { status: "Open" | "3 Seats" }) {
  const isOpen = status === "Open";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
        isOpen ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

export default async function Home() {
  const SETTINGS = await readContent<{ stats: Stat[]; partnerAlumni: string[] }>("settings");
  const HOME_SERVICES = await readContent<HomeService[]>("homeServices");
  const TESTIMONIALS = await readContent<Testimonial[]>("testimonials");
  const LANGUAGE_PROGRAM_ITEMS = await readContent<LanguageProgram[]>("languagePrograms");
  const DESTINATIONS = (await getCountries()).filter((c) =>
    ["australia", "japan", "uk", "canada"].includes(c.slug)
  );
  const STEPS_VIDEO = await getVideo("Step by Step");
  const LANGUAGE_PROGRAMS = LANGUAGE_PROGRAM_ITEMS.map((p) => ({
    name: p.name,
    href: `/language-programs#${p.id}`,
  }));
  const synced = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .toUpperCase();

  return (
    <>
      <Header />

      <main>
        {/* Hero — reference: text left, student photo over organic shapes right */}
        <section className="pt-14">
          <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="mb-5.5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                Get into your <span className="text-accent">dream university</span> abroad — guided every step.
              </h1>
              <p className="mb-8 max-w-md text-[17px] leading-relaxed text-muted">
                Free counseling from application to arrival, backed by 100+ partner universities.
                Personalized recommendations and expert guidance, at no cost to talk.
              </p>
              <div className="mb-9 flex items-center gap-3.5">
                <a href="/study-abroad" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]">
                  Find Course →
                </a>
                <a href="#consultation" className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:bg-paper-raise">
                  Book a free session
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

            <Image
              src="/hero-student.jpg"
              alt="Student ready to study abroad"
              width={988}
              height={940}
              priority
              className="mx-auto w-full max-w-md mix-blend-multiply lg:max-w-lg"
            />
          </div>
        </section>

        {/* Trust strip */}
        <div className="border-y border-line bg-paper-raise py-6.5">
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-5 px-7 font-mono text-[13px] text-muted">
            {SETTINGS.partnerAlumni.map((name) => (
              <div key={name}>
                <b className="mr-1.5 font-sans text-[15px] font-bold text-ink">{name}</b>
                Alumni placed
              </div>
            ))}
          </div>
        </div>

        {/* Services — reference: pastel cards carousel */}
        <section className="py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 max-w-xl">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
                With you at every step of your study abroad journey.
              </h2>
              <p className="text-[15.5px] leading-relaxed text-muted">
                Get personalised, friendly, honest guidance for free.
              </p>
            </div>
            <div className="reveal grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
              {HOME_SERVICES.map((service) => (
                <a
                  key={service.name}
                  href={service.href}
                  className={`flex flex-col justify-between rounded-2xl p-6 text-ink transition-transform hover:scale-[1.02] ${service.bg}`}
                >
                  <div>
                    <h4 className="mb-2 text-[16.5px] font-extrabold">{service.name}</h4>
                    <p className="mb-6 text-[13.5px] leading-relaxed opacity-70">{service.description}</p>
                  </div>
                  <span className="text-[13px] font-bold">Know more &gt;</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Journey — reference: vertical numbered timeline + visual right */}
        <section className="bg-paper-raise py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 text-center">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
                Your journey to study abroad, simplified in 6 steps.
              </h2>
              <p className="mx-auto max-w-lg text-[15.5px] leading-relaxed text-muted">
                From your first consultation to landing at your dream university, we guide you
                every step of the way.
              </p>
            </div>

            <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div className="relative flex flex-col gap-2.5 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-px before:bg-line before:content-['']">
                {JOURNEY_STEPS.map((step, i) => (
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
                  <h3 className="text-[13px] font-bold uppercase tracking-widest">Departures — Intake 2026</h3>
                  <span className="text-xs opacity-70">SYNCED {synced}</span>
                </div>
                <div className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] gap-2.5 border-b border-white/25 py-2 text-[10.5px] uppercase tracking-wide opacity-55">
                  <span>City</span>
                  <span>Program</span>
                  <span>Intake</span>
                  <span>Status</span>
                </div>
                {DEPARTURES.map((row) => (
                  <div
                    key={row.city}
                    className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] items-center gap-2.5 border-b border-dashed border-white/15 py-3.5 text-[13.5px]"
                  >
                    <span className="font-bold">{row.city}</span>
                    <span className="opacity-75">{row.program}</span>
                    <span>{row.intake}</span>
                    <StatusPill status={row.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {STEPS_VIDEO && (
          <section className="py-19 pt-0">
            <div className="mx-auto max-w-3xl px-7">
              <div className="reveal mb-8 text-center">
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                  Watch
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  See how iStudentPlus helps you, <span className="text-accent">step by step</span>.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                  A quick look at how we guide you from first consultation to enrollment abroad.
                </p>
              </div>
              <div className="reveal overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={STEPS_VIDEO.youtubeId} videoFile={STEPS_VIDEO.videoFile} title={STEPS_VIDEO.title} />
              </div>
            </div>
          </section>
        )}

        {/* Destinations */}
        <section id="destinations" className="py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Where students go
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Four countries, most requested this intake.
              </h2>
            </div>
            <div className="reveal grid gap-4.5 sm:grid-cols-2">
              {DESTINATIONS.map((dest) => (
                <a
                  key={dest.slug}
                  href={`/study-abroad/${dest.slug}`}
                  className={`relative flex aspect-2/1 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-4.5 text-white transition-transform hover:scale-[1.02] ${dest.gradient}`}
                >
                  {dest.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dest.image}
                      alt={`Study in ${dest.name}`}
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
                  Browse our language program
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Get exam-ready or just conversation-ready.
                </h2>
              </div>
              <a href="/language-programs" className="text-sm font-semibold text-accent hover:underline">
                See all programs →
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

        {/* Testimonials — reference: avatar + badge + Raih LoA list */}
        <section className="bg-sky-ink py-19">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="reveal mb-11 text-center">
              <h2 className="mb-2 text-3xl font-extrabold tracking-tight">
                Alumni who made it, <span className="text-accent">on record</span>.
              </h2>
              <p className="text-[15.5px] text-muted">
                Accepted at 50+ top campuses across 15 different countries.
              </p>
            </div>
            <div className="reveal grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col rounded-3xl bg-card p-6.5 shadow-sm">
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
                    <div className="mb-1.5 text-[13px] font-extrabold text-accent">Letters of Acceptance:</div>
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
                Free Consultation
              </div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
                Tell us your study plans, we&apos;ll do the rest.
              </h2>
              <p className="mx-auto max-w-lg text-[15.5px] leading-relaxed text-muted">
                No obligation, no fees to talk. A counselor reviews your details and replies with
                a personalized recommendation.
              </p>
            </div>
            <ConsultationForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
