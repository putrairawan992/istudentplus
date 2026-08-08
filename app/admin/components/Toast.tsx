"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Top-right: rejections happen while you're looking at a field near the top of a form,
          and a message at the bottom of the page was easy to miss. */}
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex max-w-[min(26rem,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <ToastItemView key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    // Errors say what to do next and run longer than a "Saved ✓", so they get time to be read.
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, item.type === "error" ? 8000 : 3500);

    return () => clearTimeout(timer);
  }, [onDismiss, item.type]);

  return (
    <div
      role="alert"
      onClick={() => {
        setExiting(true);
        setTimeout(onDismiss, 300);
      }}
      className={`pointer-events-auto flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold leading-relaxed shadow-lg backdrop-blur transition-all duration-300 ${
        item.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      } ${
        // Slides in from the right now that it lives at the top edge — sliding up from
        // below would have it travelling away from where it ends up.
        visible && !exiting ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
      }`}
    >
      <span className="mt-px shrink-0">{item.type === "success" ? "✓" : "✕"}</span>
      <span>{item.message}</span>
    </div>
  );
}
