import { NextResponse } from "next/server";
import { hasValidSession } from "../../../lib/auth";
import { threadsApi, visitorHash } from "../../../lib/threads";
import { DEFAULT_LOCALE, hasLocale } from "../../../lib/i18n";
import { getDictionary } from "../../../lib/dictionary";

// Anonymous posting. The browser never talks to the Go API directly: it posts here, and this
// route attaches the API token plus the visitor hash. All validation (bad words, spam, rate
// limits, blocks) lives in the backend, which is the only thing that can write to the table.
export async function POST(request: Request) {
  const input = (await request.json().catch(() => ({}))) as {
    parentId?: number;
    author?: string;
    body?: string;
    lang?: string;
  };
  const lang = hasLocale(input.lang ?? "") ? (input.lang as "en" | "id") : DEFAULT_LOCALE;

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
    // 4xx bodies are a machine-readable rejection code ("too_short", "rate_limited", …); the
    // wording lives in the dictionaries so the forum answers in the language being read.
    // 5xx bodies are ours and never shown verbatim.
    const d = await getDictionary(lang);
    const code = res.status < 500 ? (await res.text()).trim() : "";
    const error =
      res.status >= 500
        ? d.api.serverError
        : (d.api.threads as Record<string, string>)[code] || d.api.sendFailed;
    return NextResponse.json({ ok: false, error }, { status: res.status });
  }
  return NextResponse.json({ ok: true, post: await res.json() }, { status: 201 });
}
