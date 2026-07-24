import type { Metadata } from "next";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import { readContent } from "../../lib/content";
import { getVideo } from "../../lib/videos";

export const metadata: Metadata = {
  title: "Services",
  description: "Visa & Admission support and Admission Counselling from iStudentPlus education consultants.",
};

type VisaService = { name: string; intro: string; points: string[] };
type AdmissionStep = { title: string; description: string };
type Faq = { q: string; a: string };
type ServicesPageContent = { pitfalls: string[]; admissionSteps: AdmissionStep[]; faqs: Faq[] };

export default async function ServicesPage() {
  const VISA_SERVICES = await readContent<VisaService[]>("visaServices");
  const { pitfalls: PITFALLS, admissionSteps: ADMISSION_STEPS, faqs: FAQS } =
    await readContent<ServicesPageContent>("servicesPage");
  const VIDEO = await getVideo("Layanan");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Services
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Two services that get you from <span className="text-accent">interest</span> to
              <span className="text-accent"> offer letter</span>.
            </h1>
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

        {/* Visa & Admission */}
        <section id="visa-admission" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Visa &amp; Admission
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Visa process made easy.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                A simple, guided application flow for Australia, Japan, and every destination we
                support — so nothing gets missed.
              </p>
            </div>

            <div className="mb-4.5 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {VISA_SERVICES.map((service) => (
                <div key={service.name} className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="mb-2 font-bold">{service.name}</h3>
                  <p className="mb-3 text-[13px] leading-relaxed text-muted">{service.intro}</p>
                  <ul className="flex flex-col gap-1.5 text-[13px] text-muted">
                    {service.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6">
              <h3 className="mb-3 font-bold">Common pitfalls to avoid</h3>
              <ul className="flex flex-col gap-1.5 text-[13.5px] text-muted">
                {PITFALLS.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4.5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-paper-raise p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="mb-1 font-bold">Document checklist</h3>
                <p className="text-[13.5px] text-muted">A ready-to-use PDF checklist for your visa type.</p>
              </div>
              <a href={WHATSAPP_URL} className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                Get the checklist
              </a>
            </div>

            <div className="mt-6">
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25">
                Talk to Our Visa Expert
              </a>
            </div>
          </div>
        </section>

        {/* Admission Counselling */}
        <section id="admission-counselling" className="scroll-mt-20 bg-paper-raise py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Admission Counselling
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Personalized 1:1 counseling, not a generic agency script.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                We help you choose the right country, program, and university aligned with your
                career goals — then walk the admission process with you end to end.
              </p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {ADMISSION_STEPS.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-line bg-card p-5">
                  <div className="mb-2 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mb-1.5 font-bold">{step.title}</h3>
                  <p className="text-[13px] leading-relaxed text-muted">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-center text-xl font-extrabold">
                Frequently Asked Questions (FAQ)
              </h3>
              <div className="flex flex-col gap-3">
                {FAQS.map((faq) => (
                  <details key={faq.q} className="group rounded-xl border border-line bg-card px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-bold [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3">
                        <span className="text-lg font-bold text-accent group-open:rotate-45 transition-transform">+</span>
                        {faq.q}
                      </span>
                      <span className="text-muted transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <p className="mt-3 pl-7 text-[13.5px] leading-relaxed text-muted">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <a href="/#consultation" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25">
              Book a Free Consultation Today
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
