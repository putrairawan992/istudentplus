// Checks for webinar scheduling. No test framework in this project, so:
//   npx tsx lib/webinars.check.ts
import assert from "node:assert/strict";
import { groupByTheme, schedule, scheduleParts, webinarThumbnail, type Webinar, type WebinarWithStatus } from "./webinars.ts";

const COPY_EN = { minutes: "{count} min", timezone: "WIB" };
const COPY_ID = { minutes: "{count} menit", timezone: "WIB" };

// 05:00 UTC is 12:00 in Jakarta. The whole point of pinning the timezone is that this reads
// the same for a visitor in Perth as for one in Pangkalpinang.
const session: Webinar = {
  title: "Study and Build Your Career in Australia",
  date: "2026-08-15T05:00:00Z",
  durationMinutes: 90,
  platform: "Zoom",
};

const en = scheduleParts(session, "en", COPY_EN);
assert.ok(en);
assert.equal(en.date, "Saturday, 15 August 2026");
assert.equal(en.time, "12:00 WIB");
assert.equal(en.duration, "90 min");

const id = scheduleParts(session, "id", COPY_ID);
assert.ok(id);
assert.match(id.date, /Sabtu.*15 Agustus 2026/, "Indonesian weekday and month");
assert.equal(id.duration, "90 menit");

// The server renders these; a machine on another timezone must not change the answer.
process.env.TZ = "Australia/Perth";
assert.equal(scheduleParts(session, "en", COPY_EN)?.time, "12:00 WIB", "timezone is pinned");

// No duration filled in: the row is dropped, not printed as "undefined min".
const noDuration = scheduleParts({ ...session, durationMinutes: undefined }, "en", COPY_EN);
assert.equal(noDuration?.duration, null);

// Undated and unparseable entries are still listed, they just say nothing about when.
assert.equal(scheduleParts({ title: "x" }, "en", COPY_EN), null);
assert.equal(scheduleParts({ title: "x", date: "not a date" }, "en", COPY_EN), null);
assert.equal(schedule({ title: "x" }, "en", COPY_EN), null);

// The one-line form the cards use is the parts, joined — so the hero and a card can never
// disagree about when a session runs.
assert.equal(schedule(session, "en", COPY_EN), "Saturday, 15 August 2026 · 12:00 WIB · 90 min");
assert.equal(
  schedule({ ...session, durationMinutes: undefined }, "en", COPY_EN),
  "Saturday, 15 August 2026 · 12:00 WIB"
);

// --- grouping ---------------------------------------------------------------
const w = (over: Partial<WebinarWithStatus>): WebinarWithStatus => ({
  title: "t",
  status: "past",
  ...over,
});
const grouped = groupByTheme(
  [w({ title: "a", theme: "Karier" }), w({ title: "b" }), w({ title: "c", theme: "Karier" })],
  "Other"
);
assert.deepEqual(
  grouped.map(([theme, items]) => [theme, items.length]),
  [["Karier", 2], ["Other", 1]],
  "untagged entries land in the Other bucket, and it sorts last"
);
// Blank and whitespace themes are untagged, not a theme called " ".
assert.equal(groupByTheme([w({ theme: "   " })], "Other")[0][0], "Other");

// --- thumbnails -------------------------------------------------------------
assert.equal(webinarThumbnail({ title: "t", image: "/uploads/p.jpg" }), "/uploads/p.jpg");
assert.equal(
  webinarThumbnail({ title: "t", liveYoutubeId: "abc123" }),
  "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  "falls back to the stream's poster frame"
);
assert.equal(webinarThumbnail({ title: "t" }), null);

console.log("webinars.check.ts ok");
