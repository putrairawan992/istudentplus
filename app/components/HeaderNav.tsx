"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_LABELS,
  localePath,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export type NavCountry = { label: string; slug: string };
export type NavCategory = { label: string; slug: string };

type NavCopy = {
  nav: Dictionary["nav"];
  language: Dictionary["language"];
  common: Pick<Dictionary["common"], "bookFreeConsultation">;
};

// Built per render from the CMS's country list (order and visibility live there, not here).
// Every href goes through localePath so a click from an Indonesian page stays Indonesian.
const navItems = (
  locale: Locale,
  d: NavCopy,
  countries: NavCountry[],
  categories: NavCategory[]
): NavItem[] => {
  const p = (path: string) => localePath(locale, path);
  return [
    {
      label: d.nav.aboutUs,
      href: p("/about"),
      children: [
        { label: d.nav.aboutUs, href: p("/about") },
        { label: d.nav.ourServices, href: p("/services") },
        { label: d.nav.contactUs, href: p("/contact") },
      ],
    },
    {
      label: d.nav.studyAbroad,
      href: p("/study-abroad"),
      children: [
        ...countries.map((c) => ({ label: c.label, href: p(`/study-abroad/${c.slug}`) })),
        // Courses & Universities is Australia-only content, so it sits inside Study Abroad
        // instead of taking a top-level slot. Promote it back out when other countries have
        // real course data.
        { label: d.nav.coursesUniversities, href: p("/courses") },
      ],
    },
    {
      label: d.nav.languagePrograms,
      href: p("/language-programs"),
      children: [
        { label: d.nav.generalEnglish, href: p("/language-programs#general-english") },
        { label: d.nav.conversationClass, href: p("/language-programs#conversation-class") },
        { label: d.nav.ielts, href: p("/language-programs#ielts") },
        { label: d.nav.jlpt, href: p("/language-programs#jlpt") },
      ],
    },
    {
      label: d.nav.blog,
      href: p("/blog"),
      /* Straight from the blog's own category list — the two used to drift apart. */
      children: categories.map((c) => ({
        label: c.label,
        href: p(`/blog?category=${c.slug}`),
      })),
    },
    { label: d.nav.webinar, href: p("/webinars") },
    { label: d.nav.forum, href: p("/threads") },
  ];
};

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

/**
 * EN ↔ ID on the current page, not on the home page — someone reading a country page wants
 * that country page in the other language. A plain link per locale, so it works with
 * JavaScript off and search engines can follow it.
 */
function LangSwitcher({
  locale,
  d,
  className = "",
}: {
  locale: Locale;
  d: NavCopy;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-line p-0.5 text-[12px] font-bold ${className}`}
      aria-label={d.language.label}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={switchLocalePath(l, pathname)}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            title={d.language.names[l]}
            className={`rounded-full px-2 py-1 transition-colors ${
              active ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {LOCALE_LABELS[l]}
          </Link>
        );
      })}
    </div>
  );
}

// Signed-in staff get a way out from wherever they are; everyone else gets the way in.
// The logout form comes back to the current page instead of dumping you on the login screen.
// The CMS itself is English-only, so these links stay unprefixed.
function AuthControl({
  isAdmin,
  d,
  className,
}: {
  isAdmin: boolean;
  d: NavCopy;
  className?: string;
}) {
  const pathname = usePathname();
  if (!isAdmin) {
    return (
      <Link href="/admin/login" className={className}>
        {d.nav.login}
      </Link>
    );
  }
  return (
    <form action="/admin/logout" method="post" className="flex items-center gap-3">
      <input type="hidden" name="redirectTo" value={pathname} />
      <Link href="/admin" className={className}>
        {d.nav.admin}
      </Link>
      <button type="submit" className={className}>
        {d.nav.logout}
      </button>
    </form>
  );
}

export default function HeaderNav({
  isAdmin,
  countries,
  categories,
  locale,
  d,
}: {
  isAdmin: boolean;
  countries: NavCountry[];
  categories: NavCategory[];
  locale: Locale;
  d: NavCopy;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = navItems(locale, d, countries, categories);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-7 py-3.5">
        <Link href={localePath(locale, "/")} className="shrink-0">
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
          {items.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          <LangSwitcher locale={locale} d={d} className="hidden sm:flex" />
          <div className="hidden sm:block">
            <AuthControl isAdmin={isAdmin} d={d} className="text-sm font-medium text-muted hover:text-ink" />
          </div>
          <Link
            href={localePath(locale, "/#consultation")}
            className="hidden rounded-full bg-accent px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03] sm:inline-block"
          >
            {d.common.bookFreeConsultation}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={d.nav.toggleMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line xl:hidden"
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-paper px-7 py-3 xl:hidden">
          <nav className="flex flex-col divide-y divide-line">
            {items.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3">
            <div className="flex items-center justify-between px-2 py-1">
              <AuthControl isAdmin={isAdmin} d={d} className="text-sm font-medium text-muted" />
              <LangSwitcher locale={locale} d={d} />
            </div>
            <Link
              href={localePath(locale, "/#consultation")}
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-accent px-4.5 py-2.5 text-center text-[13.5px] font-semibold text-white"
            >
              {d.common.bookFreeConsultation}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
