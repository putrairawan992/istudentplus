"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

type Copy = Dictionary["forms"]["contact"];

// Pill fields on a tinted ground, turning white with a pink ring on focus — the shape the
// mockup uses for every input (ISP Ads Landing Page, #apply).
const inputClass =
  "h-[46px] w-full rounded-full border border-line bg-paper px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-card focus:ring-3 focus:ring-accent/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

/**
 * The consultation card from the ads landing-page mockup: heading with a "no fees" chip, four
 * pill fields, one full-width pink action, then a divider down to WhatsApp for anyone who
 * would rather not fill in a form at all. Sending swaps the card for a confirmation that
 * pushes the same WhatsApp hand-off, since that is the fastest answer available.
 *
 * The message box is the one thing kept from the old form and absent from the mockup: that
 * mockup is a single-purpose ad landing page, and this is the page people arrive at to ask a
 * specific question. Dropping it would send those questions nowhere.
 */
export default function ContactForm({
  lang,
  copy,
  fallbackError,
  whatsappUrl,
}: {
  lang: Locale;
  copy: Copy;
  fallbackError: string;
  whatsappUrl: string;
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
      <div className="rounded-3xl border border-line bg-card p-7 text-center shadow-xl shadow-ink/10 sm:p-8">
        <div className="mx-auto grid h-15 w-15 place-items-center rounded-full bg-emerald-50 text-[28px] font-extrabold text-emerald-700">
          ✓
        </div>
        <h2 className="mt-4.5 text-[22px] font-extrabold tracking-tight">{copy.successTitle}</h2>
        <p className="mx-auto mt-2.5 max-w-sm text-[14.5px] leading-relaxed text-muted">
          {copy.successBody}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5.5 flex h-13 items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-base font-extrabold text-[#08351C] transition-colors hover:bg-[#2ee178]"
        >
          {copy.continueWhatsApp}
        </a>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-[12.5px] font-semibold text-muted hover:text-ink"
        >
          {copy.submitAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-card p-7 shadow-xl shadow-ink/10 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[21px] font-extrabold tracking-tight">{copy.heading}</h2>
        <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          {copy.headingBadge}
        </span>
      </div>
      <p className="mt-2 mb-5 text-[14px] leading-relaxed text-muted">{copy.intro}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field label={copy.name}>
          <input name="name" type="text" required placeholder={copy.namePlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.email}>
          <input name="email" type="email" required placeholder={copy.emailPlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.whatsapp}>
          <input name="whatsapp" type="tel" placeholder={copy.whatsappPlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.destination}>
          {/* A list beats the old free-text box: "Aussie", "australi" and "AUS" were all the
              same lead, and the counselor had to read them to find out which. */}
          <select name="destination" defaultValue="" className={`${inputClass} appearance-none`}>
            <option value="" disabled>
              {copy.destinationPlaceholder}
            </option>
            {copy.destinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.message}>
          <textarea
            name="message"
            rows={3}
            placeholder={copy.messagePlaceholder}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-card focus:ring-3 focus:ring-accent/15"
          />
        </Field>

        {status === "error" && (
          <p className="rounded-xl border border-accent/25 bg-accent/8 px-3 py-2.5 text-[13px] font-semibold text-accent-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 h-13 w-full rounded-full bg-accent text-base font-extrabold text-white shadow-lg shadow-accent/30 transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {status === "loading" ? copy.submitting : copy.submit}
        </button>
        <p className="text-center text-[11.5px] leading-relaxed text-muted">{copy.note}</p>
      </form>

      <div className="my-4.5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11.5px] font-semibold text-muted">{copy.orReachDirectly}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-[14.5px] font-bold text-[#08351C] transition-colors hover:bg-[#2ee178]"
      >
        <span className="block h-2 w-2 rounded-full bg-[#08351C]" />
        {copy.whatsappInstead}
      </a>
    </div>
  );
}
