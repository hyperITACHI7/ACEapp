"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import HeroParticles from "./HeroParticles";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Background parallax + slow zoom, like the reference dispersion shot.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[150vh]"
      aria-label="ACEapp hero"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Dispersion background */}
        <motion.div
          style={reduce ? undefined : { y: bgY, scale: bgScale }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hero.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        </motion.div>

        {/* Interactive background particles */}
        <HeroParticles />

        {/* Foreground copy */}
        <motion.div
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20"
        >
          <div className="mx-auto w-full max-w-7xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cream/60"
            >
              ACEapp · The portfolio builder
            </motion.p>

            <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              {"Your portfolio, everywhere.".split(" ").map((word, i) => (
                <span key={word} className="inline-block overflow-hidden pb-1">
                  <motion.span
                    className="inline-block pr-[0.25em]"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      delay: 0.4 + i * 0.08,
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-lg text-cream/75"
            >
              150+ ways to design, publish, and grow a portfolio that follows
              your work wherever it needs to be.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#cta"
                className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start building — it&apos;s free
              </a>
              <a
                href="#design"
                className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors duration-300 hover:bg-cream/10"
              >
                See how it works
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
