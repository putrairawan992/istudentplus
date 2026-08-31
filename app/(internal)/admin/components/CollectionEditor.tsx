"use client";

import { createContext, Fragment, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { JsonValue, JsonObject } from "@/lib/json-tree";
import {
  setAtPath,
  removeAtIndex,
  insertAtEnd,
  blankShapeOf,
  unionShapeOf,
  mergeWithModel,
} from "@/lib/json-tree";
import { MEDIA_FIELDS, isEmbedPageUrl } from "@/lib/media";
import { PLATFORMS, PLATFORM_NAMES, resolveEmbed } from "@/lib/embeds";
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
  VIDEO_GUIDANCE,
  rejectionMessage,
} from "@/lib/image-specs";
import { sectionsOf } from "@/lib/form-sections";
import { ALWAYS_FIELDS } from "@/lib/collections";
import type { CollectionKey } from "@/lib/content";
import {
  fromInputValue,
  granularityOf,
  isDateKey,
  isPickable,
  toInputValue,
} from "@/lib/date-fields";
import type { ListOp } from "@/lib/list-ops";
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

// The current list's union shape (see unionShapeOf) — every field any entry in this collection
// has, used so every entry shows the same tabs and an empty array field has a real template to
// offer when someone adds its first item. `{}` for single-object collections, where there's only
// one instance and nothing to reconcile against.
const ModelContext = createContext<JsonObject>({});

/**
 * Two collections are left out of the media trio (lib/media.ts):
 *  - `leads` is an inbox of visitor submissions, not content. An upload box on a lead record
 *    invites someone to attach a file to a stranger's enquiry, which is not a thing.
 *  - `webinars` already carries all three concepts under its own names (`image`,
 *    `recordingYoutubeId`, `recordingVideoFile`); adding the trio would give it five media
 *    fields and no way to guess which pair wins.
 */
const NO_MEDIA_TRIO = new Set(["leads", "webinars"]);
function hasMediaTrio(collection?: string) {
  return !!collection && !NO_MEDIA_TRIO.has(collection);
}

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
  // A YouTube/Instagram link is a page, not a picture — without this it fell through to the
  // "any https URL is an image" arm and rendered a permanently broken <img> in the preview.
  if (isEmbedPageUrl(v)) return false;
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

/**
 * A media string field: live preview + upload (click or drop), and the stored path shown but
 * NOT editable.
 *
 * It used to be a free-text box captioned "Upload, or paste an image/video URL", which is an
 * invitation — and what turned up in a blog post's Image slot on production was
 * `https://www.youtube.com/watch?v=...`, rendering broken on the article header and in the
 * list. A video belongs in the article body's embed field or in a YouTube field; this slot
 * takes a file. Removing the box removes the mistake rather than warning about it, and Remove
 * + Upload still covers every reason someone had to retype the value.
 */
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="w-full truncate rounded-lg border border-line bg-paper-raise/60 px-3 py-2 text-sm text-muted" title={str}>
          {str || <span className="text-muted/70">Belum ada file — klik kotak di kiri untuk mengunggah.</span>}
        </div>
        {/* Values saved before this field became upload-only. Says where the link actually goes
            instead of only saying it's wrong. */}
        {isEmbedPageUrl(str) && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] leading-relaxed text-red-700">
            Ini link video/postingan, bukan gambar — di website akan tampil sebagai gambar rusak.
            Klik <span className="font-semibold">Remove</span>, lalu unggah gambar di sini. Untuk
            menampilkan videonya, tempel link itu di kolom{" "}
            <span className="font-semibold">Sisipkan embed YouTube / Instagram</span> pada isi
            artikel, atau di kolom <span className="font-semibold">YouTube</span>.
          </p>
        )}
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

// Turns a pasted link into a ready-to-render <iframe>, so an editor never has to go copy a
// platform's own embed snippet (Instagram's includes a <script> that silently does nothing once
// it's inside dangerouslySetInnerHTML — see ArticleEmbeds' removal).
//
// Reads lib/embeds.ts rather than keeping its own regexes: that table already knew about TikTok,
// X, Facebook and Vimeo while this button only accepted YouTube and Instagram — so the guidance
// panel next to the YouTube field was telling the client to paste a TikTok link into a field
// that would answer "Link tidak dikenali".
function embedIframeFor(url: string): string | null {
  const resolved = resolveEmbed(url);
  if (!resolved) return null;
  const { platform, embedUrl } = resolved;
  // Portrait players in a 16:9 box render as a letterboxed stripe; the article renderer picks
  // the box from the same table (RATIO_CLASS), these numbers only set the iframe's own aspect.
  const size =
    platform.ratio === "portrait"
      ? 'width="400" height="700"'
      : platform.ratio === "square"
        ? 'width="480" height="480"'
        : 'width="560" height="315"';
  return `<iframe ${size} src="${embedUrl}" title="${platform.label}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

// A full Rich Text / WYSIWYG Editor for HTML fields (e.g. blog posts)
// Gives non-technical users standard formatting (headings, bold, lists, quotes, links, images),
// while offering a Code view for power users and a Live Preview matching .article-body typography.
function HtmlBodyField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [err, setErr] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const savedSelection = useRef<Range | null>(null);

  // Sync value into contentEditable when switching back to visual mode or when initial value arrives
  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      const currentHtml = editorRef.current.innerHTML;
      const targetHtml = value ?? "";
      if (currentHtml !== targetHtml) {
        editorRef.current.innerHTML = targetHtml;
      }
    }
  }, [value, mode]);

  function handleInput() {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html === "" || html === "<br>" || html === "<p><br></p>" || html === "<div><br></div>") {
        onChange(null);
      } else {
        onChange(html);
      }
    }
  }

  function exec(command: string, val: string | undefined = undefined) {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  }

  function saveCurrentSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (savedSelection.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
    }
  }

  function openLinkModal() {
    saveCurrentSelection();
    const sel = window.getSelection();
    const selected = sel ? sel.toString() : "";
    setLinkText(selected);
    setLinkUrl("");
    setShowLinkModal(true);
  }

  function applyLink() {
    setShowLinkModal(false);
    if (!linkUrl.trim()) return;
    editorRef.current?.focus();
    restoreSelection();
    const url = linkUrl.trim().startsWith("http://") || linkUrl.trim().startsWith("https://") || linkUrl.trim().startsWith("mailto:")
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;
    if (linkText.trim() && savedSelection.current?.collapsed) {
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
    } else {
      document.execCommand("createLink", false, url);
    }
    handleInput();
  }

  function openImageModal() {
    saveCurrentSelection();
    setImageUrl("");
    setImageAlt("");
    setShowImageModal(true);
  }

  function applyImage() {
    setShowImageModal(false);
    if (!imageUrl.trim()) return;
    editorRef.current?.focus();
    restoreSelection();
    const imgHtml = `<figure><img src="${imageUrl.trim()}" alt="${imageAlt.trim() || 'Blog image'}" class="rounded-xl my-4 max-w-full h-auto" />${imageAlt.trim() ? `<figcaption class="text-xs text-muted mt-1 text-center">${imageAlt.trim()}</figcaption>` : ''}</figure><p></p>`;
    document.execCommand("insertHTML", false, imgHtml);
    handleInput();
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setErr("");
    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`File terlalu besar — maksimal ${MAX_UPLOAD_LABEL}.`);
      }
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await readUploadResponse(res);
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "Gagal mengunggah gambar.");
      setImageUrl(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setUploadingImage(false);
    }
  }

  function insertEmbed() {
    const iframe = embedIframeFor(embedUrl.trim());
    if (!iframe) {
      setErr(`Link tidak dikenali. Yang bisa dipakai: ${PLATFORM_NAMES}.`);
      return;
    }
    setErr("");
    const current = value ?? "";
    const updated = current ? `${current}\n<div class="my-6">${iframe}</div>\n<p></p>` : `<div class="my-6">${iframe}</div>\n<p></p>`;
    onChange(updated);
    if (editorRef.current && mode === "visual") {
      editorRef.current.innerHTML = updated;
    }
    setEmbedUrl("");
  }

  // Count words and characters
  const rawText = (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = rawText ? rawText.split(" ").length : 0;
  const charCount = rawText.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-xs">
      {/* Editor Header: Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-paper-raise p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              mode === "visual" ? "bg-card text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>🎨</span>
            <span>Editor Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              mode === "html" ? "bg-card text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>💻</span>
            <span>Kode HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              mode === "preview" ? "bg-card text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>👁️</span>
            <span>Pratinjau</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{wordCount} kata</span>
          <span>•</span>
          <span>{charCount} karakter</span>
        </div>
      </div>

      {/* Visual Editor Toolbar */}
      {mode === "visual" && (
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line/80 bg-paper p-1.5">
          {/* Headings */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                exec("formatBlock", e.target.value);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-bold text-ink outline-none"
            title="Pilih Format Judul / Paragraf"
          >
            <option value="" disabled>Format Text</option>
            <option value="<p>">Paragraf Biasa</option>
            <option value="<h2>">Judul Utama (H2)</option>
            <option value="<h3>">Sub Judul (H3)</option>
            <option value="<h4>">Sub-sub Judul (H4)</option>
          </select>

          <span className="mx-1 h-5 w-px bg-line" />

          {/* Formatting buttons */}
          <button
            type="button"
            onClick={() => exec("bold")}
            title="Tebal (Bold) - Ctrl+B"
            className="grid h-7 w-7 place-items-center rounded-lg font-bold text-ink hover:bg-paper-raise"
          >
            <b>B</b>
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            title="Miring (Italic) - Ctrl+I"
            className="grid h-7 w-7 place-items-center rounded-lg italic text-ink hover:bg-paper-raise"
          >
            <i>I</i>
          </button>
          <button
            type="button"
            onClick={() => exec("underline")}
            title="Garis Bawah (Underline) - Ctrl+U"
            className="grid h-7 w-7 place-items-center rounded-lg underline text-ink hover:bg-paper-raise"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => exec("strikeThrough")}
            title="Coret (Strikethrough)"
            className="grid h-7 w-7 place-items-center rounded-lg line-through text-ink hover:bg-paper-raise text-xs"
          >
            S
          </button>

          <span className="mx-1 h-5 w-px bg-line" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            title="Daftar Poin (Bullet List)"
            className="grid h-7 w-7 place-items-center rounded-lg text-ink hover:bg-paper-raise text-sm"
          >
            •≡
          </button>
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            title="Daftar Angka (Numbered List)"
            className="grid h-7 w-7 place-items-center rounded-lg text-ink hover:bg-paper-raise text-xs font-bold"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => exec("formatBlock", "<blockquote>")}
            title="Kutipan (Blockquote)"
            className="grid h-7 w-7 place-items-center rounded-lg text-ink hover:bg-paper-raise text-xs font-bold"
          >
            “ ”
          </button>

          <span className="mx-1 h-5 w-px bg-line" />

          {/* Links & Media */}
          <button
            type="button"
            onClick={openLinkModal}
            title="Sisipkan Tautan / Link"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
          >
            <span>🔗</span>
            <span>Link</span>
          </button>
          <button
            type="button"
            onClick={openImageModal}
            title="Sisipkan Gambar"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink hover:bg-paper-raise"
          >
            <span>🖼️</span>
            <span>Gambar</span>
          </button>
          <button
            type="button"
            onClick={() => exec("insertHorizontalRule")}
            title="Garis Pembatas (Divider)"
            className="rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-paper-raise"
          >
            ― Garis
          </button>

          <span className="mx-1 h-5 w-px bg-line" />

          {/* Utility */}
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            title="Hapus Pemformatan (Clear Formatting)"
            className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-paper-raise hover:text-ink"
          >
            🧹 Hapus Format
          </button>
          <button
            type="button"
            onClick={() => exec("undo")}
            title="Undo (Urungkan)"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-paper-raise hover:text-ink text-xs"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => exec("redo")}
            title="Redo (Ulangi)"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-paper-raise hover:text-ink text-xs"
          >
            ↷
          </button>
        </div>
      )}

      {/* Editor Body */}
      {mode === "visual" && (
        <div className="relative rounded-xl border border-line bg-paper focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent/15">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="article-body min-h-[320px] max-h-[600px] overflow-y-auto p-5 outline-none focus:outline-none"
            data-placeholder="Tulis konten artikel di sini..."
          />
          {(!value || value.trim() === "") && (
            <p className="pointer-events-none absolute left-5 top-5 text-sm text-muted/60">
              Mulai mengetik artikel Anda di sini... Gunakan toolbar di atas untuk judul, tebal, gambar, atau link.
            </p>
          )}
        </div>
      )}

      {mode === "html" && (
        <div className="flex flex-col gap-2">
          <textarea
            value={value ?? ""}
            rows={14}
            onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
            placeholder="<p>Tulis kode HTML di sini...</p>"
            className="w-full font-mono text-xs leading-relaxed rounded-xl border border-line bg-paper p-4 text-ink outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/15"
          />
          <p className="text-[11.5px] text-muted">
            💡 Mode Kode HTML berguna jika Anda ingin menyalin atau memeriksa struktur tag HTML secara langsung.
          </p>
        </div>
      )}

      {mode === "preview" && (
        <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Pratinjau Halaman Artikel</span>
            <span className="text-xs font-semibold text-emerald-600">✓ Tampilan Langsung</span>
          </div>
          {value ? (
            <div
              className="article-body max-w-none"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="py-12 text-center text-sm text-muted italic">Belum ada konten untuk ditampilkan.</p>
          )}
        </div>
      )}

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowLinkModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-extrabold">Sisipkan Tautan / Link</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Teks Tautan (Opsional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Contoh: Klik di sini untuk mendaftar"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">URL / Alamat Web</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com atau /study-abroad"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="rounded-xl border border-line px-4 py-1.5 text-xs font-semibold hover:bg-paper-raise"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  Sisipkan Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowImageModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-extrabold">Sisipkan Gambar ke Artikel</h3>
            <div className="flex flex-col gap-3">
              {/* Upload option */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Unggah dari Komputer</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full rounded-xl border border-dashed border-line bg-paper p-3 text-center text-xs font-semibold text-ink hover:border-accent hover:bg-card"
                >
                  {uploadingImage ? "Sedang mengunggah..." : "📁 Klik untuk memilih & mengunggah gambar"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] text-muted">atau masukkan URL</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">URL Gambar</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../gambar.jpg"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Keterangan Gambar / Caption (Opsional)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Contoh: Suasana perkuliahan di Melbourne University"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                />
              </div>

              {imageUrl && (
                <div className="rounded-xl border border-line p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Pratinjau" className="max-h-36 mx-auto object-contain rounded-lg" />
                </div>
              )}

              {err && <p className="text-xs text-red-600">{err}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="rounded-xl border border-line px-4 py-1.5 text-xs font-semibold hover:bg-paper-raise"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={applyImage}
                  disabled={!imageUrl.trim()}
                  className="rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                >
                  Sisipkan Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed helper (YouTube / Instagram / TikTok / etc.) */}
      <div className="rounded-xl border border-line bg-paper-raise/60 p-4">
        <p className="mb-2 text-xs font-bold text-ink">📹 Sisipkan Video / Postingan Media Sosial</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={embedUrl}
            onChange={(e) => { setEmbedUrl(e.target.value); setErr(""); }}
            placeholder="Tempel link YouTube, Instagram, TikTok, atau Twitter di sini..."
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={insertEmbed}
            className="shrink-0 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.02]"
          >
            + Sisipkan Video
          </button>
        </div>
        {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Cukup tempel link video/postingan dan klik <b>Sisipkan Video</b>. Embed responsif akan otomatis ditambahkan ke dalam artikel.
        </p>

        <dl className="mt-2.5 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 border-t border-line pt-2.5 text-[11.5px] leading-relaxed">
          {PLATFORMS.map((platform) => (
            <Fragment key={platform.id}>
              <dt className="font-bold text-ink">{platform.label}</dt>
              <dd className="text-muted">
                <span className="text-ink">{platform.accepts}</span> — {platform.note}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}

function VideoField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const id = value ?? "";
  const [broken, setBroken] = useState(false);

  function handleChange(v: string) {
    setBroken(false);
    onChange(v === "" ? null : extractYouTubeId(v));
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <input
          type="text"
          value={id}
          placeholder="Paste a YouTube URL or video ID"
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {/* The video half of the house standard. The upload field next to it already prints its
            own rules; this one had none, which is why people were pasting 4:3 uploads. */}
        <div className="rounded-lg border border-line bg-paper-raise/60 px-3 py-2 text-[12px] leading-relaxed">
          <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5">
            <dt className="text-muted">Isi dengan</dt>
            <dd className="font-semibold text-ink">
              Tempel link YouTube apa adanya — ID-nya diambil otomatis
            </dd>
            <dt className="text-muted">Bentuk</dt>
            <dd className="font-semibold text-ink">{VIDEO_GUIDANCE.ratio} (landscape)</dd>
            <dt className="text-muted">Thumbnail</dt>
            <dd className="font-semibold text-emerald-700">
              Otomatis dari YouTube — tidak perlu unggah gambar
            </dd>
          </dl>
          {/* The field stores the bare id, so the panel shows which part of each link that is —
              "paste the whole link" plus a picture of what gets kept beats a rule to memorise. */}
          <p className="mt-2 text-muted">
            Yang disimpan hanya <span className="font-semibold text-ink">ID video</span>: 11
            karakter yang ditandai di bawah. Kamu boleh menempel link penuhnya — bagian lainnya
            dibuang sendiri.
          </p>
          <ul className="mt-1.5 flex flex-col gap-1 break-all font-mono text-[11.5px] text-muted">
            {[
              "https://www.youtube.com/watch?v=",
              "https://youtu.be/",
              "https://www.youtube.com/shorts/",
            ].map((prefix) => (
              <li key={prefix}>
                <span>{prefix}</span>
                <span className="rounded bg-emerald-100 px-1 font-bold text-emerald-800">
                  dQw4w9WgXcQ
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted">{VIDEO_GUIDANCE.note}</p>
          <p className="mt-1.5 text-muted">
            Kolom ini <span className="font-semibold text-ink">hanya menerima YouTube</span>,
            karena hanya YouTube yang menyediakan thumbnail otomatis. Untuk{" "}
            {PLATFORMS.filter((x) => x.id !== "youtube").map((x) => x.label).join(", ")}: tempel
            link-nya di kolom{" "}
            <span className="font-semibold text-ink">Sisipkan video / postingan</span> pada isi
            artikel Blog — di sana ada panduan per platform-nya — dan isi kolom{" "}
            <span className="font-semibold text-ink">Image</span> bila ingin ada gambarnya di
            daftar Blog.
          </p>
        </div>
      </div>
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
// Fields that hold a paragraph, so they get a textarea and a full-width row even while empty.
//
// Length alone can't decide this in the "Add new entry" modal: every value there starts blank,
// so the blog's `html` body was being filed as a short string and rendered in a half-width
// column next to an empty gutter. The list is the set of keys that hold prose anywhere in
// content/*.json — `image`, `slug` and `source` are long too but are URLs with their own
// widgets, and `title`/`value`/`q` stay single-line on purpose.
const PROSE_KEY =
  /^(a|aboutStory|accommodation|admission|benefit|bio|body|career|content|culture|desc|description|excerpt|heroSubtitle|html|intro|livingCost|note|overview|quote|whyStudy)$/i;
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

// A date field: the browser's own picker instead of hand-typed ISO text. Webinars get a
// date-and-time picker (their schedule is to the minute, in WIB); a blog date gets a calendar.
// The stored string keeps exactly the shape it had — `+07:00` and all — so nothing downstream
// changes, and it stays visible under the input because that's the value the guide talks about.
function DateField({
  value,
  onChange,
  collection,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  collection?: string;
}) {
  const granularity = granularityOf(value, collection);
  return (
    <div>
      <input
        type={granularity === "datetime" ? "datetime-local" : "date"}
        value={toInputValue(value, granularity)}
        onChange={(e) => onChange(fromInputValue(e.target.value, granularity))}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {granularity === "datetime" && (
        <p className="mt-1 text-[12px] text-muted">
          Waktu WIB (GMT+7).{" "}
          {value ? <>Tersimpan sebagai <code className="text-[11px]">{value}</code></> : "Belum diisi."}
        </p>
      )}
    </div>
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
  const collection = useContext(CollectionContext);
  const model = useContext(ModelContext);
  const update = (v: JsonValue) => setRoot(setAtPath(root, path, v));
  const placeholder = label ? `Enter ${humanize(label).toLowerCase()}` : undefined;

  if (value === null || typeof value === "string") {
    if (label === "html") return <HtmlBodyField value={value} onChange={update} />;
    if (isMediaKey(label)) return <ImageField value={value} onChange={update} field={label} />;
    if (label && YOUTUBE_KEY.test(label)) return <VideoField value={value} onChange={update} />;
    if (isBgColorField(label, value)) return <BgColorField value={value ?? ""} onChange={update} />;
    // A value no picker can represent (someone typed "besok pagi") keeps the text box, so it can
    // be read and corrected rather than silently blanked by a control that can't hold it.
    if (isDateKey(label) && isPickable(value)) {
      return <DateField value={value} onChange={update} collection={collection} />;
    }
    return <StringField value={value} onChange={update} placeholder={placeholder} label={label} />;
  }

  // Was falling through to the final `return null` — a "Hidden" checkbox never rendered at all,
  // so a field that exists in the data was invisible and unreachable in the CMS.
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 py-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => update(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-accent"
        />
        {value ? "Yes" : "No"}
      </label>
    );
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
    // An empty array can't say what it should hold — every entry in this list without a single
    // Featured Program looked exactly like an empty tag list otherwise, and got that UI instead
    // of the "+ Add entry" card editor. The model's own example (see mergeWithModel) is what
    // another entry in the same collection actually stores there.
    const modelExample = label ? model[label] : undefined;
    const sample = value.length > 0 ? value[0] : Array.isArray(modelExample) ? modelExample[0] : undefined;
    const itemsArePrimitive = sample === undefined || sample === null || typeof sample !== "object";
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
    // An entry that doesn't have this field yet (see mergeWithModel) shows it as empty rather
    // than missing; the model supplies what its first item should look like — e.g. Australia's
    // {label, value} Key Fact shape — so "+ Add entry" here doesn't hand back a card with no
    // fields to fill in just because this particular entry has never had one before.
    const modelTemplate = label && Array.isArray(model[label]) ? (model[label] as JsonValue[])[0] : undefined;
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
          onClick={() => setRoot(insertAtEnd(root, path, blankShapeOf(value[0] ?? modelTemplate ?? {})))}
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
  keys,
}: {
  value: JsonObject;
  path: (string | number)[];
  root: JsonValue;
  setRoot: (v: JsonValue) => void;
  /** Render only these fields. Used by the tab strip; defaults to the whole object. */
  keys?: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
      {/* isMediaish, not isMediaKey: "youtubeId" doesn't match the media-key regex, so it was
          the one tall field still sharing a row. Half of the 672px Add-entry modal left its
          guidance panel 170px wide, wrapping the text three words to a line. */}
      {(keys ?? Object.keys(value)).map((key) => (
        <div key={key} className={isWideField(value[key], key) || isMediaish(key) ? "sm:col-span-2" : ""}>
          <label className="mb-1 block text-[12.5px] font-bold text-muted">{humanize(key)}</label>
          <FieldEditor value={value[key]} path={[...path, key]} root={root} setRoot={setRoot} label={key} />
        </div>
      ))}
    </div>
  );
}

/** Media/video fields are the tall ones — a preview box plus the size rules for the slot. */
function isMediaish(key: string) {
  return isMediaKey(key) || YOUTUBE_KEY.test(key);
}

/** The tab strip. One `ObjectFields` at a time; the data behind all tabs is one object, so Save
    writes every tab whether or not it's the one on screen. Grouping lives in lib/form-sections. */
function TabbedFields({
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
  // Widened to every field this collection's other entries have, so every entry gets the same
  // tabs in the same order — a field this one doesn't have yet renders blank rather than its tab
  // just not existing. `root`/`path`/`setRoot` stay the real data throughout: this only changes
  // what's read for display, not what a field write targets.
  const model = useContext(ModelContext);
  const merged = mergeWithModel(value, model);
  const sections = sectionsOf(merged, isMediaish);
  const [active, setActive] = useState(0);

  if (sections.length < 2) {
    return <ObjectFields value={merged} path={path} root={root} setRoot={setRoot} />;
  }

  // A section that disappeared (an emptied list) must not leave a blank pane behind.
  const current = sections[Math.min(active, sections.length - 1)];

  return (
    <div>
      <div role="tablist" aria-label="Sections" className="mb-4 flex flex-wrap gap-1.5 border-b border-line pb-3">
        {sections.map((section, i) => {
          const selected = section === current;
          return (
            <button
              key={section.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                selected ? "bg-ink text-white" : "border border-line text-muted hover:bg-paper-raise"
              }`}
            >
              {section.label}
              {section.keys.length === 1 && Array.isArray(merged[section.keys[0]]) && (
                <span className={`ml-1.5 text-[11px] ${selected ? "text-white/70" : "text-muted"}`}>
                  {(merged[section.keys[0]] as JsonValue[]).length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <ObjectFields value={merged} path={path} root={root} setRoot={setRoot} keys={current.keys} />
    </div>
  );
}

export default function CollectionEditor({
  collection,
  initialData,
  locale,
  saveAction,
  entryAction,
}: {
  collection: string;
  initialData: JsonValue;
  /** Which language's document is being edited — passed straight through to the save action. */
  locale?: string;
  /** Whole-document save. Used by single-object collections, which are only a few KB. */
  saveAction: (
    collection: string,
    json: string,
    locale?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  /** One-entry save for list collections. `blog` is ~1.5MB, far past the Server Action body
      limit, so a list never sends the whole document back — just the op that changed it. */
  entryAction: (
    collection: string,
    op: ListOp,
    locale?: string
  ) => Promise<{ ok: boolean; error?: string }>;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<"20" | "50" | "all">("20");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  // Accordion: track open index
  const [openIdx, setOpenIdx] = useState<number | null>(() => {
    if (Array.isArray(initialData) && initialData.length === 1) return 0;
    return null;
  });

  const isList = Array.isArray(data);
  const model = useMemo(() => {
    const always = ALWAYS_FIELDS[collection as CollectionKey] ?? {};
    const union = isList ? unionShapeOf(data as JsonValue[]) : {};
    if (!hasMediaTrio(collection)) return { ...always, ...union };
    return { ...MEDIA_FIELDS, ...always, ...union };
  }, [isList, data, collection]);

  const itemsWithOriginalIndex = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item, originalIndex) => ({ item, originalIndex }));
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return itemsWithOriginalIndex;
    const q = searchQuery.toLowerCase();
    return itemsWithOriginalIndex.filter(({ item }) => {
      if (!item || typeof item !== "object") return false;
      const str = JSON.stringify(item).toLowerCase();
      return str.includes(q);
    });
  }, [itemsWithOriginalIndex, searchQuery]);

  const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredItems.length / Number(pageSize)) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const displayedItems = useMemo(() => {
    if (pageSize === "all") return filteredItems;
    const size = Number(pageSize);
    const start = (safeCurrentPage - 1) * size;
    return filteredItems.slice(start, start + size);
  }, [filteredItems, pageSize, safeCurrentPage]);

  function edit(v: JsonValue) {
    setData(v);
    setDirty(true);
    setStatus("idle");
  }

  function toggle(i: number) {
    setOpenIdx((prev) => (prev === i ? null : i));
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
      const res = await entryAction(collection, { type: "remove", index }, locale);
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

  async function moveEntry(index: number, direction: -1 | 1) {
    if (!Array.isArray(data) || reorderBusy) return;
    const target = index + direction;
    if (target < 0 || target >= data.length) return;

    const next = [...data];
    [next[index], next[target]] = [next[target], next[index]];

    setReorderBusy(true);
    try {
      const res = await entryAction(collection, { type: "move", from: index, to: target }, locale);
      if (res.ok) {
        setData(next);
        setDirty(false);
        setStatus("saved");
        setOpenIdx((prev) => (prev === index ? target : prev === target ? index : prev));
      } else {
        toast("error", res.error || "Failed to reorder.");
      }
    } catch {
      toast("error", "Failed to reorder.");
    } finally {
      setReorderBusy(false);
    }
  }

  function handleSave(index?: number) {
    startTransition(async () => {
      const res =
        Array.isArray(data) && index !== undefined
          ? await entryAction(collection, { type: "replace", index, entry: data[index] }, locale)
          : await saveAction(collection, JSON.stringify(data), locale);
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) {
        setDirty(false);
        toast("success", "Changes saved successfully.");
      } else {
        toast("error", res.error || "Failed to save.");
      }
    });
  }

  function openAddModal() {
    if (!Array.isArray(data)) return;
    setDraft(blankShapeOf(model));
    setShowAddModal(true);
  }

  function handleDuplicate(originalIndex: number) {
    if (!Array.isArray(data)) return;
    const source = data[originalIndex];
    if (typeof source !== "object" || source === null) return;
    const cloned = JSON.parse(JSON.stringify(source));
    if (cloned.title && typeof cloned.title === "string") {
      cloned.title = `${cloned.title} (Copy)`;
    } else if (cloned.name && typeof cloned.name === "string") {
      cloned.name = `${cloned.name} (Copy)`;
    }
    if (cloned.slug && typeof cloned.slug === "string") {
      cloned.slug = `${cloned.slug}-copy`;
    }
    setDraft(cloned);
    setShowAddModal(true);
  }

  function confirmAddEntry() {
    if (!Array.isArray(data)) return;
    startTransition(async () => {
      const res = await entryAction(collection, { type: "insert", entry: draft }, locale);
      if (!res.ok) {
        toast("error", res.error || "Failed to add entry.");
        return;
      }
      setData([draft, ...data]);
      setDirty(false);
      setStatus("saved");
      setOpenIdx(0);
      setCurrentPage(1);
      setShowAddModal(false);
      toast("success", "Entry added.");
    });
  }

  function cancelAddEntry() {
    setShowAddModal(false);
  }

  return (
    <CollectionContext.Provider value={collection}>
    <ModelContext.Provider value={model}>
    <div>
      {/* Top bar — only for lists: search, filter, add entries + status */}
      {isList && (
        <div className="sticky top-0 z-20 -mx-1 mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-card/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {status === "saved" && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
              {status === "error" && <span className="text-sm font-semibold text-red-600">Failed to save</span>}
              {dirty && status === "idle" && <span className="text-sm font-medium text-amber-600">Unsaved changes</span>}
              {!dirty && status === "idle" && (
                <span className="text-xs font-semibold text-muted">
                  Total: <b className="text-ink">{(data as JsonValue[]).length}</b> entries
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === null ? 0 : null)}
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-paper-raise hover:text-ink"
              >
                {openIdx === null ? "Expand First" : "Collapse All"}
              </button>
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-xs transition-transform hover:scale-[1.02]"
              >
                <span>+</span>
                <span>Add new entry</span>
              </button>
            </div>
          </div>

          {/* Search bar & pagination controls for list collections */}
          {(data as JsonValue[]).length > 3 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-3">
              <div className="relative min-w-[220px] flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by title, name, content…"
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-1.5 text-xs text-ink placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/15"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted">
                {searchQuery && (
                  <span>
                    Found <b className="text-ink">{filteredItems.length}</b> matches
                  </span>
                )}
                {(data as JsonValue[]).length > 20 && (
                  <div className="flex items-center gap-1.5">
                    <span>Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value as "20" | "50" | "all");
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink outline-none"
                    >
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-paper-raise p-6">
              {isObject(draft) && Object.keys(draft).length > 0 ? (
                <TabbedFields value={draft} path={[]} root={draft} setRoot={setDraft} />
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
                disabled={pending}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-opacity disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add entry"}
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

          {filteredItems.length === 0 && (data as JsonValue[]).length > 0 && (
            <div className="rounded-2xl border border-line bg-card p-8 text-center">
              <p className="text-sm text-muted">No entries match your search &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:bg-paper-raise"
              >
                Clear filter
              </button>
            </div>
          )}

          {displayedItems.map(({ item, originalIndex }) => {
            const isOpen = openIdx === originalIndex;
            const title = entryTitle(item, `Entry #${originalIndex + 1}`);
            return (
              <div key={originalIndex} className="overflow-hidden rounded-2xl border border-line bg-card transition-all hover:border-line">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(originalIndex)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <span className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-paper-raise text-[11px] font-bold text-muted">
                      {originalIndex + 1}
                    </span>
                    <span className="truncate text-sm font-bold text-ink">{title}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(originalIndex)}
                      title="Duplicate entry as template"
                      className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-medium text-muted transition-colors hover:bg-paper-raise hover:text-ink"
                    >
                      Duplicate
                    </button>
                    {(data as JsonValue[]).length > 1 && !searchQuery && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveEntry(originalIndex, -1)}
                          disabled={originalIndex === 0 || reorderBusy}
                          title="Move up"
                          aria-label="Move up"
                          className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-paper-raise disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEntry(originalIndex, 1)}
                          disabled={originalIndex === (data as JsonValue[]).length - 1 || reorderBusy}
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
                      onClick={() => handleRemove(originalIndex, title)}
                      className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[12px] text-red-600 transition-colors hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-line p-5">
                    <TabbedFields value={item as JsonObject} path={[originalIndex]} root={data} setRoot={edit} />
                    <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-4">
                      {status === "saved" && <span className="text-[13px] font-semibold text-emerald-600">Saved ✓</span>}
                      {status === "error" && <span className="text-[13px] font-semibold text-red-600">Failed to save</span>}
                      <button
                        type="button"
                        onClick={() => handleSave(originalIndex)}
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

          {/* Pagination bar */}
          {pageSize !== "all" && totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
              <span className="text-xs text-muted">
                Showing Page <b className="text-ink">{safeCurrentPage}</b> of <b className="text-ink">{totalPages}</b> ({filteredItems.length} entries)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-paper-raise disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === safeCurrentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? "bg-accent text-white" : "border border-line text-muted hover:bg-paper-raise"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="px-1 text-xs text-muted">…</span>}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-paper-raise disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-line bg-card p-5 pb-6">
            <TabbedFields value={data as JsonObject} path={[]} root={data} setRoot={edit} />
          </div>
          <div className="h-20" /> {/* spacer so the fixed bar never covers the last field */}
          {/* Fixed bottom save bar — always visible; offset past the sidebar on desktop */}
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-5 sm:px-8 lg:pl-64">
            <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-end gap-3 rounded-2xl border border-line bg-card/90 px-4 py-3 shadow-lg shadow-ink/10 backdrop-blur">
              {status === "saved" && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
              {status === "error" && <span className="text-sm font-semibold text-red-600">Failed to save</span>}
              {dirty && status === "idle" && <span className="text-sm font-medium text-amber-600">Unsaved changes</span>}
              <button
                onClick={() => handleSave()}
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
    </ModelContext.Provider>
    </CollectionContext.Provider>
  );
}
