"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@portfolio/ui-kit";
import { NewPortfolioDialog } from "./NewPortfolioDialog";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0">
        <Plus size={14} /> New Project
      </Button>
      <NewPortfolioDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
