"use client";

/** A plain horizontal rule the user places explicitly between sections — dividers are opt-in,
 *  never baked into a theme's section wrapper (see globals.css `.theme-slot`). */
export function DividerComponent() {
  return (
    <div className="widget widget-divider">
      <hr className="widget-divider-rule" />
    </div>
  );
}
