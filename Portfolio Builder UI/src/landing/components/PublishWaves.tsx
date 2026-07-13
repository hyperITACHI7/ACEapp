import { useEffect, useRef } from "react";

export default function PublishWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    // Config for three waves
    const waveConfigs = [
      {
        amplitude: 35,
        frequency: 0.003,
        speed: 0.015,
        color: "rgba(34, 211, 238, 0.25)", // cyan
        yOffset: 0.5, // Center
      },
      {
        amplitude: 25,
        frequency: 0.005,
        speed: 0.025,
        color: "rgba(59, 130, 246, 0.2)", // blue
        yOffset: 0.55,
      },
      {
        amplitude: 15,
        frequency: 0.008,
        speed: 0.035,
        color: "rgba(6, 182, 212, 0.15)", // cyan-blue dark
        yOffset: 0.48,
      },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.5;

      waveConfigs.forEach((cfg) => {
        ctx.beginPath();
        
        const centerY = height * cfg.yOffset;

        for (let x = 0; x <= width; x += 4) {
          // Standard sine wave calculation
          let y = centerY + Math.sin(x * cfg.frequency + time * cfg.speed) * cfg.amplitude;

          // React to mouse hover
          if (mouseRef.current.active) {
            const dx = x - mouseRef.current.x;
            // Vertical distance from the mouse to the center of the wave
            const dy = centerY - mouseRef.current.y;
            const dist = Math.hypot(dx, dy);
            const maxDist = 220;

            if (dist < maxDist) {
              // Ripple effect: wave amplitude increases and creates high frequency ripples near mouse
              const force = (maxDist - dist) / maxDist;
              // Add a ripple factor using mouse horizontal position and phase offsets
              const ripple = Math.sin(dist * 0.08 - time * 0.15) * 22 * force;
              y += ripple;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Fill below the wave to create deep water effect, or just draw stroke. Let's draw stroke + gradient fill!
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = cfg.color;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          let y = centerY + Math.sin(x * cfg.frequency + time * cfg.speed) * cfg.amplitude;
          if (mouseRef.current.active) {
            const dx = x - mouseRef.current.x;
            const dy = centerY - mouseRef.current.y;
            const dist = Math.hypot(dx, dy);
            const maxDist = 220;
            if (dist < maxDist) {
              const force = (maxDist - dist) / maxDist;
              const ripple = Math.sin(dist * 0.08 - time * 0.15) * 22 * force;
              y += ripple;
            }
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = cfg.color.replace("0.", "0.6"); // Brighten opacity for border line
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-80"
    />
  );
}
