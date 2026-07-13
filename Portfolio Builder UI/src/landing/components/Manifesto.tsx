import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";

const TEXT =
  "Your work deserves more than a link in a bio. Folio turns projects into a portfolio that feels designed, loads instantly, and shows up everywhere people look for you.";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.25"],
  });

  const words = TEXT.split(" ");

  return (
    <section className="relative bg-ink py-28 sm:py-40">
      <div ref={ref} className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="mb-8 text-sm font-medium uppercase tracking-[0.3em] text-cream/40">
          Why Folio
        </p>
        <p className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1 text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                range={[start, end]}
              >
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
}
