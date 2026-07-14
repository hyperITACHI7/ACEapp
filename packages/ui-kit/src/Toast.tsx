"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/** Rendered once in the root layout. */
export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(23,23,23,0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#ffffff",
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}

type ToastKind = "info" | "error" | "success";

/**
 * Same call signature as the previous context-based implementation
 * (`showToast(message, kind)`) so existing call sites needed no changes —
 * only the internals moved to sonner, which needs no provider/context at all.
 */
export function useToast() {
  function showToast(message: string, kind: ToastKind = "info") {
    if (kind === "success") toast.success(message);
    else if (kind === "error") toast.error(message);
    else toast(message);
  }
  return { showToast };
}
