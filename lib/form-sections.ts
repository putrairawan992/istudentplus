import type { JsonObject } from "./json-tree";

export type Section = { label: string; keys: string[] };

/**
 * Splits a CMS form into tab sections so a long document (Site Settings, a country page) stops
 * being one endless scroll. Derived from the data rather than a per-collection list:
 *
 *   · every list/object field becomes its own section — those are the parts that grow
 *   · media/video fields share a "Media" section, but only on a form big enough to be worth
 *     splitting and only when there are at least two of them (a lone photo field belongs with
 *     the rest of the details)
 *   · whatever is left is "General", shown first
 *
 * Returns a single section when there is nothing worth tabbing — the caller then renders the
 * plain form, because a four-field entry gains nothing from a tab strip.
 *
 * Invariant the check script pins down: every key lands in exactly one section, so no field can
 * quietly vanish from the editor.
 */
export function sectionsOf(
  value: JsonObject,
  isMediaish: (key: string) => boolean,
  minKeysForMediaTab = 7
): Section[] {
  const allKeys = Object.keys(value);
  const isComplex = (k: string) => {
    const v = value[k];
    return Array.isArray(v) || (v !== null && typeof v === "object");
  };

  const complex = allKeys.filter(isComplex);
  const mediaCandidates =
    allKeys.length >= minKeysForMediaTab ? allKeys.filter((k) => !isComplex(k) && isMediaish(k)) : [];
  const media = mediaCandidates.length >= 2 ? mediaCandidates : [];
  const general = allKeys.filter((k) => !isComplex(k) && !media.includes(k));

  const sections: Section[] = [];
  if (general.length > 0) sections.push({ label: "General", keys: general });
  if (media.length > 0) sections.push({ label: "Media", keys: media });
  for (const key of complex) sections.push({ label: humanizeKey(key), keys: [key] });
  return sections;
}

/** `keyFacts` → `Key Facts`. Same rule the field labels use. */
export function humanizeKey(key: string) {
  const withSpaces = key.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
