import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import ContactForm from "@/app/components/ContactForm";
import { readContent } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.contact.title,
    description: d.meta.contact.description,
    alternates: alternatesFor(lang, "/contact"),
  };
}

type Social = { label: string; href: string };
type Settings = { languages: string[]; socials: Social[]; whatsapp: string };

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const SETTINGS = await readContent<Settings>("settings", lang);
  const LANGUAGES = SETTINGS.languages;
  const SOCIALS = SETTINGS.socials;
  const WHATSAPP_URL = SETTINGS.whatsapp;

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              {d.contact.kicker}
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <Marked text={d.contact.title} />
            </h1>
            <p className="mx-auto max-w-lg text-[17px] leading-relaxed text-muted">{d.contact.subtitle}</p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-7 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-4.5">
              <a
                href={WHATSAPP_URL}
                className="flex items-center justify-between rounded-2xl bg-accent px-6 py-5 text-white shadow-lg shadow-accent/25"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-80">{d.contact.fastest}</div>
                  <div className="text-lg font-extrabold">{d.common.chatOnWhatsApp}</div>
                </div>
                <span className="text-2xl">→</span>
              </a>

              <div className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.contact.weReplyIn}
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((language) => (
                    <span key={language} className="rounded-full bg-paper-raise px-3 py-1 text-[12.5px] font-medium">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  {d.contact.socialMedia}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {SOCIALS.map((s) => (
                    <a key={s.label} href={s.href} className="rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold hover:bg-paper-raise">
                      {s.label}
                    </a>
                  ))}
                  <a href={WHATSAPP_URL} className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <ContactForm
              lang={lang}
              copy={d.forms.contact}
              fallbackError={d.common.somethingWentWrong}
            />
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
