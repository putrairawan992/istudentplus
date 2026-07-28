import { readContent } from "./content";

// The WhatsApp number lives in the "settings" CMS collection, editable at /admin/settings —
// never hardcode it, or a number change there silently stops reaching the live site.
export async function getWhatsAppUrl(): Promise<string> {
  const settings = await readContent<{ whatsapp: string }>("settings");
  return settings.whatsapp;
}
