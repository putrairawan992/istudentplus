// Ad instrumentation for the paid-traffic landing page. Client-side only — every function
// here runs in the browser, and the module is imported by client components.
//
// NOTE: the (ads) layout now loads the site's GTM container (GTM-5DC3QD86) on this page, and
// GTM is the intended home for the GA4 / Ads tags. Keep the ids below as placeholders unless
// a page-local gtag.js is genuinely wanted — filling them in while GTM also carries the same
// tags would fire everything twice. The dataLayer events ("generate_lead", "whatsapp_click")
// and the gclid/UTM capture below stay useful either way: GTM triggers are built on them.

export const ADS_CONFIG = {
  /** Google Ads tag ID, e.g. "AW-123456789". */
  adsId: "AW-XXXXXXXXX",
  /** Conversion label for the lead form, e.g. "AbC-DEfGhIjKlMnOp". */
  leadConversionLabel: "XXXXXXXXXXXXXXXXXXX",
  /** Conversion label for WhatsApp button clicks. */
  whatsappConversionLabel: "XXXXXXXXXXXXXXXXXXX",
  /** GA4 measurement ID, e.g. "G-ABCDEF1234". */
  ga4Id: "G-XXXXXXXXXX",
  /** Both pages must exist before the campaign runs (Google Ads requires a privacy policy). */
  privacyUrl: "https://www.istudentplus.com/privacy-policy",
  termsUrl: "https://www.istudentplus.com/terms",
} as const;

/** Pre-filled into every wa.me link on the page. */
export const WHATSAPP_TEXT =
  "Hi iStudentPlus, I would like a free consultation about my study or English plans.";

/** Click IDs and campaign parameters worth capturing — they tell the CRM which ad paid off. */
const TRACKED_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    __ispAdsLoaded?: boolean;
  }
}

/** "X"-free values only — the mock's placeholders must never load a tag or fire an event. */
const isReal = (value: string) => value.length > 0 && !value.includes("XXXX");

/** The official gtag stub: calls queue on dataLayer until (unless) gtag.js drains them. */
function ensureGtag(): void {
  const queue = (window.dataLayer = window.dataLayer ?? []);
  if (!window.gtag) {
    window.gtag = function gtag() {
      // Google's snippet queues the `arguments` object itself — gtag.js replays the queue in
      // that exact shape, so the rest-params rewrite is not a safe substitute.
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments);
    };
  }
}

/** Appends the pre-filled intro message to a wa.me URL from Site Settings. */
export function withWhatsAppText(url: string, text: string = WHATSAPP_TEXT): string {
  return `${url}${url.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
}

/** Loads gtag.js once, only when real IDs are configured. Safe to call on every mount. */
export function initAdsTags(): void {
  ensureGtag();
  if (window.__ispAdsLoaded) return;

  const ids = [ADS_CONFIG.adsId, ADS_CONFIG.ga4Id].filter(isReal);
  if (!ids.length) return;
  window.__ispAdsLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`;
  document.head.appendChild(script);

  window.gtag?.("js", new Date());
  for (const id of ids) {
    window.gtag?.("config", id, id.startsWith("AW-") ? { allow_enhanced_conversions: true } : {});
  }
}

/** dataLayer event, mirrored to GA4 when a real measurement ID is configured. */
export function track(eventName: string, data: Record<string, string> = {}): void {
  ensureGtag();
  window.dataLayer?.push({ event: eventName, ...data });
  if (isReal(ADS_CONFIG.ga4Id)) window.gtag?.("event", eventName, data);
}

/** Google Ads conversion, queued until gtag.js is loaded. */
export function adsConversion(label: string, extra: Record<string, string> = {}): void {
  ensureGtag();
  if (isReal(ADS_CONFIG.adsId) && isReal(label)) {
    window.gtag?.("event", "conversion", { send_to: `${ADS_CONFIG.adsId}/${label}`, ...extra });
  }
}

/** Enhanced-conversions user data, sent just before the lead conversion fires. */
export function setUserData(email: string, phone: string): void {
  ensureGtag();
  if (isReal(ADS_CONFIG.adsId)) window.gtag?.("set", "user_data", { email, phone_number: phone });
}

// sessionStorage wrappers — unavailable in some privacy modes, which must never break the form.
function store(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Keeps click IDs and UTMs for this session. A URL that carries a parameter updates the
    stored one (the latest click wins, matching Google's own attribution), while the landing
    URL and referrer are first-touch so the original entry point can't be overwritten by a
    later in-page navigation. */
export function captureAdParams(): void {
  const params = new URLSearchParams(window.location.search);
  for (const key of TRACKED_PARAMS) {
    const value = params.get(key);
    if (value) store(`isp_${key}`, value);
  }
  if (!read("isp_landing_page")) store("isp_landing_page", window.location.href);
  if (!read("isp_referrer")) store("isp_referrer", document.referrer || "");
}

/** The hidden fields attached to the lead submission. */
export function adFormFields(): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const key of TRACKED_PARAMS) fields[key] = read(`isp_${key}`) ?? "";
  fields.landing_page = read("isp_landing_page") ?? "";
  fields.referrer = read("isp_referrer") ?? "";
  return fields;
}

/** Reports clicks on any `[data-wa-source]` link (WhatsApp buttons all over the page).
    Returns the cleanup so a component effect can remove the listener on unmount. */
export function trackWhatsAppClicks(): () => void {
  function onClick(event: MouseEvent) {
    const link = event.target instanceof Element ? event.target.closest("[data-wa-source]") : null;
    if (!link) return;
    track("whatsapp_click", { click_location: (link as HTMLElement).dataset.waSource ?? "unknown" });
    adsConversion(ADS_CONFIG.whatsappConversionLabel);
  }
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
