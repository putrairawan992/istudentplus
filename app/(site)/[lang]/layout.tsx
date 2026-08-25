import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import FloatWhatsApp from "@/app/components/FloatWhatsApp";
import { SITE_URL as siteUrl } from "@/lib/site";
import { alternatesFor, hasLocale, LOCALE_TAGS, LOCALES } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

// Both locales are known up front, so every public page still prerenders at build time.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const m = d.meta.site;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: m.title, template: `%s | iStudentPlus` },
    description: m.description,
    alternates: alternatesFor(lang, "/"),
    openGraph: {
      type: "website",
      siteName: "iStudentPlus",
      locale: LOCALE_TAGS[lang].replace("-", "_"),
      title: m.title,
      description: m.ogDescription,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: m.twitterTitle,
      description: m.twitterDescription,
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = await getDictionary(lang);

  // GEO: structured data so AI answer engines (ChatGPT, Gemini, Perplexity, AI Overviews)
  // can cite iStudentPlus's identity, services, and reach accurately. Described in the
  // visitor's language — an Indonesian query should get an Indonesian citation.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "iStudentPlus",
    url: siteUrl,
    description: d.meta.site.organizationDescription,
    areaServed: "Worldwide",
    inLanguage: LOCALE_TAGS[lang],
    sameAs: [] as string[],
  };

  return (
    <html lang={LOCALE_TAGS[lang]} className="h-full antialiased">
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
        <FloatWhatsApp label={d.common.whatsappFloat} ariaLabel={d.common.whatsappFloatAria} />
      </body>
    </html>
  );
}
