import Image from "next/image";
import Link from "next/link";
import { readContent } from "../../lib/content";
import { getVisibleCountries } from "../study-abroad/data";

type Social = { label: string; href: string };

export default async function Footer() {
  const [SETTINGS, COUNTRIES] = await Promise.all([
    readContent<{ socials: Social[]; whatsapp: string }>("settings"),
    getVisibleCountries(),
  ]);
  const SOCIALS = [...SETTINGS.socials, { label: "WhatsApp", href: SETTINGS.whatsapp }];

  return (
    <footer className="mt-5 border-t border-line py-14">
      <div className="mx-auto max-w-[1400px] px-7">
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
            {/* From the CMS, like the header's submenu — this list used to be Australia and UK
                hardcoded, and UK is one of the countries the client wants out of sight. */}
            {COUNTRIES.map((country) => (
              <Link
                key={country.slug}
                href={`/study-abroad/${country.slug}`}
                className="mb-2.5 block text-[13.5px] hover:text-accent"
              >
                {country.name}
              </Link>
            ))}
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
        </div>
      </div>
    </footer>
  );
}
