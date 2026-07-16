import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_URL } from "./Header";

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "WhatsApp", href: WHATSAPP_URL },
];

export default function Footer() {
  return (
    <footer className="mt-5 border-t border-line py-14">
      <div className="mx-auto max-w-6xl px-7">
        <div className="mb-10 grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/icon-istudentplus.png"
              alt="iStudentPlus"
              width={986}
              height={338}
              className="mb-3 h-8 w-auto"
            />
            <p className="max-w-xs text-[13.5px] leading-relaxed text-muted">
              Your Global Student Network and Media Agency — offices in Pangkalpinang and
              Makassar, Indonesia (Jakarta coming soon).
            </p>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Study Abroad
            </h5>
            <Link href="/study-abroad/australia" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Australia
            </Link>
            <Link href="/study-abroad/uk" className="mb-2.5 block text-[13.5px] hover:text-accent">
              UK
            </Link>
            <Link href="/study-abroad" className="mb-2.5 block text-[13.5px] hover:text-accent">
              All destinations
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Programs
            </h5>
            <Link href="/services" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Services
            </Link>
            <Link href="/courses" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Courses &amp; Universities
            </Link>
            <Link href="/language-programs" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Language Programs
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Company
            </h5>
            <Link href="/about" className="mb-2.5 block text-[13.5px] hover:text-accent">
              About Us
            </Link>
            <Link href="/blog" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Blog
            </Link>
            <Link href="/contact" className="mb-2.5 block text-[13.5px] hover:text-accent">
              Contact Us
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Social
            </h5>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} className="mb-2.5 block text-[13.5px] hover:text-accent">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="stub mb-6" />
        <div className="flex flex-wrap justify-between gap-2.5 font-mono text-[12.5px] text-muted">
          <span>© 2026 iStudentPlus</span>
          <span>Built with Next.js · Optimized for SEO &amp; Generative Engines</span>
        </div>
      </div>
    </footer>
  );
}
