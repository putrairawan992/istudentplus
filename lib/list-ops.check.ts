// Checks for list-collection edit ops. No test framework here, so:
//   node --experimental-strip-types lib/list-ops.check.ts
import assert from "node:assert/strict";
import { applyListOp, type ListOp } from "./list-ops.ts";

const base = ["a", "b", "c"];

// --- insert: new entries go to the top, where the editor shows them -----------
assert.deepEqual(applyListOp(base, { type: "insert", entry: "new" }), ["new", "a", "b", "c"]);
assert.deepEqual(applyListOp([], { type: "insert", entry: "first" }), ["first"], "empty list is fine");

// --- replace: only the named slot changes ------------------------------------
assert.deepEqual(applyListOp(base, { type: "replace", index: 1, entry: "B" }), ["a", "B", "c"]);
assert.deepEqual(applyListOp(base, { type: "replace", index: 0, entry: "A" }), ["A", "b", "c"]);

// --- remove ------------------------------------------------------------------
assert.deepEqual(applyListOp(base, { type: "remove", index: 0 }), ["b", "c"]);
assert.deepEqual(applyListOp(base, { type: "remove", index: 2 }), ["a", "b"]);

// --- move: the reorder buttons swap neighbours, but any pair must work --------
assert.deepEqual(applyListOp(base, { type: "move", from: 0, to: 1 }), ["b", "a", "c"]);
assert.deepEqual(applyListOp(base, { type: "move", from: 2, to: 0 }), ["c", "a", "b"]);
assert.deepEqual(applyListOp(base, { type: "move", from: 1, to: 1 }), ["a", "b", "c"], "no-op move");

// --- the input is never mutated ----------------------------------------------
const frozen = Object.freeze(["x", "y"]);
assert.deepEqual(applyListOp(frozen, { type: "remove", index: 0 }), ["y"]);
assert.deepEqual(frozen, ["x", "y"], "caller's array is left alone");

// --- a stale index is refused, not written onto the wrong entry ---------------
// This is the whole point of the bounds checks: the editor's index came from a list that may
// have changed. Writing "edited" onto whatever now sits at index 5 would be silent data loss.
const stale: ListOp[] = [
  { type: "replace", index: 5, entry: "edited" },
  { type: "replace", index: -1, entry: "edited" },
  { type: "remove", index: 3 },
  { type: "move", from: 0, to: 9 },
  { type: "move", from: 9, to: 0 },
];
for (const op of stale) {
  assert.throws(() => applyListOp(base, op), RangeError, `expected ${op.type} to be refused`);
}
// A non-integer index must not slip past the range check either.
assert.throws(() => applyListOp(base, { type: "replace", index: 1.5, entry: "x" }), RangeError);

console.log("list-ops: all checks passed");
