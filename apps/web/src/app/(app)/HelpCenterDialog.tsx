"use client";

import { HelpCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@portfolio/ui-kit";

export function HelpCenterDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors w-full text-left">
          <HelpCircle size={16} />
          Help Center
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Help Center</DialogTitle>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>Need a hand? Here are a few quick starting points:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Use the Portfolio Editor to add sections, swap widget styles, and change your theme.</li>
            <li>Publish from the editor&apos;s top bar to make your portfolio live at your own URL.</li>
            <li>Connect GitHub from Settings to pull in your repos as projects.</li>
          </ul>
          <p>
            Still stuck? Email us at{" "}
            <a href="mailto:support@aceapp.dev" className="text-foreground underline">
              support@aceapp.dev
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
