import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header, { WHATSAPP_URL } from "../../components/Header";
import Footer from "../../components/Footer";
import { COUNTRIES, getCountry } from "../data";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  return {
    title: `Study in ${country.name}`,
    description: country.whyStudy,
  };
}

const OVERVIEW_LABELS: { key: keyof import("../data").CountryOverview; label: string }[] = [
  { key: "livingCost", label: "Living Cost" },
  { key: "career", label: "Career Orientation" },
  { key: "admission", label: "Admission Process" },
  { key: "accommodation", label: "Accommodation" },
  { key: "culture", label: "Culture & Lifestyle" },
];

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  return (
    <>
      <Header />
      <main>
        <section className={`bg-gradient-to-b py-16 text-white ${country.gradient}`}>
          <div className="mx-auto max-w-4xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              Study Abroad · {country.tag}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Study in {country.name}
            </h1>
            <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-white/85">
              {country.whyStudy}
            </p>
          </div>
        </section>

        {country.featuredPrograms && (
          <section className="py-14">
            <div className="mx-auto max-w-5xl px-7">
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
                Popular programs in {country.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {country.featuredPrograms.map((program) => (
                  <a
                    key={program.name}
                    href={program.href}
                    className="block rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent/40"
                  >
                    <h3 className="mb-1.5 font-bold">{program.name}</h3>
                    <p className="text-[13px] leading-relaxed text-muted">{program.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-5xl px-7">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {OVERVIEW_LABELS.map(({ key, label }) => (
                <div key={key} className="rounded-2xl border border-line bg-card p-6">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                    {label}
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-muted">{country.overview[key]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7 text-center">
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight">
              See qualification types available in {country.name}
            </h2>
            <a href="/courses" className="text-sm font-semibold text-accent hover:underline">
              Browse Courses &amp; Universities →
            </a>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Ready to talk about studying in {country.name}?
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/#consultation" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                  Book Free Consultation
                </a>
                <a href={WHATSAPP_URL} className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
