"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

type Copy = Dictionary["forms"]["consultation"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20";

// The dropdown values are what the counselor reads in the CMS inbox, so they stay in the
// visitor's language — a lead that says "Jepang" is no harder to act on than one that says
// "Japan", and translating them back would need a mapping nobody maintains.
export default function ConsultationForm({
  lang,
  copy,
  fallbackError,
}: {
  lang: Locale;
  copy: Copy;
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
    formData.set("source", "consultation");
    // So the API's own validation messages come back in the language being read.
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
      <div className="rounded-2xl border border-line bg-card p-10 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <h3 className="mb-1.5 text-lg font-extrabold">{copy.successTitle}</h3>
        <p className="text-sm text-muted">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-line bg-card p-7 sm:grid-cols-2">
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
        <select name="destination" className={inputClass} defaultValue="">
          <option value="" disabled>{copy.destinationPlaceholder}</option>
          {copy.destinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>
      {/* Optional details tucked behind a native disclosure — lowers friction to a 4-field ask. */}
      <details className="group sm:col-span-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-accent hover:underline">
          <span className="group-open:hidden">{copy.showOptional}</span>
          <span className="hidden group-open:inline">{copy.hideOptional}</span>
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={copy.fieldOfStudy}>
            <select name="fieldOfStudy" className={inputClass} defaultValue="">
              <option value="" disabled>{copy.fieldOfStudyPlaceholder}</option>
              {copy.fieldsOfStudy.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label={copy.qualificationLevel}>
            <select name="qualificationLevel" className={inputClass} defaultValue="">
              <option value="" disabled>{copy.qualificationLevelPlaceholder}</option>
              {copy.qualificationLevels.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={copy.latestQualification}>
              <select name="latestQualification" className={inputClass} defaultValue="">
                <option value="" disabled>{copy.latestQualificationPlaceholder}</option>
                {copy.latestQualifications.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={copy.cv}>
              <input
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
              />
              <p className="mt-1.5 text-xs text-muted">{copy.cvHint}</p>
            </Field>
          </div>
        </div>
      </details>
      {status === "error" && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.02] disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
      >
        {status === "loading" ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
