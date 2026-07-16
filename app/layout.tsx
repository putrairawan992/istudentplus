import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.istudentplus.com";

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
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
