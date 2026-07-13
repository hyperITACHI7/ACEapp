import { motion, useReducedMotion } from "framer-motion";

const ITEMS = [
  "Behance",
  "Dribbble",
  "GitHub",
  "Notion",
  "Figma",
  "Instagram",
  "LinkedIn",
  "Vimeo",
  "Read.cv",
  "Substack",
];

export default function Marquee() {
  const reduce = useReducedMotion();
  const row = [...ITEMS, ...ITEMS];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-ink py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-cream/40">
        Bring your work in from everywhere
      </p>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <motion.div
          className="flex shrink-0 items-center gap-14 pr-14"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          {row.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="whitespace-nowrap text-2xl font-semibold tracking-tight text-cream/40 transition-colors hover:text-cream sm:text-3xl"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
