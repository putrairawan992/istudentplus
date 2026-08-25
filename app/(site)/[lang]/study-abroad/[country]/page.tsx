import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getCountries, getCountry, type CountryOverview } from "@/lib/countries";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale, localePath } from "@/lib/i18n";

// Only this segment's params — Next combines them with the `lang` values the locale layout
// declares, so each country still prerenders once per language.
export async function generateStaticParams() {
  return (await getCountries()).map((c) => ({ country: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/study-abroad/[country]">): Promise<Metadata> {
  const { lang, country: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [country, d] = await Promise.all([getCountry(slug, lang), getDictionary(lang)]);
  if (!country) return {};
  return {
    title: fmt(d.meta.country.titleTemplate, { name: country.name }),
    description: country.whyStudy,
    alternates: alternatesFor(lang, `/study-abroad/${slug}`),
  };
}

// Living Cost leads because it's the first thing people ask, and the two entries that have
// supporting detail (the monthly cost table, the visa checklist) now carry it inside them
// instead of repeating it in a separate section further down the page.
const OVERVIEW_ROWS: { key: keyof CountryOverview; icon: string }[] = [
  { key: "livingCost", icon: "💰" },
  { key: "admission", icon: "📋" },
  { key: "career", icon: "💼" },
  { key: "accommodation", icon: "🏠" },
  { key: "culture", icon: "🌏" },
];

export default async function CountryPage({ params }: PageProps<"/[lang]/study-abroad/[country]">) {
  const { lang, country: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const country = await getCountry(slug, lang);
  if (!country) notFound();
  const WHATSAPP_URL = await getWhatsAppUrl();
  const name = country.name;

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className={`bg-gradient-to-b py-16 text-white ${country.gradient}`}>
          <div className="mx-auto max-w-4xl px-7 text-center">
            {/* The country's `tag` used to be appended here, rendering "Study Abroad · Open".
                "Open" reads as a claim about intakes or applications being open, which isn't
                something this page can promise per country — dropped as misleading. */}
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              {d.country.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {fmt(d.country.heroTitle, { name })}
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
                {fmt(d.country.featuredProgramsTitle, { name })}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {country.featuredPrograms.map((program) => (
                  <a
                    key={program.name}
                    href={localePath(lang, program.href)}
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
                  {fmt(d.country.keyFactsTitle, { name })}
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

        {/* Expand/collapse via native <details> — same approach as the consultation form's
            disclosure, so this needs no client component and works without JavaScript. */}
        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-4xl px-7">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{d.country.overviewTitle}</h2>
            <div className="flex flex-col gap-3">
              {OVERVIEW_ROWS.map(({ key, icon }, i) => (
                <details
                  key={key}
                  open={i === 0}
                  className="group overflow-hidden rounded-2xl border border-line bg-card [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3.5 px-6 py-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper-raise text-lg">
                      {icon}
                    </span>
                    <span className="flex-1 font-bold">{d.country.overviewLabels[key]}</span>
                    <span className="text-muted transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <div className="border-t border-line px-6 py-5">
                    <p className="text-[14.5px] leading-relaxed text-muted">{country.overview[key]}</p>

                    {/* The monthly table belongs with Living Cost, not in a section of its own. */}
                    {key === "livingCost" && country.livingCosts && (
                      <div className="mt-5 overflow-hidden rounded-xl border border-line">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-line bg-paper-raise/60 text-left text-xs uppercase tracking-wide text-muted">
                              <th className="px-4 py-2 font-semibold">{d.country.colExpense}</th>
                              <th className="px-4 py-2 font-semibold">{d.country.colCostRange}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {country.livingCosts.map((row, r) => (
                              <tr key={row.expense} className={r % 2 === 1 ? "bg-paper-raise/40" : ""}>
                                <td className="px-4 py-2.5 font-semibold">{row.expense}</td>
                                <td className="px-4 py-2.5 font-mono text-muted">{row.range}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* "…then proceed with the check points" — the visa checklist, in place. */}
                    {key === "admission" && country.visaRequirements && (
                      <ul className="mt-5 flex flex-col gap-2.5">
                        {country.visaRequirements.map((req) => (
                          <li key={req} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                            <span className="mt-0.5 text-emerald-600">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7 text-center">
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight">
              {fmt(d.country.qualificationsTitle, { name })}
            </h2>
            <a href={localePath(lang, "/courses")} className="text-sm font-semibold text-accent hover:underline">
              {d.country.browseCourses}
            </a>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                {fmt(d.country.ctaTitle, { name })}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={localePath(lang, "/#consultation")}
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30"
                >
                  {d.common.bookFreeConsultation}
                </a>
                <a href={WHATSAPP_URL} className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  {d.common.chatOnWhatsApp}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
