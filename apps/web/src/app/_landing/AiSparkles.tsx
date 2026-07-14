"use client";

import { useEffect, useRef } from "react";

export default function AiSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let animationId: number;

    interface Sparkle {
      x: number;
      y: number;
      size: number;
      maxSize: number;
      speed: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      direction: number; // 1 = fade in, -1 = fade out
    }

    const colors = [
      "rgba(167, 139, 250, ", // Purple
      "rgba(236, 72, 153, ", // Pink
      "rgba(255, 255, 255, ", // White
      "rgba(244, 114, 182, ", // Light pink
    ];

    const sparkleCount = 45;
    const sparkles: Sparkle[] = [];

    const createSparkle = (randomY = false): Sparkle => {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20, // start at bottom or random
        size: 0.1,
        maxSize: Math.random() * 8 + 4,
        speed: Math.random() * 0.4 + 0.15, // float speed upward
        opacity: 0.01,
        fadeSpeed: Math.random() * 0.015 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        direction: 1,
      };
    };

    // Initialize sparkles scattered across the height
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push(createSparkle(true));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];

        // Float upwards
        s.y -= s.speed;
        s.rotation += s.rotationSpeed;

        // Fade state machine
        if (s.direction === 1) {
          s.opacity += s.fadeSpeed;
          s.size += (s.maxSize - s.size) * 0.08;
          if (s.opacity >= 0.8) {
            s.direction = -1;
          }
        } else {
          s.opacity -= s.fadeSpeed;
          s.size -= s.size * 0.05;
          if (s.opacity <= 0.01) {
            // Re-spawn
            sparkles[i] = createSparkle(false);
            continue;
          }
        }

        // Draw 4-point sparkle shape
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);

        ctx.beginPath();
        // Top point
        ctx.moveTo(0, -s.size);
        // Curve to Right point
        ctx.quadraticCurveTo(0, 0, s.size, 0);
        // Curve to Bottom point
        ctx.quadraticCurveTo(0, 0, 0, s.size);
        // Curve to Left point
        ctx.quadraticCurveTo(0, 0, -s.size, 0);
        // Curve back to Top point
        ctx.quadraticCurveTo(0, 0, 0, -s.size);

        ctx.closePath();
        ctx.fillStyle = `${s.color}${s.opacity})`;
        ctx.shadowColor = s.color.includes("167") ? "#a78bfa" : "#ec4899";
        ctx.shadowBlur = s.size * 1.5;
        ctx.fill();
        ctx.restore();
      }

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
      className="absolute inset-0 h-full w-full pointer-events-none mix-blend-screen opacity-90 z-10"
    />
  );
}
