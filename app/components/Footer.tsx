import Image from "next/image";
import Link from "next/link";
import { readContent } from "../../lib/content";
import { getVisibleCountries } from "@/lib/countries";
import { getDictionary } from "@/lib/dictionary";
import { localePath, type Locale } from "@/lib/i18n";

type Social = { label: string; href: string };

export default async function Footer({ lang }: { lang: Locale }) {
  const [SETTINGS, COUNTRIES, d] = await Promise.all([
    readContent<{ socials: Social[] }>("settings", lang),
    getVisibleCountries(lang),
    getDictionary(lang),
  ]);
  // Both WhatsApp numbers (ID + AU) are stored in `socials` now, so don't append a third.
  const SOCIALS = SETTINGS.socials;
  const p = (path: string) => localePath(lang, path);

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
            <p className="max-w-xs text-[13.5px] leading-relaxed text-muted">{d.footer.tagline}</p>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {d.footer.studyAbroad}
            </h5>
            {/* From the CMS, like the header's submenu — this list used to be Australia and UK
                hardcoded, and UK is one of the countries the client wants out of sight. */}
            {COUNTRIES.map((country) => (
              <Link
                key={country.slug}
                href={p(`/study-abroad/${country.slug}`)}
                className="mb-2.5 block text-[13.5px] hover:text-accent"
              >
                {country.name}
              </Link>
            ))}
            <Link href={p("/study-abroad")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.allDestinations}
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {d.footer.programs}
            </h5>
            <Link href={p("/services")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.services}
            </Link>
            <Link href={p("/courses")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.coursesUniversities}
            </Link>
            <Link href={p("/language-programs")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.languagePrograms}
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {d.footer.company}
            </h5>
            <Link href={p("/about")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.aboutUs}
            </Link>
            <Link href={p("/blog")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.blog}
            </Link>
            <Link href={p("/contact")} className="mb-2.5 block text-[13.5px] hover:text-accent">
              {d.footer.contactUs}
            </Link>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {d.footer.social}
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
          <span>{d.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
