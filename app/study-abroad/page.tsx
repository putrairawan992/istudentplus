import type { Metadata } from "next";
import Link from "next/link";
import Header, { WHATSAPP_URL } from "../components/Header";
import Footer from "../components/Footer";
import { COUNTRIES } from "./data";

export const metadata: Metadata = {
  title: "Study Abroad",
  description:
    "Explore study destinations — Australia, UK, USA, Canada, China, and Japan — with guidance from iStudentPlus counselors.",
};

export default function StudyAbroadPage() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-16 pb-14">
          <div className="mx-auto max-w-3xl px-7 text-center">
            <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-sky-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky">
              Study Abroad
            </div>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Pick a destination, then let a <span className="text-accent">counselor</span> handle
              the paperwork.
            </h1>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-7">
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {COUNTRIES.map((dest) => (
                <Link
                  key={dest.slug}
                  href={`/study-abroad/${dest.slug}`}
                  className={`relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b p-5 text-white ${dest.gradient}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide backdrop-blur-sm">
                    {dest.tag}
                  </span>
                  <h4 className="relative text-xl font-bold">{dest.name}</h4>
                  <span className="relative text-xs opacity-85">{dest.cities}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper-raise py-16">
          <div className="mx-auto max-w-5xl px-7 text-center">
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight">
              Not sure which qualification fits your goal?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-[15px] leading-relaxed text-muted">
              Compare VET/Diploma, Bachelor, Master, PhD, and language-study pathways on the
              Courses &amp; Universities page.
            </p>
            <Link href="/courses" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              Browse Courses &amp; Universities
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-7">
            <div className="flex flex-col items-center gap-4.5 rounded-3xl bg-ink px-8 py-14 text-center text-white">
              <h2 className="max-w-md text-3xl font-extrabold">
                Not sure which country fits? Ask a counselor.
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
