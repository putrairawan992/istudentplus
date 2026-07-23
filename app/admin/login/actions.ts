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
  redirect("/admin");
}
