"use client";

import { useCallback, useRef, useState } from "react";

interface ToastState {
  message: string;
  isError: boolean;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    isError: false,
    visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string, isError = false) => {
    clearTimeout(timerRef.current);
    setToast({ message, isError, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 1400);
  }, []);

  return { toast, show };
}

export function Toast({ message, isError, visible }: ToastState) {
  return (
    <div
      className={`fixed right-4 bottom-4 z-50 rounded-md border bg-bg-elevated px-3.5 py-2 text-xs text-text-secondary transition-all duration-150 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1.5 opacity-0"
      }`}
      style={{ borderColor: isError ? "var(--removed)" : "var(--border)" }}
    >
      {message}
    </div>
  );
}
