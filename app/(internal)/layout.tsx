import type { Metadata } from "next";
import "@/app/globals.css";

// Second root layout, for staff-only routes. The public site's root lives at
// (site)/[lang]/layout.tsx and is locale-aware; the CMS is English-only and has no business
// carrying the marketing site's analytics, WhatsApp button, or hreflang tags.
export const metadata: Metadata = {
  title: "iStudentPlus CMS",
  robots: { index: false, follow: false },
};

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
