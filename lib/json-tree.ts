export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };

type PathSegment = string | number;

export function getAtPath(root: JsonValue, path: PathSegment[]): JsonValue {
  let cur: JsonValue = root;
  for (const seg of path) {
    if (cur == null) return null;
    // @ts-expect-error index into array or object by segment
    cur = cur[seg];
  }
  return cur ?? null;
}

export function setAtPath(root: JsonValue, path: PathSegment[], value: JsonValue): JsonValue {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = root.slice();
    const idx = Number(head);
    copy[idx] = setAtPath(copy[idx] ?? null, rest, value);
    return copy;
  }
  const obj = { ...(root as JsonObject) };
  obj[String(head)] = setAtPath(obj[String(head)] ?? null, rest, value);
  return obj;
}

export function removeAtIndex(root: JsonValue, path: PathSegment[], index: number): JsonValue {
  const arr = getAtPath(root, path);
  if (!Array.isArray(arr)) return root;
  const copy = arr.slice();
  copy.splice(index, 1);
  return setAtPath(root, path, copy);
}

export function insertAtEnd(root: JsonValue, path: PathSegment[], item: JsonValue): JsonValue {
  const arr = getAtPath(root, path);
  if (!Array.isArray(arr)) return setAtPath(root, path, [item]);
  return setAtPath(root, path, [...arr, item]);
}

export function blankShapeOf(value: JsonValue): JsonValue {
  if (value === null) return null;
  if (Array.isArray(value)) return [];
  if (typeof value === "object") {
    const result: JsonObject = {};
    for (const key of Object.keys(value)) {
      result[key] = blankShapeOf(value[key]);
    }
    return result;
  }
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return value;
}

/** True when `a` is a more useful shape template than `b` — a longer array, or a longer string.
    Ties (including two empty values) keep whichever was found first. */
function isRicherThan(a: JsonValue, b: JsonValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length > b.length;
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === "string" && typeof b === "string") return a.length > b.length;
  return false;
}

/**
 * The union of every field across a list collection's entries, each key mapped to the richest
 * example found for it (e.g. the country with the fullest Key Facts list). Entries in the same
 * list collection can otherwise have wildly different keys — a destination page finished only
 * up to "why study here" versus one with the full Key Facts/Living Costs/Visa Requirements
 * treatment — and without this, each entry's editor would show a different set of tabs for what
 * the client sees as "the same kind of page." Key order follows whichever entry first introduces
 * each field, scanned in list order, so every entry's tabs land in the same left-to-right order.
 */
export function unionShapeOf(items: JsonValue[]): JsonObject {
  const model: JsonObject = {};
  for (const item of items) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) continue;
    for (const [key, value] of Object.entries(item)) {
      if (!(key in model) || isRicherThan(value, model[key])) model[key] = value;
    }
  }
  return model;
}

/**
 * `item` widened to every field the collection's other entries have, in the model's own field
 * order — a field this particular entry doesn't have yet renders blank (and, for a list, ready
 * to fill in) instead of its whole tab silently not existing. Purely a display shape: the extra
 * keys aren't written back unless the admin actually edits one, same as any other field.
 */
export function mergeWithModel(item: JsonObject, model: JsonObject): JsonObject {
  const merged: JsonObject = {};
  for (const key of Object.keys(model)) {
    merged[key] = key in item ? item[key] : blankShapeOf(model[key]);
  }
  for (const key of Object.keys(item)) {
    if (!(key in merged)) merged[key] = item[key];
  }
  return merged;
}
