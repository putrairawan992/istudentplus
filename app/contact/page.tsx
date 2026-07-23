import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import { readContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a free consultation with an iStudentPlus counselor via WhatsApp, or reach our Pangkalpinang and Makassar offices.",
};

type Office = { city: string; country: string; status: string | null };
type Social = { label: string; href: string };
type Settings = { offices: Office[]; languages: string[]; socials: Social[] };

export default async function ContactPage() {
  const SETTINGS = await readContent<Settings>("settings");
  const OFFICES = SETTINGS.offices;
  const LANGUAGES = SETTINGS.languages;
  const SOCIALS = SETTINGS.socials;

  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Get In Touch
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Book a free <span className="text-accent">consultation</span> session.
            </h1>
            <p className="mx-auto max-w-lg text-[17px] leading-relaxed text-muted">
              The fastest way to reach a counselor is WhatsApp — most questions get answered same
              day.
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-7 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-4.5">
              <a
                href={WHATSAPP_URL}
                className="flex items-center justify-between rounded-2xl bg-accent px-6 py-5 text-white shadow-lg shadow-accent/25"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-80">Fastest</div>
                  <div className="text-lg font-extrabold">Chat on WhatsApp</div>
                </div>
                <span className="text-2xl">→</span>
              </a>

              <div className="grid gap-3 sm:grid-cols-3">
                {OFFICES.map((office) => (
                  <div key={office.city} className="rounded-2xl border border-line bg-card p-5">
                    <div className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
                      Office
                    </div>
                    <div className="break-words text-lg font-extrabold leading-tight">{office.city}</div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="text-sm text-muted">{office.country}</div>
                      {office.status && (
                        <span className="rounded-full bg-sky-ink px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-sky">
                          {office.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  We reply in
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <span key={lang} className="rounded-full bg-paper-raise px-3 py-1 text-[12.5px] font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  Social Media
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

            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
