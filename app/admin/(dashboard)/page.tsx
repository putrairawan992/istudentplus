import Link from "next/link";
import { COLLECTIONS, COLLECTION_GROUPS } from "../../../lib/collections";
import { readContent } from "../../../lib/content";

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

  return (
    <div>
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-ink to-[#1d4066] p-7 text-white shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Dashboard</p>
        <h1 className="mt-1 text-2xl font-extrabold">Welcome back 👋</h1>
        <p className="mt-1 max-w-lg text-sm text-white/70">
          This is the content powering the live iStudentPlus website. Pick a section below to edit it — changes go live on save.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-2.5">
            <div className="text-xl font-extrabold">{COLLECTIONS.length}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Collections</div>
          </div>
          <Link href="/admin/leads" className="rounded-2xl bg-accent px-4 py-2.5 transition-transform hover:scale-[1.03]">
            <div className="text-xl font-extrabold">{leadCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">New leads →</div>
          </Link>
        </div>
      </div>

      {COLLECTION_GROUPS.map((group) => {
        const items = COLLECTIONS.filter((c) => c.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="mb-8">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => {
                const count = counts.get(c.key) ?? null;
                return (
                  <Link
                    key={c.key}
                    href={`/admin/${c.key}`}
                    className="group rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper-raise text-lg transition-colors group-hover:bg-accent/10">
                        {c.icon}
                      </span>
                      {count !== null && (
                        <span className="rounded-full bg-paper-raise px-2.5 py-0.5 text-[11px] font-bold text-muted">
                          {count}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold">{c.label}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.description}</p>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-accent">Used on: {c.usedOn}</p>
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
