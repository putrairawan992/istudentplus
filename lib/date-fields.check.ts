// Round-trip check for the CMS date picker helpers. No test framework in this project, so:
//   node --experimental-strip-types lib/date-fields.check.ts
import assert from "node:assert/strict";
import {
  fromInputValue,
  granularityOf,
  isDateKey,
  isPickable,
  toInputValue,
  type DateGranularity,
} from "./date-fields.ts";

// which control a field gets
assert.equal(isDateKey("date"), true);
assert.equal(isDateKey("Date"), true);
assert.equal(isDateKey("durationMinutes"), false);
assert.equal(isDateKey("submittedAt"), false);
assert.equal(isDateKey(undefined), false);

assert.equal(granularityOf("2026-04-18T12:00:00+07:00"), "datetime");
assert.equal(granularityOf("2025-07-26"), "date");
assert.equal(granularityOf("", "webinars"), "datetime", "a blank webinar entry needs time too");
assert.equal(granularityOf(null, "blog"), "date");
assert.equal(granularityOf(null, undefined), "date");

// the whole point: an existing value survives a render/edit cycle byte-for-byte
const roundTrip = (v: string, g: DateGranularity) => fromInputValue(toInputValue(v, g), g);
assert.equal(roundTrip("2026-04-18T12:00:00+07:00", "datetime"), "2026-04-18T12:00:00+07:00");
assert.equal(roundTrip("2026-07-05T12:00:00+07:00", "datetime"), "2026-07-05T12:00:00+07:00");
assert.equal(roundTrip("2025-07-26", "date"), "2025-07-26");

// a value written in another offset is shown as the WIB wall clock it really starts at
assert.equal(toInputValue("2026-04-18T05:00:00+00:00", "datetime"), "2026-04-18T12:00");
assert.equal(fromInputValue("2026-04-18T12:00", "datetime"), "2026-04-18T12:00:00+07:00");
// midnight must not come back as hour 24
assert.equal(toInputValue("2026-01-01T00:00:00+07:00", "datetime"), "2026-01-01T00:00");

// clearing the field stores null, matching how every other field in the editor blanks
assert.equal(fromInputValue("", "datetime"), null);
assert.equal(fromInputValue("", "date"), null);

// unrepresentable values keep the plain text box instead of being wiped
assert.equal(isPickable("besok pagi"), false);
assert.equal(isPickable("2026-13-45T99:99:00+07:00"), false);
assert.equal(isPickable(""), true, "an empty field is safe to hand to the picker");
assert.equal(isPickable("2026-04-18T12:00:00+07:00"), true);
assert.equal(isPickable("2025-07-26"), true);

// a datetime value shown in a date-only slot keeps its day rather than blanking
assert.equal(toInputValue("2026-04-18T12:00:00+07:00", "date"), "2026-04-18");

console.log("date-fields: all checks passed");
