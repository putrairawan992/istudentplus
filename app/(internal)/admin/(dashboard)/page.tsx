import Link from "next/link";
import { COLLECTIONS, COLLECTION_GROUPS } from "@/lib/collections";
import { readContent } from "@/lib/content";

export default async function AdminDashboardPage() {
  // Fetch every collection's data up front so we can show counts without awaiting inside JSX.
  const counts = new Map<string, number | null>(
    await Promise.all(
      COLLECTIONS.map(async (c): Promise<[string, number | null]> => {
        const data = await readContent<unknown>(c.key);
        return [c.key, Array.isArray(data) ? data.length : null];
      })
    )
  );
  const leadCount = counts.get("leads") ?? 0;
  const blogCount = counts.get("blog") ?? 0;
  const webinarCount = counts.get("webinars") ?? 0;
  const countryCount = counts.get("countries") ?? 0;

  return (
    <div className="pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-[#17385c] to-[#112942] p-7 text-white shadow-md sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live CMS Console
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Welcome back 👋</h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
              Control and publish content across the live iStudentPlus website. All edits are applied instantly upon saving.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              href="/admin/leads"
              className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-white shadow-sm shadow-accent/40 transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-base font-extrabold">
                {leadCount}
              </span>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Inquiries / Leads</div>
                <div className="text-[10px] font-medium text-white/80">View submissions →</div>
              </div>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:scale-[1.02]"
            >
              <span>Visit Website</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-xs">
            <div className="text-xl font-extrabold text-white">{blogCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Blog Posts</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-xs">
            <div className="text-xl font-extrabold text-white">{countryCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Destinations</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-xs">
            <div className="text-xl font-extrabold text-white">{webinarCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Webinars</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-xs">
            <div className="text-xl font-extrabold text-white">{COLLECTIONS.length}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Total Collections</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mb-8 rounded-2xl border border-line bg-card p-4 shadow-xs">
        <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-muted">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Link
            href="/admin/blog"
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink transition-all hover:border-accent/40 hover:bg-card hover:shadow-xs"
          >
            <span>✍️</span>
            <span>Manage Blog</span>
          </Link>
          <Link
            href="/admin/webinars"
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink transition-all hover:border-accent/40 hover:bg-card hover:shadow-xs"
          >
            <span>🎥</span>
            <span>Manage Webinars</span>
          </Link>
          <Link
            href="/admin/countries"
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink transition-all hover:border-accent/40 hover:bg-card hover:shadow-xs"
          >
            <span>🌍</span>
            <span>Study Countries</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink transition-all hover:border-accent/40 hover:bg-card hover:shadow-xs"
          >
            <span>⚙️</span>
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* Collections by Group */}
      {COLLECTION_GROUPS.map((group) => {
        const items = COLLECTIONS.filter((c) => c.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="mb-8">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted">
                {group} <span className="text-muted/60">({items.length})</span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => {
                const count = counts.get(c.key) ?? null;
                return (
                  <Link
                    key={c.key}
                    href={`/admin/${c.key}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper-raise text-lg transition-transform group-hover:scale-110 group-hover:bg-accent/10">
                          {c.icon}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                            {c.kind === "list" ? "List" : "Single"}
                          </span>
                          {count !== null && (
                            <span className="rounded-full bg-paper-raise px-2.5 py-0.5 text-[11px] font-bold text-ink">
                              {count} items
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-ink transition-colors group-hover:text-accent">{c.label}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                      <span className="text-[11px] font-medium text-muted truncate max-w-[190px]">
                        Used: <span className="font-semibold text-ink/70">{c.usedOn}</span>
                      </span>
                      <span className="text-xs font-bold text-accent transition-transform group-hover:translate-x-1">
                        Edit →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
