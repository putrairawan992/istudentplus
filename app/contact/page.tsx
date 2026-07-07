import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a free consultation with an iStudentPlus counselor via WhatsApp, or reach our Sydney and Makassar offices.",
};

const OFFICES = [
  { city: "Sydney", country: "Australia" },
  { city: "Makassar", country: "Indonesia" },
];

const LANGUAGES = ["Indonesian", "English", "Chinese", "Japanese", "French"];

export default function ContactPage() {
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

              <div className="grid gap-3 sm:grid-cols-2">
                {OFFICES.map((office) => (
                  <div key={office.city} className="rounded-2xl border border-line bg-card p-5">
                    <div className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
                      Office
                    </div>
                    <div className="text-lg font-extrabold">{office.city}</div>
                    <div className="text-sm text-muted">{office.country}</div>
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
            </div>

            <form className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-7">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="destination" className="mb-1.5 block text-sm font-semibold">
                  Interested destination
                </label>
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Australia, Korea, Japan"
                  className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tell us about your study plans"
                  className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Send message
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
