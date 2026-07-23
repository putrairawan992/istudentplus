"use server";

import { revalidatePath } from "next/cache";
import { writeContent, type CollectionKey } from "../../../../lib/content";
import { getCollectionMeta } from "../../../../lib/collections";

export async function saveCollectionAction(collection: string, json: string) {
  const meta = getCollectionMeta(collection);
  if (!meta) return { ok: false, error: "Unknown collection" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  try {
    await writeContent(collection as CollectionKey, parsed);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
