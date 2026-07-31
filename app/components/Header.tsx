"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  { label: "Webinar", href: "/webinars" },
  { label: "Forum", href: "/threads" },
  { label: "Contact Us", href: "/contact" },
];

function NavLink({ item }: { item: NavItem }) {
  if (!item.children) {
    return (
      <Link href={item.href} className="whitespace-nowrap transition-colors hover:text-ink">
        {item.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <Link href={item.href} className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-ink">
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

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  if (!item.children) {
    return (
      <Link href={item.href} onClick={onNavigate} className="block px-2 py-2.5 font-semibold text-ink">
        {item.label}
      </Link>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2 py-2.5 font-semibold text-ink"
      >
        {item.label}
        <span className={`text-[10px] opacity-60 transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="flex flex-col border-l border-line pl-3">
          {item.children.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              onClick={onNavigate}
              className="px-2 py-2 text-sm text-muted hover:text-ink"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-7 py-3.5">
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
        <nav className="hidden gap-4 text-sm font-medium text-muted xl:flex">
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
            className="hidden rounded-full bg-accent px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Book Free Consultation
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line xl:hidden"
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-paper px-7 py-3 xl:hidden">
          <nav className="flex flex-col divide-y divide-line">
            {NAV_ITEMS.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3">
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-2 py-1 text-sm font-medium text-muted">
              Login
            </Link>
            <Link
              href="/#consultation"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-accent px-4.5 py-2.5 text-center text-[13.5px] font-semibold text-white"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export { COUNTRIES };
