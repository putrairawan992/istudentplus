export type Article = {
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  date?: string;
  slug?: string;
  content?: string[];
};

export const CATEGORIES = [
  { slug: "recent-news", label: "Recent News" },
  { slug: "immigration", label: "Immigration" },
  { slug: "student-life", label: "Student Life" },
  { slug: "study-tips", label: "Study Tips" },
];

export function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
