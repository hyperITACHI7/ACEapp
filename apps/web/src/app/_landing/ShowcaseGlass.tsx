"use client";

import { useRef } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";

type Props = {
  scrollYProgress: MotionValue<number>;
};

export default function ShowcaseGlass({ scrollYProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse movement values for interactive hover parallax
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(rawMouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize coordinates between -0.5 and 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rawMouseX.set(x);
    rawMouseY.set(y);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  };

  // Scroll rotation and positioning mappings for Panel 1 (left)
  const panel1RotateX = useTransform(scrollYProgress, [0, 1], [35, -20]);
  const panel1RotateY = useTransform(scrollYProgress, [0, 1], [-45, 15]);
  const panel1RotateZ = useTransform(scrollYProgress, [0, 1], [-20, 15]);
  const panel1Y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // Scroll rotation and positioning mappings for Panel 2 (right/top)
  const panel2RotateX = useTransform(scrollYProgress, [0, 1], [-25, 30]);
  const panel2RotateY = useTransform(scrollYProgress, [0, 1], [30, -35]);
  const panel2RotateZ = useTransform(scrollYProgress, [0, 1], [15, -25]);
  const panel2Y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  // Scroll rotation and positioning mappings for Panel 3 (center overlay)
  const panel3RotateZ = useTransform(scrollYProgress, [0, 1], [-10, 20]);
  const panel3Scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.1, 0.9]);
  const panel3Y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Hover displacement mappings
  const hoverX1 = useTransform(mouseX, [-0.5, 0.5], [-25, 25]);
  const hoverY1 = useTransform(mouseY, [-0.5, 0.5], [-25, 25]);
  const hoverTiltY1 = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const hoverX2 = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const hoverY2 = useTransform(mouseY, [-0.5, 0.5], [30, -30]);
  const hoverTiltX2 = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);

  const hoverX3 = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const hoverY3 = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 h-full w-full overflow-hidden [perspective:1000px] z-10"
    >
      {/* Panel 1 (Floating Left) */}
      <motion.div
        style={{
          x: hoverX1,
          y: panel1Y,
          rotateX: panel1RotateX,
          rotateY: panel1RotateY,
          rotateZ: panel1RotateZ,
          translateY: hoverY1,
          skewX: hoverTiltY1,
        }}
        className="absolute left-[8%] top-[20%] w-[32%] h-[40%] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between p-6 overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-cream/40">
          ⌥
        </div>
        <div className="space-y-2">
          <div className="w-2/3 h-4 rounded-md bg-white/[0.08]" />
          <div className="w-1/2 h-3 rounded-md bg-white/[0.04]" />
        </div>
      </motion.div>

      {/* Panel 2 (Floating Right) */}
      <motion.div
        style={{
          x: hoverX2,
          y: panel2Y,
          rotateX: panel2RotateX,
          rotateY: panel2RotateY,
          rotateZ: panel2RotateZ,
          translateY: hoverY2,
          skewY: hoverTiltX2,
        }}
        className="absolute right-[10%] top-[15%] w-[28%] h-[35%] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-end p-6 overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none" />
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#f4845f]/20 border border-[#f4845f]/30" />
          <div className="w-4/5 h-3 rounded-md bg-white/[0.06]" />
        </div>
      </motion.div>

      {/* Panel 3 (Overlay Center) */}
      <motion.div
        style={{
          x: hoverX3,
          y: panel3Y,
          scale: panel3Scale,
          rotateZ: panel3RotateZ,
          translateY: hoverY3,
        }}
        className="absolute left-[38%] top-[30%] w-[30%] h-[42%] rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] p-6 flex flex-col justify-between overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7b267]/10 to-[#f4845f]/10 opacity-50 pointer-events-none" />
        <div className="flex justify-between items-center">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="text-[10px] text-cream/40 tracking-widest font-mono">SECURE</div>
        </div>
        <div className="space-y-3 mt-auto">
          <div className="h-2 w-full rounded bg-white/[0.08]" />
          <div className="h-2 w-5/6 rounded bg-white/[0.08]" />
          <div className="h-2 w-4/6 rounded bg-white/[0.04]" />
        </div>
      </motion.div>
    </div>
  );
}
