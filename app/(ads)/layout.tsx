import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./landing.css";

// The third root layout in the app (the other two: the public site at (site)/[lang] and the
// CMS at (internal)). Paid-traffic landing pages get their own shell on purpose: no site
// header/footer/nav to click away, no WhatsApp float, no GTM container — a visitor from an
// ad sees exactly one page and one action. The approved mock's whole design (Plus Jakarta
// Sans, navy/eucalyptus/sun palette) lives in ./landing.css, so nothing leaks either way.
const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jakarta",
});

export const metadata: Metadata = {
    // So the page's relative `canonical: "/consultation"` resolves to an absolute URL.
    metadataBase: new URL(SITE_URL),
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={jakarta.variable}>
            <body>{children}</body>
        </html>
    );
}
