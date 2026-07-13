import { useEffect, useRef } from "react";
import { MotionValue } from "framer-motion";

type Props = {
  scrollYProgress: MotionValue<number>;
};

export default function GrowGraphs({ scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollValRef = useRef(0);

  // Sync scrollYProgress to a mutable ref for the Canvas animation loop
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      scrollValRef.current = latest;
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let animationId: number;
    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const graphConfigs = [
      {
        baseAmp: 25,
        freqMultiplier: 1.0,
        speed: 0.01,
        color: "rgba(52, 211, 153, 0.4)", // Bright emerald
        fillColor: "rgba(52, 211, 153, 0.05)",
        yOffset: 0.7,
      },
      {
        baseAmp: 35,
        freqMultiplier: 0.7,
        speed: 0.015,
        color: "rgba(16, 185, 129, 0.3)", // Green-600
        fillColor: "rgba(16, 185, 129, 0.03)",
        yOffset: 0.65,
      },
      {
        baseAmp: 18,
        freqMultiplier: 1.5,
        speed: 0.02,
        color: "rgba(5, 150, 105, 0.25)", // Dark emerald
        fillColor: "rgba(5, 150, 105, 0.02)",
        yOffset: 0.75,
      },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.8;

      // Draw background grid lines that match the "graphs" theme
      ctx.strokeStyle = "rgba(245, 242, 236, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Progress ranges from 0 (top of viewport) to 1 (bottom of viewport)
      // As user scrolls, we want the waves to "emerge and reach high"
      // We can map scroll progress to an amplitude scale factor
      const scrollFactor = scrollValRef.current;
      // Emerging scale: starts small, reaches highest amplitude around scrollYProgress = 0.5 to 0.8
      const emergenceScale = Math.min(scrollFactor * 2.5, 2.0); // Allow scale up to 2x for visual pop

      graphConfigs.forEach((cfg) => {
        ctx.beginPath();

        const currentAmp = cfg.baseAmp * emergenceScale;
        const centerY = height * cfg.yOffset;

        for (let x = 0; x <= width; x += 5) {
          // Combination of two sine waves to simulate a complex, wavy line graph
          const sine1 = Math.sin(x * 0.004 * cfg.freqMultiplier + time * cfg.speed);
          const sine2 = Math.cos(x * 0.01 * cfg.freqMultiplier - time * cfg.speed * 0.8);
          const noise = Math.sin(x * 0.025 + time * 0.02) * 2; // high-frequency micro waves
          
          const y = centerY - (sine1 * 0.7 + sine2 * 0.3) * currentAmp + noise;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Fill below graph
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = cfg.fillColor;
        ctx.fill();

        // Draw the graph stroke line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const sine1 = Math.sin(x * 0.004 * cfg.freqMultiplier + time * cfg.speed);
          const sine2 = Math.cos(x * 0.01 * cfg.freqMultiplier - time * cfg.speed * 0.8);
          const noise = Math.sin(x * 0.025 + time * 0.02) * 2;
          
          const y = centerY - (sine1 * 0.7 + sine2 * 0.3) * currentAmp + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw small pulse dots on the first graph to make it look like a live data visualization
        if (cfg === graphConfigs[0] && emergenceScale > 0.2) {
          const dotInterval = 200;
          for (let x = dotInterval; x < width - 50; x += dotInterval) {
            const indexX = x + Math.floor(time * 0.2) % dotInterval;
            if (indexX < width) {
              const s1 = Math.sin(indexX * 0.004 * cfg.freqMultiplier + time * cfg.speed);
              const s2 = Math.cos(indexX * 0.01 * cfg.freqMultiplier - time * cfg.speed * 0.8);
              const dotY = centerY - (s1 * 0.7 + s2 * 0.3) * currentAmp;
              
              ctx.beginPath();
              ctx.arc(indexX, dotY, 4, 0, Math.PI * 2);
              ctx.fillStyle = "#10b981";
              ctx.shadowColor = "#34d399";
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-80"
    />
  );
}
