"use server";

import { redirect } from "next/navigation";
import { verifyPassword, createSession } from "../../../lib/auth";

export async function loginAction(_prevState: { error: string } | null, formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  if (username !== expectedUsername || !verifyPassword(password)) {
    return { error: "Invalid username or password." };
  }

  await createSession();

  // Callers can ask to land back where they started (the forum logs in inline). Only same-site
  // paths — "//evil.com" is a valid URL to a browser, so a leading "/" alone isn't enough.
  const to = String(formData.get("redirectTo") || "/admin");
  redirect(to.startsWith("/") && !to.startsWith("//") ? to : "/admin");
}
