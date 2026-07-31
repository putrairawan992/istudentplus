import { NextResponse } from "next/server";
import { hasValidSession } from "../../../lib/auth";
import { threadsApi, visitorHash } from "../../../lib/threads";

// Anonymous posting. The browser never talks to the Go API directly: it posts here, and this
// route attaches the API token plus the visitor hash. All validation (bad words, spam, rate
// limits, blocks) lives in the backend, which is the only thing that can write to the table.
export async function POST(request: Request) {
  const input = (await request.json().catch(() => ({}))) as {
    parentId?: number;
    author?: string;
    body?: string;
  };

  const res = await threadsApi("/threads", {
    method: "POST",
    body: JSON.stringify({
      parentId: input.parentId ?? null,
      author: input.author ?? "",
      body: input.body ?? "",
      ipHash: await visitorHash(),
      // Read from the session cookie, not from the request body — the badge can't be faked.
      official: await hasValidSession(),
    }),
  });

  if (!res.ok) {
    // 4xx bodies are the rejection reason meant for the visitor; 5xx bodies are ours.
    const error =
      res.status < 500 ? (await res.text()).trim() : "Server sedang bermasalah, coba lagi nanti.";
    return NextResponse.json({ ok: false, error: error || "Gagal mengirim." }, { status: res.status });
  }
  return NextResponse.json({ ok: true, post: await res.json() }, { status: 201 });
}
