"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

// Same click-to-reveal pattern as LeadForm: the checklist "form" is really a
// lead capture (source "checklist") — the team follows up by email, there's no automated PDF
// delivery yet since that needs an email-sending service the project doesn't have configured.
export default function ChecklistForm({
  lang,
  copy,
  fallbackError,
}: {
  lang: Locale;
  copy: Dictionary["forms"]["checklist"];
  fallbackError: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("source", "checklist");
    data.set("lang", lang);
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || fallbackError);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : fallbackError);
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-xl bg-paper-raise px-4 py-3 text-[13.5px] font-semibold">{copy.success}</p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        {copy.open}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-start">
      <input name="name" type="text" required placeholder={copy.namePlaceholder} className={inputClass} />
      <input name="email" type="email" required placeholder={copy.emailPlaceholder} className={inputClass} />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "loading" ? copy.submitting : copy.submit}
      </button>
      {status === "error" && (
        <p className="basis-full rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
    </form>
  );
}
