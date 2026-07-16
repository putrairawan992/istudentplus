import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Language Programs",
  description: "General English, Conversation Class, IELTS, and JLPT preparation with iStudentPlus.",
};

const ENGLISH_SKILLS = [
  { name: "Reading", description: "Vocabulary building and comprehension." },
  { name: "Writing", description: "Clear, concise written communication." },
  { name: "Speaking", description: "Interactive, conversational exercises." },
  { name: "Listening", description: "Comprehension across authentic materials and accents." },
];

const PROGRAMS = [
  {
    id: "general-english",
    name: "General English",
    overview:
      "A comprehensive foundation across all four language skills, with personalized teacher " +
      "feedback throughout — built for academic, professional, and personal contexts.",
    method: "Structured skill-by-skill curriculum with regular one-on-one feedback.",
    schedule: "Flexible scheduling — ask a counselor about current class times.",
  },
  {
    id: "conversation-class",
    name: "Conversation Class",
    overview:
      "Focused on speaking confidence and fluency — smaller, discussion-driven sessions rather " +
      "than grammar drills.",
    method: "Small-group, discussion-led format with real-world topics.",
    schedule: "Evening and weekend options available — confirm current slots with a counselor.",
  },
  {
    id: "ielts",
    name: "IELTS Preparation",
    overview:
      "Exam-focused preparation for the International English Language Testing System, used for " +
      "university admission and visa applications across most English-speaking destinations.",
    method: "Timed practice tests, band-score feedback, and mock exam support.",
    schedule: "Cohort-based classes with a mock test built in — ask a counselor for the next intake.",
  },
  {
    id: "jlpt",
    name: "JLPT Preparation",
    overview:
      "Preparation for the Japanese Language Proficiency Test (N5–N1), the standard benchmark for " +
      "language schools and employers in Japan.",
    method: "Level-based classes covering vocabulary, grammar, reading, and listening sections.",
    schedule: "Ask a counselor which level and intake matches your current Japanese ability.",
  },
];

export default function LanguageProgramsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Language Programs
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Get exam-ready, or just <span className="text-accent">conversation-ready</span>.
            </h1>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-7">
            {PROGRAMS.map((program) => (
              <div key={program.id} id={program.id} className="scroll-mt-20 rounded-2xl border border-line bg-card p-7">
                <h2 className="mb-2 text-xl font-extrabold">{program.name}</h2>
                <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">{program.overview}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-paper-raise p-4.5">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">Teaching Method</div>
                    <p className="text-[13.5px] leading-relaxed text-muted">{program.method}</p>
                  </div>
                  <div className="rounded-xl bg-paper-raise p-4.5">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">Schedule & Flexibility</div>
                    <p className="text-[13.5px] leading-relaxed text-muted">{program.schedule}</p>
                  </div>
                </div>
                {program.id === "general-english" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    {ENGLISH_SKILLS.map((skill) => (
                      <div key={skill.name} className="rounded-xl bg-paper-raise p-4">
                        <div className="mb-1 font-bold">{skill.name}</div>
                        <p className="text-[12px] leading-relaxed text-muted">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Not sure which language program fits?
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
