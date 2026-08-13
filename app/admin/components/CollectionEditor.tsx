"use client";

import { createContext, useContext, useRef, useState, useTransition } from "react";
import type { JsonValue, JsonObject } from "../../../lib/json-tree";
import { setAtPath, removeAtIndex, insertAtEnd, blankShapeOf } from "../../../lib/json-tree";
import {
  IMAGE_EXT,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  VIDEO_EXT,
  acceptFor,
  checkImage,
  describeSpec,
  formatList,
  getImageSpec,
  isVideoField,
  rejectionMessage,
} from "../../../lib/image-specs";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

function humanize(key: string) {
  const withSpaces = key.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

// Which collection is open, so an image field can look up the size rules for its exact slot
// (a country banner is 2:1, a blog header is 3:2 — same "image" key, different shape). Passed by
// context rather than threaded through every recursive ObjectFields/FieldEditor call.
const CollectionContext = createContext<string | undefined>(undefined);

// Field keys that hold an uploadable asset — these render an image/video upload widget.
const MEDIA_KEY = /(image|photo|thumbnail|thumb|logo|icon|avatar|cover|poster|banner|picture|img|video)/i;
// Keys the regex above catches but that hold text, not a file: "imageLabel" is the caption drawn
// over a country card, and "icon" holds an emoji (🎓, 🧳). Both were rendering an upload box with
// a permanently broken preview, which is exactly the kind of thing that makes the CMS confusing.
const NOT_MEDIA_KEY = /^(imageLabel|icon)$/;
function isMediaKey(key?: string) {
  return !!key && MEDIA_KEY.test(key) && !NOT_MEDIA_KEY.test(key);
}
function isImagePath(v: string) {
  return /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(v) || (/^https?:\/\//i.test(v) && !/\.(mp4|webm|pdf)(\?|#|$)/i.test(v));
}
function isVideoPath(v: string) {
  return /\.(mp4|webm)(\?|#|$)/i.test(v);
}

// Reads an upload response as JSON, but degrades to the response's status/text instead of
// throwing a raw parse error when the body isn't JSON (a platform-level 413, a gateway 502, …).
async function readUploadResponse(res: Response): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    return await res.json();
  } catch {
    const text = (await res.text().catch(() => "")).trim();
    return { ok: false, error: text ? `Upload failed (${res.status}): ${text}` : `Upload failed (${res.status}).` };
  }
}

/** Intrinsic size of a picked image, read in the browser before it's uploaded. */
function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    // SVG has no meaningful pixel size, and video isn't what the specs describe.
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return resolve(null);
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

// A media string field: live preview + upload (click or drag-drop) + editable path/URL.
function ImageField({
  value,
  onChange,
  field,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  field?: string;
}) {
  const str = value ?? "";
  const collection = useContext(CollectionContext);
  const spec = getImageSpec(collection, field);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setErr("");
    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(
          `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB) — maksimal ${MAX_UPLOAD_LABEL}. Kompres gambarnya atau potong videonya dulu.`
        );
      }
      // Rejected here, before anything is uploaded or saved — an image that would ship
      // stretched or badly cropped never reaches the server in the first place.
      const dims = await readDimensions(file);
      if (spec && dims) {
        const { ok, reasons } = checkImage(spec, dims);
        if (!ok) throw new Error(rejectionMessage(spec, dims, reasons));
      }

      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await readUploadResponse(res);
      if (!res.ok || !data.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url as string);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal mengunggah.";
      // Toast so it's noticed even when the field is off-screen; the inline copy stays put
      // after the toast fades, since the message says what size to prepare next.
      toast("error", message);
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
        className={`grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border text-center text-[10px] ${drag ? "border-accent bg-accent/5" : "border-line bg-paper"}`}
        title="Click or drop a file to upload"
      >
        {busy ? (
          <span className="text-muted">Uploading…</span>
        ) : str && isVideoPath(str) ? (
          <video src={str} muted className="h-full w-full object-cover" />
        ) : str && isImagePath(str) ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, arbitrary hosts
          <img src={str} alt="" className="h-full w-full object-cover" />
        ) : str ? (
          <span className="px-1 text-muted">file set</span>
        ) : (
          <span className="text-muted">+ Upload</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <input
          type="text"
          value={str}
          placeholder="Upload, or paste an image/video URL"
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {/* The rules for this exact slot, spelled out before anyone picks a file — the whole
            point is that nobody has to guess and every upload comes out the same shape.
            Shown for every media field: slots without a size spec still get the limit and
            the accepted formats, which is what people were missing most. */}
        <div className="rounded-lg border border-line bg-paper-raise/60 px-3 py-2 text-[12px] leading-relaxed">
          <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5">
            {spec && (
              <>
                <dt className="text-muted">Ukuran</dt>
                <dd className="font-semibold text-ink">{describeSpec(spec)}</dd>
              </>
            )}
            <dt className="text-muted">Maks. ukuran file</dt>
            <dd className="font-semibold text-ink">{MAX_UPLOAD_LABEL}</dd>
            <dt className="text-muted">Format</dt>
            <dd className="font-semibold text-ink">
              {formatList(isVideoField(field) ? VIDEO_EXT : IMAGE_EXT)}
            </dd>
            {spec && (
              <>
                <dt className="text-muted">Dipakai di</dt>
                <dd className="text-ink">{spec.usedOn}</dd>
              </>
            )}
          </dl>
          {spec && (
            <p className="mt-1.5 text-muted">
              Gambar yang terlalu kecil atau bentuknya tidak sesuai akan{" "}
              <span className="font-semibold text-ink">ditolak</span> supaya tidak tampil pecah di
              website.{spec.note ? ` ${spec.note}` : ""}
            </p>
          )}
          {isVideoField(field) && (
            <p className="mt-1.5 text-muted">
              Batas {MAX_UPLOAD_LABEL} biasanya hanya cukup untuk klip beberapa detik. Untuk video
              panjang, pakai kolom YouTube — tanpa batas durasi.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-[12.5px] font-semibold text-accent hover:underline disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload file"}
          </button>
          {str && (
            <button type="button" onClick={() => onChange(null)} className="text-[12.5px] text-muted hover:text-red-600">
              Remove
            </button>
          )}
        </div>
        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] leading-relaxed text-red-700">
            ✕ {err}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        // Narrowed per field so the picker can't offer a video for a poster slot (or vice versa).
        accept={acceptFor(field)}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
}

// Field keys holding a raw YouTube video ID — accept a pasted URL too, and preview the thumbnail.
const YOUTUBE_KEY = /youtube/i;
function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  const match =
    trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
    trimmed.match(/youtube\.com\/(?:watch\?(?:\S*&)?v=|embed\/|shorts\/|v\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : trimmed;
}

function VideoField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const id = value ?? "";
  const [broken, setBroken] = useState(false);

  function handleChange(v: string) {
    setBroken(false);
    onChange(v === "" ? null : extractYouTubeId(v));
  }

  return (
    <div className="flex gap-3">
      <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper text-center text-[10px] text-muted">
        {id && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail
          <img
            src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span>No preview</span>
        )}
      </div>
      <input
        type="text"
        value={id}
        placeholder="Paste a YouTube URL or video ID"
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

// A solid Tailwind arbitrary-value bg class, e.g. "bg-[#FDF3C7]" — edit via a native color picker.
// Detected by value shape (works anywhere), plus the exact key "bg" (so a brand-new, still-blank
// entry gets the color picker too — an empty value can't be pattern-matched yet).
const BG_COLOR = /^bg-\[(#[0-9a-fA-F]{6})\]$/;
function isBgColorField(key: string | undefined, value: string | null) {
  if (typeof value === "string" && BG_COLOR.test(value)) return true;
  return key === "bg";
}

function BgColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = value.match(BG_COLOR)?.[1] ?? "#ffffff";
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(`bg-[${e.target.value}]`)}
        className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-line bg-paper p-1"
        title="Pick a color"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function isObject(v: JsonValue): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// "Description" is unambiguously prose everywhere it appears — always a textarea, no matter
// how short today's value happens to be, so it doesn't clip as someone types a longer one.
const PROSE_KEY = /^(desc|description)$/i;
// "Value" is ambiguous: a Key Facts row ("AUD 20,000 – AUD 45,000 / year") and a homepage stat
// ("9.3K") are the same {label, value} shape with very different content. They don't overlap
// in length in the data on this site (stats top out at 4 chars, Key Facts values start at 7),
// so a low length floor tells them apart without needing to know which array either came from.
const SHORT_VALUE_KEY = /^value$/i;
const SHORT_VALUE_FLOOR = 5;

// The one place that decides "does this string get an <input> or a <textarea>" — shared by
// the field itself (StringField) and the layout around it (isWideField), so a field that's
// about to render as a textarea can't end up squeezed into a half-width column because its
// current value happens to be short.
function isTextareaValue(v: string | null, label?: string): boolean {
  const str = v ?? "";
  if (str.length > 50 || str.includes("\n")) return true;
  if (!label) return false;
  if (PROSE_KEY.test(label)) return true;
  if (SHORT_VALUE_KEY.test(label)) return str.length > SHORT_VALUE_FLOOR;
  return false;
}

// A field is "wide" (spans the full row) if it renders tall: a textarea, a list, or a nested
// object. Short scalars (short strings, numbers) sit two-per-row so entries scroll less.
function isWideField(v: JsonValue, label?: string): boolean {
  if (typeof v === "string" || v === null) return isTextareaValue(v as string | null, label);
  if (typeof v === "number") return false;
  return true; // arrays and objects
}

// Pick a human-readable label for a list entry from its most title-like string field.
const TITLE_KEYS = ["name", "title", "label", "question", "value", "country", "heading"];
function entryTitle(item: JsonValue, fallback: string): string {
  if (!isObject(item)) return fallback;
  for (const k of TITLE_KEYS) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return v.length > 60 ? v.slice(0, 60) + "…" : v;
  }
  const firstStr = Object.values(item).find((v) => typeof v === "string" && v.trim());
  return typeof firstStr === "string" ? (firstStr.length > 60 ? firstStr.slice(0, 60) + "…" : firstStr) : fallback;
}

function StringField({
  value,
  onChange,
  placeholder,
  label,
  rows = 3,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
}) {
  const str = value ?? "";
  if (isTextareaValue(value, label)) {
    return (
      <textarea
        value={str}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
      />
    );
  }
  return (
    <input
      type="text"
      value={str}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
    />
  );
}

function FieldEditor({
  value,
  path,
  root,
  setRoot,
  label,
}: {
  value: JsonValue;
  path: (string | number)[];
  root: JsonValue;
  setRoot: (v: JsonValue) => void;
  label?: string;
}) {
  const update = (v: JsonValue) => setRoot(setAtPath(root, path, v));
  const placeholder = label ? `Enter ${humanize(label).toLowerCase()}` : undefined;

  if (value === null || typeof value === "string") {
    if (isMediaKey(label)) return <ImageField value={value} onChange={update} field={label} />;
    if (label && YOUTUBE_KEY.test(label)) return <VideoField value={value} onChange={update} />;
    if (isBgColorField(label, value)) return <BgColorField value={value ?? ""} onChange={update} />;
    return <StringField value={value} onChange={update} placeholder={placeholder} label={label} />;
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => update(Number(e.target.value))}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
      />
    );
  }

  if (Array.isArray(value)) {
    const itemsArePrimitive = value.length === 0 || typeof value[0] !== "object" || value[0] === null;
    if (itemsArePrimitive) {
      // A list like Languages or Client Countries is short tags, best packed 3-per-row. A list
      // like About Story is paragraphs — the same 1/3-width, 3-row box was squeezing multi-
      // sentence prose into a tiny scrollable slot. Judge by what's actually in the array
      // rather than the field name, so any future long-text list gets this for free.
      const isProse = value.some((v) => typeof v === "string" && (v.length > 80 || v.includes("\n")));
      return (
        <div className={isProse ? "flex flex-col gap-3" : "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"}>
          {value.map((item, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1">
                <StringField
                  value={item as string | null}
                  onChange={(v) => setRoot(setAtPath(root, [...path, i], v))}
                  placeholder={placeholder}
                  rows={isProse ? 6 : 3}
                />
              </div>
              <button
                type="button"
                onClick={() => setRoot(removeAtIndex(root, path, i))}
                className="shrink-0 rounded-lg border border-line px-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRoot(insertAtEnd(root, path, ""))}
            className={`justify-self-start text-[13px] font-semibold text-accent hover:underline ${isProse ? "" : "sm:col-span-2 lg:col-span-3"}`}
          >
            + Add {label ? humanize(label).toLowerCase() : "item"}
          </button>
        </div>
      );
    }
    // array of objects — two per row so long lists (stats, offices) scroll less
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper-raise/60 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">#{i + 1}</span>
              <button
                type="button"
                onClick={() => setRoot(removeAtIndex(root, path, i))}
                className="rounded-lg border border-line bg-card px-2.5 py-1 text-[12px] text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
            <ObjectFields value={item as JsonObject} path={[...path, i]} root={root} setRoot={setRoot} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRoot(insertAtEnd(root, path, blankShapeOf(value[0] ?? {})))}
          className="justify-self-start text-[13px] font-semibold text-accent hover:underline sm:col-span-2"
        >
          + Add entry
        </button>
      </div>
    );
  }

  if (isObject(value)) {
    return (
      <div className="rounded-lg border border-line bg-paper/60 p-3">
        <ObjectFields value={value} path={path} root={root} setRoot={setRoot} />
      </div>
    );
  }

  return null;
}

function ObjectFields({
  value,
  path,
  root,
  setRoot,
}: {
  value: JsonObject;
  path: (string | number)[];
  root: JsonValue;
  setRoot: (v: JsonValue) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
      {Object.keys(value).map((key) => (
        <div key={key} className={isWideField(value[key], key) || isMediaKey(key) ? "sm:col-span-2" : ""}>
          <label className="mb-1 block text-[12.5px] font-bold text-muted">{humanize(key)}</label>
          <FieldEditor value={value[key]} path={[...path, key]} root={root} setRoot={setRoot} label={key} />
        </div>
      ))}
    </div>
  );
}

export default function CollectionEditor({
  collection,
  initialData,
  saveAction,
}: {
  collection: string;
  initialData: JsonValue;
  saveAction: (collection: string, json: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [data, setData] = useState<JsonValue>(initialData);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [dirty, setDirty] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draft, setDraft] = useState<JsonValue>({});
  const [confirmRemove, setConfirmRemove] = useState<{
    index: number;
    title: string;
  } | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [reorderBusy, setReorderBusy] = useState(false);
  const { toast } = useToast();
  // Collapse list entries by default when there are more than a few, so the page stays scannable.
  const [openIdx, setOpenIdx] = useState<Set<number>>(() => {
    if (!Array.isArray(initialData) || initialData.length > 3) return new Set();
    return new Set(initialData.map((_, i) => i));
  });

  const isList = Array.isArray(data);

  function edit(v: JsonValue) {
    setData(v);
    setDirty(true);
    setStatus("idle");
  }

  function toggle(i: number) {
    setOpenIdx((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleRemove(index: number, entryLabel: string) {
    setConfirmRemove({ index, title: entryLabel });
  }

  async function confirmRemoveEntry() {
    if (confirmRemove === null || !Array.isArray(data)) return;
    const { index } = confirmRemove;
    const newData = removeAtIndex(data, [], index);
    setRemoveBusy(true);
    try {
      const res = await saveAction(collection, JSON.stringify(newData));
      if (res.ok) {
        setData(newData);
        setDirty(false);
        setStatus("saved");
        toast("success", `"${confirmRemove.title}" has been deleted.`);
      } else {
        toast("error", res.error || "Failed to delete.");
      }
    } catch {
      toast("error", "Failed to delete.");
    } finally {
      setRemoveBusy(false);
      setConfirmRemove(null);
    }
  }

  // Display order on every public page is just array order (confirmed: no seed data has a
  // separate "order" field, pages render collections via plain .map()) — so reordering here
  // is reordering the array, saved the same way Remove already does: immediately, not gated
  // behind each entry's own "Save changes" button, since this acts on the list itself rather
  // than one entry's fields.
  async function moveEntry(index: number, direction: -1 | 1) {
    if (!Array.isArray(data) || reorderBusy) return;
    const target = index + direction;
    if (target < 0 || target >= data.length) return;

    const next = [...data];
    [next[index], next[target]] = [next[target], next[index]];

    setReorderBusy(true);
    try {
      const res = await saveAction(collection, JSON.stringify(next));
      if (res.ok) {
        setData(next);
        setDirty(false);
        setStatus("saved");
        // The open/closed entries follow their content, not their old position.
        setOpenIdx((prev) => {
          const out = new Set<number>();
          prev.forEach((i) => out.add(i === index ? target : i === target ? index : i));
          return out;
        });
      } else {
        toast("error", res.error || "Failed to reorder.");
      }
    } catch {
      toast("error", "Failed to reorder.");
    } finally {
      setReorderBusy(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveAction(collection, JSON.stringify(data));
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) {
        setDirty(false);
        toast("success", "Changes saved successfully.");
      } else {
        toast("error", res.error || "Failed to save.");
      }
    });
  }

  // "Add new entry" opens a modal to fill in the new item, instead of appending a blank
  // row at the bottom of a possibly-long list and forcing a scroll to find it.
  function openAddModal() {
    if (!Array.isArray(data)) return;
    setDraft(blankShapeOf(data.length > 0 ? data[0] : {}));
    setShowAddModal(true);
  }

  function confirmAddEntry() {
    if (!Array.isArray(data)) return;
    edit([draft, ...data]);
    setOpenIdx((prev) => {
      const shifted = new Set<number>();
      prev.forEach((i) => shifted.add(i + 1));
      shifted.add(0); // open the new entry at the top
      return shifted;
    });
    setShowAddModal(false);
  }

  function cancelAddEntry() {
    setShowAddModal(false);
  }

  return (
    <CollectionContext.Provider value={collection}>
    <div>
      {/* Top bar — only for lists: add entries + status. Saving lives on each entry (lists)
          or in the sticky bottom bar (single objects), never both. */}
      {isList && (
        <div className="sticky top-0 z-20 -mx-1 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            {status === "saved" && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
            {status === "error" && <span className="text-sm font-semibold text-red-600">Failed to save</span>}
            {dirty && status === "idle" && <span className="text-sm font-medium text-amber-600">Unsaved changes</span>}
            {!dirty && status === "idle" && (
              <span className="text-sm font-medium text-muted">Open an entry to edit, then Save inside it.</span>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-raise"
          >
            + Add new entry
          </button>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmRemove !== null}
        title="Delete entry"
        message={
          confirmRemove
            ? `Are you sure you want to delete "${confirmRemove.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        busy={removeBusy}
        onConfirm={confirmRemoveEntry}
        onCancel={() => setConfirmRemove(null)}
      />

      {isList && showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5" onClick={cancelAddEntry}>
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="text-lg font-extrabold">Add new entry</h3>
              <button
                type="button"
                onClick={cancelAddEntry}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-paper-raise"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-paper-raise p-6">
              {isObject(draft) && Object.keys(draft).length > 0 ? (
                <ObjectFields value={draft} path={[]} root={draft} setRoot={setDraft} />
              ) : (
                <p className="text-sm text-muted">
                  This collection has no existing entries to model a new one on yet.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                onClick={cancelAddEntry}
                className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-paper-raise"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddEntry}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/25"
              >
                Add entry
              </button>
            </div>
          </div>
        </div>
      )}

      {isList ? (
        <div className="flex flex-col gap-3">
          {(data as JsonValue[]).length === 0 && (
            <p className="rounded-2xl border border-dashed border-line bg-card/50 p-8 text-center text-sm text-muted">
              No entries yet. Click “+ Add new entry” to create one.
            </p>
          )}
          {(data as JsonValue[]).map((item, i) => {
            const isOpen = openIdx.has(i);
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-paper-raise text-[11px] font-bold text-muted">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-bold">{entryTitle(item, `Entry #${i + 1}`)}</span>
                  </button>
                  {(data as JsonValue[]).length > 1 && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveEntry(i, -1)}
                        disabled={i === 0 || reorderBusy}
                        title="Move up"
                        aria-label="Move up"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-paper-raise disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEntry(i, 1)}
                        disabled={i === (data as JsonValue[]).length - 1 || reorderBusy}
                        title="Move down"
                        aria-label="Move down"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-paper-raise disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(i, entryTitle(item, `Entry #${i + 1}`))}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[12px] text-red-600 transition-colors hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
                {isOpen && (
                  <div className="border-t border-line p-5">
                    <ObjectFields value={item as JsonObject} path={[i]} root={data} setRoot={edit} />
                    <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-4">
                      {status === "saved" && <span className="text-[13px] font-semibold text-emerald-600">Saved ✓</span>}
                      {status === "error" && <span className="text-[13px] font-semibold text-red-600">Failed to save</span>}
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={pending || !dirty}
                        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-opacity disabled:opacity-50"
                      >
                        {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-line bg-card p-5 pb-6">
            <ObjectFields value={data as JsonObject} path={[]} root={data} setRoot={edit} />
          </div>
          <div className="h-20" /> {/* spacer so the fixed bar never covers the last field */}
          {/* Fixed bottom save bar — always visible; offset past the sidebar on desktop */}
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-5 sm:px-8 lg:pl-64">
            <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-end gap-3 rounded-2xl border border-line bg-card/90 px-4 py-3 shadow-lg shadow-ink/10 backdrop-blur">
              {status === "saved" && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
              {status === "error" && <span className="text-sm font-semibold text-red-600">Failed to save</span>}
              {dirty && status === "idle" && <span className="text-sm font-medium text-amber-600">Unsaved changes</span>}
              <button
                onClick={handleSave}
                disabled={pending || !dirty}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-opacity disabled:opacity-50"
              >
                {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    </CollectionContext.Provider>
  );
}
