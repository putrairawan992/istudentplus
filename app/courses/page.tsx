import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseFilter from "../components/CourseFilter";
import { readContent } from "../../lib/content";
import { getWhatsAppUrl } from "../../lib/whatsapp";

export const metadata: Metadata = {
  title: "Courses & Universities",
  description: "Compare VET/Diploma, Bachelor, Master, PhD, Language Study, and Exchange qualification pathways.",
};

type CoursesPage = {
  qualifications: { name: string; length: string; benefit: string }[];
  popularFields: { level: string; fields: string[] }[];
  vetLevels: { level: string; duration: string; outcome: string }[];
  vetFields: string[];
  highSchool: { years: string; description: string }[];
};

export default async function CoursesPage() {
  const {
    qualifications: QUALIFICATIONS,
    popularFields: POPULAR_FIELDS,
    vetLevels: VET_LEVELS,
    vetFields: VET_FIELDS,
    highSchool: HIGH_SCHOOL,
  } = await readContent<CoursesPage>("coursesPage");
  const WHATSAPP_URL = await getWhatsAppUrl();
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Courses &amp; Universities
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Six qualification types, <span className="text-accent">one decision</span> to make.
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

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
              Popular fields among Indonesian students
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {POPULAR_FIELDS.map((row) => (
                <div key={row.level} className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="mb-3 font-bold">{row.level}</h3>
                  <div className="flex flex-wrap gap-2">
                    {row.fields.map((f) => (
                      <span key={f} className="rounded-full bg-paper-raise px-3 py-1 text-[12.5px] font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VET detail (Australia) */}
        <section id="vet" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="rounded-2xl border border-line bg-card p-7">
              <h2 className="mb-2 text-xl font-extrabold">VET Courses (Australia)</h2>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">
                Vocational Education and Training — also known as TVET or &quot;skills
                training&quot; — delivered by TAFE institutes, independent RTOs, and dual-sector
                universities.
              </p>
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
                      <th className="py-2 pr-4 font-semibold">Qualification</th>
                      <th className="py-2 pr-4 font-semibold">Duration</th>
                      <th className="py-2 font-semibold">Outcome</th>
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
              <h2 className="mb-2 text-xl font-extrabold">High School (Australia)</h2>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">
                Known for quality and diverse options — choosing the right school depends on your
                goals, location, and budget.
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
            <CourseFilter />
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Still deciding between qualifications?
              </h2>
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
