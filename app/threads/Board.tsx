"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "../../lib/threads";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

// Fixed locale and timezone so the server-rendered timestamp matches what the browser renders.
const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

function PostForm({
  parentId,
  placeholder,
  compact,
  onDone,
}: {
  parentId?: number;
  placeholder: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          author: String(data.get("author") || ""),
          body: String(data.get("body") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Gagal mengirim.");
      form.reset();
      onDone?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "mt-3 flex flex-col gap-2"
          : "flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 sm:p-6"
      }
    >
      <input
        name="author"
        type="text"
        maxLength={40}
        placeholder="Nama (opsional — kosongkan untuk Anonim)"
        className={inputClass}
      />
      <textarea
        name="body"
        required
        rows={compact ? 2 : 4}
        maxLength={2000}
        placeholder={placeholder}
        className={inputClass}
      />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {busy ? "Mengirim…" : parentId ? "Balas" : "Kirim pertanyaan"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-muted hover:text-ink">
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

// ponytail: native prompt/confirm for the moderation dialogs. The admin CMS has a nicer
// ConfirmModal, but this page is public and importing the admin shell here isn't worth it.
function ModTools({ post }: { post: Post }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(init: RequestInit) {
    setBusy(true);
    await fetch(`/api/threads/${post.id}`, { headers: { "Content-Type": "application/json" }, ...init });
    setBusy(false);
    router.refresh();
  }
  const patch = (body: object) => act({ method: "PATCH", body: JSON.stringify(body) });

  const btn = "rounded-md border border-line px-2 py-1 font-semibold hover:bg-paper-raise disabled:opacity-50";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dashed border-line pt-2 text-[11px] text-muted">
      <span className="rounded bg-paper-raise px-1.5 py-1 font-mono" title="Handle moderasi (hash IP)">
        {post.ipHash?.slice(0, 8)}
      </span>
      <button type="button" disabled={busy} className={btn} onClick={() => patch({ hidden: !post.hidden })}>
        {post.hidden ? "Tampilkan" : "Sembunyikan"}
      </button>
      <button
        type="button"
        disabled={busy}
        className={btn}
        onClick={() => {
          const body = window.prompt("Edit tulisan", post.body);
          if (body?.trim()) patch({ body });
        }}
      >
        Edit
      </button>
      <button
        type="button"
        disabled={busy}
        className={btn}
        onClick={() => {
          if (post.blocked || window.confirm("Blokir pengirim ini? Semua tulisannya ikut disembunyikan."))
            patch({ block: !post.blocked });
        }}
      >
        {post.blocked ? "Buka blokir" : "Blokir"}
      </button>
      <button
        type="button"
        disabled={busy}
        className={`${btn} text-red-600`}
        onClick={() => {
          if (window.confirm("Hapus permanen? Balasannya ikut terhapus.")) act({ method: "DELETE" });
        }}
      >
        Hapus
      </button>
    </div>
  );
}

function PostBody({ post, isAdmin }: { post: Post; isAdmin: boolean }) {
  return (
    <div className={post.hidden ? "opacity-50" : undefined}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-bold">{post.author}</span>
        {post.official && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-ink">
            ✓ Tim iStudentPlus
          </span>
        )}
        <span className="text-[11px] text-muted">{dateFmt.format(new Date(post.createdAt))}</span>
        {post.hidden && (
          <span className="rounded-full bg-paper-raise px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
            disembunyikan
          </span>
        )}
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-[14.5px] leading-relaxed">{post.body}</p>
      {isAdmin && <ModTools post={post} />}
    </div>
  );
}

export default function Board({ posts, isAdmin }: { posts: Post[]; isAdmin: boolean }) {
  const [replyTo, setReplyTo] = useState<number | null>(null);

  // The API returns oldest-first. Newest questions belong on top; replies read better in order.
  const roots = posts.filter((p) => p.parentId === null).reverse();

  return (
    <div className="flex flex-col gap-5">
      <PostForm placeholder="Tulis pertanyaanmu di sini…" />

      {roots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
          Belum ada pertanyaan. Jadi yang pertama!
        </p>
      ) : (
        roots.map((root) => {
          const replies = posts.filter((p) => p.parentId === root.id);
          return (
            <article key={root.id} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <PostBody post={root} isAdmin={isAdmin} />

              {replies.length > 0 && (
                <div className="mt-4 flex flex-col gap-4 border-l-2 border-line pl-4">
                  {replies.map((reply) => (
                    <PostBody key={reply.id} post={reply} isAdmin={isAdmin} />
                  ))}
                </div>
              )}

              {replyTo === root.id ? (
                <PostForm
                  parentId={root.id}
                  compact
                  placeholder="Tulis jawabanmu…"
                  onDone={() => setReplyTo(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyTo(root.id)}
                  className="mt-3 text-[13px] font-semibold text-accent hover:underline"
                >
                  Balas{replies.length > 0 ? ` (${replies.length})` : ""}
                </button>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
