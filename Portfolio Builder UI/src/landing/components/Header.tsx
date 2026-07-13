import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { sections } from "../data/sections";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 text-cream">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#ff8c78] to-[#ec4899] text-sm font-bold text-ink">
            F
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Folio</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm font-medium text-cream/70 transition-colors hover:text-cream"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-cream/70 transition-colors hover:text-cream sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start building
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
