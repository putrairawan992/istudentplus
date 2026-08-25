import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(request: Request) {
  await destroySession();

  // Come back to where the form was submitted from — the header logout can fire on any page.
  // Same-site paths only: "//evil.com" is a valid URL to a browser, so a leading "/" isn't enough.
  const to = String((await request.formData()).get("redirectTo") || "");
  const target = to.startsWith("/") && !to.startsWith("//") ? to : "/admin/login";

  // 303 so the browser follows with GET; a 307 would replay the POST against a page route.
  return NextResponse.redirect(new URL(target, request.url), 303);
}
