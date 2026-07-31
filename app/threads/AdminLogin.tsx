"use client";

import { useActionState, useState } from "react";
import { loginAction } from "../admin/login/actions";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent";

// Staff log in here rather than detouring through /admin and navigating back. Same action and
// same session as the CMS — this is only a second door, not a second way of being an admin.
export default function AdminLogin() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 text-[13px] text-muted underline underline-offset-4 hover:text-ink"
      >
        Masuk sebagai admin
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex max-w-sm flex-col gap-2.5 rounded-2xl border border-line bg-card p-5">
      <p className="text-sm font-bold">Masuk sebagai admin</p>
      <input type="hidden" name="redirectTo" value="/threads" />
      <input name="username" type="text" autoComplete="username" required placeholder="Username" className={inputClass} />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Password"
        className={inputClass}
      />
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Masuk…" : "Masuk"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
          Batal
        </button>
      </div>
    </form>
  );
}
