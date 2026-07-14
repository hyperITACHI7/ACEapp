"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

// Every dimension/position/color here is an inline style, not a Tailwind utility class, on
// purpose: this component lives in packages/ui-kit, a sibling workspace package outside
// apps/web. Tailwind v4's automatic content scanner only walks apps/web's own source tree, so
// utility classes used exclusively in this package were silently never generated in the
// compiled CSS — confirmed missing: fixed, top-1/2, -translate-x/y-1/2, max-w-lg,
// bg-[#12121e], shadow-2xl, z-50, backdrop-blur-sm, animate-in, text-lg. A couple of classes
// (rounded-2xl, w-full, overflow-y-auto) happened to render correctly purely by coincidence,
// because some unrelated apps/web file also happens to use that exact class string. Inline
// styles are the only fix that doesn't depend on that coincidence recurring.
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
};

// Matches globals.css's `.glass-panel` recipe (translucent fill + blur + soft border + the one
// shadow in the whole design system — modals/panels are the only place elevation shows at all).
const contentStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 50,
  width: "calc(100% - 2rem)",
  maxWidth: "32rem",
  maxHeight: "85vh",
  overflowY: "auto",
  borderRadius: "1rem",
  border: "1px solid rgba(38, 38, 38, 0.5)",
  background: "rgba(23, 23, 23, 0.8)",
  backdropFilter: "blur(24px)",
  padding: "1.5rem",
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
};

const closeStyle: React.CSSProperties = { position: "absolute", top: "1rem", right: "1rem" };

const titleStyle: React.CSSProperties = { fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" };

export function DialogContent({ children, style, ...props }: RadixDialog.DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay style={overlayStyle} />
      <RadixDialog.Content style={{ ...contentStyle, ...style }} {...props}>
        {children}
        <RadixDialog.Close style={closeStyle} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogTitle({ style, ...props }: RadixDialog.DialogTitleProps) {
  return <RadixDialog.Title style={{ ...titleStyle, ...style }} {...props} />;
}
