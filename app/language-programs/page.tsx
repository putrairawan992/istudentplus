import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { readContent } from "../../lib/content";
import { getWhatsAppUrl } from "../../lib/whatsapp";

export const metadata: Metadata = {
  title: "Language Programs",
  description:
    "General English, Conversation Class, IELTS, and JLPT preparation with iStudentPlus — placement evaluation, international certification from Australia, and native-speaker instructors.",
};

type LanguageProgram = { id: string; name: string; overview: string; features: string[]; duration: string };
type Instructor = { name: string; photo: string };
type EnglishSkill = { name: string; description: string };

export default async function LanguageProgramsPage() {
  const PROGRAMS = await readContent<LanguageProgram[]>("languagePrograms");
  const INSTRUCTORS = await readContent<Instructor[]>("instructors");
  const ENGLISH_SKILLS = await readContent<EnglishSkill[]>("englishSkills");
  const WHATSAPP_URL = await getWhatsAppUrl();
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
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-7">
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
          <div className="mx-auto max-w-[1400px] px-7">
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
          <div className="mx-auto max-w-[1400px] px-7">
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
