"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

// Registration is a lead, not an account: it lands in the same CMS inbox as the consultation
// and contact forms, tagged with the webinar title. The team sends the join link from there.
export default function RegisterForm({ webinar }: { webinar: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("source", "webinar");
    data.set("webinar", webinar);
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Pendaftaran gagal.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-4 rounded-xl bg-paper-raise px-4 py-3 text-[13.5px] font-semibold">
        ✓ Pendaftaranmu masuk. Link acaranya kami kirim ke email/WhatsApp sebelum hari-H.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03]"
      >
        Daftar gratis
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
      <input name="name" type="text" required placeholder="Nama lengkap" className={inputClass} />
      <input name="email" type="email" required placeholder="Email aktif" className={inputClass} />
      <input name="whatsapp" type="tel" placeholder="Nomor WhatsApp (opsional)" className={inputClass} />
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "loading" ? "Mendaftarkan…" : "Kirim pendaftaran"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
          Batal
        </button>
      </div>
    </form>
  );
}
