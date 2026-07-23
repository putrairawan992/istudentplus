"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source", "contact");

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-10 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <h3 className="mb-1.5 text-lg font-extrabold">Message sent!</h3>
        <p className="text-sm text-muted">A counselor will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-7">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
          Full name
        </label>
        <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
      </div>
      <div>
        <label htmlFor="destination" className="mb-1.5 block text-sm font-semibold">
          Interested destination
        </label>
        <input
          id="destination"
          name="destination"
          type="text"
          placeholder="e.g. Australia, Korea, Japan"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about your study plans"
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
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
