import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import ContactForm from "@/app/components/ContactForm";
import Media from "@/app/components/Media";
import { readContent } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale } from "@/lib/i18n";
import { hasMedia, type Media as MediaValue } from "@/lib/media";

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
type Stat = { label: string; value: string };
type Settings = { languages: string[]; socials: Social[]; whatsapp: string; stats: Stat[] };

// The hero's headline, proof points and optional photo/video live in their own CMS record
// (like the home page's heroTitle/heroSubtitle in Site Settings) rather than in the interface
// dictionary — this is marketing copy the client changes on her own, not fixed page chrome.
// `weReplyIn` / `socialMedia` below stay in the dictionary: those are UI labels, not content.
type ContactPageContent = MediaValue & {
  badge: string;
  title: string;
  subtitle: string;
  benefits: string[];
};

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const SETTINGS = await readContent<Settings>("settings", lang);
  const PAGE = await readContent<ContactPageContent>("contactPage", lang);
  const LANGUAGES = SETTINGS.languages;
  const SOCIALS = SETTINGS.socials;
  const WHATSAPP_URL = SETTINGS.whatsapp;

  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Two columns, the pitch beside the form — the shape of the ads landing-page mockup.
            The old layout put a centred hero above a WhatsApp card, a language list and a
            social list, and left the form last: three things to scroll past before the one
            thing the page is for. */}
        <section className="bg-[radial-gradient(760px_420px_at_92%_0%,var(--color-accent)/8,transparent_62%)] pt-12 pb-16 sm:pt-16">
          <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-[12.5px] font-bold text-accent-ink shadow-sm">
                <span className="block h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                {PAGE.badge}
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.03] tracking-tight text-balance sm:text-5xl lg:text-[60px]">
                <Marked text={PAGE.title} />
              </h1>

              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted">
                {PAGE.subtitle}
              </p>

              <div className="mt-7 flex max-w-lg flex-col gap-3">
                {PAGE.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-[12px] font-extrabold text-emerald-700">
                      ✓
                    </span>
                    <span className="text-[15.5px] leading-snug text-ink/80">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Straight from Site Settings, like the home page's row — one place to edit. */}
              <div className="mt-8 flex flex-wrap gap-x-9 gap-y-5 border-t border-line pt-6">
                {SETTINGS.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[34px] font-extrabold leading-none">{stat.value}</div>
                    <div className="mt-1.5 font-mono text-[11.5px] uppercase tracking-wide text-muted">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional photo or video, set on the Contact Page record itself — a counselor
                  at their desk, a short intro clip, whatever the client wants to put a face to
                  the form. Renders nothing at all when unset, so the pitch column above is the
                  whole page until someone fills it in. */}
              {hasMedia(PAGE) && (
                <Media
                  media={PAGE}
                  alt={PAGE.title}
                  ratio="wide"
                  rounded="rounded-3xl"
                  className="mt-8 max-w-lg"
                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw"
                />
              )}
            </div>

            <div>
              <ContactForm
                lang={lang}
                copy={d.forms.contact}
                fallbackError={d.common.somethingWentWrong}
                whatsappUrl={WHATSAPP_URL}
              />

              <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 text-[12px] text-muted">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider">
                  {d.contact.weReplyIn}
                </span>
                <span>{LANGUAGES.join(" · ")}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                  {d.contact.socialMedia}
                </span>
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-[13px] font-semibold text-ink hover:text-accent"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
