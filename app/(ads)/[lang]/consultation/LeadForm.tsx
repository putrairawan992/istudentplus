"use client";

import { useEffect, useRef, useState } from "react";
import { ADS_CONFIG, adFormFields, adsConversion, setUserData, track } from "./tracking";
import { type AdsFormCopy } from "./form-copy";

/**
 * The landing page's one conversion point. Field set comes from the approved mock; the copy
 * (title, button, success message, dropdown choices) is CMS-editable and arrives via `copy`.
 * Submissions land in the CMS inbox (/admin/leads) with source "ads" plus every ad parameter
 * the visitor arrived with. Inputs stay uncontrolled on purpose — the form is read once via
 * FormData on submit, with the mock's own inline validation.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK_ERROR =
    "Your details were not sent. Check your connection and try again, or message us on WhatsApp.";

type Props = {
    /** Full wa.me URL with the intro message already appended (built from the CMS settings). */
    whatsappHref: string;
    /** Interest preselected when the ad's URL carries ?topic=. */
    defaultInterest?: string;
    /** CMS copy and choices — see form-copy.ts for the defaults the page falls back to. */
    copy: AdsFormCopy;
};

function value(fd: FormData, key: string): string {
    return String(fd.get(key) ?? "").trim();
}

/** +62 0812… -> +62812… — the stored number should be WhatsApp-dialable as-is. */
function fullPhone(dial: string, phone: string): string {
    let number = phone.replace(/[^\d+]/g, "");
    if (dial && number.startsWith("0")) number = number.slice(1);
    return dial ? dial + number : number;
}

export default function LeadForm({ whatsappHref, defaultInterest = "", copy }: Props) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");
    const [invalid, setInvalid] = useState<Record<string, boolean>>({});
    const thanksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === "success") thanksRef.current?.focus();
    }, [status]);

    // Same behaviour as the mock: typing in a field clears its error immediately.
    function handleInput(e: React.FormEvent<HTMLFormElement>) {
        const name = (e.target as HTMLInputElement).name;
        if (name && invalid[name]) setInvalid((prev) => ({ ...prev, [name]: false }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        const problems: Record<string, boolean> = {};
        if (value(fd, "name").length < 2) problems.name = true;
        if (!EMAIL_RE.test(value(fd, "email"))) problems.email = true;
        if (value(fd, "phone").replace(/\D/g, "").length < 8) problems.phone = true;
        if (!value(fd, "interest")) problems.interest = true;
        if (!value(fd, "location")) problems.location = true;
        if (!value(fd, "start")) problems.start = true;
        if (fd.get("consent") !== "yes") problems.consent = true;

        setInvalid(problems);
        const firstProblem = Object.keys(problems)[0];
        if (firstProblem) {
            (form.elements.namedItem(firstProblem) as HTMLElement | null)?.focus();
            return;
        }

        setStatus("loading");
        setError("");

        const phoneFull = fullPhone(value(fd, "dial_code"), value(fd, "phone"));
        fd.set("source", "ads");
        fd.set("lang", "en");
        fd.set("phone_full", phoneFull);
        fd.set("submitted_at", new Date().toISOString());
        // The mock's hidden tracking inputs, attached here instead: they come from sessionStorage,
        // so they survive whatever the visitor browsed before deciding to fill the form in.
        for (const [key, val] of Object.entries(adFormFields())) fd.set(key, val);

        try {
            const res = await fetch("/api/leads", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                // The API's own message when it gave one, the mock's copy for everything else —
                // a raw "Failed to fetch" would confuse a visitor on a bad connection.
                setStatus("error");
                setError(data.error || FALLBACK_ERROR);
                return;
            }

            // The ad side of a successful lead: enhanced-conversions user data first, then the
            // conversion itself, then the generic event. All three queue until gtag.js is ready.
            setUserData(value(fd, "email").toLowerCase(), phoneFull);
            adsConversion(ADS_CONFIG.leadConversionLabel);
            track("generate_lead", { interest: value(fd, "interest"), location: value(fd, "location") });
            setStatus("success");
        } catch {
            setStatus("error");
            setError(FALLBACK_ERROR);
        }
    }

    if (status === "success") {
        return (
            <div className="thanks" ref={thanksRef} tabIndex={-1}>
                <h2>{copy.successTitle}</h2>
                <p>{copy.successBody}</p>
                <a
                    className="btn btn-wa"
                    href={whatsappHref}
                    data-wa-source="thanks"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
                    </svg>
                    Chat with us now
                </a>
            </div>
        );
    }

    return (
        <form id="leadForm" noValidate onSubmit={handleSubmit} onInput={handleInput}>
            <h2>{copy.title}</h2>
            <p>{copy.intro}</p>

            <div className={"field" + (invalid.name ? " invalid" : "")}>
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" autoComplete="name" required />
                <div className="error">Enter your full name.</div>
            </div>

            <div className="row">
                <div className={"field" + (invalid.email ? " invalid" : "")}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" required />
                    <div className="error">Enter a valid email address.</div>
                </div>
                <div className={"field" + (invalid.phone ? " invalid" : "")}>
                    <label htmlFor="phone">WhatsApp number</label>
                    <div className="phone">
                        <select id="dial" name="dial_code" aria-label="Country code" defaultValue="+62">
                            <option value="+62">+62</option>
                            <option value="+61">+61</option>
                            <option value="">Other</option>
                        </select>
                        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required />
                    </div>
                    <div className="error">Enter a phone number with at least 8 digits.</div>
                </div>
            </div>

            <div className={"field" + (invalid.interest ? " invalid" : "")}>
                <label htmlFor="interest">What are you interested in?</label>
                <select id="interest" name="interest" required defaultValue={defaultInterest}>
                    <option value="">Choose one</option>
                    {copy.interests.map((option) => (
                        <option key={option}>{option}</option>
                    ))}
                </select>
                <div className="error">Choose what you are interested in.</div>
            </div>

            <div className="row">
                <div className={"field" + (invalid.location ? " invalid" : "")}>
                    <label htmlFor="location">Where are you now?</label>
                    <select id="location" name="location" required defaultValue="">
                        <option value="">Choose one</option>
                        {copy.locations.map((option) => (
                            <option key={option}>{option}</option>
                        ))}
                    </select>
                    <div className="error">Choose where you are now.</div>
                </div>
                <div className={"field" + (invalid.start ? " invalid" : "")}>
                    <label htmlFor="start">When do you plan to start?</label>
                    <select id="start" name="start" required defaultValue="">
                        <option value="">Choose one</option>
                        {copy.starts.map((option) => (
                            <option key={option}>{option}</option>
                        ))}
                    </select>
                    <div className="error">Choose when you plan to start.</div>
                </div>
            </div>

            <div className="field">
                <label htmlFor="message">
                    Anything we should know? <span className="opt">(optional)</span>
                </label>
                <textarea id="message" name="message" />
            </div>

            <div className="field">
                <label htmlFor="cv">
                    Attach your CV <span className="opt">(optional, PDF or Word)</span>
                </label>
                <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" />
            </div>

            <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : copy.submit}
            </button>

            <label className="consent" style={{ marginTop: 14 }}>
                <input type="checkbox" id="consent" name="consent" value="yes" required />
                <span>
                    By submitting, I agree to the <a href={ADS_CONFIG.privacyUrl}>privacy policy</a> and
                    consent to be contacted by email, phone or WhatsApp about education counselling. We use
                    your details only to respond to this enquiry.
                </span>
            </label>
            <div className={"field" + (invalid.consent ? " invalid" : "")}>
                <div className="error">Tick the box so we can contact you.</div>
            </div>

            {status === "error" && (
                <div className="form-status" role="alert">
                    {error}
                </div>
            )}

            <p className="form-alt">
                Prefer to chat?{" "}
                <a href={whatsappHref} data-wa-source="form" target="_blank" rel="noopener noreferrer">
                    Message us on WhatsApp
                </a>
            </p>
        </form>
    );
}
