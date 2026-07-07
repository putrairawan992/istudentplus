import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "iStudentPlus is a global student network and media agency with offices in Sydney, Australia and Makassar, Indonesia — promoting inclusivity and empowering students worldwide.",
};

const OFFICES = [
  { city: "Sydney", country: "Australia" },
  { city: "Makassar", country: "Indonesia" },
];

const CLIENT_COUNTRIES = [
  "Indonesia", "Malaysia", "Vietnam", "Thailand", "China", "Japan", "Korea",
  "Jordan", "Germany", "UK", "Estonia", "Colombia", "Chile", "Argentina", "Brazil",
];

const LANGUAGES = ["English", "Bahasa Indonesia", "Chinese", "Spanish"];

const SERVICES = [
  "Expert visa guidance",
  "English language courses",
  "Short-term study programs",
  "Partnerships with educational institutions",
  "Resource hub — scholarships & visa info",
  "Accommodation assistance",
  "Mental health support",
  "Academic guidance",
];

export default function AboutPage() {
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
            <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-muted">
              We promote inclusivity and empower students locally and internationally — helping
              with educational and migration needs, with a focus on studying in Australia.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto grid max-w-5xl gap-4.5 px-7 sm:grid-cols-2">
            {OFFICES.map((office) => (
              <div key={office.city} className="rounded-2xl border border-line bg-card p-7">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                  Office
                </div>
                <h3 className="text-2xl font-extrabold">{office.city}</h3>
                <p className="text-muted">{office.country}</p>
              </div>
            ))}
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
