"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COLLECTIONS, COLLECTION_GROUPS } from "@/lib/collections";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href;

  const navLink = (href: string, icon: string, label: string) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent/10 text-accent-ink"
            : "text-muted hover:bg-paper-raise hover:text-ink"
        }`}
      >
        <span
          className={`grid h-6 w-6 place-items-center rounded-md text-[13px] ${
            active ? "bg-accent/15" : "bg-paper-raise group-hover:bg-card"
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-base font-extrabold">iStudentPlus CMS</span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line bg-card p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 hidden items-center gap-2 px-2 lg:flex">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">iS</span>
          <span className="text-base font-extrabold leading-tight">iStudentPlus<br /><span className="text-[11px] font-bold uppercase tracking-widest text-muted">CMS</span></span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navLink("/admin", "📊", "Dashboard")}
          {COLLECTION_GROUPS.map((group) => {
            const items = COLLECTIONS.filter((c) => c.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mt-4">
                <p className="mb-1 px-3 text-[10.5px] font-bold uppercase tracking-widest text-muted/70">
                  {group}
                </p>
                {items.map((c) => navLink(`/admin/${c.key}`, c.icon, c.label))}
              </div>
            );
          })}
        </nav>

        <form action="/admin/logout" method="post" className="mt-4 border-t border-line pt-4">
          <button
            type="submit"
            className="w-full rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-paper-raise hover:text-ink"
          >
            Log out
          </button>
        </form>
      </aside>
    </>
  );
}
