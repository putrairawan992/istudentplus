"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

type Labels = {
  /** Closed state: the button that opens the form. */
  open: string;
  submit: string;
  submitting: string;
  cancel: string;
  success: string;
  failure: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  whatsappPlaceholder: string;
};

// Defaults are the webinar wording (Indonesian) this form started life with; the language
// programs page passes English. Kept as one component because the only real difference between
// the two is copy — the lead round trip, the collapsed/open states and the error handling are
// identical, and duplicating them was how the two would have drifted.
const DEFAULT_LABELS: Labels = {
  open: "Daftar gratis",
  submit: "Kirim pendaftaran",
  submitting: "Mendaftarkan…",
  cancel: "Batal",
  success: "✓ Pendaftaranmu masuk. Link acaranya kami kirim ke email/WhatsApp sebelum hari-H.",
  failure: "Pendaftaran gagal.",
  namePlaceholder: "Nama lengkap",
  emailPlaceholder: "Email aktif",
  whatsappPlaceholder: "Nomor WhatsApp (opsional)",
};

/**
 * A lead, not an account: submissions land in the same CMS inbox as the consultation and
 * contact forms (`/admin/leads`), tagged with what they were about. `subjectKey`/`subject`
 * is that tag — the webinar title, or the language program someone is asking about.
 */
export default function LeadForm({
  source,
  subjectKey,
  subject,
  labels,
}: {
  source: "webinar" | "inquiry";
  subjectKey: string;
  subject: string;
  labels?: Partial<Labels>;
}) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("source", source);
    data.set(subjectKey, subject);
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || copy.failure);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : copy.failure);
    }
  }

  if (status === "success") {
    return (
      <p className="mt-4 rounded-xl bg-paper-raise px-4 py-3 text-[13.5px] font-semibold">
        {copy.success}
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
        {copy.open}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
      <input name="name" type="text" required placeholder={copy.namePlaceholder} className={inputClass} />
      <input name="email" type="email" required placeholder={copy.emailPlaceholder} className={inputClass} />
      <input name="whatsapp" type="tel" placeholder={copy.whatsappPlaceholder} className={inputClass} />
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "loading" ? copy.submitting : copy.submit}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}
