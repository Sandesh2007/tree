"use client";

import { useLayoutEffect, useRef, memo } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { gsap } from "gsap";
import { ToastMessage } from "@/app/hooks/useToast";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
} as const;

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast = memo(function Toast({ toast, onRemove }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = ICONS[toast.type];

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          ease: "power2.out",
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[18rem] ${STYLES[toast.type]}`}
    >
      <Icon size={20} className="shrink-0" />

      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-md hover:bg-black/5 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
});

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-100 flex max-h-[30vh] flex-col gap-2 overflow-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
