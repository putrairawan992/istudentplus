"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

export default function ContactForm({
  lang,
  copy,
  fallbackError,
}: {
  lang: Locale;
  copy: Dictionary["forms"]["contact"];
  fallbackError: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source", "contact");
    formData.set("lang", lang);

    try {
      const res = await fetch("/api/leads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || fallbackError);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : fallbackError);
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-10 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <h3 className="mb-1.5 text-lg font-extrabold">{copy.successTitle}</h3>
        <p className="text-sm text-muted">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-7">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
          {copy.name}
        </label>
        <input id="name" name="name" type="text" required placeholder={copy.namePlaceholder} className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          {copy.email}
        </label>
        <input id="email" name="email" type="email" required placeholder={copy.emailPlaceholder} className={inputClass} />
      </div>
      <div>
        <label htmlFor="destination" className="mb-1.5 block text-sm font-semibold">
          {copy.destination}
        </label>
        <input
          id="destination"
          name="destination"
          type="text"
          placeholder={copy.destinationPlaceholder}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
          {copy.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={copy.messagePlaceholder}
          className={inputClass}
        />
      </div>
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "loading" ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
