import { sections } from "./data/sections";

const columns = [
  {
    heading: "Product",
    links: sections.map((s) => ({ label: s.title, href: `#${s.id}` })),
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help center", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <a href="#top" className="flex items-center gap-2 text-cream">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#ff8c78] to-[#ec4899] text-sm font-bold text-ink">
                A
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                ACEapp
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/50">
              The portfolio builder for people who make things. Design, publish,
              and grow — everywhere.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/40">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-cream/60 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} ACEapp. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-cream">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-cream">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-cream">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
