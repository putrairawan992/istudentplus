import type { Metadata } from "next";
import Image from "next/image";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";
import { getVideo } from "../../lib/videos";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "iStudentPlus is a global student network and media agency with offices in Pangkalpinang and Makassar, Indonesia — promoting inclusivity and empowering students worldwide.",
};

type Office = { city: string; country: string; status: string | null };
type TeamMember = { name: string; role: string; photo: string | null; bio: string | null };
type Settings = {
  offices: Office[];
  languages: string[];
  clientCountries: string[];
  aboutStory: string[];
  whatWeDo: string[];
};

const LANGUAGES = ["English", "Bahasa Indonesia", "Chinese", "Spanish"];

export default async function AboutPage() {
  const SETTINGS = await readContent<Settings>("settings");
  const OFFICES = SETTINGS.offices;
  const TEAM = await readContent<TeamMember[]>("team");
  const CLIENT_COUNTRIES = SETTINGS.clientCountries;
  const SERVICES = SETTINGS.whatWeDo;
  const VIDEO = await getVideo("About Us");

  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Who We Are
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              A global student network and <span className="text-accent">media agency</span>.
            </h1>
            {SETTINGS.aboutStory.map((paragraph, i) => (
              <p
                key={i}
                className={`mx-auto max-w-xl text-[17px] leading-relaxed text-muted ${i === 0 ? "mb-4" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {VIDEO && (
          <section className="pb-8">
            <div className="mx-auto max-w-3xl px-7">
              <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={VIDEO.youtubeId} title={VIDEO.title} />
              </div>
            </div>
          </section>
        )}

        {/* Vision & Mission — reference: navy + orange cards */}
        <section className="py-8">
          <div className="mx-auto grid max-w-5xl gap-4.5 px-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white">
              <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" />
              <h2 className="relative mb-4 text-lg font-extrabold uppercase tracking-wide">Our Vision</h2>
              <p className="relative mb-1 text-[15px]">Becoming</p>
              <p className="relative mb-3">
                <span className="mr-2 text-5xl font-extrabold">#1</span>
                <span className="text-xl font-bold">Support System</span>
              </p>
              <p className="relative text-[15px] leading-relaxed">
                for students to <b>study overseas</b> and <b>make a big impact</b>.
              </p>
            </div>
            <div className="rounded-3xl bg-[#E8722C] p-8 text-white">
              <h2 className="mb-5 text-lg font-extrabold uppercase tracking-wide">Our Mission</h2>
              <ul className="flex flex-col gap-3.5">
                <li className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF3C7] text-xs text-[#B8860B]">✓</span>
                  <span>
                    <b>Fully supporting the ambition</b> of students to reach their{" "}
                    <b>dream of studying abroad</b>.
                  </span>
                </li>
                <li className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF3C7] text-xs text-[#B8860B]">✓</span>
                  <span>
                    Creating a <b>comfortable, fun,</b> and <b>meaningful learning atmosphere</b>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto grid max-w-5xl gap-4.5 px-7 sm:grid-cols-3">
            {OFFICES.map((office) => (
              <div key={office.city} className="rounded-2xl border border-line bg-card p-7">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  Office
                </div>
                <h3 className="break-words text-2xl font-extrabold leading-tight">{office.city}</h3>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <p className="text-muted">{office.country}</p>
                  {office.status && (
                    <span className="rounded-full bg-sky-ink px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-sky">
                      {office.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-card py-12">
          <div className="mx-auto max-w-5xl px-7">
            <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight">
              Our Certifications
            </h2>
            <p className="mx-auto mb-7 max-w-lg text-center text-[14px] leading-relaxed text-muted">
              Member of The Law Society of NSW · QEAC #12929 (Cindy Christella, Qualified
              Education Agent Counsellor) · ISEAA · Australia FutureUnlimited
            </p>
            <Image
              src="/certifications.png"
              alt="Certifications: Member of The Law Society of NSW, QEAC #12929, ISEAA, Australia FutureUnlimited"
              width={2048}
              height={459}
              className="mx-auto w-full max-w-3xl"
            />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">Our Team</h2>
            <p className="mb-8 max-w-xl text-[15.5px] leading-relaxed text-muted">
              The counselors behind your application.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {TEAM.map((member) => (
                <div key={member.name} className="rounded-2xl border border-line bg-card p-7">
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
                      Photo and bio coming soon.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-5xl px-7">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">What we do</h2>
            <p className="mb-8 max-w-xl text-[15.5px] leading-relaxed text-muted">
              From the first consultation to settling in on campus, our team covers every part of
              the journey.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => (
                <div key={service} className="rounded-xl border border-line bg-card px-5 py-4 text-sm font-medium">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
              Students we&apos;ve worked with, by country
            </h2>
            <p className="mb-8 max-w-xl text-[15.5px] leading-relaxed text-muted">
              Our counselors speak {LANGUAGES.join(", ")} — and have supported students from:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CLIENT_COUNTRIES.map((country) => (
                <span key={country} className="rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium">
                  {country}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Talk to a counselor who&apos;s helped students like you.
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
