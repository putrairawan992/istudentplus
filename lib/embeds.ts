/**
 * Every social/video platform the CMS can embed, in one table.
 *
 * The rules were previously two regexes inside CollectionEditor, so the admin's "insert embed"
 * button, the article renderer's aspect ratio, and the advice printed next to the field could
 * each disagree about what was supported. They all read this now.
 *
 * `thumbnail` is the honest half: only YouTube publishes a poster frame at a predictable URL.
 * For the others there is no public still, so a post whose only visual is a TikTok has nothing
 * to show in the blog list unless someone uploads an Image — which is exactly what the guidance
 * in the CMS has to say, rather than letting the client find out from an empty card.
 */
export type PlatformId = "youtube" | "instagram" | "tiktok" | "twitter" | "facebook" | "vimeo";

export type Platform = {
  id: PlatformId;
  label: string;
  /** Captures the post/video id from a link a person would copy out of the app or the URL bar. */
  match: RegExp;
  /** The player URL for that id. */
  embedUrl: (id: string) => string;
  /** The shape the player wants. Portrait platforms in a 16:9 box are letterboxed to a stripe. */
  ratio: "video" | "portrait" | "square";
  /** Poster frame from the id, when the platform publishes one at a stable URL. */
  thumbnail?: (id: string) => string;
  /** What to paste, in the client's words. */
  accepts: string;
  /** The thumbnail story for this platform, for the CMS guidance panel. */
  note: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "youtube",
    label: "YouTube",
    // watch?v=, youtu.be/, /embed/, /shorts/, /live/ — every shape the share sheet produces.
    match: /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:\S*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i,
    embedUrl: (id) => `https://www.youtube.com/embed/${id}`,
    ratio: "video",
    thumbnail: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    accepts: "link video, Shorts, atau live",
    note: "Thumbnail otomatis diambil dari YouTube — tidak perlu unggah gambar.",
  },
  {
    id: "instagram",
    label: "Instagram",
    match: /instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/i,
    embedUrl: (id) => `https://www.instagram.com/p/${id}/embed`,
    ratio: "portrait",
    accepts: "link post, Reel, atau IGTV",
    note: "Instagram tidak menyediakan thumbnail publik. Unggah gambar di kolom Image bila ingin ada gambar di daftar Blog.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    match: /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d{6,})/i,
    embedUrl: (id) => `https://www.tiktok.com/embed/v2/${id}`,
    ratio: "portrait",
    accepts: "link video (yang memuat /video/<angka>)",
    note: "Link pendek vm.tiktok.com tidak bisa dipakai — buka dulu di browser sampai alamatnya berubah jadi tiktok.com/@akun/video/<angka>, baru salin. Tidak ada thumbnail otomatis.",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    match: /(?:twitter\.com|x\.com)\/[\w.-]+\/status\/(\d{6,})/i,
    embedUrl: (id) =>
      `https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=light&hideCard=false`,
    ratio: "portrait",
    accepts: "link postingan (yang memuat /status/<angka>)",
    note: "Menampilkan kartu postingan, bukan pemutar video penuh. Tidak ada thumbnail otomatis.",
  },
  {
    id: "facebook",
    label: "Facebook",
    match: /(?:facebook\.com\/(?:[\w.-]+\/videos\/|watch\/?\?v=)|fb\.watch\/)(\d{6,}|[\w-]+)/i,
    embedUrl: (id) =>
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        `https://www.facebook.com/video.php?v=${id}`
      )}&show_text=false`,
    ratio: "video",
    accepts: "link video",
    note: "Hanya video yang setelannya Publik yang bisa tampil. Tidak ada thumbnail otomatis.",
  },
  {
    id: "vimeo",
    label: "Vimeo",
    match: /vimeo\.com\/(?:video\/)?(\d{6,})/i,
    embedUrl: (id) => `https://player.vimeo.com/video/${id}`,
    ratio: "video",
    accepts: "link video",
    note: "Tidak ada thumbnail otomatis tanpa akses API Vimeo.",
  },
];

export type ResolvedEmbed = { platform: Platform; id: string; embedUrl: string };

/** The platform and id behind a pasted link, or null when nothing recognises it. */
export function resolveEmbed(url: string): ResolvedEmbed | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  for (const platform of PLATFORMS) {
    const m = trimmed.match(platform.match);
    if (m) return { platform, id: m[1], embedUrl: platform.embedUrl(m[1]) };
  }
  return null;
}

/** Which registrable domains a player is served from, per platform. */
const EMBED_HOSTS: Record<PlatformId, string[]> = {
  youtube: ["youtube.com", "youtube-nocookie.com", "youtu.be", "ytimg.com"],
  instagram: ["instagram.com", "cdninstagram.com"],
  tiktok: ["tiktok.com"],
  twitter: ["twitter.com", "x.com", "twimg.com"],
  facebook: ["facebook.com", "fb.watch", "fbcdn.net"],
  vimeo: ["vimeo.com", "player.vimeo.com"],
};

/** Exact host or a subdomain of it — never a substring. `youtube.com.evil.test` is not YouTube. */
function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain);
}

/**
 * The platform behind a player URL already stored in an article body — how the renderer knows
 * a TikTok wants a portrait box. Matched on the registrable domain, because a substring test
 * on the hostname says yes to `youtube.com.evil.test`.
 */
export function platformOfEmbedUrl(src: string): Platform | null {
  let host: string;
  try {
    host = new URL(src).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const platform of PLATFORMS) {
    if (EMBED_HOSTS[platform.id].some((d) => hostMatches(host, d))) return platform;
  }
  return null;
}

/** Tailwind aspect class per platform shape — one place, so the CMS and the page agree. */
export const RATIO_CLASS: Record<Platform["ratio"], string> = {
  video: "aspect-video",
  portrait: "aspect-[9/16]",
  square: "aspect-square",
};

/** "YouTube, Instagram, TikTok, X / Twitter, Facebook, Vimeo" — for placeholders and errors. */
export const PLATFORM_NAMES = PLATFORMS.map((p) => p.label).join(", ");
