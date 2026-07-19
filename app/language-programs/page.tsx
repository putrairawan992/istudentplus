import type { Metadata } from "next";
import Image from "next/image";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Language Programs",
  description:
    "General English, Conversation Class, IELTS, and JLPT preparation with iStudentPlus — placement evaluation, international certification from Australia, and native-speaker instructors.",
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
      "A comprehensive foundation across all four language skills, for everyday communication, " +
      "travel, work, or further study — with personalized teacher feedback throughout.",
    features: ["Placement evaluation", "International certification from Australia"],
    duration: "1 month · 20 sessions · 90 minutes each · 5 days per week",
  },
  {
    id: "ielts",
    name: "IELTS Preparation",
    overview:
      "Exam-focused preparation for the International English Language Testing System, used for " +
      "university admission and visa applications across most English-speaking destinations.",
    features: [
      "Placement evaluation",
      "Comprehensive handbook",
      "Complimentary weekly counseling",
      "Pre-test and post-test evaluations",
    ],
    duration: "6 weeks · 30 sessions · 90 minutes each · 5 times a week",
  },
  {
    id: "conversation-class",
    name: "Conversation Class",
    overview:
      "Focused on speaking confidence and fluency — smaller, discussion-driven sessions rather " +
      "than grammar drills.",
    features: [
      "Instructor who is a native speaker",
      "Comprehensive handbook",
      "Progress assessments",
    ],
    duration: "3 months · 26 sessions · 90 minutes per session · 3 times a week",
  },
  {
    id: "jlpt",
    name: "JLPT Preparation",
    overview:
      "Preparation for the Japanese Language Proficiency Test (N5–N1), the standard benchmark for " +
      "language schools and employers in Japan.",
    features: ["Level-based classes covering vocabulary, grammar, reading, and listening"],
    duration: "Ask a counselor which level and intake matches your current Japanese ability",
  },
];

const INSTRUCTORS = [
  { name: "Danny Dermawansyah", photo: "/instructors/danny-dermawansyah.jpg" },
  { name: "Shah Reza Pahlevi", photo: "/instructors/shah-reza-pahlevi.jpg" },
  { name: "Anastasia Naomi", photo: "/instructors/anastasia-naomi.jpg" },
  { name: "Firsty Viriani", photo: "/instructors/firsty-viriani.jpg" },
];

export default function LanguageProgramsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Our Online Courses
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Study abroad, <span className="text-accent">experience differently!</span>
            </h1>
            <p className="mx-auto max-w-lg text-[17px] leading-relaxed text-muted">
              Our philosophy: get exam-ready — or just conversation-ready — before you fly.
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-7">
            {PROGRAMS.map((program) => (
              <div key={program.id} id={program.id} className="scroll-mt-20 rounded-2xl border border-line bg-card p-7">
                <h2 className="mb-2 text-xl font-extrabold">{program.name}</h2>
                <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">{program.overview}</p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {program.features.map((feature) => (
                    <span key={feature} className="rounded-full bg-paper-raise px-3.5 py-1.5 text-[12.5px] font-medium">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
                <div className="rounded-xl bg-sky-ink px-4.5 py-3 text-[13.5px] font-semibold text-ink">
                  <span className="mr-2 text-xs font-bold uppercase tracking-wide text-sky">Duration</span>
                  {program.duration}
                </div>
                {program.id === "general-english" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="mb-9 text-center">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Teacher Profiles
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Meet your instructors</h2>
            </div>
            <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
              {INSTRUCTORS.map((instructor) => (
                <div key={instructor.name} className="rounded-2xl border border-line bg-card p-5 text-center">
                  <Image
                    src={instructor.photo}
                    alt={instructor.name}
                    width={310}
                    height={310}
                    className="mx-auto mb-3.5 h-28 w-28 rounded-full object-cover"
                  />
                  <div className="text-[14.5px] font-bold">{instructor.name}</div>
                  <div className="text-xs text-muted">English Teacher</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
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
