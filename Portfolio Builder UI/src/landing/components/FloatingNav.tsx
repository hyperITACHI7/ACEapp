import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections } from "../data/sections";

export default function FloatingNav() {
  const [active, setActive] = useState(sections[0].id);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const activeSection = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Section navigation"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
        >
          <div className="relative">
            <AnimatePresence>
              {open && (
                <motion.ul
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-14 left-1/2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-ink/80 p-1.5 backdrop-blur-xl"
                >
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                          s.id === active
                            ? "bg-white/10 text-cream"
                            : "text-cream/60 hover:bg-white/5 hover:text-cream"
                        }`}
                      >
                        <span>{s.title}</span>
                        <span className="text-xs text-cream/30">{s.eyebrow}</span>
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={`Section navigation, current section ${activeSection.title}`}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-ink/80 py-2.5 pl-4 pr-3 backdrop-blur-xl transition-colors hover:border-white/20"
            >
              <span
                className={`h-2 w-2 rounded-full bg-gradient-to-br ${activeSection.accent}`}
              />
              <span className="text-sm font-medium text-cream">
                {activeSection.title}
              </span>
              <span className="flex h-6 w-6 flex-col items-center justify-center gap-[3px]">
                <motion.span
                  animate={{ rotate: open ? 45 : 0, y: open ? 4 : 0 }}
                  className="block h-[1.5px] w-3.5 rounded bg-cream/70"
                />
                <motion.span
                  animate={{ rotate: open ? -45 : 0, y: open ? -1 : 0 }}
                  className="block h-[1.5px] w-3.5 rounded bg-cream/70"
                />
              </span>
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
