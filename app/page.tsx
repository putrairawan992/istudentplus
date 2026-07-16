import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsultationForm from "./components/ConsultationForm";

const STATS = [
  { value: "9.3K", label: "Enrolled" },
  { value: "20+", label: "Languages" },
  { value: "100+", label: "Partner Universities" },
];

const DEPARTURES = [
  { city: "Melbourne", program: "VET + Bachelor", intake: "Feb", status: "Open" as const },
  { city: "Toronto", program: "Undergraduate", intake: "Sep", status: "3 Seats" as const },
  { city: "Osaka", program: "Language School", intake: "Apr", status: "Open" as const },
  { city: "London", program: "Postgraduate", intake: "Sep", status: "Open" as const },
  { city: "Beijing", program: "Language + University", intake: "Mar", status: "Open" as const },
];

const PARTNER_ALUMNI = ["KAIST", "Seoul Nat'l Univ", "U. Toronto", "UCL", "UBC"];

const SERVICES = [
  { name: "Education Counseling", description: "Program and university matching based on grades, budget, and goals." },
  { name: "Visa Application", description: "Document prep and mock interviews with former visa officers." },
  { name: "Student Accommodation", description: "Verified dorms and homestays arranged before you land." },
  { name: "Pre-Departure", description: "Orientation, insurance, and travel briefing before you fly." },
];

const JOURNEY_STEPS = [
  { title: "Personal Assessment", description: "Explore your study goals, country preference, and career path." },
  { title: "Document & Finance Check", description: "Review academic and financial readiness." },
  { title: "Admission Process", description: "Apply and secure offers from partner universities." },
  { title: "Visa & Immigration", description: "Full support for a smooth application process." },
  { title: "Pre-Departure Prep", description: "Orientation, accommodation, and travel guidance." },
  { title: "Enrollment Abroad", description: "Begin your study journey with confidence." },
];

const LANGUAGE_PROGRAMS = [
  { name: "General English", href: "/language-programs#general-english" },
  { name: "Conversation Class", href: "/language-programs#conversation-class" },
  { name: "IELTS", href: "/language-programs#ielts" },
  { name: "JLPT", href: "/language-programs#jlpt" },
];

const DESTINATIONS = [
  { country: "Australia", slug: "australia", cities: "Melbourne · Sydney", tag: "Open", gradient: "from-[#1E78C7] to-[#0C2F4E]" },
  { country: "Japan", slug: "japan", cities: "Osaka · Tokyo", tag: "3 seats", gradient: "from-[#C7297E] to-[#4E0F32]" },
  { country: "United Kingdom", slug: "uk", cities: "London · Manchester", tag: "Open", gradient: "from-[#153A5B] to-[#0A1D30]" },
  { country: "Canada", slug: "canada", cities: "Toronto · Vancouver", tag: "Open", gradient: "from-[#2E9E7A] to-[#0F3D2F]" },
];

const TESTIMONIALS = [
  { quote: "My counselor caught a missing bank statement two days before my visa interview.", name: "Jennifer", destination: "KAIST & Seoul National University" },
  { quote: "Accommodation was sorted before I even booked my flight.", name: "Nareswari", destination: "University of Toronto, UBC Okanagan" },
  { quote: "Four offers, one counselor keeping every deadline straight.", name: "Hafiz", destination: "UBC & Monash University" },
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

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
                100+ Partner Universities Worldwide
              </div>
              <h1 className="mb-5.5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                More Than <span className="text-accent">100+</span> Partner Universities Worldwide
              </h1>
              <p className="mb-8 max-w-md text-[17px] leading-relaxed text-muted">
                Your journey to studying abroad starts here. Access detailed information,
                personalized recommendations, and expert guidance from our education counselors.
              </p>
              <div className="mb-9 flex items-center gap-3.5">
                <a href="/study-abroad" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]">
                  Find Course
                </a>
                <a href="#consultation" className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:bg-paper-raise">
                  Book a free session
                </a>
              </div>
              <div className="flex gap-9 font-mono tabular-nums">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <b className="block text-2xl font-extrabold text-ink">{stat.value}</b>
                    <span className="text-[12.5px] uppercase tracking-wide text-muted">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Departure board */}
            <div className="rounded-2xl bg-ink px-5.5 pb-2.5 pt-5.5 font-mono text-white shadow-2xl shadow-ink/20">
              <div className="mb-1 flex items-baseline justify-between border-b border-white/20 pb-3.5">
                <h3 className="text-[13px] font-bold uppercase tracking-widest">Departures — Intake 2026</h3>
                <span className="text-xs opacity-70">SYNCED 07 JUL</span>
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
        </section>

        {/* Trust strip */}
        <div className="mt-16 border-y border-line bg-paper-raise py-6.5">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-5 px-7 font-mono text-[13px] text-muted">
            {PARTNER_ALUMNI.map((name) => (
              <div key={name}>
                <b className="mr-1.5 font-sans text-[15px] font-bold text-ink">{name}</b>
                Alumni placed
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <section className="py-19">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                What we handle
              </div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
                Everything between &quot;I want to study abroad&quot; and the arrivals hall.
              </h2>
              <p className="text-[15.5px] leading-relaxed text-muted">
                Four services, one counselor, no dropped handoffs between departments.
              </p>
            </div>
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, i) => (
                <div key={service.name} className="relative overflow-hidden rounded-xl border border-line bg-card p-6 pt-5.5">
                  <div className="absolute right-3.5 top-3.5 h-11.5 w-11.5 -rotate-12 rounded-full border-2 border-sky opacity-30" />
                  <div className="mb-3.5 font-mono text-[13px] text-muted">{String(i + 1).padStart(2, "0")}</div>
                  <h4 className="mb-2 text-[16.5px] font-bold">{service.name}</h4>
                  <p className="text-[13.5px] leading-relaxed text-muted">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-7">
          <div className="stub" />
        </div>

        {/* Journey */}
        <section className="py-19">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                The journey
              </div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
                Your journey to study abroad, simplified in 6 steps.
              </h2>
              <p className="text-[15.5px] leading-relaxed text-muted">
                From your first consultation to landing at your dream university, we guide you
                every step of the way.
              </p>
            </div>
            <div className="relative grid gap-7 sm:grid-cols-3 lg:grid-cols-6 lg:before:absolute lg:before:left-[5%] lg:before:right-[5%] lg:before:top-[11px] lg:before:h-px lg:before:bg-line lg:before:content-['']">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.title} className="relative px-0 sm:px-3.5">
                  <div
                    className={`relative z-10 mb-4.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink font-mono text-[11px] font-bold ${
                      i % 2 === 0 ? "bg-ink text-white" : "bg-white text-ink"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <h4 className="mb-1.5 text-[15px] font-bold">{step.title}</h4>
                  <p className="text-[13px] leading-relaxed text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section id="destinations" className="bg-paper-raise py-19">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Where students go
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Four countries, most requested this intake.
              </h2>
            </div>
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
              {DESTINATIONS.map((dest) => (
                <a
                  key={dest.country}
                  href={`/study-abroad/${dest.slug}`}
                  className={`relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-4.5 text-white ${dest.gradient}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-white/20 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide backdrop-blur-sm">
                    {dest.tag}
                  </span>
                  <h4 className="relative text-lg font-bold">{dest.country}</h4>
                  <span className="relative text-xs opacity-85">{dest.cities}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Language programs */}
        <section className="py-19">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
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
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Testimonials */}
        <section className="py-19">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Postcards from alumni
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                They wrote back, from campus.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="relative rounded-xl border border-line bg-card p-6.5">
                  <div className="absolute right-4.5 top-4.5 h-8.5 w-8.5 rounded-full border-2 border-accent opacity-40" />
                  <q className="mb-4.5 block text-base italic leading-relaxed">{t.quote}</q>
                  <div className="text-[13px] font-bold">{t.name}</div>
                  <div className="text-xs text-muted">→ {t.destination}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Free consultation form */}
        <section id="consultation" className="scroll-mt-20 bg-paper-raise py-19">
          <div className="mx-auto max-w-3xl px-7">
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
