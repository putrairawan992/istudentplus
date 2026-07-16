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
  return (
    <form className="grid gap-4 rounded-2xl border border-line bg-card p-7 sm:grid-cols-2">
      <Field label="Name">
        <input type="text" placeholder="Your full name" className={inputClass} />
      </Field>
      <Field label="Email Address">
        <input type="email" placeholder="you@example.com" className={inputClass} />
      </Field>
      <Field label="WhatsApp Number">
        <input type="tel" placeholder="+62 8xx xxxx xxxx" className={inputClass} />
      </Field>
      <Field label="Preferred Study Destination">
        <select className={inputClass} defaultValue="">
          <option value="" disabled>Select a destination</option>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="Preferred Field of Study">
        <select className={inputClass} defaultValue="">
          <option value="" disabled>Select a field</option>
          {FIELDS_OF_STUDY.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label="Preferred Level of Qualification">
        <select className={inputClass} defaultValue="">
          <option value="" disabled>Select a level</option>
          {QUALIFICATION_LEVELS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Latest Qualification">
          <select className={inputClass} defaultValue="">
            <option value="" disabled>Select your latest qualification</option>
            {LATEST_QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Attach Your Most Updated CV">
          <input type="file" accept=".pdf,.doc,.docx" className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white`} />
          <p className="mt-1.5 text-xs text-muted">For assessment purposes prior to your consultation.</p>
        </Field>
      </div>
      <button
        type="submit"
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.02] sm:col-span-2 sm:justify-self-start"
      >
        Book My Free Consultation
      </button>
    </form>
  );
}
