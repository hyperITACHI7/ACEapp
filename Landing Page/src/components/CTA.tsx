import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Reveal from "./Reveal";

export default function CTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.4]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section
      id="cta"
      ref={ref}
      className="relative overflow-hidden bg-ink py-32 sm:py-44"
    >
      <motion.div
        style={reduce ? undefined : { scale: glowScale, y: glowY }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#ff8c78]/40 via-[#ec4899]/25 to-[#a78bfa]/30 blur-[120px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2
            className="text-balance font-extrabold leading-[0.95] tracking-tightest"
            style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            Build the portfolio
            <br />
            your work deserves.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/70">
            Free to start. No credit card, no code. Launch in an afternoon and
            update it forever.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#top"
              className="rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start building — it's free
            </a>
            <a
              href="#design"
              className="rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream transition-colors duration-300 hover:bg-cream/10"
            >
              Book a demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
