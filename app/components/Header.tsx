import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "About Us", href: "/about" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const WHATSAPP_URL = "https://wa.me/6281234567890";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-7 py-3.5">
        <Link href="/" className="shrink-0">
          <Image
            src="/icon-istudentplus.png"
            alt="iStudentPlus"
            width={986}
            height={338}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="hidden gap-7 text-sm font-medium text-muted md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={WHATSAPP_URL}
          className="rounded-full bg-accent px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03]"
        >
          Chat WhatsApp
        </a>
      </div>
    </header>
  );
}

export { WHATSAPP_URL };
