import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./landing.css";

// The third root layout in the app (the other two: the public site at (site)/[lang] and the
// CMS at (internal)). Paid-traffic landing pages get their own shell on purpose: no site
// header/footer/nav to click away and no WhatsApp float — a visitor from an ad sees exactly
// one page and one action. GTM is the deliberate exception: the marketing team asked for the
// site's container (GTM-5DC3QD86, same id as the main site) on this page, so keep GA4/Ads
// tags there and leave ADS_CONFIG's page-local gtag ids as the placeholders they are (see
// the note in [lang]/consultation/tracking.ts). The approved mock's whole design (Plus
// Jakarta Sans, navy/eucalyptus/sun palette) lives in ./landing.css, so nothing leaks either
// way.
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
            <head>
                {/* The same container the main site loads, mirrored from (site)/[lang]/layout.tsx
                    so both properties report into one GTM workspace. */}
                <Script id="gtm-script" strategy="afterInteractive">
                    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5DC3QD86');`}
                </Script>
            </head>
            <body>
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-5DC3QD86"
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    />
                </noscript>
                {children}
            </body>
        </html>
    );
}
