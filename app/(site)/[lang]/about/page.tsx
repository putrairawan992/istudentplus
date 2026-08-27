import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import { readContent } from "@/lib/content";
import { getVideo } from "@/lib/videos";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, fmt, hasLocale } from "@/lib/i18n";
import Media from "@/app/components/Media";
import { anyMedia, hasMedia, type Media as MediaValue } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.about.title,
    description: d.meta.about.description,
    alternates: alternatesFor(lang, "/about"),
  };
}

type TeamMember = MediaValue & { name: string; role: string; photo: string | null; bio: string | null };
type Settings = MediaValue & {
  languages: string[];
  clientCountries: string[];
  aboutStory: string[];
  whatsapp: string;
};

// Presentable flags for the "students we've worked with" pill list (feedback: countries
// should read as flags, not just text). Falls back to the plain name if a country isn't mapped.
const COUNTRY_FLAGS: Record<string, string> = {
  Indonesia: "🇮🇩", Malaysia: "🇲🇾", Vietnam: "🇻🇳", Thailand: "🇹🇭", China: "🇨🇳", Japan: "🇯🇵",
  Korea: "🇰🇷", Jordan: "🇯🇴", Germany: "🇩🇪", UK: "🇬🇧", Estonia: "🇪🇪", Colombia: "🇨🇴",
  Chile: "🇨🇱", Argentina: "🇦🇷", Brazil: "🇧🇷", USA: "🇺🇸", Canada: "🇨🇦", Australia: "🇦🇺",
};

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const SETTINGS = await readContent<Settings>("settings", lang);
  const TEAM = await readContent<TeamMember[]>("team", lang);
  const CLIENT_COUNTRIES = SETTINGS.clientCountries;
  const WHATSAPP_URL = SETTINGS.whatsapp;
  const VIDEO = await getVideo("About Us", lang);
  const teamHaveMedia = anyMedia(TEAM);

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.about.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.about.title} />
            </h1>
            {SETTINGS.aboutStory.map((paragraph, i) => (
              <p
                key={i}
                className={`mx-auto max-w-xl text-[17px] leading-relaxed text-muted ${i === 0 ? "mb-4" : ""}`}
              >
                {paragraph}
              </p>
            ))}
            {/* The Site Settings record's own picture. It closes the story rather than opening
                the page, because the "About Us" video below is the section that wants to be
                the first thing seen when one is published. */}
            {hasMedia(SETTINGS) && (
              <Media
                media={SETTINGS}
                alt={d.about.title}
                ratio="wide"
                rounded="rounded-3xl"
                className="mt-9"
                sizes="(min-width: 768px) 768px, 100vw"
              />
            )}
          </div>
        </section>

        {VIDEO && (
          <section className="py-8">
            <div className="mx-auto max-w-3xl px-7">
              <div className="mb-8 text-center">
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.common.watch}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  <Marked text={d.about.watchTitle} />
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                  {d.about.watchSubtitle}
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={VIDEO.youtubeId} videoFile={VIDEO.videoFile} title={VIDEO.title} />
              </div>
            </div>
          </section>
        )}

        {/* Vision & Mission — reference: navy + orange cards */}
        <section className="py-8">
          <div className="mx-auto grid max-w-[1400px] gap-4.5 px-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white">
              <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" />
              <h2 className="relative mb-4 text-lg font-extrabold uppercase tracking-wide">
                {d.about.visionHeading}
              </h2>
              <p className="relative mb-1 text-[15px]">{d.about.visionBecoming}</p>
              <p className="relative mb-3">
                <span className="mr-2 text-5xl font-extrabold">{d.about.visionRank}</span>
                <span className="text-xl font-bold">{d.about.visionSupportSystem}</span>
              </p>
              <p className="relative text-[15px] leading-relaxed">
                <Marked text={d.about.visionTail} className="font-bold" />
              </p>
            </div>
            <div className="rounded-3xl bg-[#E8722C] p-8 text-white">
              <h2 className="mb-5 text-lg font-extrabold uppercase tracking-wide">{d.about.missionHeading}</h2>
              <ul className="flex flex-col gap-3.5">
                {d.about.missionPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF3C7] text-xs text-[#B8860B]">✓</span>
                    <span>
                      <Marked text={point} className="font-bold" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-card py-12">
          <div className="mx-auto max-w-[1400px] px-7">
            <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight">
              {d.about.certificationsTitle}
            </h2>
            <p className="mx-auto mb-7 max-w-lg text-center text-[14px] leading-relaxed text-muted">
              {d.about.certificationsSubtitle}
            </p>
            <Image
              src="/certifications.png"
              alt={d.about.certificationsAlt}
              width={2048}
              height={459}
              className="mx-auto w-full max-w-3xl"
            />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">{d.about.teamTitle}</h2>
            <p className="mb-8 max-w-xl text-[15.5px] leading-relaxed text-muted">{d.about.teamSubtitle}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {TEAM.map((member) => (
                <div key={member.name} className="overflow-hidden rounded-2xl border border-line bg-card p-7">
                  {/* Separate from the round portrait above: this is the member's own picture
                      or intro clip, not their headshot. Reserved so the two columns stay level. */}
                  {teamHaveMedia && (
                    <div className="-mx-7 -mt-7 mb-5">
                      <Media
                        media={member}
                        alt={member.name}
                        ratio="wide"
                        reserve
                        placeholder={member.name}
                        rounded="rounded-none"
                        sizes="(min-width: 640px) 46vw, 92vw"
                      />
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-4">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-full object-cover object-[50%_55%]"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper-raise text-lg font-extrabold text-muted">
                        {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-extrabold">{member.name}</h3>
                      <p className="text-sm text-accent">{member.role}</p>
                    </div>
                  </div>
                  {member.bio ? (
                    <p className="text-[13.5px] leading-relaxed text-muted">{member.bio}</p>
                  ) : (
                    <p className="text-[13.5px] italic leading-relaxed text-muted/70">
                      {d.about.bioComingSoon}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">{d.about.countriesTitle}</h2>
            <p className="mb-8 max-w-xl text-[15.5px] leading-relaxed text-muted">
              {fmt(d.about.countriesSubtitle, { languages: d.about.spokenLanguages.join(", ") })}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CLIENT_COUNTRIES.map((country) => (
                <span key={country} className="rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium">
                  {COUNTRY_FLAGS[country] ? `${COUNTRY_FLAGS[country]} ` : ""}
                  {country}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">{d.about.ctaTitle}</h2>
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
