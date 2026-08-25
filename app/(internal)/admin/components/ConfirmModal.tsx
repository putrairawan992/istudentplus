"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-lg font-extrabold">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-paper-raise disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-50 ${
              variant === "danger"
                ? "bg-red-600 shadow-red-600/25 hover:bg-red-700"
                : "bg-accent shadow-accent/25 hover:bg-accent/90"
            }`}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
