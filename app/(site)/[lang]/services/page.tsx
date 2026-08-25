import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Marked from "@/app/components/Marked";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";
import ChecklistForm from "@/app/components/ChecklistForm";
import { readContent } from "@/lib/content";
import { getVideo } from "@/lib/videos";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { alternatesFor, hasLocale, localePath } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  return {
    title: d.meta.services.title,
    description: d.meta.services.description,
    alternates: alternatesFor(lang, "/services"),
  };
}

type VisaService = { name: string; intro: string; points: string[]; icon?: string };
type AdmissionStep = { title: string; description: string };
type Faq = { q: string; a: string; link?: { text: string; href: string } };
type ServicesPageContent = { pitfalls: string[]; admissionSteps: AdmissionStep[]; faqs: Faq[] };

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  const VISA_SERVICES = await readContent<VisaService[]>("visaServices", lang);
  const { pitfalls: PITFALLS, admissionSteps: ADMISSION_STEPS, faqs: FAQS } =
    await readContent<ServicesPageContent>("servicesPage", lang);
  const VIDEO = await getVideo("Services", lang);
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
      <Header lang={lang} />
      <main>
        {/* The "Two services that get you from interest to offer letter." hero was removed on
            client feedback — the page now opens straight on the services video. The h1 moved
            onto that section so the page still has exactly one top-level heading. */}
        <section className="pt-16 pb-8">
          <div className="mx-auto max-w-3xl px-7">
            <div className={`text-center ${VIDEO ? "mb-8" : ""}`}>
              <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
                {d.services.kicker}
              </div>
              {/* The heading stays outside the VIDEO check so the page keeps its h1 even if
                  the video is ever unpublished from the CMS. */}
              <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                <Marked text={d.services.title} />
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                {d.services.subtitle}
              </p>
            </div>
            {VIDEO && (
              <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <YouTubeEmbed id={VIDEO.youtubeId} videoFile={VIDEO.videoFile} title={VIDEO.title} />
              </div>
            )}
          </div>
        </section>

        {/* Visa & Admission */}
        <section id="visa-admission" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            <div className="mb-8 max-w-xl">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.services.visaKicker}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">{d.services.visaTitle}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{d.services.visaSubtitle}</p>
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
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6">
              <h3 className="mb-3 font-bold">{d.services.pitfallsTitle}</h3>
              <ul className="mb-5 flex flex-col gap-1.5 text-[13.5px] text-muted">
                {PITFALLS.map((pitfall) => (
                  <li key={pitfall}>• {pitfall}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line bg-paper-raise p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13.5px] font-semibold">{d.services.checklistPrompt}</p>
                <ChecklistForm
                  lang={lang}
                  copy={d.forms.checklist}
                  fallbackError={d.common.somethingWentWrong}
                />
              </div>
            </div>

            <div className="mt-6">
              <a href={WHATSAPP_URL} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25">
                {d.services.talkToVisaExpert}
              </a>
            </div>
          </div>
        </section>

        {/* Admission Counselling */}
        <section id="admission-counselling" className="scroll-mt-20 bg-paper-raise py-16">
          <div className="mx-auto max-w-[1400px] px-7">
            {/* Centred column: the steps used to run the full 1400px width, leaving a wide
                empty gutter on the right that read as a mistake. The step text itself stays
                left-aligned — a centred list with icons would be unreadable. */}
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-accent">
                {d.services.counsellingKicker}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">{d.services.counsellingTitle}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{d.services.counsellingSubtitle}</p>
            </div>

            <div className="relative mx-auto mb-8 flex max-w-3xl flex-col gap-2.5 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-px before:bg-line before:content-['']">
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
              <h3 className="mb-4 text-center text-xl font-extrabold">{d.services.faqTitle}</h3>
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

            <a
              href={localePath(lang, "/#consultation")}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25"
            >
              {d.services.bookToday}
            </a>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
