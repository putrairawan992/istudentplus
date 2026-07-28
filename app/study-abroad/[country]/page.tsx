import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCountries, getCountry } from "../data";
import { getWhatsAppUrl } from "../../../lib/whatsapp";

export async function generateStaticParams() {
  return (await getCountries()).map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: slug } = await params;
  const country = await getCountry(slug);
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
  const country = await getCountry(slug);
  if (!country) notFound();
  const WHATSAPP_URL = await getWhatsAppUrl();

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
            <div className="mx-auto max-w-[1400px] px-7">
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

        {country.keyFacts && (
          <section className="py-14">
            <div className="mx-auto max-w-4xl px-7">
              <div className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="bg-sky-ink px-6 py-4 text-center text-lg font-extrabold text-ink">
                  Key Facts to Study in {country.name}
                </div>
                {country.keyFacts.map((fact, i) => (
                  <div
                    key={fact.label}
                    className={`grid gap-1 px-6 py-3.5 sm:grid-cols-[200px_1fr] ${i % 2 === 1 ? "bg-paper-raise/60" : ""}`}
                  >
                    <div className="text-sm font-bold">{fact.label}</div>
                    <div className="text-sm text-muted">{fact.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
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

        {(country.livingCosts || country.visaRequirements) && (
          <section className="py-16">
            <div className="mx-auto grid max-w-[1400px] gap-6 px-7 lg:grid-cols-2">
              {country.livingCosts && (
                <div className="overflow-hidden rounded-2xl border border-line bg-card">
                  <div className="px-6 pb-2 pt-5">
                    <h3 className="text-lg font-extrabold">Cost of Living in {country.name}</h3>
                    <p className="mt-1 text-[13px] text-muted">Approximate monthly expenses.</p>
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-6 py-2 font-semibold">Expense</th>
                        <th className="px-6 py-2 font-semibold">Cost range (monthly)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {country.livingCosts.map((row, i) => (
                        <tr key={row.expense} className={i % 2 === 1 ? "bg-paper-raise/60" : ""}>
                          <td className="px-6 py-2.5 font-semibold">{row.expense}</td>
                          <td className="px-6 py-2.5 font-mono text-muted">{row.range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {country.visaRequirements && (
                <div className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="mb-1 text-lg font-extrabold">
                    Student Visa Requirements
                  </h3>
                  <p className="mb-4 text-[13px] text-muted">
                    What you need before applying — we help you prepare every item.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {country.visaRequirements.map((req) => (
                      <li key={req} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                        <span className="mt-0.5 text-emerald-600">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7 text-center">
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight">
              See qualification types available in {country.name}
            </h2>
            <a href="/courses" className="text-sm font-semibold text-accent hover:underline">
              Browse Courses &amp; Universities →
            </a>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
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
