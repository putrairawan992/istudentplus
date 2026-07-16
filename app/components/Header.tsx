import Image from "next/image";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/6281234567890";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const COUNTRIES = [
  { label: "Australia", slug: "australia" },
  { label: "UK", slug: "uk" },
  { label: "USA", slug: "usa" },
  { label: "Canada", slug: "canada" },
  { label: "China", slug: "china" },
  { label: "Japan", slug: "japan" },
];

const NAV_ITEMS: NavItem[] = [
  { label: "About Us", href: "/about" },
  {
    label: "Study Abroad",
    href: "/study-abroad",
    children: COUNTRIES.map((c) => ({ label: c.label, href: `/study-abroad/${c.slug}` })),
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Visa & Admission", href: "/services#visa-admission" },
      { label: "Admission Counselling", href: "/services#admission-counselling" },
    ],
  },
  { label: "Courses & Universities", href: "/courses" },
  {
    label: "Language Programs",
    href: "/language-programs",
    children: [
      { label: "General English", href: "/language-programs#general-english" },
      { label: "Conversation Class", href: "/language-programs#conversation-class" },
      { label: "IELTS", href: "/language-programs#ielts" },
      { label: "JLPT", href: "/language-programs#jlpt" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [
      { label: "Recent News", href: "/blog?category=recent-news" },
      { label: "Immigration", href: "/blog?category=immigration" },
      { label: "Student Life", href: "/blog?category=student-life" },
      { label: "Study Tips", href: "/blog?category=study-tips" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
];

function NavLink({ item }: { item: NavItem }) {
  if (!item.children) {
    return (
      <Link href={item.href} className="transition-colors hover:text-ink">
        {item.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <Link href={item.href} className="flex items-center gap-1 transition-colors hover:text-ink">
        {item.label}
        <span className="text-[9px] opacity-60">▼</span>
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-52 rounded-xl border border-line bg-card p-2 opacity-0 shadow-lg shadow-ink/10 transition-all group-hover:visible group-hover:opacity-100">
        {item.children.map((child) => (
          <Link
            key={child.label}
            href={child.href}
            className="block rounded-lg px-3 py-2 text-[13.5px] text-ink hover:bg-paper-raise"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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
        <nav className="hidden gap-6 text-sm font-medium text-muted lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/contact" className="hidden text-sm font-medium text-muted hover:text-ink sm:block">
            Login
          </Link>
          <Link
            href="/#consultation"
            className="rounded-full bg-accent px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03]"
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </header>
  );
}

export { WHATSAPP_URL, COUNTRIES };
