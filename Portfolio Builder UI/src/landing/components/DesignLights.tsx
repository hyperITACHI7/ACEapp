import { useEffect, useRef } from "react";

export default function DesignLights() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollDataRef = useRef({
    lastY: window.scrollY,
    lastTime: performance.now(),
    targetVelocity: 0,
    currentVelocity: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let animationId: number;

    interface Star {
      x: number;
      y: number;
      z: number; // depth
      color: string;
    }

    const starCount = 150;
    const stars: Star[] = [];

    const colors = [
      "rgba(255, 140, 120, 0.8)", // Coral/pinkish from design accent
      "rgba(255, 95, 158, 0.8)",  // Pinkish red
      "rgba(255, 255, 255, 0.9)", // White
      "rgba(255, 210, 180, 0.7)", // Soft orange
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Handle scroll events to calculate scroll speed/velocity
    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dT = Math.max(now - scrollDataRef.current.lastTime, 1);
      const dY = Math.abs(currentY - scrollDataRef.current.lastY);

      // Velocity in pixels per millisecond, scaled for visual effect
      const instantVelocity = (dY / dT) * 1.5;
      
      // Clamp maximum speed
      scrollDataRef.current.targetVelocity = Math.min(instantVelocity, 12);
      scrollDataRef.current.lastY = currentY;
      scrollDataRef.current.lastTime = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Decay target velocity to simulate drag and stop when scrolling stops
      scrollDataRef.current.targetVelocity *= 0.93;
      if (scrollDataRef.current.targetVelocity < 0.01) {
        scrollDataRef.current.targetVelocity = 0;
      }

      // Smoothly interpolate current velocity toward target velocity
      const velocityDiff = scrollDataRef.current.targetVelocity - scrollDataRef.current.currentVelocity;
      scrollDataRef.current.currentVelocity += velocityDiff * 0.1;

      // Clear with slight trailing opacity to create a motion blur/streak effect
      ctx.fillStyle = "rgba(10, 10, 12, 0.15)"; // background ink color
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];

        // Move star closer in Z space based on scroll velocity
        // Base movement rate is proportional to velocity.
        const speed = scrollDataRef.current.currentVelocity * 10;
        star.z -= speed;

        // Reset star if it gets too close or past the viewer
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = 1000;
        }

        // Project 3D coordinate onto 2D screen
        const k = 400 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        // If the star projects within the screen bounds
        if (px >= 0 && px < width && py >= 0 && py < height) {
          // If we are moving, draw a streak line. If not, draw a small dot.
          if (scrollDataRef.current.currentVelocity > 0.05) {
            // Radial streak from previous projected position to current projected position
            const prevK = 400 / (star.z + speed * 1.8);
            const prevPx = star.x * prevK + cx;
            const prevPy = star.y * prevK + cy;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(prevPx, prevPy);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = Math.min(k * 1.5, 3);
            ctx.lineCap = "round";
            ctx.stroke();
          } else {
            // Stationary dot
            ctx.beginPath();
            ctx.arc(px, py, Math.min(k * 0.8, 1.5), 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none mix-blend-screen opacity-70"
    />
  );
}
