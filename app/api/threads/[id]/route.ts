import { NextResponse } from "next/server";
import { hasValidSession } from "../../../../lib/auth";
import { threadsApi } from "../../../../lib/threads";

// Moderation. These sit outside /admin so the proxy matcher doesn't cover them — the session
// check has to happen here.
async function forward(method: string, id: string, body?: string) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const res = await threadsApi(`/threads/${id}`, { method, body });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: (await res.text()).trim() }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}

// { body?, hidden?, block? } — edit the text, hide it, or block whoever wrote it.
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forward("PATCH", id, JSON.stringify(await request.json().catch(() => ({}))));
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forward("DELETE", id);
}
