import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import LeadForm from "@/app/components/LeadForm";
import Media from "@/app/components/Media";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale } from "@/lib/i18n";
import { anyMedia, hasMedia, type Media as MediaValue } from "@/lib/media";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/language-programs">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.languagePrograms.title,
    description: d.meta.languagePrograms.description,
    alternates: alternatesFor(lang, "/language-programs"),
  };
}

type LanguageProgram = MediaValue & {
  id: string;
  name: string;
  overview: string;
  features: string[];
  duration: string;
  /** Tailwind background class, same palette as the Services cards (`homeServices`). The client
      asked for colour coding here so the programs stop reading as one block of identical cards. */
  bg?: string;
};
type Instructor = { name: string; photo: string };
type EnglishSkill = MediaValue & { name: string; description: string };

export default async function LanguageProgramsPage({
  params,
}: PageProps<"/[lang]/language-programs">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const PROGRAMS = await readContent<LanguageProgram[]>("languagePrograms", lang);
  const INSTRUCTORS = await readContent<Instructor[]>("instructors", lang);
  const ENGLISH_SKILLS = await readContent<EnglishSkill[]>("englishSkills", lang);
  const skillsHaveMedia = anyMedia(ENGLISH_SKILLS);
  const WHATSAPP_URL = await getWhatsAppUrl();

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.languagePrograms.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.languagePrograms.title} />
            </h1>
            <p className="mx-auto max-w-lg text-[17px] leading-relaxed text-muted">
              {d.languagePrograms.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-7">
            {PROGRAMS.map((program) => (
              <div
                key={program.id}
                id={program.id}
                className={`scroll-mt-20 rounded-2xl border border-line p-7 ${program.bg ?? "bg-card"}`}
              >
                {/* These panels are stacked full-width with the text capped at max-w-2xl, so
                    there is real space to the right of it on a laptop and up. A picture goes
                    there rather than above the heading; below lg it moves to the top, where a
                    single-column layout wants it. No reserve needed — nothing sits beside a
                    panel to fall out of line with. */}
                <div
                  className={
                    hasMedia(program)
                      ? "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-8"
                      : ""
                  }
                >
                  <div className="min-w-0">
                    <h2 className="mb-2 text-xl font-extrabold">{program.name}</h2>
                    <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-ink/70">{program.overview}</p>
                    <div className="mb-5 flex flex-wrap gap-2">
                      {program.features.map((feature) => (
                        <span key={feature} className="rounded-full bg-white/70 px-3.5 py-1.5 text-[12.5px] font-medium">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white/70 px-4.5 py-3 text-[13.5px] font-semibold text-ink">
                      <span className="mr-2 text-xs font-bold uppercase tracking-wide text-sky">
                        {d.languagePrograms.duration}
                      </span>
                      {program.duration}
                    </div>
                  </div>
                  {hasMedia(program) && (
                    <Media
                      media={program}
                      alt={program.name}
                      ratio="wide"
                      rounded="rounded-xl"
                      className="order-first lg:order-none"
                      sizes="(min-width: 1024px) 380px, 92vw"
                    />
                  )}
                </div>
                {program.id === "general-english" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ENGLISH_SKILLS.map((skill) => (
                      <div key={skill.name} className="overflow-hidden rounded-xl bg-white/70 p-4">
                        {/* Four small cards in one row — reserved, or one picture drags the row. */}
                        {skillsHaveMedia && (
                          <div className="-mx-4 -mt-4 mb-3">
                            <Media
                              media={skill}
                              alt={skill.name}
                              ratio="photo"
                              reserve
                              placeholder={skill.name}
                              rounded="rounded-none"
                              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 42vw, 88vw"
                            />
                          </div>
                        )}
                        <div className="mb-1 font-bold">{skill.name}</div>
                        <p className="text-[12px] leading-relaxed text-ink/70">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* The old site let people see a price and register here; there is no bookable
                    program behind this page yet, so the honest equivalent is an enquiry that
                    reaches the team — it lands in /admin/leads tagged with the program, and
                    nobody has to invent a price to make the page work. */}
                <LeadForm
                  source="inquiry"
                  subjectKey="program"
                  subject={program.name}
                  lang={lang}
                  labels={{
                    ...d.forms.programLead,
                    open: fmt(d.forms.programLead.open, { program: program.name }),
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="mb-9 text-center">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.languagePrograms.instructorsKicker}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {d.languagePrograms.instructorsTitle}
              </h2>
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
                  <div className="text-xs text-muted">{d.languagePrograms.instructorRole}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">{d.languagePrograms.ctaTitle}</h2>
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
