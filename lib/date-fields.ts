// The CMS stores two shapes of date, and a native picker has to round-trip both without
// mangling what is already stored:
//   blog.date       2025-07-26                  — a plain calendar date
//   webinars.date   2026-04-18T12:00:00+07:00   — wall clock plus the WIB offset
//
// Everything the site does with webinar dates is in Asia/Jakarta (see app/webinars/shared.ts),
// so a picker means "this WIB wall clock" and the stored offset stays +07:00.

export const WIB_OFFSET = "+07:00";

export type DateGranularity = "date" | "datetime";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HAS_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Field keys that hold a date. Narrow on purpose: `durationMinutes` and `submittedAt` are not
    dates a person edits, and catching them would swap in a picker that can't hold their value. */
export function isDateKey(key?: string): boolean {
  return !!key && /^date$/i.test(key);
}

/**
 * Which picker a value wants. An existing value decides it; an empty one falls back to the
 * collection's known shape, so "+ Add new entry" opens the right control on a blank form.
 */
export function granularityOf(value: string | null | undefined, collection?: string): DateGranularity {
  if (value && HAS_TIME.test(value)) return "datetime";
  if (value && DATE_ONLY.test(value)) return "date";
  // Webinars are scheduled to the minute; a blog post is filed to the day.
  return collection === "webinars" ? "datetime" : "date";
}

/**
 * Whether a picker can represent this value at all. Anything else keeps the plain text box —
 * a value the picker can't hold must stay readable and hand-fixable, never be silently cleared.
 */
export function isPickable(value: string | null | undefined): boolean {
  if (!value) return true;
  if (DATE_ONLY.test(value)) return true;
  return HAS_TIME.test(value) && !Number.isNaN(new Date(value).getTime());
}

// h23 rather than hour12:false: the latter renders midnight as "24" in some runtimes, which no
// input accepts.
const jakartaParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Stored value → the string a native `date` / `datetime-local` input expects. */
export function toInputValue(value: string | null | undefined, granularity: DateGranularity): string {
  if (!value) return "";
  if (granularity === "date") return DATE_ONLY.test(value) ? value : value.slice(0, 10);

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // Read the instant back as WIB wall clock, so a value written with a different offset still
  // shows the local time the event actually starts at.
  const p: Record<string, string> = {};
  for (const part of jakartaParts.formatToParts(d)) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Input string → the value to store. Empty means "no date", which this CMS stores as null. */
export function fromInputValue(input: string, granularity: DateGranularity): string | null {
  if (!input) return null;
  if (granularity === "date") return input;
  // Chrome gives YYYY-MM-DDTHH:mm; some browsers include seconds when the step allows them.
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input) ? `${input}:00` : input;
  return `${withSeconds}${WIB_OFFSET}`;
}
