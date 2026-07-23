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
  return value;
}
