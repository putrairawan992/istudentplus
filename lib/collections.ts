import type { CollectionKey } from "./content";

export type CollectionGroup = "General" | "Content" | "Inbox";

export type CollectionMeta = {
  key: CollectionKey;
  label: string;
  description: string;
  kind: "list" | "single";
  usedOn: string;
  icon: string;
  group: CollectionGroup;
};

export const COLLECTIONS: CollectionMeta[] = [
  { key: "settings", label: "Site Settings", description: "Stats, offices, WhatsApp, socials, languages spoken", kind: "single", usedOn: "Home, About, Contact", icon: "⚙️", group: "General" },
  { key: "countries", label: "Study Abroad Countries", description: "Destination pages — Australia, UK, USA, Canada, China, Japan", kind: "list", usedOn: "Home, Study Abroad", icon: "🌍", group: "Content" },
  { key: "testimonials", label: "Testimonials", description: "Alumni stories with LoA lists", kind: "list", usedOn: "Home", icon: "💬", group: "Content" },
  { key: "team", label: "Team", description: "About Us team members", kind: "list", usedOn: "About Us", icon: "👥", group: "Content" },
  { key: "homeServices", label: "Home Service Cards", description: "The 4 pastel service cards", kind: "list", usedOn: "Home", icon: "🃏", group: "Content" },
  { key: "visaServices", label: "Visa Services", description: "Visa & partner services list", kind: "list", usedOn: "Services", icon: "🛂", group: "Content" },
  { key: "servicesPage", label: "Services Page Extras", description: "Pitfalls to avoid, admission steps, and FAQ", kind: "single", usedOn: "Services", icon: "📄", group: "Content" },
  { key: "languagePrograms", label: "Language Programs", description: "General English, IELTS, Conversation, JLPT", kind: "list", usedOn: "Language Programs, Home", icon: "🗣️", group: "Content" },
  { key: "instructors", label: "Instructors", description: "Teacher profiles", kind: "list", usedOn: "Language Programs", icon: "🎓", group: "Content" },
  { key: "blog", label: "Blog Articles", description: "Blog post titles, excerpts, categories", kind: "list", usedOn: "Blog", icon: "✍️", group: "Content" },
  { key: "videoSeries", label: "Blog Videos", description: "Abroad Stories & Scholarships video cards", kind: "list", usedOn: "Blog", icon: "▶️", group: "Content" },
  { key: "coursesPage", label: "Courses & Universities", description: "Qualification types, popular fields, VET levels/fields, high school", kind: "single", usedOn: "Courses", icon: "🎯", group: "Content" },
  { key: "englishSkills", label: "English Skills", description: "The 4 General English skill cards (Reading, Writing, Speaking, Listening)", kind: "list", usedOn: "Language Programs", icon: "📚", group: "Content" },
  { key: "webinars", label: "Webinars", description: "Upcoming and past webinars — upcoming/past is decided by the date, no flag to flip", kind: "list", usedOn: "Webinars", icon: "🎥", group: "Content" },
  { key: "leads", label: "Consultation & Contact Leads", description: "Submissions from the Free Consultation, Contact, and webinar registration forms", kind: "list", usedOn: "Collected from Home, Contact, Webinars", icon: "📥", group: "Inbox" },
];

export const COLLECTION_GROUPS: CollectionGroup[] = ["General", "Content", "Inbox"];

export function getCollectionMeta(key: string): CollectionMeta | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}
