import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouTubeEmbed from "../components/YouTubeEmbed";
import ChecklistForm from "../components/ChecklistForm";
import { readContent } from "../../lib/content";
import { getVideo } from "../../lib/videos";
import { getWhatsAppUrl } from "../../lib/whatsapp";

export const metadata: Metadata = {
  title: "Services",
  description: "Visa & Admission support and Admission Counselling from iStudentPlus education consultants.",
};

type VisaService = { name: string; intro: string; points: string[]; icon?: string };
type AdmissionStep = { title: string; description: string };
type Faq = { q: string; a: string; link?: { text: string; href: string } };
type ServicesPageContent = { pitfalls: string[]; admissionSteps: AdmissionStep[]; faqs: Faq[] };

export default async function ServicesPage() {
  const VISA_SERVICES = await readContent<VisaService[]>("visaServices");
  const { pitfalls: PITFALLS, admissionSteps: ADMISSION_STEPS, faqs: FAQS } =
    await readContent<ServicesPageContent>("servicesPage");
  const VIDEO = await getVideo("Services");
  const WHATSAPP_URL = await getWhatsAppUrl();

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
          <section className="py-8">
            <div className="mx-auto max-w-3xl px-7">
              <div className="mb-8 text-center">
                <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">Watch</div>
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  Our services in <span className="text-accent">a minute</span>.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                  See how our visa and admission support works, end to end.
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={VIDEO.youtubeId} videoFile={VIDEO.videoFile} title={VIDEO.title} />
              </div>
            </div>
          </section>
        )}

        {/* Visa & Admission */}
        <section id="visa-admission" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Visa &amp; Admission
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Multiple visa pathways, one end-to-end guide.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                From student visas to short and long-stay options across Australia and Japan, we
                walk with you through every step of settling into a new country.
              </p>
            </div>

            <div className="mb-4.5 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {VISA_SERVICES.map((service) => (
                <div key={service.name} className="rounded-2xl border border-line bg-card p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-xl">
                    {service.icon || "📄"}
                  </div>
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
              <h3 className="mb-3 font-bold">Avoid the most common visa rejection reasons</h3>
              <ul className="mb-5 flex flex-col gap-1.5 text-[13.5px] text-muted">
                {PITFALLS.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line bg-paper-raise p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13.5px] font-semibold">
                  Inquire this document checklist as your visa guidance.
                </p>
                <ChecklistForm />
              </div>
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
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                Student Visa Admission Counselling
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Get to know your counseling process, step by step.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                We help you choose the right country, program, and university aligned with your
                career and long-term goals.
              </p>
            </div>

            <div className="relative mb-8 flex flex-col gap-2.5 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-px before:bg-line before:content-['']">
              {ADMISSION_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`relative flex items-start gap-4 rounded-2xl px-3.5 py-3.5 ${
                    i === 0 ? "border border-accent/20 bg-accent/5" : ""
                  }`}
                >
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold ${
                      i === 0 ? "bg-accent text-white" : "border border-line bg-card text-muted"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-extrabold">{step.title}</h4>
                    <p className="text-[13px] leading-relaxed text-muted">{step.description}</p>
                  </div>
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
                    <p className="mt-3 pl-7 text-[13.5px] leading-relaxed text-muted">
                      {faq.a}
                      {faq.link && (
                        <>
                          {" "}
                          <a href={faq.link.href} className="font-semibold text-accent hover:underline">
                            {faq.link.text} →
                          </a>
                        </>
                      )}
                    </p>
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
