"use client";

import { useState } from "react";
import { fmt, localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

export default function CourseFilter({
  lang,
  copy,
}: {
  lang: Locale;
  copy: Dictionary["forms"]["courseFilter"];
}) {
  const [qualification, setQualification] = useState("");
  const [country, setCountry] = useState("");

  const ready = qualification && country;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="mb-4 font-bold">{copy.title}</h3>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <select
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">{copy.qualification}</option>
          {copy.qualifications.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">{copy.country}</option>
          {copy.countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {ready ? (
        <div className="rounded-xl bg-paper-raise p-4.5 text-[13.5px] leading-relaxed">
          {fmt(copy.result, { qualification, country })}
          <a
            href={localePath(lang, "/#consultation")}
            className="mt-3 block font-semibold text-accent hover:underline"
          >
            {copy.resultCta}
          </a>
        </div>
      ) : (
        <p className="text-[13px] text-muted">{copy.hint}</p>
      )}
    </div>
  );
}
