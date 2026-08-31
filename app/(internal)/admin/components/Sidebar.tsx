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
  const [query, setQuery] = useState("");

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
        className={`group flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
          active
            ? "bg-accent/10 text-accent-ink shadow-xs"
            : "text-muted hover:bg-paper-raise hover:text-ink"
        }`}
      >
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[13px] transition-colors ${
            active ? "bg-accent/20 text-accent" : "bg-paper-raise group-hover:bg-card"
          }`}
        >
          {icon}
        </span>
        {/* Wraps rather than truncating: "Consultation & Contac…" and "Study Abroad Countri…"
            hid exactly the words that told them apart. Two lines cost less than a guess. */}
        <span className="min-w-0 leading-snug">{label}</span>
        {badge > 0 && (
          <span
            aria-label={`${badge} baru`}
            className="ml-auto min-w-5 shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white animate-pulse"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  const filteredCollections = query.trim()
    ? COLLECTIONS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.key.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-base font-extrabold hover:text-accent">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-xs text-white">iS</span>
          <span>iStudentPlus CMS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink"
            title="View live site"
          >
            ↗ Site
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
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
        {/* Header with logo & live site link */}
        <div className="mb-4 hidden items-center justify-between gap-2 px-1 lg:flex">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-paper-raise">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#d92672] text-sm font-bold text-white shadow-xs">iS</span>
            <span className="text-base font-extrabold leading-tight text-ink">
              iStudentPlus<br />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Admin CMS</span>
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open live website in new tab"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-xs font-bold text-muted transition-colors hover:bg-paper-raise hover:text-ink"
          >
            ↗
          </Link>
        </div>

        {/* Quick sidebar filter */}
        <div className="mb-3 px-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections…"
              className="w-full rounded-xl border border-line bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {navLink("/admin", "📊", "Dashboard")}

          {filteredCollections ? (
            <div className="mt-3">
              <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-widest text-muted/70">
                Matches ({filteredCollections.length})
              </p>
              {filteredCollections.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted">No collections found.</p>
              ) : (
                filteredCollections.map((c) =>
                  navLink(`/admin/${c.key}`, c.icon, c.label, c.key === "leads" ? unseen : 0)
                )
              )}
            </div>
          ) : (
            COLLECTION_GROUPS.map((group) => {
              const items = COLLECTIONS.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="mt-4 first:mt-2">
                  <p className="mb-1 px-3 text-[10.5px] font-bold uppercase tracking-widest text-muted/70">
                    {group}
                  </p>
                  {items.map((c) =>
                    navLink(`/admin/${c.key}`, c.icon, c.label, c.key === "leads" ? unseen : 0)
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-paper-raise hover:text-ink"
          >
            <span>View Public Website</span>
            <span>↗</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
