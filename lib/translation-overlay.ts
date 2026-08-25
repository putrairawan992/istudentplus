// How a translated CMS document combines with the English one it sits on top of. Kept free of
// imports so lib/i18n.check.ts can exercise it directly under `node --experimental-strip-types`.

/** A value an editor hasn't filled in: English should show through instead of a blank. */
function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * The translated document laid over the English one. Per-field for objects, so a half-finished
 * `settings.id` shows Indonesian where it has been written and English everywhere else;
 * whole-list for arrays, because matching up entry 3 of one list with entry 3 of another is a
 * guess, and a guess here means a Japanese webinar captioned as an Australian one.
 */
export function overlay<T>(base: T, translated: unknown): T {
  if (isBlank(translated)) return base;
  if (
    base !== null &&
    typeof base === "object" &&
    !Array.isArray(base) &&
    typeof translated === "object" &&
    !Array.isArray(translated)
  ) {
    const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(translated as Record<string, unknown>)) {
      merged[k] = k in merged ? overlay(merged[k], v) : v;
    }
    return merged as T;
  }
  return translated as T;
}
