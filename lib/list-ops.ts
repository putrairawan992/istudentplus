/**
 * One edit to a list collection.
 *
 * The admin editor used to save by shipping the whole collection back through a Server Action.
 * For `blog` that is 277 posts — ~1.5MB per keystroke-save — which blew Next's Server Action
 * request-body cap and failed with an opaque digest error. An op describes just what changed
 * (a few KB), and the server applies it to the document it already has.
 */
export type ListOp =
  | { type: "insert"; entry: unknown }
  | { type: "replace"; index: number; entry: unknown }
  | { type: "remove"; index: number }
  | { type: "move"; from: number; to: number };

/**
 * Applies one op to a list, returning a new array.
 *
 * Throws when an index isn't there any more — the list changed between the editor loading it
 * and the save arriving. Refusing beats writing the edit onto whichever entry now sits at that
 * position, which is silent data loss.
 */
export function applyListOp<T>(list: readonly T[], op: ListOp): T[] {
  const next = [...list];
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < next.length;

  switch (op.type) {
    case "insert":
      // New entries land at the top, matching where the editor shows them.
      next.unshift(op.entry as T);
      return next;
    case "replace":
      if (!inRange(op.index)) throw new RangeError(`replace: no entry at ${op.index}`);
      next[op.index] = op.entry as T;
      return next;
    case "remove":
      if (!inRange(op.index)) throw new RangeError(`remove: no entry at ${op.index}`);
      next.splice(op.index, 1);
      return next;
    case "move": {
      if (!inRange(op.from) || !inRange(op.to)) {
        throw new RangeError(`move: ${op.from} -> ${op.to} out of range`);
      }
      const [moved] = next.splice(op.from, 1);
      next.splice(op.to, 0, moved);
      return next;
    }
  }
}
