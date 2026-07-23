import { notFound } from "next/navigation";
import { readContent, type CollectionKey } from "../../../../lib/content";
import { getCollectionMeta } from "../../../../lib/collections";
import type { JsonValue } from "../../../../lib/json-tree";
import CollectionEditor from "../../components/CollectionEditor";
import { saveCollectionAction } from "./actions";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const meta = getCollectionMeta(collection);
  if (!meta) notFound();

  const data = await readContent<unknown>(collection as CollectionKey);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">{meta.label}</h1>
      <p className="mb-6 text-sm text-muted">{meta.description} — used on {meta.usedOn}.</p>
      <CollectionEditor
        collection={collection}
        initialData={data as JsonValue}
        saveAction={saveCollectionAction}
      />
    </div>
  );
}
