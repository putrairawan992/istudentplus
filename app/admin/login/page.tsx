"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper-raise to-sky-ink px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-8 shadow-lg shadow-ink/5">
        <Image src="/icon-istudentplus.png" alt="iStudentPlus" width={986} height={338} className="mb-6 h-8 w-auto" />
        <h1 className="mb-1 text-xl font-extrabold">Admin Login</h1>
        <p className="mb-6 text-sm text-muted">Manage iStudentPlus website content.</p>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
