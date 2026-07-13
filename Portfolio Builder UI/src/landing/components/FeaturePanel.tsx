import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { Section } from "../data/sections";
import Reveal from "./Reveal";
import DesignLights from "./DesignLights";
import PublishWaves from "./PublishWaves";
import ShowcaseGlass from "./ShowcaseGlass";
import GrowGraphs from "./GrowGraphs";
import AiSparkles from "./AiSparkles";

type Props = {
  section: Section;
  index: number;
};

export default function FeaturePanel({ section }: Props) {
  const visualRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: visualRef,
    offset: ["start end", "end start"],
  });

  // "Rush" zoom on the background as the panel travels through the viewport.
  const scale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  // Title drifts up and fades as it scrolls past.
  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.7, 1],
    [0, 1, 1, 0],
  );

  return (
    <section id={section.id} className="relative scroll-mt-16">
      {/* Full-bleed visual with zoom + parallax and the big section title */}
      <div ref={visualRef} className="relative h-[90vh] overflow-hidden">
        <motion.div
          style={reduce ? undefined : { scale, y: imgY }}
          className="absolute inset-0"
        >
          <img
            src={section.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />
        </motion.div>

        {/* Section-specific background animations */}
        {!reduce && (
          <>
            {section.id === "design" && <DesignLights />}
            {section.id === "publish" && <PublishWaves />}
            {section.id === "showcase" && <ShowcaseGlass scrollYProgress={scrollYProgress} />}
            {section.id === "grow" && <GrowGraphs scrollYProgress={scrollYProgress} />}
            {section.id === "ai" && <AiSparkles />}
          </>
        )}

        <motion.div
          style={reduce ? undefined : { y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-5 sm:px-8 pointer-events-none z-20"
        >
          <span
            className={`mb-4 inline-block w-fit bg-gradient-to-r ${section.accent} bg-clip-text text-sm font-semibold uppercase tracking-[0.35em] text-transparent`}
          >
            {section.eyebrow} — {section.tagline}
          </span>
          <h2
            className="font-extrabold leading-[0.92] tracking-tightest text-cream"
            style={{ fontSize: "clamp(3rem, 11vw, 9rem)" }}
          >
            {section.title}
          </h2>
        </motion.div>
      </div>

      {/* Dark content block: headline + staggered feature cards */}
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
          <Reveal>
            <h3 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {section.headline}
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-cream/70">
              {section.copy}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} y={50}>
              <article className="grain group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.06]">
                <div
                  className={`mb-6 h-10 w-10 rounded-xl bg-gradient-to-br ${section.accent} opacity-90 transition-transform duration-500 group-hover:scale-110`}
                />
                <h4 className="mb-2 text-lg font-semibold tracking-tight text-cream">
                  {f.title}
                </h4>
                <p className="text-sm leading-relaxed text-cream/60">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <a
            href="#cta"
            className="group mt-12 inline-flex items-center gap-2 text-sm font-semibold text-cream"
          >
            <span
              className={`bg-gradient-to-r ${section.accent} bg-clip-text text-transparent`}
            >
              {section.cta}
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
