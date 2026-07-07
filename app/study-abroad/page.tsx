import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Study Abroad",
  description:
    "Explore study destinations and real programs — VET courses, high school, and general English — with guidance from iStudentPlus counselors.",
};

const DESTINATIONS = [
  { country: "South Korea", cities: "Seoul · Busan · Daegu", tag: "Open", gradient: "from-[#153A5B] to-[#0A1D30]" },
  { country: "Australia", cities: "Melbourne · Sydney", tag: "Open", gradient: "from-[#1E78C7] to-[#0C2F4E]" },
  { country: "Japan", cities: "Osaka · Tokyo", tag: "3 seats", gradient: "from-[#C7297E] to-[#4E0F32]" },
  { country: "Malaysia", cities: "Kuala Lumpur", tag: "Open", gradient: "from-[#2E9E7A] to-[#0F3D2F]" },
];

const VET_LEVELS = [
  { level: "Certificate I", duration: "4–6 months", outcome: "Competent operator" },
  { level: "Certificate II", duration: "~1 year", outcome: "Advanced operator" },
  { level: "Certificate III", duration: "~1 year", outcome: "Qualified tradesperson" },
  { level: "Certificate IV", duration: "12–18 months", outcome: "Supervisor" },
  { level: "Diploma", duration: "18–24 months", outcome: "Paraprofessional" },
  { level: "Advanced Diploma", duration: "24–36 months", outcome: "Junior manager" },
];

const VET_FIELDS = [
  "IT & Cybersecurity", "Tourism & Hospitality", "Business", "Engineering", "Construction",
  "Agriculture", "Legal Studies", "Automotive", "Health Sciences", "Creative Industries",
];

const ENGLISH_SKILLS = [
  { name: "Reading", description: "Vocabulary building and comprehension." },
  { name: "Writing", description: "Clear, concise written communication." },
  { name: "Speaking", description: "Interactive, conversational exercises." },
  { name: "Listening", description: "Comprehension across authentic materials and accents." },
];

export default function StudyAbroadPage() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Study Abroad
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Pick a destination, then let a <span className="text-accent">counselor</span> handle
              the paperwork.
            </h1>
          </div>
        </section>

        <section id="destinations" className="pb-16">
          <div className="mx-auto max-w-6xl px-7">
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.country}
                  className={`relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-4.5 text-white ${dest.gradient}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-white/20 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide backdrop-blur-sm">
                    {dest.tag}
                  </span>
                  <h4 className="relative text-lg font-bold">{dest.country}</h4>
                  <span className="relative text-xs opacity-85">{dest.cities}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="bg-paper-raise py-16">
          <div className="mx-auto max-w-6xl px-7">
            <div className="mb-11 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Programs
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Three real paths in, today.</h2>
            </div>

            {/* VET Courses */}
            <div id="vet" className="mb-10 rounded-2xl border border-line bg-card p-7">
              <h3 className="mb-2 text-xl font-extrabold">VET Courses (Australia)</h3>
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

            {/* High School */}
            <div className="mb-10 rounded-2xl border border-line bg-card p-7">
              <h3 className="mb-2 text-xl font-extrabold">High School (Australia)</h3>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">
                Known for quality and diverse options — choosing the right school depends on your
                goals, location, and budget.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-paper-raise p-5">
                  <h4 className="mb-1.5 font-bold">Years 7–10 (Junior)</h4>
                  <p className="text-[13.5px] leading-relaxed text-muted">
                    Core subjects — English, Mathematics, Science, History, Geography, Health/PE,
                    the Arts — plus electives. Assessed via assignments, tests, and participation.
                  </p>
                </div>
                <div className="rounded-xl bg-paper-raise p-5">
                  <h4 className="mb-1.5 font-bold">Years 11–12 (Senior)</h4>
                  <p className="text-[13.5px] leading-relaxed text-muted">
                    State qualifications like HSC (NSW) or VCE (Victoria); academic or vocational
                    subjects, leading to an ATAR for university entrance.
                  </p>
                </div>
              </div>
            </div>

            {/* General English */}
            <div className="rounded-2xl border border-line bg-card p-7">
              <h3 className="mb-2 text-xl font-extrabold">General English</h3>
              <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-muted">
                A comprehensive foundation across all four language skills, with personalized
                teacher feedback throughout.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ENGLISH_SKILLS.map((skill) => (
                  <div key={skill.name} className="rounded-xl bg-paper-raise p-4.5">
                    <div className="mb-1 font-bold">{skill.name}</div>
                    <p className="text-[12.5px] leading-relaxed text-muted">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Not sure which program fits? Ask a counselor.
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
