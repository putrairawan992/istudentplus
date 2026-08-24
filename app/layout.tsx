import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FloatWhatsApp from "./components/FloatWhatsApp";
import { SITE_URL as siteUrl } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "iStudentPlus — Study Abroad Counseling, 100+ Partner Universities",
    template: "%s | iStudentPlus",
  },
  description:
    "Your journey to studying abroad starts here. Access detailed information, personalized recommendations, and expert guidance from our education counselors.",
  openGraph: {
    type: "website",
    siteName: "iStudentPlus",
    title: "iStudentPlus — Study Abroad Counseling, 100+ Partner Universities",
    description:
      "A global student network and media agency with offices in Pangkalpinang and Makassar, guiding students from application to arrival across 100+ partner universities.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "iStudentPlus — Study Abroad Counseling",
    description: "100+ partner universities. One counselor, from application to arrival.",
  },
};

// GEO: structured data so AI answer engines (ChatGPT, Gemini, Perplexity, AI Overviews)
// can cite iStudentPlus's identity, services, and reach accurately.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "iStudentPlus",
  url: siteUrl,
  description:
    "Global student network and media agency offering education counseling, visa application support, student accommodation, and pre-departure services. Offices in Pangkalpinang and Makassar, Indonesia.",
  areaServed: "Worldwide",
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5DC3QD86');`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5DC3QD86"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              var EXT_ATTRS = ['fdprocessedid'];
              function strip(el) {
                if (el.nodeType !== 1) return;
                EXT_ATTRS.forEach(function(a) { el.removeAttribute(a); });
                if (!el.querySelectorAll) return;
                EXT_ATTRS.forEach(function(a) {
                  el.querySelectorAll('[' + a + ']').forEach(function(c) { c.removeAttribute(a); });
                });
              }
              // strip already-parsed elements
              EXT_ATTRS.forEach(function(a) {
                document.querySelectorAll('[' + a + ']').forEach(function(c) { c.removeAttribute(a); });
              });
              // strip future elements (React portals, dynamically inserted nodes)
              new MutationObserver(function(ms) {
                ms.forEach(function(m) { m.addedNodes.forEach(strip); });
              }).observe(document.documentElement, { childList: true, subtree: true });
            })();`,
          }}
        />
        {children}
        <FloatWhatsApp />
      </body>
    </html>
  );
}
