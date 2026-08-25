import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import CourseFilter from "@/app/components/CourseFilter";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale, localePath } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/courses">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.courses.title,
    description: d.meta.courses.description,
    alternates: alternatesFor(lang, "/courses"),
  };
}

type CoursesPage = {
  qualifications: { name: string; length: string; benefit: string }[];
  popularFields: { level: string; fields: string[] }[];
  vetLevels: { level: string; duration: string; outcome: string }[];
  vetFields: string[];
  highSchool: { years: string; description: string }[];
};

export default async function CoursesPage({ params }: PageProps<"/[lang]/courses">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const {
    qualifications: QUALIFICATIONS,
    // popularFields is still in the CMS but no longer rendered — see the note further down.
    vetLevels: VET_LEVELS,
    vetFields: VET_FIELDS,
    highSchool: HIGH_SCHOOL,
  } = await readContent<CoursesPage>("coursesPage", lang);
  const WHATSAPP_URL = await getWhatsAppUrl();

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.courses.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.courses.title} />
            </h1>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QUALIFICATIONS.map((q) => (
                <div key={q.name} className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="mb-1 font-bold">{q.name}</h3>
                  <div className="mb-2.5 font-mono text-xs text-muted">{q.length}</div>
                  <p className="text-[13.5px] leading-relaxed text-muted">{q.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "Popular fields among Indonesian students" used to sit here. Removed on client
            feedback (flagged twice — as mergeable with the cards above and as redundant with
            the VET breakdown below). The `popularFields` data is left in the CMS in case they
            want it back somewhere else. */}

        {/* From here down the page is Australia-specific, which wasn't stated anywhere before. */}
        <section className="bg-paper-raise py-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
              {d.courses.focusKicker}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
              {d.courses.focusTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
              {d.courses.focusBodyBefore}
              <Link href={localePath(lang, "/study-abroad")} className="font-semibold text-accent hover:underline">
                {d.courses.focusBodyLink}
              </Link>
              {d.courses.focusBodyAfter}
            </p>
          </div>
        </section>

        {/* VET detail (Australia) */}
        <section id="vet" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="rounded-2xl border border-line bg-card p-7">
              <h2 className="mb-2 text-xl font-extrabold">{d.courses.vetTitle}</h2>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">{d.courses.vetSubtitle}</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {VET_FIELDS.map((field) => (
                  <span key={field} className="rounded-full bg-paper-raise px-3.5 py-1.5 text-[12.5px] font-medium">
                    {field}
                  </span>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-4 font-semibold">{d.courses.colQualification}</th>
                      <th className="py-2 pr-4 font-semibold">{d.courses.colDuration}</th>
                      <th className="py-2 font-semibold">{d.courses.colOutcome}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VET_LEVELS.map((row) => (
                      <tr key={row.level} className="border-b border-line/60">
                        <td className="py-2.5 pr-4 font-semibold">{row.level}</td>
                        <td className="py-2.5 pr-4 font-mono text-muted">{row.duration}</td>
                        <td className="py-2.5 text-muted">{row.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* High School detail (Australia) */}
        <section id="high-school" className="scroll-mt-20 bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="rounded-2xl border border-line bg-card p-7">
              <h2 className="mb-2 text-xl font-extrabold">{d.courses.highSchoolTitle}</h2>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">
                {d.courses.highSchoolSubtitle}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {HIGH_SCHOOL.map((tier) => (
                  <div key={tier.years} className="rounded-xl bg-paper-raise p-5">
                    <h4 className="mb-1.5 font-bold">{tier.years}</h4>
                    <p className="text-[13.5px] leading-relaxed text-muted">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-7">
            <CourseFilter lang={lang} copy={d.forms.courseFilter} />
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">{d.courses.ctaTitle}</h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                {d.common.chatOnWhatsApp}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
