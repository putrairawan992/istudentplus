import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readContent } from "@/lib/content";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { hasLocale } from "@/lib/i18n";
import AdsTracking from "./AdsTracking";
import LeadForm from "./LeadForm";
import { ADS_CONFIG, withWhatsAppText } from "./tracking";

// The paid-traffic landing page. Deliberately the only page in the (ads) route group: the
// campaign links point at /consultation, the visitor gets one standalone page with one
// action, and nothing here is linked from (or links into) the site's navigation.

export async function generateMetadata({ params }: PageProps<"/[lang]/consultation">): Promise<Metadata> {
    const { lang } = await params;
    if (!hasLocale(lang)) notFound();
    return {
        title: "Free Study and English Counselling | iStudentPlus",
        description:
            "Free one-to-one counselling for study in Australia and English programs. Share your goals, budget and background, and get a personalised recommendation.",
        alternates: { canonical: "/consultation" },
        // Ads-only page: kept out of the organic index on purpose, so it can't compete with
        // /contact. Delete this line if it should rank on its own.
        robots: { index: false, follow: false },
    };
}

// Lets an ad's URL (?topic=vet, ?topic=ielts, …) drop the visitor straight into the right
// interest — same mechanism the mock had, but resolved on the server so the select renders
// preselected instead of snapping after hydration.
const TOPIC_INTERESTS: Record<string, string> = {
    australia: "study-australia",
    vet: "vet-diploma",
    degree: "bachelor-master",
    next: "next-course",
    english: "general-english",
    ielts: "ielts",
};

// Style overrides come from the "adsPage" collection (CMS → Ads Landing Page): the logo, three
// theme colours and a font choice. Every value is re-validated here — only a proper 6-digit hex
// can reach the stylesheet — so a bad paste can never break the page; anything invalid simply
// falls back to the default it replaced.
type AdsPageStyle = {
    logo?: string | null;
    primaryColor?: string | null;
    actionColor?: string | null;
    inkColor?: string | null;
    font?: string | null;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function cssHex(value: unknown, fallback: string): string {
    return typeof value === "string" && HEX.test(value.trim()) ? value.trim().toUpperCase() : fallback;
}

/** Mixes a hex colour toward white or black — the tints and hover shades the design derives
    from the three theme colours. */
function mixHex(hex: string, target: "white" | "black", amount: number): string {
    const n = parseInt(hex.slice(1), 16);
    const to = target === "white" ? 255 : 0;
    const ch = (shift: number) => {
        const c = (n >> shift) & 0xff;
        return Math.round(c + (to - c) * amount);
    };
    return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0").toUpperCase()}`;
}

/** Matches the main site's own font stack (globals.css) — the CMS's "system" font choice. */
const SYSTEM_FONT_STACK = `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/** Readable text for a filled button: white on a dark action colour, the theme's ink on a
    light one — a dark brand colour for the buttons used to render navy-on-navy text. YIQ is
    deliberately simple; it only picks between two presets and gets the common cases right. */
function onAction(hex: string, ink: string): string {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    return (r * 299 + g * 587 + b * 114) / 1000 < 128 ? "#FFFFFF" : ink;
}

export default async function AdsConsultationPage({
    params,
    searchParams,
}: PageProps<"/[lang]/consultation">) {
    const { lang } = await params;
    if (!hasLocale(lang)) notFound();

    const { topic } = await searchParams;
    const topicParam = Array.isArray(topic) ? topic[0] : topic;
    const defaultInterest = TOPIC_INTERESTS[(topicParam ?? "").toLowerCase()] ?? "";

    // Tolerant read: the collection is created by its first CMS save (or the backend's next
    // seed run), and until then this page must keep advertising — the defaults below match
    // content/adsPage.json, so the look is identical whichever side wins.
    const style = (await readContent<AdsPageStyle>("adsPage").catch(() => null)) ?? {};
    const primary = cssHex(style.primaryColor, "#2F6F5E");
    const action = cssHex(style.actionColor, "#F2B544");
    const ink = cssHex(style.inkColor, "#13294B");
    const font =
        typeof style.font === "string" && style.font.trim().toLowerCase() === "system" ? "system" : "jakarta";
    // A cleared logo field means "use the wordmark again"; a missing one gets the brand mark.
    const logo = style.logo === undefined ? "/icon-istudentplus.png" : (style.logo ?? "").trim();

    const cssVars = [
        `--ink:${ink}`,
        `--gum:${primary}`,
        `--gum-tint:${mixHex(primary, "white", 0.88)}`,
        `--sun:${action}`,
        `--sun-deep:${mixHex(action, "black", 0.12)}`,
        `--on-action:${onAction(action, ink)}`,
        ...(font === "system" ? [`--font-lp:${SYSTEM_FONT_STACK}`] : []),
    ].join(";");

    const whatsappHref = withWhatsAppText(await getWhatsAppUrl());

    return (
        <>
            {/* The CMS style overrides, as plain CSS variables the landing stylesheet reads.
                Rendered here rather than in the layout so the theme stays one server-side read. */}
            <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
            <AdsTracking />

            <header className="top">
                <div className="wrap">
                    <a className="brand" href="https://www.istudentplus.com/" aria-label="iStudentPlus home">
                        {logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element -- CMS-uploaded logo: uploads can be SVG or any host, and a 36px header mark doesn't need the optimizer */
                            <img src={logo} alt="iStudentPlus" width={986} height={338} className="brand-logo" />
                        ) : (
                            <>
                                iStudent<span>Plus</span>
                            </>
                        )}
                    </a>
                    <div className="top-actions">
                        <a
                            className="btn btn-wa btn-small"
                            href={whatsappHref}
                            data-wa-source="header"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                            </svg>
                            WhatsApp
                        </a>
                        <a className="btn btn-primary btn-small" href="#consultation">
                            Book a free consultation
                        </a>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="wrap hero-grid">
                        <div>
                            <h1>Study abroad counselling and English programs, one-to-one</h1>
                            <p className="hero-lede">
                                Free course counselling and university shortlisting. Tell us your goals, budget and
                                academic background, and we shortlist courses and providers that fit.
                            </p>
                            <p className="notice">
                                iStudentPlus is a private education consultancy. This page is about study and
                                English course counselling. We are not affiliated with the Australian Government or
                                any other government agency.
                            </p>
                            <ul className="facts">
                                <li>Free counselling</li>
                                <li>100+ partner universities</li>
                                <li>Honest, friendly one-to-one guidance</li>
                            </ul>
                            <div className="paths">
                                <div className="path">
                                    <h3>Study in Australia</h3>
                                    <ul>
                                        <li>VET and diploma courses, including VET to bachelor pathways</li>
                                        <li>Bachelor and master degrees</li>
                                        <li>Your next course, if you are already in Australia</li>
                                    </ul>
                                </div>
                                <div className="path">
                                    <h3>English programs</h3>
                                    <ul>
                                        <li>General English</li>
                                        <li>Conversation Class</li>
                                        <li>IELTS Preparation, with practical lessons, study resources and personalised support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="form-card" id="consultation">
                            <LeadForm whatsappHref={whatsappHref} defaultInterest={defaultInterest} />
                        </div>
                    </div>
                </section>

                <section className="route" aria-labelledby="route-title">
                    <div className="wrap">
                        <h2 id="route-title">How it works</h2>
                        <p className="route-intro">One counsellor guides you from your first consultation to enrolment.</p>
                        <ol className="steps">
                            <li>
                                <h3>Share your plans</h3>
                                <p>Tell us your goals, budget and background. Add your CV if you have one.</p>
                            </li>
                            <li>
                                <h3>Get a shortlist</h3>
                                <p>We compare suitable courses and providers and send a personalised recommendation.</p>
                            </li>
                            <li>
                                <h3>Apply with support</h3>
                                <p>We help you prepare and review your application to your chosen university or college.</p>
                            </li>
                            <li>
                                <h3>Review your offer</h3>
                                <p>We go through your offer letter with you so you understand it before you accept.</p>
                            </li>
                            <li>
                                <h3>Enrol in your course</h3>
                                <p>We support your enrolment and help you find student accommodation options.</p>
                            </li>
                        </ol>
                    </div>
                </section>

                <section className="section" aria-labelledby="why-title">
                    <div className="wrap">
                        <h2 id="why-title">Why students talk to us first</h2>
                        <div className="why">
                            <div>
                                <h3>Counselling is free</h3>
                                <p>Our service is funded by commissions from partner institutions, and you see all costs before you go.</p>
                            </div>
                            <div>
                                <h3>100+ partner universities</h3>
                                <p>More options to compare, so the shortlist fits your goals rather than one provider.</p>
                            </div>
                            <div>
                                <h3>One-to-one, from day one</h3>
                                <p>The same counsellor guides you from your first consultation through to enrolment.</p>
                            </div>
                            <div>
                                <h3>Study and English in one place</h3>
                                <p>Start with General English, Conversation Class or IELTS Preparation, then plan your course.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section" style={{ paddingTop: 0 }} aria-labelledby="faq-title">
                    <div className="wrap">
                        <h2 id="faq-title">Common questions</h2>
                        <div className="faq">
                            <details>
                                <summary>Is the consultation really free?</summary>
                                <p>
                                    Yes. Study counselling and application support are free because partner
                                    institutions pay us a commission. There is no obligation, and you will know about
                                    all costs before you go.
                                </p>
                            </details>
                            <details>
                                <summary>Which English test does my course accept?</summary>
                                <p>
                                    Accepted tests and minimum scores vary by institution and program. Your counsellor
                                    checks the requirement for your chosen course with you.
                                </p>
                            </details>
                            <details>
                                <summary>I am already in Australia. Can you help?</summary>
                                <p>Yes. If you are planning your next course or further study, we help you compare options and support your enrolment.</p>
                            </details>
                            <details>
                                <summary>Do you offer English classes?</summary>
                                <p>Yes. We run General English, Conversation Class and IELTS Preparation, whether you want to get exam-ready or conversation-ready.</p>
                            </details>
                        </div>
                    </div>
                </section>

                <section className="closing">
                    <div className="wrap">
                        <h2>Ready to talk about your plans?</h2>
                        <p>Book a free consultation, or send us a message on WhatsApp.</p>
                        <div className="btns">
                            <a className="btn btn-primary" href="#consultation">
                                Book a free consultation
                            </a>
                            <a
                                className="btn btn-wa"
                                href={whatsappHref}
                                data-wa-source="closing"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Message us on WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="wrap">
                    <p>
                        <strong>iStudentPlus</strong> is operated by PT Wacana Belajar Internasional.
                    </p>
                    {/* The mock had street addresses, a contact email and an office phone here. None
                        of them exists in the CMS or anywhere on the live site (what's published are
                        the WhatsApp numbers and socials), so the lines are dropped rather than left
                        as placeholders. Add them back once the client supplies real values. */}
                    <p>
                        iStudentPlus is a private education consultancy. We are not affiliated with, endorsed
                        by, or acting on behalf of the Australian Government or any other government agency.
                    </p>
                    <p>
                        <a href={ADS_CONFIG.privacyUrl}>Privacy policy</a> &nbsp;{" "}
                        <a href={ADS_CONFIG.termsUrl}>Terms of service</a> &nbsp;{" "}
                        <a href="https://www.istudentplus.com/contact">Contact us</a>
                    </p>
                </div>
            </footer>

            <div className="sticky">
                <a
                    className="btn btn-wa"
                    href={whatsappHref}
                    data-wa-source="sticky"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    WhatsApp
                </a>
                <a className="btn btn-primary" href="#consultation">
                    Free consultation
                </a>
            </div>
        </>
    );
}
