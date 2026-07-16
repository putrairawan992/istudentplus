"use client";

import { useState } from "react";

const QUALIFICATIONS = ["VET or Diploma", "Bachelor Degree", "Master Degree", "PhD", "Language Study", "Exchange Program"];
const COUNTRIES = ["Australia", "UK", "USA", "Canada", "China", "Japan"];

export default function CourseFilter() {
  const [qualification, setQualification] = useState("");
  const [country, setCountry] = useState("");

  const ready = qualification && country;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="mb-4 font-bold">Browse by qualification &amp; country</h3>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <select
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">Qualification</option>
          {QUALIFICATIONS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">Country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {ready ? (
        <div className="rounded-xl bg-paper-raise p-4.5 text-[13.5px] leading-relaxed">
          {`We don't publish a live university database yet — tell a counselor you're looking at ${qualification} in ${country} and they'll send you the current partner list and requirements.`}
          <a href="/#consultation" className="mt-3 block font-semibold text-accent hover:underline">
            Book a free consultation →
          </a>
        </div>
      ) : (
        <p className="text-[13px] text-muted">Pick both to see how a counselor can help.</p>
      )}
    </div>
  );
}
