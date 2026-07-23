"use client";

import { useState } from "react";

const DESTINATIONS = ["Australia", "Japan", "China", "UK", "USA", "Canada", "Others"];
const FIELDS_OF_STUDY = ["Business", "IT", "Hospitality", "Health", "Language and Linguistic", "Others"];
const QUALIFICATION_LEVELS = ["VET or Diploma", "Bachelor Degree", "Master Degree", "PhD", "Language Study", "Others"];
const LATEST_QUALIFICATIONS = ["High School", "VET or Diploma", "Bachelor Degree", "Master Degree", "PhD", "Language Study", "Others"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

export default function ConsultationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source", "consultation");

    try {
      const res = await fetch("/api/leads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <h3 className="mb-1.5 text-lg font-extrabold">Thanks — we got it!</h3>
        <p className="text-sm text-muted">A counselor will reach out on WhatsApp or email soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-line bg-card p-7 sm:grid-cols-2">
      <Field label="Name">
        <input name="name" type="text" required placeholder="Your full name" className={inputClass} />
      </Field>
      <Field label="Email Address">
        <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
      </Field>
      <Field label="WhatsApp Number">
        <input name="whatsapp" type="tel" placeholder="+62 8xx xxxx xxxx" className={inputClass} />
      </Field>
      <Field label="Preferred Study Destination">
        <select name="destination" className={inputClass} defaultValue="">
          <option value="" disabled>Select a destination</option>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="Preferred Field of Study">
        <select name="fieldOfStudy" className={inputClass} defaultValue="">
          <option value="" disabled>Select a field</option>
          {FIELDS_OF_STUDY.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label="Preferred Level of Qualification">
        <select name="qualificationLevel" className={inputClass} defaultValue="">
          <option value="" disabled>Select a level</option>
          {QUALIFICATION_LEVELS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Latest Qualification">
          <select name="latestQualification" className={inputClass} defaultValue="">
            <option value="" disabled>Select your latest qualification</option>
            {LATEST_QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Attach Your Most Updated CV">
          <input
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
          />
          <p className="mt-1.5 text-xs text-muted">For assessment purposes prior to your consultation.</p>
        </Field>
      </div>
      {status === "error" && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.02] disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
      >
        {status === "loading" ? "Sending…" : "Book My Free Consultation"}
      </button>
    </form>
  );
}
