"use client";

import type { PortfolioData } from "@portfolio/schema";
import { PortfolioRenderer } from "@/lib/portfolioRenderer";

/** The editor's live canvas: the real rendered portfolio, made directly editable. */
export function EditorCanvas({ data }: { data: PortfolioData }) {
  return (
    <div className="portfolio-canvas">
      <PortfolioRenderer data={data} />
    </div>
  );
}
