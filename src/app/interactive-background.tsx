"use client";
import { useEffect, useRef, useState } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const orbsRef = useRef<Orb[]>([]);
  const animRef = useRef<number>(0);
  const [theme, setTheme] = useState<"darkpink" | "ocean" | "sunset" | "cosmic">("darkpink");

  const themes = {
    darkpink: { hues: [320, 340, 350, 10], bg: "rgba(24, 8, 16, 1)" },
    ocean: { hues: [180, 200, 220, 240], bg: "rgba(5, 15, 30, 1)" },
    sunset: { hues: [10, 30, 50, 320], bg: "rgba(20, 10, 15, 1)" },
    cosmic: { hues: [260, 280, 300, 320], bg: "rgba(10, 5, 20, 1)" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const currentTheme = themes[theme];

    // Create orbs
    const orbs: Orb[] = [];
    for (let i = 0; i < 18; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: 80 + Math.random() * 180,
        hue: currentTheme.hues[Math.floor(Math.random() * currentTheme.hues.length)],
        opacity: 0.08 + Math.random() * 0.12,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      });
    }
    orbsRef.current = orbs;

    function handleResize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function handleMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    let time = 0;
    function draw() {
      time++;
      ctx.fillStyle = currentTheme.bg;
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const orb of orbs) {
        // Mouse repulsion/attraction
        const dx = mx - orb.x;
        const dy = my - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          const force = (400 - dist) / 400;
          orb.vx += (dx / dist) * force * 0.15;
          orb.vy += (dy / dist) * force * 0.15;
        }

        // Damping
        orb.vx *= 0.98;
        orb.vy *= 0.98;

        // Move
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges with padding
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        // Pulse
        orb.pulse += orb.pulseSpeed;
        const scale = 1 + Math.sin(orb.pulse) * 0.15;
        const r = orb.radius * scale;

        // Draw glowing orb
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 60%, ${orb.opacity * 1.5})`);
        gradient.addColorStop(0.4, `hsla(${orb.hue}, 70%, 50%, ${orb.opacity * 0.8})`);
        gradient.addColorStop(1, `hsla(${orb.hue}, 60%, 40%, 0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw connection lines between nearby orbs
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const dx = orbs[i].x - orbs[j].x;
          const dy = orbs[i].y - orbs[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 350) {
            const alpha = (1 - dist / 350) * 0.08;
            ctx.beginPath();
            ctx.moveTo(orbs[i].x, orbs[i].y);
            ctx.lineTo(orbs[j].x, orbs[j].y);
            ctx.strokeStyle = `hsla(${(orbs[i].hue + orbs[j].hue) / 2}, 60%, 50%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Floating particles
      for (let i = 0; i < 40; i++) {
        const px = ((Math.sin(time * 0.002 + i * 1.7) + 1) / 2) * w;
        const py = ((Math.cos(time * 0.003 + i * 2.3) + 1) / 2) * h;
        const size = 1 + Math.sin(time * 0.01 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${currentTheme.hues[i % currentTheme.hues.length]}, 70%, 70%, 0.3)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [theme]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10"
        style={{ pointerEvents: "none" }}
      />
      {/* Theme switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-1.5 rounded-full bg-black/30 p-1.5 backdrop-blur-md border border-white/10">
        {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-all duration-300 ${
              theme === t
                ? "bg-white/20 text-white shadow-lg shadow-white/5"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  );
}
