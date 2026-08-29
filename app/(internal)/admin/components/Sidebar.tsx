"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { COLLECTIONS, COLLECTION_GROUPS } from "@/lib/collections";

/**
 * When this browser last opened the inbox, as the newest submission time it saw.
 *
 * ponytail: per-browser, in localStorage. A shared "seen" marker would mean a write to the
 * content API on every visit to the inbox and a new field to migrate; sign in on a second
 * device and the badge simply counts from zero there. Move it into `settings` if the team
 * ever wants the count to agree across devices.
 */
const LEADS_SEEN_KEY = "istudentplus:leadsSeenAt";
const LEADS_SEEN_EVENT = "istudentplus:leads-seen";
const INBOX_HREF = "/admin/leads";

function readSeenAt(): string {
  try {
    return localStorage.getItem(LEADS_SEEN_KEY) ?? "";
  } catch {
    return ""; // private mode / storage blocked: nothing has been seen
  }
}

/** Re-read on our own write, and on another tab's — two open tabs shouldn't disagree. */
function subscribeSeenAt(onChange: () => void) {
  window.addEventListener(LEADS_SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LEADS_SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function markSeen(at: string) {
  try {
    localStorage.setItem(LEADS_SEEN_KEY, at);
  } catch {
    // Nothing to do — the badge just comes back on the next load.
  }
  window.dispatchEvent(new Event(LEADS_SEEN_EVENT));
}

export default function Sidebar({ leadTimes }: { leadTimes: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The server can't know what this browser has seen, so its snapshot is null and the badge
  // renders nothing until the client has read localStorage — no wrong number flashing on
  // hydration, and no setState inside an effect to get there.
  const seenAt = useSyncExternalStore(subscribeSeenAt, readSeenAt, () => null);

  const newest = leadTimes.reduce((a, b) => (a > b ? a : b), "");

  // Opening the inbox is what marks it read.
  useEffect(() => {
    if (pathname === INBOX_HREF && newest) markSeen(newest);
  }, [pathname, newest]);

  // ISO-8601 UTC strings, so a lexical compare is a chronological one.
  const unseen = seenAt === null ? 0 : leadTimes.filter((t) => t > seenAt).length;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href;

  const navLink = (href: string, icon: string, label: string, badge = 0) => {
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
        {badge > 0 && (
          <span
            aria-label={`${badge} baru`}
            className="ml-auto min-w-5 shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-base font-extrabold hover:text-accent">
          iStudentPlus CMS
        </Link>
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
        {/* Back to the public site — the logo is the one thing everybody already tries to click. */}
        <Link href="/" className="mb-6 hidden items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-paper-raise lg:flex">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">iS</span>
          <span className="text-base font-extrabold leading-tight">iStudentPlus<br /><span className="text-[11px] font-bold uppercase tracking-widest text-muted">CMS</span></span>
        </Link>

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
                {items.map((c) =>
                  navLink(`/admin/${c.key}`, c.icon, c.label, c.key === "leads" ? unseen : 0)
                )}
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
